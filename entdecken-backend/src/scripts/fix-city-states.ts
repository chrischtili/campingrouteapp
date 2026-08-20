import { getDb } from '../db/db.js';

async function run() {
  const db = await getDb();
  
  // Update Berlin places
  const berlinResult = await db.run(`
    UPDATE places 
    SET state = 'Berlin' 
    WHERE country = 'DE' 
      AND latitude BETWEEN 52.3381 AND 52.6755 
      AND longitude BETWEEN 13.0883 AND 13.7611 
      AND (address LIKE '%Berlin%' OR name LIKE '%Berlin%' OR name LIKE '%Berliner%')
  `);
  console.log(`Updated Berlin places state. Changes:`, berlinResult.changes);

  // Update Hamburg places (with refined latitude to exclude lower saxony clubs)
  const hamburgResult = await db.run(`
    UPDATE places 
    SET state = 'Hamburg' 
    WHERE country = 'DE' 
      AND latitude BETWEEN 53.395 AND 53.75 
      AND longitude BETWEEN 9.65 AND 10.35 
      AND (address LIKE '%Hamburg%' OR name LIKE '%Hamburg%')
  `);
  console.log(`Updated Hamburg places state. Changes:`, hamburgResult.changes);

  // Update Bremen/Bremerhaven places
  const bremenResult = await db.run(`
    UPDATE places 
    SET state = 'Bremen' 
    WHERE country = 'DE' 
      AND (
        (latitude BETWEEN 53.0 AND 53.25 AND longitude BETWEEN 8.5 AND 9.0) OR 
        (latitude BETWEEN 53.45 AND 53.65 AND longitude BETWEEN 8.5 AND 8.7)
      )
      AND (address LIKE '%Bremen%' OR address LIKE '%Bremerhaven%' OR name LIKE '%Bremen%')
  `);
  console.log(`Updated Bremen places state. Changes:`, bremenResult.changes);
}

run().catch(console.error);
