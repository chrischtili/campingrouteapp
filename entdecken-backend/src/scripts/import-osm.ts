import { getDb } from '../db/db.js';
import { osmToPlace, upsertPlace } from './lib/import-utils.js';
import { COUNTRY_BBOXES, TARGET_COUNTRIES } from '../db/geo.js';

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
    pets?: string;
    playground?: string;
    sauna?: string;
    swimming_pool?: string;
    leisure?: string;
    shop?: string;
    restaurant?: string;
    [key: string]: string | undefined;
  };
}

const COUNTRIES = [
  { code: "DE", name: "Germany" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "DK", name: "Denmark" },
  { code: "NO", name: "Norway" },
  { code: "SE", name: "Sweden" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "LU", name: "Luxembourg" },
  { code: "FI", name: "Finland" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "HR", name: "Croatia" },
  { code: "GR", name: "Greece" },
  { code: "SI", name: "Slovenia" },
  { code: "CZ", name: "Czechia" },
  { code: "PL", name: "Poland" },
  { code: "HU", name: "Hungary" },
  { code: "GB", name: "United Kingdom" }
];

// Optional filter: COUNTRIES=ES,PT,HR npm run import-data
const countriesFilter = (process.env.COUNTRIES || '')
  .split(',')
  .map(c => c.trim().toUpperCase())
  .filter(Boolean);

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
];

async function fetchOverpass(query: string): Promise<Response> {
  let lastError: any = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const url = `${endpoint}?data=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'CampingRouteCountryImporter/1.0 (christian.projekte@campingroute.app)' }
        });
        if (res.status === 429 || res.status === 504) {
          console.warn(`Overpass ${endpoint} -> HTTP ${res.status}. Retrying in ${10 * (attempt + 1)}s...`);
          await new Promise(r => setTimeout(r, 10000 * (attempt + 1)));
          continue;
        }
        if (!res.ok) {
          console.warn(`Overpass ${endpoint} returned status ${res.status}.`);
          lastError = new Error(`HTTP ${res.status}`);
          continue;
        }
        return res;
      } catch (error) {
        lastError = error;
        console.warn(`Overpass request to ${endpoint} failed: ${(error as Error).message}`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  throw lastError || new Error('All Overpass endpoints failed');
}

async function fetchCampgroundsByCountry(countryCode: string): Promise<OSMElement[]> {
  console.log(`Fetching ALL campgrounds & caravan sites with websites for ${countryCode} using Area query...`);
  
  // Use Overpass area search which is indexed and highly performant
  // A website is REQUIRED, but many places store it under contact:website
  // instead of website - accept both so we don't miss Stellplätze with sites.
  const query = `
    [out:json][timeout:240];
    area["ISO3166-1"="${countryCode}"]->.searchArea;
    (
      node["tourism"="camp_site"]["name"]["website"](area.searchArea);
      way["tourism"="camp_site"]["name"]["website"](area.searchArea);
      node["tourism"="camp_site"]["name"]["contact:website"](area.searchArea);
      way["tourism"="camp_site"]["name"]["contact:website"](area.searchArea);
      node["tourism"="caravan_site"]["name"]["website"](area.searchArea);
      way["tourism"="caravan_site"]["name"]["website"](area.searchArea);
      node["tourism"="caravan_site"]["name"]["contact:website"](area.searchArea);
      way["tourism"="caravan_site"]["name"]["contact:website"](area.searchArea);
      node["tourism"="camp_site"]["glamping"="yes"](area.searchArea);
      way["tourism"="camp_site"]["glamping"="yes"](area.searchArea);
    );
    out center;
  `;

  try {
    const response = await fetchOverpass(query);
    const data = (await response.json()) as { elements: OSMElement[] };
    return data.elements || [];
  } catch (error) {
    console.error(`Failed to fetch OSM data for ${countryCode}:`, (error as Error).message);
    return [];
  }
}

// Loose country fences as a first sanity check; precise polygon validation
// happens in the data-quality migration.
function withinCountryFence(lat: number, lon: number, countryCode: string): boolean {
  const b = COUNTRY_BBOXES[countryCode];
  if (!b) return false;
  return lat >= b[0] && lat <= b[2] && lon >= b[1] && lon <= b[3];
}

async function run() {
  const db = await getDb();
  let totalImported = 0;

  const target = COUNTRIES.filter(c => countriesFilter.length === 0 || countriesFilter.includes(c.code));
  if (target.length === 0) {
    console.error(`No matching countries for filter: ${process.env.COUNTRIES}`);
    process.exit(1);
  }
  console.log(`Importing countries: ${target.map(c => c.code).join(', ')}`);

  for (const country of target) {
    const elements = await fetchCampgroundsByCountry(country.code);
    if (elements.length === 0) {
      console.log(`No elements found or query failed for ${country.name}`);
      continue;
    }

    console.log(`Processing ${elements.length} sites for ${country.name}...`);
    let countryImported = 0;

    for (const el of elements) {
      const tags = el.tags;
      if (!tags || !tags.name) continue;

      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat === undefined || lon === undefined) continue;

      // Skip elements clearly outside the queried country (defensive geofence)
      if (!withinCountryFence(lat, lon, country.code)) continue;

      const place = osmToPlace({
        // Include the element type: OSM node/way/relation ids share the same
        // numeric space, so `osm-{id}` alone collides across types & countries.
        id: `osm-${el.type}-${el.id}`,
        tags: tags as any,
        lat,
        lon,
        country: country.code,
        osmId: `${el.type}-${el.id}`,
        source: 'osm'
      });

      await upsertPlace(db, place);
      countryImported++;
      totalImported++;
    }

    console.log(`Successfully imported ${countryImported} places for ${country.name}.`);
    // Throttling to respect Overpass rate-limits
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Also run glamping heuristics on top of imports
  console.log("Running glamping heuristics on database...");
  const result = await db.run(`
    UPDATE places 
    SET type = 'glamping' 
    WHERE type = 'campground' 
      AND (
        name LIKE '%glamping%' OR 
        name LIKE '%glamp%' OR 
        name LIKE '%yurt%' OR 
        name LIKE '%jurte%' OR 
        name LIKE '%lodge%' OR 
        name LIKE '%tipi%' OR 
        name LIKE '%cabin%' OR
        description LIKE '%glamping%' OR 
        description LIKE '%glamp%' OR 
        description LIKE '%yurt%' OR 
        description LIKE '%lodge%' OR
        description LIKE '%safari tent%'
      )
  `);
  console.log(`Migrated ${result.changes} campgrounds to glamping via heuristics.`);

  console.log(`================================================`);
  console.log(`⭐ Country Bulk Area Import Complete!`);
  console.log(`   Imported a total of ${totalImported} verified places.`);
  console.log(`================================================`);
}

run().catch(console.error);
