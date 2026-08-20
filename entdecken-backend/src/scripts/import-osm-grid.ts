import { getDb } from '../db/db.js';
import { osmToPlace, upsertPlace } from './lib/import-utils.js';
import { loadCountries, pointInCountry, TARGET_COUNTRIES } from '../db/geo.js';

interface OSMElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    description?: string;
    "addr:country"?: string;
    "addr:city"?: string;
    "addr:street"?: string;
    "addr:housenumber"?: string;
    "addr:postcode"?: string;
    website?: string;
    phone?: string;
    "contact:website"?: string;
    "contact:phone"?: string;
    power_supply?: string;
    water?: string;
    internet_access?: string;
    shower?: string;
    toilets?: string;
    fee?: string;
    charge?: string;
    glamping?: string;
    cabin?: string;
    yurt?: string;
    [key: string]: string | undefined;
  };
}

// Bounding box of Germany, Austria, Switzerland, Denmark, Norway, Sweden
// Min Lat: 46, Max Lat: 71
// Min Lon: 4, Max Lon: 32
const LAT_MIN = 46.0;
const LAT_MAX = 71.0;
const LON_MIN = 4.0;
const LON_MAX = 32.0;

// Grid size in degrees (approx 3x4 degree tiles)
const LAT_STEP = 3.0;
const LON_STEP = 4.0;

async function fetchGridTile(minLat: number, minLon: number, maxLat: number, maxLon: number): Promise<OSMElement[]> {
  const bbox = `${minLat.toFixed(2)},${minLon.toFixed(2)},${maxLat.toFixed(2)},${maxLon.toFixed(2)}`;
  console.log(`Querying grid tile bbox: ${bbox}...`);
  
  const query = `
    [out:json][timeout:30];
    (
      node["tourism"="camp_site"]["name"]["website"](${bbox});
      way["tourism"="camp_site"]["name"]["website"](${bbox});
      node["tourism"="caravan_site"]["name"]["website"](${bbox});
      way["tourism"="caravan_site"]["name"]["website"](${bbox});
      node["tourism"="camp_site"]["glamping"="yes"](${bbox});
      way["tourism"="camp_site"]["glamping"="yes"](${bbox});
    );
    out center;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CampingRouteGridImporter/1.0 (christian.projekte@campingroute.app)'
      }
    });
    
    if (response.status === 429) {
      console.warn("Rate limited (429). Sleeping for 5 seconds...");
      await new Promise(r => setTimeout(r, 5000));
      return fetchGridTile(minLat, minLon, maxLat, maxLon); // Retry
    }
    
    if (!response.ok) {
      console.warn(`Failed to fetch tile: HTTP ${response.status}`);
      return [];
    }
    
    const data = (await response.json()) as { elements: OSMElement[] };
    return data.elements || [];
  } catch (error) {
    console.error(`Error querying tile ${bbox}:`, error);
    return [];
  }
}

/**
 * Determine the country for a coordinate. Prefers the explicit OSM addr:country
 * tag, then verifies with the country polygon dataset, and falls back to a
 * bounding-box heuristic. Returns null for places outside the target region.
 */
async function determineCountry(
  lat: number,
  lon: number,
  addrCountry: string | undefined,
  countries: Awaited<ReturnType<typeof loadCountries>>
): Promise<string | null> {
  const fromAddr = (addrCountry || '').trim().toUpperCase();
  if (TARGET_COUNTRIES.includes(fromAddr)) return fromAddr;

  const polyCode = pointInCountry(lat, lon, countries);
  if (polyCode && TARGET_COUNTRIES.includes(polyCode)) return polyCode;

  // Bounding-box fallback (rough, but only used when polygons are unavailable)
  if (lat >= 54.5) {
    if (lon < 12.0) return "NO";
    return "SE";
  }
  if (lat > 49.0 && lat < 55.0 && lon > 5.8 && lon < 15.0) return "DE";
  if (lat > 46.2 && lat < 49.0 && lon > 9.5 && lon < 17.0) return "AT";
  if (lat > 45.8 && lat < 47.8 && lon > 5.9 && lon < 10.5) return "CH";
  return null;
}

async function run() {
  const db = await getDb();
  let totalImported = 0;
  
  console.log("Loading country polygons for accurate attribution...");
  const countryFeatures = await loadCountries();

  // Build grid tiles
  const tiles: { minLat: number; minLon: number; maxLat: number; maxLon: number }[] = [];
  for (let lat = LAT_MIN; lat < LAT_MAX; lat += LAT_STEP) {
    for (let lon = LON_MIN; lon < LON_MAX; lon += LON_STEP) {
      tiles.push({
        minLat: lat,
        minLon: lon,
        maxLat: Math.min(lat + LAT_STEP, LAT_MAX),
        maxLon: Math.min(lon + LON_STEP, LON_MAX)
      });
    }
  }

  console.log(`Starting crawl of ${tiles.length} grid tiles covering Europe...`);

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    console.log(`[Tile ${i + 1}/${tiles.length}]`);
    const elements = await fetchGridTile(tile.minLat, tile.minLon, tile.maxLat, tile.maxLon);
    
    if (elements.length === 0) {
      continue;
    }

    console.log(`Found ${elements.length} elements. Inserting into SQLite...`);
    let tileImported = 0;

    for (const el of elements) {
      const tags = el.tags;
      if (!tags || !tags.name) continue;

      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat === undefined || lon === undefined) continue;

      const country = await determineCountry(lat, lon, tags["addr:country"], countryFeatures);
      if (!country) continue; // Only import target countries

      const place = osmToPlace({
        // Element type must be part of the id (node/way ids overlap numerically)
        id: `osm-${el.type}-${el.id}`,
        tags: tags as any,
        lat,
        lon,
        country,
        osmId: `${el.type}-${el.id}`,
        source: 'osm'
      });

      await upsertPlace(db, place);
      tileImported++;
      totalImported++;
    }

    console.log(`Imported ${tileImported} campgrounds from this tile.`);
    
    // Polite delay to prevent hammering Overpass API
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`================================================`);
  console.log(`⭐ Grid Crawl Complete!`);
  console.log(`   Imported a total of ${totalImported} campgrounds/stellplätze.`);
  console.log(`================================================`);
}

run().catch(console.error);
