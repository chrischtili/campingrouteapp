import { getDb } from '../db/db.js';

// Calculate distance in km between two coordinates
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Normalize place name for matching
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '') // remove non-alphanumeric
    .replace(/wohnmobilstellplatz/g, '')
    .replace(/stellplatz/g, '')
    .replace(/campingplatz/g, '')
    .replace(/camping/g, '')
    .replace(/camp/g, '')
    .trim();
}

async function run() {
  const db = await getDb();
  console.log("Loading all places for deduplication...");
  const places = await db.all("SELECT * FROM places");
  console.log(`Loaded ${places.length} places.`);

  // Sort places by latitude to enable efficient spatial window comparison
  places.sort((a, b) => a.latitude - b.latitude);

  const toDeleteIds = new Set<string>();

  console.log("Scanning for geographic duplicates with similar names...");
  for (let i = 0; i < places.length; i++) {
    const p1 = places[i];
    if (toDeleteIds.has(p1.id)) continue;

    const norm1 = normalizeName(p1.name);
    if (!norm1) continue;

    // Compare with subsequent places in the latitude window
    for (let j = i + 1; j < places.length; j++) {
      const p2 = places[j];
      
      // Latitude difference limit of 0.015 degrees (~1.6 km)
      if (p2.latitude - p1.latitude > 0.015) {
        break;
      }

      if (toDeleteIds.has(p2.id)) continue;

      // Longitude difference limit
      if (Math.abs(p2.longitude - p1.longitude) > 0.03) {
        continue;
      }

      // Exact distance check
      const dist = getDistanceKm(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
      if (dist >= 1.5) {
        continue;
      }

      const norm2 = normalizeName(p2.name);
      if (!norm2) continue;

      // Check similarity: if one name is a substring or prefix of the other (e.g. "rosenvoldstrand" vs "rosenvoldstrandparkering")
      const isSimilar = norm1.startsWith(norm2) || norm2.startsWith(norm1) || 
                        norm1.includes(norm2) || norm2.includes(norm1);

      if (isSimilar) {
        // Decide which one to keep
        const cluster = [p1, p2];
        cluster.sort((a, b) => {
          // 1. Prefer items with website in contact
          const aHasWeb = a.contact.includes('http') ? 1 : 0;
          const bHasWeb = b.contact.includes('http') ? 1 : 0;
          if (aHasWeb !== bHasWeb) return bHasWeb - aHasWeb;

          // 2. Prefer items with images in description
          const aHasImg = a.description.includes('![') ? 1 : 0;
          const bHasImg = b.description.includes('![') ? 1 : 0;
          if (aHasImg !== bHasImg) return bHasImg - aHasImg;

          // 3. Prefer higher rating
          if (a.rating !== b.rating) return b.rating - a.rating;

          // 4. Prefer longer address info
          const aAddrLen = a.address ? a.address.length : 0;
          const bAddrLen = b.address ? b.address.length : 0;
          if (aAddrLen !== bAddrLen) return bAddrLen - aAddrLen;

          return a.id.localeCompare(b.id);
        });

        const best = cluster[0];
        const duplicate = cluster[1];

        toDeleteIds.add(duplicate.id);
        console.log(`[Dedupe] Keeping: "${best.name}" (${best.id}) [Rating ${best.rating}]. Deleting duplicate: "${duplicate.name}" (${duplicate.id}) [Rating ${duplicate.rating}] - Dist: ${dist.toFixed(2)} km`);
      }
    }
  }

  const deleteIdsArray = Array.from(toDeleteIds);
  console.log(`\nFound a total of ${deleteIdsArray.length} duplicate rows to delete.`);

  if (deleteIdsArray.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < deleteIdsArray.length; i += chunkSize) {
      const chunk = deleteIdsArray.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => '?').join(',');
      await db.run(`DELETE FROM places WHERE id IN (${placeholders})`, chunk);
    }
    console.log(`Successfully deleted ${deleteIdsArray.length} duplicate rows from the database!`);
  } else {
    console.log("No duplicates found to delete.");
  }
}

run().catch(console.error);
