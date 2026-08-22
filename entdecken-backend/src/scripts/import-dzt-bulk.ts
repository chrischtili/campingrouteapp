import { getDb } from '../db/db.js';
import https from 'https';
import { assignGeoStates } from './update-all-states.js';

const SPARQL_URL = 'https://proxy.opendatagermany.io/api/ts/v1/kg/sparql';
const DZT_API_KEY = process.env.DZT_API_KEY || 'b513a9bd29df07836f0d483ff34b3518';

function runSparql(query: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const payload = query;
    const req = https.request(
      SPARQL_URL,
      {
        method: 'POST',
        headers: {
          accept: 'application/sparql-results+json',
          'content-type': 'text/plain',
          'x-api-key': DZT_API_KEY,
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 45000
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const bindings = parsed?.results?.bindings || [];
            resolve(bindings);
          } catch (e) {
            reject(new Error(`Failed to parse SPARQL response: ${body.slice(0, 200)}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('SPARQL request timed out'));
    });

    req.write(payload);
    req.end();
  });
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function normalizeWords(str: string): string[] {
  return (str || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['camping', 'campingplatz', 'stellplatz', 'wohnmobilstellplatz', 'ferienpark', 'der', 'die', 'das', 'und', 'campground'].includes(w));
}

function cleanHtml(str: string): string {
  return (str || '').replace(/<[^>]*>?/gm, '').trim();
}

async function importDztBulk() {
  console.log('=== Starting Memory-Safe DZT Knowledge Graph Bulk Ingestion ===\n');
  const db = await getDb();

  // Optimize SQLite performance & reduce disk churn during bulk insertion
  await db.exec(`
    PRAGMA synchronous = OFF;
    PRAGMA temp_store = MEMORY;
    DROP TRIGGER IF EXISTS places_fts_ai;
    DROP TRIGGER IF EXISTS places_fts_au;
    DROP TRIGGER IF EXISTS places_fts_ad;
  `);

  // 1. Fetch all Campgrounds from DZT
  console.log('📥 1. Fetching Campgrounds from DZT SPARQL Endpoint...');
  const campgroundQuery = `
PREFIX schema: <https://schema.org/>

SELECT ?id ?name ?desc ?lat ?lon ?image ?street ?locality ?postalCode ?phone ?url
WHERE {
  ?id a schema:Campground ;
      schema:name ?name .
  OPTIONAL { ?id schema:description ?desc }
  OPTIONAL { 
    ?id schema:geo ?geo .
    OPTIONAL { ?geo schema:latitude ?lat ; schema:longitude ?lon . }
  }
  OPTIONAL { ?id schema:image ?image }
  OPTIONAL { ?id schema:telephone ?phone }
  OPTIONAL { ?id schema:url ?url }
  OPTIONAL {
    ?id schema:address ?address .
    OPTIONAL { ?address schema:streetAddress ?street }
    OPTIONAL { ?address schema:addressLocality ?locality }
    OPTIONAL { ?address schema:postalCode ?postalCode }
  }
}
`;

  let campgrounds: any[] = [];
  try {
    campgrounds = await runSparql(campgroundQuery);
    console.log(`✅ Retrieved ${campgrounds.length} Campground records from DZT.\n`);
  } catch (err: any) {
    console.warn(`⚠️ Could not fetch campgrounds: ${err.message}`);
  }

  // Load existing German places into memory for fast spatial lookup
  console.log('⚡ Loading existing German places for fast spatial matching...');
  const allGermanPlaces = await db.all(
    `SELECT id, name, type, latitude, longitude, city, street, postal_code, address, description, image_url, phone, website, source FROM places WHERE country = 'DE'`
  );
  console.log(`✅ ${allGermanPlaces.length} existing places in memory.\n`);

  let campEnriched = 0;
  let campInserted = 0;
  let duplicatesCleaned = 0;

  await db.run('BEGIN TRANSACTION');
  let uncommitted = 0;

  for (const item of campgrounds) {
    const rawId = item.id?.value;
    const name = item.name?.value;
    if (!name || !rawId) continue;

    const lat = parseFloat(item.lat?.value);
    const lon = parseFloat(item.lon?.value);
    const desc = cleanHtml(item.desc?.value || '');
    const imageUrl = item.image?.value || null;
    const street = item.street?.value || null;
    const city = item.locality?.value || null;
    const postalCode = item.postalCode?.value || null;
    const phone = item.phone?.value || null;
    const website = item.url?.value || null;

    const dztWords = normalizeWords(name);

    let bestMatch: any = null;
    let minDistance = 999999;

    if (!isNaN(lat) && !isNaN(lon)) {
      for (const cand of allGermanPlaces) {
        if (cand.type !== 'campground' && cand.type !== 'caravan') continue;
        if (Math.abs(cand.latitude - lat) > 0.05 || Math.abs(cand.longitude - lon) > 0.05) continue;

        const distKm = haversineDistance(lat, lon, cand.latitude, cand.longitude);
        if (distKm < 0.8) {
          const candWords = normalizeWords(cand.name);
          const hasCommonWord = dztWords.some((w) => candWords.includes(w)) || dztWords.length === 0;

          if (distKm < 0.1 || hasCommonWord) {
            if (distKm < minDistance) {
              minDistance = distKm;
              bestMatch = cand;
            }
          }
        }
      }
    }

    if (bestMatch) {
      const updates: string[] = [];
      const params: any[] = [];

      if (desc && (!bestMatch.description || bestMatch.description.length < desc.length || bestMatch.description.includes('Campingplatz in Deutschland'))) {
        updates.push('description = ?');
        params.push(desc);
        bestMatch.description = desc;
      }
      if (imageUrl && !bestMatch.image_url) {
        updates.push('image_url = ?');
        params.push(imageUrl);
        bestMatch.image_url = imageUrl;
      }
      if (phone && !bestMatch.phone) {
        updates.push('phone = ?');
        params.push(phone);
        bestMatch.phone = phone;
      }
      if (website && !bestMatch.website) {
        updates.push('website = ?');
        params.push(website);
        bestMatch.website = website;
      }
      if (city && (!bestMatch.city || bestMatch.city === 'null')) {
        updates.push('city = ?');
        params.push(city);
        bestMatch.city = city;
      }
      if (street && !bestMatch.street) {
        updates.push('street = ?');
        params.push(street);
        bestMatch.street = street;
      }
      if (postalCode && !bestMatch.postal_code) {
        updates.push('postal_code = ?');
        params.push(postalCode);
        bestMatch.postal_code = postalCode;
      }

      const fullAddress = [street || bestMatch.street, postalCode || bestMatch.postal_code, city || bestMatch.city, 'Deutschland'].filter(Boolean).join(', ');
      if (fullAddress && (!bestMatch.address || bestMatch.address === 'Deutschland')) {
        updates.push('address = ?');
        params.push(fullAddress);
        bestMatch.address = fullAddress;
      }

      updates.push("source = 'dzt,osm'");
      updates.push("data_quality = 90");
      params.push(bestMatch.id);

      await db.run(`UPDATE places SET ${updates.join(', ')} WHERE id = ?`, params);
      campEnriched++;

      const duplicateDztId = `dzt-${rawId.split('/').pop()}`;
      if (bestMatch.id !== duplicateDztId) {
        const delRes = await db.run(`DELETE FROM places WHERE id = ?`, [duplicateDztId]);
        if (delRes?.changes) duplicatesCleaned += delRes.changes;
      }
    } else if (!isNaN(lat) && !isNaN(lon)) {
      const placeId = `dzt-${rawId.split('/').pop() || Math.random().toString(36).slice(2, 9)}`;
      const address = [street, postalCode, city, 'Deutschland'].filter(Boolean).join(', ');

      await db.run(
        `INSERT OR REPLACE INTO places (
          id, name, type, latitude, longitude, country, city, postal_code, street,
          description, image_url, phone, website, address, source, data_quality, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          placeId,
          name,
          'campground',
          lat,
          lon,
          'DE',
          city,
          postalCode,
          street,
          desc || null,
          imageUrl,
          phone,
          website,
          address || null,
          'dzt',
          85,
          new Date().toISOString()
        ]
      );
      campInserted++;
    }

    uncommitted++;
    if (uncommitted >= 300) {
      await db.run('COMMIT');
      await db.run('PRAGMA wal_checkpoint(TRUNCATE)');
      await db.run('BEGIN TRANSACTION');
      uncommitted = 0;
    }
  }

  await db.run('COMMIT');
  await db.run('PRAGMA wal_checkpoint(TRUNCATE)');
  console.log(`🏕️ Campgrounds: ${campEnriched} enriched, ${campInserted} new added, ${duplicatesCleaned} duplicates merged.`);

  // 2. Fetch Tourist Attractions in batches
  console.log('\n📥 2. Fetching Tourist Attractions, Parks, Castles & Museums from DZT...');
  const ATTRACTION_TYPES = ['schema:TouristAttraction', 'schema:Park', 'schema:Museum', 'schema:CivicStructure'];
  
  let attrEnriched = 0;
  let attrInserted = 0;

  for (const aType of ATTRACTION_TYPES) {
    let offset = 0;
    const batchSize = 3000;

    while (true) {
      console.log(`  Fetching ${aType} (Offset: ${offset}, Limit: ${batchSize})...`);
      const attractionQuery = `
PREFIX schema: <https://schema.org/>

SELECT ?id ?name ?desc ?lat ?lon ?image ?street ?locality ?postalCode ?phone ?url
WHERE {
  ?id a ${aType} ;
      schema:name ?name .
  ?id schema:geo ?geo .
  ?geo schema:latitude ?lat ; schema:longitude ?lon .
  OPTIONAL { ?id schema:description ?desc }
  OPTIONAL { ?id schema:image ?image }
  OPTIONAL { ?id schema:telephone ?phone }
  OPTIONAL { ?id schema:url ?url }
  OPTIONAL {
    ?id schema:address ?address .
    OPTIONAL { ?address schema:streetAddress ?street }
    OPTIONAL { ?address schema:addressLocality ?locality }
    OPTIONAL { ?address schema:postalCode ?postalCode }
  }
}
LIMIT ${batchSize} OFFSET ${offset}
`;

      let batch: any[] = [];
      try {
        batch = await runSparql(attractionQuery);
      } catch (err: any) {
        console.warn(`  ⚠️ Category ${aType} finished at offset ${offset}.`);
        break;
      }

      if (!batch || batch.length === 0) {
        break;
      }
      console.log(`  ✅ Processing ${batch.length} ${aType} records...`);

      await db.run('BEGIN TRANSACTION');
      let batchUncommitted = 0;

      for (const item of batch) {
        const rawId = item.id?.value;
        const name = item.name?.value;
        if (!name || !rawId) continue;

        const lat = parseFloat(item.lat?.value);
        const lon = parseFloat(item.lon?.value);
        if (isNaN(lat) || isNaN(lon)) continue;

        const desc = cleanHtml(item.desc?.value || '');
        const imageUrl = item.image?.value || null;
        const street = item.street?.value || null;
        const city = item.locality?.value || null;
        const postalCode = item.postalCode?.value || null;
        const phone = item.phone?.value || null;
        const website = item.url?.value || null;

        const dztWords = normalizeWords(name);

        let bestMatch: any = null;
        let minDistance = 999999;

        for (const cand of allGermanPlaces) {
          if (cand.type !== 'attraction') continue;
          if (Math.abs(cand.latitude - lat) > 0.05 || Math.abs(cand.longitude - lon) > 0.05) continue;

          const distKm = haversineDistance(lat, lon, cand.latitude, cand.longitude);
          if (distKm < 0.6) {
            const candWords = normalizeWords(cand.name);
            const hasCommonWord = dztWords.some((w) => candWords.includes(w)) || dztWords.length === 0;

            if (distKm < 0.1 || hasCommonWord) {
              if (distKm < minDistance) {
                minDistance = distKm;
                bestMatch = cand;
              }
            }
          }
        }

        if (bestMatch) {
          const updates: string[] = [];
          const params: any[] = [];

          if (desc && (!bestMatch.description || bestMatch.description.length < desc.length)) {
            updates.push('description = ?');
            params.push(desc);
            bestMatch.description = desc;
          }
          if (imageUrl && !bestMatch.image_url) {
            updates.push('image_url = ?');
            params.push(imageUrl);
            bestMatch.image_url = imageUrl;
          }
          if (city && (!bestMatch.city || bestMatch.city === 'null')) {
            updates.push('city = ?');
            params.push(city);
            bestMatch.city = city;
          }
          if (street && !bestMatch.street) {
            updates.push('street = ?');
            params.push(street);
            bestMatch.street = street;
          }

          const fullAddress = [street || bestMatch.street, postalCode || bestMatch.postal_code, city || bestMatch.city, 'Deutschland'].filter(Boolean).join(', ');
          if (fullAddress && (!bestMatch.address || bestMatch.address === 'Deutschland')) {
            updates.push('address = ?');
            params.push(fullAddress);
            bestMatch.address = fullAddress;
          }

          updates.push("source = 'dzt,osm'");
          updates.push("data_quality = 90");
          params.push(bestMatch.id);

          await db.run(`UPDATE places SET ${updates.join(', ')} WHERE id = ?`, params);
          attrEnriched++;

          const duplicateDztId = `dzt-${rawId.split('/').pop()}`;
          if (bestMatch.id !== duplicateDztId) {
            const delRes = await db.run(`DELETE FROM places WHERE id = ?`, [duplicateDztId]);
            if (delRes?.changes) duplicatesCleaned += delRes.changes;
          }
        } else {
          const placeId = `dzt-${rawId.split('/').pop() || Math.random().toString(36).slice(2, 9)}`;
          const address = [street, postalCode, city, 'Deutschland'].filter(Boolean).join(', ');

          await db.run(
            `INSERT OR REPLACE INTO places (
              id, name, type, latitude, longitude, country, city, postal_code, street,
              description, image_url, phone, website, address, source, data_quality, last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              placeId,
              name,
              'attraction',
              lat,
              lon,
              'DE',
              city,
              postalCode,
              street,
              desc || null,
              imageUrl,
              phone,
              website,
              address || null,
              'dzt',
              85,
              new Date().toISOString()
            ]
          );
          attrInserted++;
        }

        batchUncommitted++;
        if (batchUncommitted >= 300) {
          await db.run('COMMIT');
          await db.run('BEGIN TRANSACTION');
          batchUncommitted = 0;
        }
      }

      await db.run('COMMIT');
      await db.run('PRAGMA wal_checkpoint(TRUNCATE)');

      offset += batchSize;
      if (batch.length < batchSize) {
        break;
      }
    }
  }

  console.log(`🏰 Attractions: ${attrEnriched} existing places enriched & fused, ${attrInserted} new added.`);

  // 3. Automatically assign geo-states to all newly imported places
  console.log('\n🗺️ 3. Assigning Bundesländer & Provinces based on polygon boundaries...');
  await assignGeoStates(db);

  // 4. Final Rebuild of Full-Text Search Index & Triggers
  console.log('\n🧹 4. Rebuilding full-text search index...');
  await db.exec(`
    DELETE FROM places_fts;
    INSERT INTO places_fts(rowid, name, description, address, city, amenities, state)
    SELECT rowid, name, description, address, city, amenities, state FROM places;

    CREATE TRIGGER IF NOT EXISTS places_fts_ai AFTER INSERT ON places BEGIN
      INSERT INTO places_fts(rowid, name, description, address, city, amenities, state)
      VALUES (new.rowid, new.name, new.description, new.address, new.city, new.amenities, new.state);
    END;
    CREATE TRIGGER IF NOT EXISTS places_fts_ad AFTER DELETE ON places BEGIN
      DELETE FROM places_fts WHERE rowid = old.rowid;
    END;
    CREATE TRIGGER IF NOT EXISTS places_fts_au AFTER UPDATE ON places BEGIN
      DELETE FROM places_fts WHERE rowid = old.rowid;
      INSERT INTO places_fts(rowid, name, description, address, city, amenities, state)
      VALUES (new.rowid, new.name, new.description, new.address, new.city, new.amenities, new.state);
    END;

    PRAGMA synchronous = NORMAL;
    VACUUM;
    PRAGMA wal_checkpoint(TRUNCATE);
  `);
  console.log('✅ Full-text search index rebuilt and SQLite database optimized & compacted.');

  console.log('\n======================================================');
  console.log('🎉 TOTAL DZT BULK IMPORT COMPLETE:');
  console.log(`   Total Existing Places Enriched: ${campEnriched + attrEnriched}`);
  console.log(`   Total Brand New Places Added: ${campInserted + attrInserted}`);
  console.log(`   Total Duplicates Cleaned: ${duplicatesCleaned}`);
  console.log('======================================================\n');
}

importDztBulk()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error during DZT bulk import:', err);
    process.exit(1);
  });
