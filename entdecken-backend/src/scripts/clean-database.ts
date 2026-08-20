import { getDb } from '../db/db.js';

async function run() {
  const db = await getDb();

  // 1. Delete places in Estonia (lon 21-28, lat 57-60)
  const estoniaResult = await db.run(`
    DELETE FROM places 
    WHERE longitude >= 21.0 AND longitude <= 28.5 AND latitude >= 57.0 AND latitude <= 60.0
  `);
  console.log(`Deleted ${estoniaResult.changes} misclassified places located in Estonia.`);

  // 2. Delete places in Russia (lon > 28, lat < 60)
  const russiaResult = await db.run(`
    DELETE FROM places 
    WHERE longitude > 28.0 AND latitude < 60.0
  `);
  console.log(`Deleted ${russiaResult.changes} misclassified places located in Russia.`);

  // 3. Delete any place that doesn't belong to our 6 target countries
  const targetCountries = ['DE', 'AT', 'CH', 'DK', 'NO', 'SE'];
  const placeholders = targetCountries.map(() => '?').join(',');
  const countryResult = await db.run(`
    DELETE FROM places 
    WHERE country NOT IN (${placeholders})
  `, targetCountries);
  console.log(`Deleted ${countryResult.changes} places outside target countries.`);
}

run().catch(console.error);
