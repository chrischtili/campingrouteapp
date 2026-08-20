import { getDb } from '../db/db.js';

async function run() {
  const db = await getDb();
  
  // Heuristic-based migration to flag glamping sites
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

  console.log(`Successfully migrated ${result.changes} campgrounds to 'glamping' type based on name/description heuristics!`);
}

run().catch(console.error);
