import { getDb } from '../db/db.js';
import { osmToPlace, upsertPlace } from './lib/import-utils.js';

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

const REGIONS = [
  // France quadrants
  { code: "FR", name: "France (NW)", bbox: "46.2,-5.2,51.1,2.2" },
  { code: "FR", name: "France (NE)", bbox: "46.2,2.2,51.1,9.6" },
  { code: "FR", name: "France (SW)", bbox: "41.3,-5.2,46.2,2.2" },
  { code: "FR", name: "France (SE)", bbox: "41.3,2.2,46.2,9.6" },
  
  // Italy quadrants
  { code: "IT", name: "Italy (North)", bbox: "44.0,6.6,47.1,18.6" },
  { code: "IT", name: "Italy (South)", bbox: "36.6,6.6,44.0,18.6" }
];

const COUNTRY_BBOXES: { [key: string]: [number, number, number, number] } = {
  FR: [41.3, -5.2, 51.1, 9.6],
  IT: [36.6, 6.6, 47.1, 18.6]
};

function withinCountryFence(lat: number, lon: number, countryCode: string): boolean {
  const b = COUNTRY_BBOXES[countryCode];
  return lat >= b[0] && lat <= b[2] && lon >= b[1] && lon <= b[3];
}

async function fetchRegionCampgrounds(code: string, bbox: string): Promise<OSMElement[]> {
  console.log(`Fetching campgrounds & caravan sites with websites for ${code} (${bbox})...`);
  const query = `
    [out:json][timeout:90];
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
        'User-Agent': 'CampingRouteFRITImporter/1.0 (christian.projekte@campingroute.app)'
      }
    });

    if (response.status === 429) {
      console.warn("Rate limited (429). Sleeping for 10 seconds...");
      await new Promise(r => setTimeout(r, 10000));
      return fetchRegionCampgrounds(code, bbox);
    }

    if (!response.ok) {
      console.warn(`Failed to fetch region: HTTP ${response.status}`);
      return [];
    }

    const data = (await response.json()) as { elements: OSMElement[] };
    return data.elements || [];
  } catch (error) {
    console.error(`Error querying region ${code} (${bbox}):`, error);
    return [];
  }
}

async function run() {
  const db = await getDb();
  let totalImported = 0;

  for (const reg of REGIONS) {
    const elements = await fetchRegionCampgrounds(reg.code, reg.bbox);
    if (elements.length === 0) continue;

    console.log(`Processing ${elements.length} elements for ${reg.name}...`);
    let regImported = 0;

    for (const el of elements) {
      const tags = el.tags;
      if (!tags || !tags.name) continue;

      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat === undefined || lon === undefined) continue;

      // Geofence verification (the raw quadrant bboxes overlap neighbors)
      if (!withinCountryFence(lat, lon, reg.code)) continue;

      const place = osmToPlace({
        // Element type must be part of the id (node/way ids overlap numerically)
        id: `osm-${el.type}-${el.id}`,
        tags: tags as any,
        lat,
        lon,
        country: reg.code,
        osmId: `${el.type}-${el.id}`,
        source: 'osm'
      });

      await upsertPlace(db, place);
      regImported++;
      totalImported++;
    }

    console.log(`Imported ${regImported} campgrounds for ${reg.name}.`);
    
    // Throttling to respect Overpass rate-limits
    await new Promise(r => setTimeout(r, 6000));
  }

  // Also run glamping heuristics on top of imports
  console.log("Running glamping heuristics on database...");
  await db.run(`
    UPDATE places 
    SET type = 'glamping' 
    WHERE type = 'campground' 
      AND (
        name LIKE '%glamping%' OR name LIKE '%glamp%' OR name LIKE '%yurt%' OR name LIKE '%jurte%' OR name LIKE '%lodge%'
      )
  `);

  console.log(`================================================`);
  console.log(`⭐ France & Italy Import Complete!`);
  console.log(`   Imported a total of ${totalImported} verified places.`);
  console.log(`================================================`);
}

run().catch(console.error);
