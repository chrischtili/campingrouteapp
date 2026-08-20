import { getDb } from '../db/db.js';
import { assignState } from '../db/geo.js';

// Reassign the state/province for all places of a country using precise polygon
// data. Fixes cross-border mis-assignments (e.g. NL places tagged as German
// states by the nearest-polygon fallback).
const COUNTRY = (process.env.COUNTRY || 'NL').toUpperCase();

async function run() {
  const db = await getDb();
  const places = await db.all(
    'SELECT id, latitude, longitude FROM places WHERE country = ?',
    [COUNTRY]
  );
  console.log(`Assigning states for ${places.length} places in ${COUNTRY}...`);
  const stmt = await db.prepare('UPDATE places SET state = ? WHERE id = ?');
  let updated = 0;
  for (const p of places) {
    const state = await assignState(COUNTRY, p.latitude, p.longitude);
    await stmt.run(state || null, p.id);
    if (state) updated++;
  }
  await stmt.finalize();
  console.log(`✅ Assigned states to ${updated}/${places.length} places in ${COUNTRY}.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
