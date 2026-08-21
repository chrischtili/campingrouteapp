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

function normalizeName(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '');
}

function cleanHtml(str: string): string {
  return (str || '').replace(/<[^>]*>?/gm, '').trim();
}

async function importDztBulk() {
  console.log('=== Starting Full DZT Knowledge Graph Bulk Ingestion ===\n');
  const db = await getDb();

  // 1. Fetch all Campgrounds
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

  let campEnriched = 0;
  let campInserted = 0;

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

    const norm = normalizeName(name);

    // Check if match in existing places
    const existing = await db.all(
      `SELECT id, name, description, image_url, phone, website FROM places WHERE country = 'DE' AND (name LIKE ? OR city LIKE ?)`,
      [`%${name.slice(0, 15)}%`, city ? `%${city}%` : '%---%']
    );

    let matchedId: string | null = null;
    for (const cand of existing) {
      const candNorm = normalizeName(cand.name);
      if (candNorm.includes(norm) || norm.includes(candNorm)) {
        matchedId = cand.id;
        break;
      }
    }

    if (matchedId) {
      const updates: string[] = [];
      const params: any[] = [];

      if (desc) {
        updates.push('description = ?');
        params.push(desc);
      }
      if (imageUrl) {
        updates.push('image_url = ?');
        params.push(imageUrl);
      }
      if (phone) {
        updates.push('phone = ?');
        params.push(phone);
      }
      if (website) {
        updates.push('website = ?');
        params.push(website);
      }

      if (updates.length > 0) {
        updates.push("source = 'dzt,osm'");
        params.push(matchedId);
        await db.run(`UPDATE places SET ${updates.join(', ')} WHERE id = ?`, params);
        campEnriched++;
      }
    } else if (!isNaN(lat) && !isNaN(lon)) {
      // Insert as a new DZT place!
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

  console.log(`🏕️ Campgrounds: ${campEnriched} existing enriched, ${campInserted} new campgrounds added!`);

  // 2. Fetch Tourist Attractions, Parks, and Castles with Coordinates & Descriptions
  console.log('\n📥 2. Fetching Top Tourist Attractions, Parks & Castles from DZT...');
  const attractionQuery = `
PREFIX schema: <https://schema.org/>

SELECT ?id ?name ?desc ?lat ?lon ?image ?street ?locality ?postalCode ?phone ?url
WHERE {
  ?id a ?type ;
      schema:name ?name .
  FILTER (?type IN (schema:TouristAttraction, schema:Park, schema:Museum))
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
LIMIT 5000
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

    const norm = normalizeName(name);

    const existing = await db.all(
      `SELECT id, name, description, image_url FROM places WHERE country = 'DE' AND (name LIKE ? OR city LIKE ?)`,
      [`%${name.slice(0, 15)}%`, city ? `%${city}%` : '%---%']
    );

    let matchedId: string | null = null;
    for (const cand of existing) {
      const candNorm = normalizeName(cand.name);
      if (candNorm.includes(norm) || norm.includes(candNorm)) {
        matchedId = cand.id;
        break;
      }
    }

    if (matchedId) {
      const updates: string[] = [];
      const params: any[] = [];

      if (desc) {
        updates.push('description = ?');
        params.push(desc);
      }
      if (imageUrl) {
        updates.push('image_url = ?');
        params.push(imageUrl);
      }

      if (updates.length > 0) {
        updates.push("source = 'dzt,osm'");
        params.push(matchedId);
        await db.run(`UPDATE places SET ${updates.join(', ')} WHERE id = ?`, params);
        attrEnriched++;
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

  console.log(`🏰 Attractions: ${attrEnriched} existing enriched, ${attrInserted} new attractions added!`);

  console.log('\n======================================================');
  console.log('🎉 TOTAL DZT BULK IMPORT COMPLETE:');
  console.log(`   Total Existing Enriched: ${campEnriched + attrEnriched}`);
  console.log(`   Total Brand New Places Added: ${campInserted + attrInserted}`);
  console.log('======================================================\n');
}

importDztBulk()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error during DZT bulk import:', err);
    process.exit(1);
  });
