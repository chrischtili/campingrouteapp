import { getDb } from '../db/db.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { upsertPlace, NormalizedPlace } from './lib/import-utils.js';
import { loadCountries, pointInCountry, TARGET_COUNTRIES, COUNTRY_NAMES } from '../db/geo.js';

const TARGET_DB_PATH = '/Users/christian/projekte/campingroute_app/places.sqlite';

async function determineCountry(
  lat: number,
  lon: number,
  dbCountry: string,
  countries: Awaited<ReturnType<typeof loadCountries>>
): Promise<string | null> {
  const code = dbCountry ? dbCountry.toUpperCase().trim() : "";
  if (TARGET_COUNTRIES.includes(code)) return code;

  const polyCode = pointInCountry(lat, lon, countries);
  if (polyCode && TARGET_COUNTRIES.includes(polyCode)) return polyCode;

  // Bounding-box fallback
  if (lat >= 47.0 && lat <= 55.2 && lon >= 5.8 && lon <= 15.2) return "DE";
  if (lat >= 46.2 && lat <= 49.1 && lon >= 9.5 && lon <= 17.2) return "AT";
  if (lat >= 45.8 && lat <= 47.9 && lon >= 5.9 && lon <= 10.5) return "CH";
  if (lat >= 54.5 && lat <= 57.9 && lon >= 8.0 && lon <= 12.8) return "DK";
  return null;
}

async function run() {
  console.log(`Connecting to local target database: ${TARGET_DB_PATH}...`);
  const sourceDb = await open({
    filename: TARGET_DB_PATH,
    driver: sqlite3.Database
  });

  const destDb = await getDb();

  console.log("Loading country polygons...");
  const countryFeatures = await loadCountries();

  console.log("Fetching places from source database...");
  // Get all places with verified website
  const sourcePlaces = await sourceDb.all(`
    SELECT * FROM places 
    WHERE website != '' AND website != 'N/A'
  `);

  console.log(`Found ${sourcePlaces.length} places with websites in source database. Merging into CampingRoute database...`);
  let importedCount = 0;

  for (const sp of sourcePlaces) {
    const countryCode = await determineCountry(sp.lat, sp.lon, sp.country || '', countryFeatures);
    if (!countryCode) {
      continue; // Skip countries outside of target region
    }

    const name = sp.name;
    const lat = sp.lat;
    const lon = sp.lon;
    const rawCategory = sp.category || 'camp_site';
    
    // Determine type (campground, caravan, glamping)
    let type = rawCategory === 'camp_site' ? 'campground' : 'caravan';
    
    const isGlamping = 
      name.toLowerCase().includes('glamping') || 
      name.toLowerCase().includes('glamp') || 
      name.toLowerCase().includes('yurt') || 
      name.toLowerCase().includes('jurte') || 
      name.toLowerCase().includes('lodge') || 
      (sp.description || '').toLowerCase().includes('glamping');

    if (isGlamping) {
      type = 'glamping';
    }

    const description = sp.description || null;
    const price = sp.fee || (sp.fee === 'no' ? 'Free' : 'Paid');
    const phone = sp.phone || null;
    const website = sp.website || null;
    const contact = [phone, website].filter(Boolean).join(' | ') || 'N/A';

    const place: NormalizedPlace = {
      id: sp.id,
      name,
      type,
      latitude: lat,
      longitude: lon,
      country: countryCode,
      description,
      image_url: sp.image_url || null,
      price: price || 'Paid',
      contact,
      website,
      phone,
      address: sp.address || COUNTRY_NAMES[countryCode],
      source: 'osm'
    };

    await upsertPlace(destDb, place);
    importedCount++;
  }

  console.log(`================================================`);
  console.log(`⭐ Places Merging Complete!`);
  console.log(`   Imported/Updated ${importedCount} verified places.`);
  console.log(`================================================`);
  
  await sourceDb.close();
}

run().catch(console.error);
