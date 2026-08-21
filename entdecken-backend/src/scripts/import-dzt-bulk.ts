import { getDb } from '../db/db.js';
import https from 'https';

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
  console.log('=== Starting Smart Geo-Fusing DZT Knowledge Graph Bulk Ingestion ===\n');
  const db = await getDb();

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

  const campgrounds = await runSparql(campgroundQuery);
  console.log(`✅ Retrieved ${campgrounds.length} Campground records from DZT.\n`);

  // Load all existing German places into memory for instant fast geo-matching
  console.log('⚡ Loading existing German places for fast spatial matching...');
  const allGermanPlaces = await db.all(
    `SELECT id, name, type, latitude, longitude, city, street, postal_code, address, description, image_url, phone, website, source FROM places WHERE country = 'DE'`
  );
  console.log(`✅ ${allGermanPlaces.length} existing places in memory.\n`);

  let campEnriched = 0;
  let campInserted = 0;
  let duplicatesCleaned = 0;

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
      // Find nearby candidates within bbox +- 0.05 degrees (~5km)
      for (const cand of allGermanPlaces) {
        if (cand.type !== 'campground' && cand.type !== 'caravan') continue;
        if (Math.abs(cand.latitude - lat) > 0.05 || Math.abs(cand.longitude - lon) > 0.05) continue;

        const distKm = haversineDistance(lat, lon, cand.latitude, cand.longitude);
        if (distKm < 0.8) {
          // Check name similarity
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
      // Enrich the existing place!
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

      // If there was an old dzt-* duplicate created previously, remove it
      const duplicateDztId = `dzt-${rawId.split('/').pop()}`;
      if (bestMatch.id !== duplicateDztId) {
        const delRes = await db.run(`DELETE FROM places WHERE id = ?`, [duplicateDztId]);
        if (delRes?.changes) duplicatesCleaned += delRes.changes;
      }
    } else if (!isNaN(lat) && !isNaN(lon)) {
      // Brand new place
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
  }

  console.log(`🏕️ Campgrounds: ${campEnriched} existing places enriched & fused with DZT, ${campInserted} new added, ${duplicatesCleaned} duplicates merged.`);

  // 2. Fetch Tourist Attractions with Coordinates
  console.log('\n📥 2. Fetching Tourist Attractions, Parks & Castles from DZT...');
  const attractionQuery = `
PREFIX schema: <https://schema.org/>

SELECT ?id ?name ?desc ?lat ?lon ?image ?street ?locality ?postalCode ?phone ?url
WHERE {
  ?id a ?type ;
      schema:name ?name .
  FILTER (?type IN (schema:TouristAttraction, schema:Park, schema:Museum, schema:CivicStructure))
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
LIMIT 10000
`;

  const attractions = await runSparql(attractionQuery);
  console.log(`✅ Retrieved ${attractions.length} Attraction records with coordinates from DZT.\n`);

  let attrEnriched = 0;
  let attrInserted = 0;

  for (const item of attractions) {
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
  }

  console.log(`🏰 Attractions: ${attrEnriched} existing places enriched & fused, ${attrInserted} new added.`);

  // 3. Final Spatial Deduplication Pass
  console.log('\n🧹 3. Running final spatial deduplication pass across Germany...');
  const allPlaces = await db.all("SELECT * FROM places WHERE country = 'DE'");
  const osmPlaces = allPlaces.filter(p => !p.id.startsWith('dzt-'));
  const dztPlaces = allPlaces.filter(p => p.id.startsWith('dzt-'));

  let passMerged = 0;
  for (const dzt of dztPlaces) {
    const dztWords = normalizeWords(dzt.name);
    let bestOsm: any = null;
    let minDistance = 999999;

    for (const osm of osmPlaces) {
      if (osm.type !== dzt.type && !(osm.type.startsWith('camp') && dzt.type.startsWith('camp'))) continue;
      if (Math.abs(osm.latitude - dzt.latitude) > 0.05 || Math.abs(osm.longitude - dzt.longitude) > 0.05) continue;

      const dist = haversineDistance(dzt.latitude, dzt.longitude, osm.latitude, osm.longitude);
      if (dist < 0.6) {
        const osmWords = normalizeWords(osm.name);
        const hasCommon = dztWords.some(w => osmWords.includes(w)) || dztWords.length === 0;
        if (dist < 0.15 || hasCommon) {
          if (dist < minDistance) {
            minDistance = dist;
            bestOsm = osm;
          }
        }
      }
    }

    if (bestOsm) {
      const desc = dzt.description || bestOsm.description;
      const img = dzt.image_url || bestOsm.image_url;
      const city = dzt.city || bestOsm.city;
      const street = dzt.street || bestOsm.street;
      const postalCode = dzt.postal_code || bestOsm.postal_code;
      const address = dzt.address || bestOsm.address;
      const phone = dzt.phone || bestOsm.phone;
      const website = dzt.website || bestOsm.website;

      await db.run(
        `UPDATE places SET 
          description = ?, image_url = ?, city = ?, street = ?, postal_code = ?, 
          address = ?, phone = ?, website = ?, source = 'dzt,osm', data_quality = 90
        WHERE id = ?`,
        [desc, img, city, street, postalCode, address, phone, website, bestOsm.id]
      );

      await db.run("DELETE FROM places WHERE id = ?", [dzt.id]);
      passMerged++;
    }
  }
  console.log(`✅ Cleaned and fused ${passMerged} duplicate places into canonical OSM records.`);

  console.log('\n======================================================');
  console.log('🎉 TOTAL DZT GEO-FUSION & IMPORT COMPLETE:');
  console.log(`   Total Existing Places Enriched: ${campEnriched + attrEnriched + passMerged}`);
  console.log(`   Total Brand New Places Added: ${campInserted + attrInserted - passMerged}`);
  console.log(`   Total Duplicates Fused: ${duplicatesCleaned + passMerged}`);
  console.log('======================================================\n');
}

importDztBulk()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error during DZT bulk import:', err);
    process.exit(1);
  });
