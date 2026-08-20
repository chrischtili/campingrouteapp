import { getDb } from '../db/db.js';

async function run() {
  const db = await getDb();
  
  // Update campgrounds with glamping amenity to have the type 'glamping'
  const result = await db.run(`
    UPDATE places 
    SET type = 'glamping' 
    WHERE type = 'campground' AND amenities LIKE '%glamping%'
  `);

  console.log(`Updated ${result.changes} places to 'glamping' type!`);
}

run().catch(console.error);
