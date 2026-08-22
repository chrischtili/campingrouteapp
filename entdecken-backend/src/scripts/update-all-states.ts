import { getDb } from '../db/db.js';
import { assignState, TARGET_COUNTRIES } from '../db/geo.js';

export async function assignGeoStates(db: any) {
  console.log("Loading places needing state assignment from database...");
  const places = await db.all("SELECT id, name, latitude, longitude, country FROM places WHERE country IN ('DE', 'AT', 'CH', 'FR', 'IT', 'NL')");
  console.log(`Loaded ${places.length} places.`);

  let updatedCount = 0;
  const stmt = await db.prepare("UPDATE places SET state = ? WHERE id = ?");

  await db.run('BEGIN TRANSACTION');
  let uncommitted = 0;

  for (const place of places) {
    const lat = place.latitude;
    const lon = place.longitude;
    const country = (place.country || '').toUpperCase();

    if (isNaN(lat) || isNaN(lon)) continue;

    let stateName = await assignState(country, lat, lon);

    // Hardcoded bounding boxes for German city-states (Berlin, Bremen, Hamburg) in case of boundary edge issues
    if (country === 'DE' && !stateName) {
      if (lat >= 52.3381 && lat <= 52.6755 && lon >= 13.0883 && lon <= 13.7611) {
        stateName = 'Berlin';
      } else if (lat >= 53.395 && lat <= 53.75 && lon >= 9.65 && lon <= 10.35) {
        stateName = 'Hamburg';
      } else if ((lat >= 53.0 && lat <= 53.25 && lon >= 8.5 && lon <= 9.0) || (lat >= 53.45 && lat <= 53.65 && lon >= 8.5 && lon <= 8.7)) {
        stateName = 'Bremen';
      }
    }

    if (stateName) {
      await stmt.run(stateName, place.id);
      updatedCount++;
      uncommitted++;
    }

    if (uncommitted >= 500) {
      await db.run('COMMIT');
      await db.run('BEGIN TRANSACTION');
      uncommitted = 0;
      if (updatedCount % 5000 === 0) {
        console.log(`Progress: Assigned state to ${updatedCount}/${places.length} places...`);
      }
    }
  }

  await db.run('COMMIT');
  await stmt.finalize();
  console.log(`✅ Successfully assigned geo-states to ${updatedCount}/${places.length} places in the database!`);
}

// Auto-run if executed standalone
if (process.argv[1]?.includes('update-all-states')) {
  getDb()
    .then(db => assignGeoStates(db))
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
