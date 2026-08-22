import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../db/db.js';
import { assignState } from '../db/geo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DZT_API_KEY = process.env.DZT_API_KEY || 'b513a9bd29df07836f0d483ff34b3518';

const SPARQL_URL = 'https://proxy.opendatagermany.io/api/ts/v1/kg/sparql';

function runSparql(query: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      SPARQL_URL,
      {
        method: 'POST',
        headers: {
          accept: 'application/sparql-results+json',
          'content-type': 'text/plain',
          'x-api-key': DZT_API_KEY,
          'Content-Length': Buffer.byteLength(query)
        },
        timeout: 90000
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const bindings = parsed?.results?.bindings || [];
            resolve(Array.isArray(bindings) ? bindings : []);
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
    req.write(query);
    req.end();
  });
}

function cleanHtml(str: string): string {
  return (str || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function extractString(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return extractString(val[0]);
  if (typeof val === 'object') return extractString(val['@value'] || val['de'] || val['name'] || Object.values(val)[0]);
  return String(val);
}

function fixLatLng(v1: number, v2: number): [number, number] {
  if (isNaN(v1) || isNaN(v2)) return [0, 0];
  if (v1 >= 35 && v1 <= 70 && v2 >= -15 && v2 <= 40) return [v1, v2];
  if (v2 >= 35 && v2 <= 70 && v1 >= -15 && v1 <= 40) return [v2, v1];
  return [v1, v2];
}

const DEFAULT_TRAIL_IMAGES = [
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80'
];

export async function syncAllTrails() {
  console.log('🚀 Starting DZT Open Data Trails Sync via SPARQL (bulk, all trails in one pass)...\n');
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS trails (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'hiking',
      region TEXT,
      state TEXT,
      country TEXT NOT NULL DEFAULT 'DE',
      distance_km REAL NOT NULL DEFAULT 10.0,
      duration_hours REAL,
      difficulty TEXT DEFAULT 'medium',
      elevation_gain_m INTEGER,
      description TEXT,
      highlights TEXT,
      image_url TEXT,
      start_location TEXT,
      end_location TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      polyline TEXT,
      campsites_along_count INTEGER DEFAULT 0,
      rating REAL DEFAULT 4.8,
      search_query TEXT,
      source TEXT DEFAULT 'dzt_opendata',
      last_updated TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_trails_state ON trails(state);
    CREATE INDEX IF NOT EXISTS idx_trails_country ON trails(country);
    CREATE INDEX IF NOT EXISTS idx_trails_coords ON trails(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_trails_type ON trails(type);
  `);

  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  let totalInserted = 0;

  console.log('🧹 Clearing trails table for fresh Open Data Germany ingestion...');
  await db.exec('DELETE FROM trails;');

  // Single bulk SPARQL query over the whole DZT knowledge graph.
  // The MCP tool "get_trails_by_criteria" is capped at 50 results per call with no
  // pagination, so it can never return the full dataset. SPARQL returns everything.
  const trailsQuery = `
PREFIX schema: <https://schema.org/>
PREFIX schema_http: <http://schema.org/>
PREFIX odta: <https://odta.io/voc/>
PREFIX odta_http: <http://odta.io/voc/>

SELECT DISTINCT ?id ?name ?desc ?lat ?lon ?image ?locality ?region ?length ?diff
WHERE {
  {
    ?id a schema:TouristTrip ;
        schema:name ?name .
  } UNION {
    ?id a odta:Tour ;
        schema:name ?name .
  } UNION {
    ?id a schema_http:TouristTrip ;
        schema_http:name ?name .
  } UNION {
    ?id a odta_http:Tour ;
        schema_http:name ?name .
  }
  OPTIONAL { ?id schema:description|schema_http:description ?desc }
  OPTIONAL {
    ?id schema:geo|schema_http:geo ?geo .
    OPTIONAL { ?geo schema:latitude|schema_http:latitude ?lat ; schema:longitude|schema_http:longitude ?lon . }
  }
  OPTIONAL {
    ?id odta:startLocation|odta_http:startLocation ?startLoc .
    OPTIONAL {
      ?startLoc schema:geo|schema_http:geo ?startGeo .
      ?startGeo schema:latitude|schema_http:latitude ?lat ; schema:longitude|schema_http:longitude ?lon .
    }
    OPTIONAL { ?startLoc schema:addressLocality|schema_http:addressLocality ?locality }
  }
  OPTIONAL { ?id schema:image|schema_http:image ?image }
  OPTIONAL { ?id odta:length|odta_http:length ?lenObj . OPTIONAL { ?lenObj schema:value|schema_http:value ?length } }
  OPTIONAL { ?id odta:difficulty|odta_http:difficulty ?diffObj . OPTIONAL { ?diffObj schema:name|schema_http:name ?diff } }
}
LIMIT 25000
`;

  console.log('📡 Fetching all trails from DZT SPARQL endpoint...');
  let trailsList: any[] = [];
  try {
    trailsList = await runSparql(trailsQuery);
  } catch (err: any) {
    console.warn(`  ⚠️ Could not fetch trails via SPARQL: ${err.message}`);
  }
  console.log(`  ✅ Retrieved ${trailsList.length} trail records from DZT.\n`);

  const skippedNoGeo: string[] = [];
  await db.run('BEGIN TRANSACTION');
  let uncommitted = 0;

  for (const item of trailsList) {
    const rawId = extractString(item.id?.value || item.id?.value);
    const name = extractString(item.name?.value || item.name).trim();
    if (!name || !rawId) continue;
    if (seenIds.has(rawId) || seenNames.has(name.toLowerCase())) continue;
    seenIds.add(rawId);
    seenNames.add(name.toLowerCase());

    let lat = parseFloat(extractString(item.lat?.value));
    let lon = parseFloat(extractString(item.lon?.value));

    const startLoc = item.startLoc || item.startLocation;
    if ((!lat || isNaN(lat)) && startLoc) {
      const sGeo = startLoc['schema:geo'] || startLoc.geo;
      if (sGeo) {
        lat = parseFloat(extractString(sGeo['schema:latitude'] || sGeo.latitude));
        lon = parseFloat(extractString(sGeo['schema:longitude'] || sGeo.longitude));
      }
    }

    let polyline: [number, number][] = [];
    if ((!lat || isNaN(lat)) && (item.line?.value || item['schema:line'])) {
      const lineStr = extractString(item.line?.value || item['schema:line']);
      if (lineStr && typeof lineStr === 'string') {
        const pairs = lineStr.trim().split(/\s+/);
        polyline = pairs.map(p => {
          const [c1, c2] = p.split(',').map(Number);
          return fixLatLng(c1, c2);
        }).filter(([la, lo]) => la !== 0 && lo !== 0);
        if ((!lat || isNaN(lat)) && polyline.length > 0) {
          lat = polyline[0][0];
          lon = polyline[0][1];
        }
      }
    }

    if (isNaN(lat) || isNaN(lon) || lat === 0) {
      skippedNoGeo.push(name);
      continue;
    }
    const fixed = fixLatLng(lat, lon);
    lat = fixed[0];
    lon = fixed[1];

    if (lat < 47.0 || lat > 55.5 || lon < 5.5 || lon > 15.5) continue;

    const trailId = `dzt-trail-${rawId.split('/').pop() || Math.random().toString(36).slice(2, 9)}`;

    let stateName = await assignState('DE', lat, lon);
    if (!stateName) stateName = 'Deutschland';

    let distKm = 12;
    const lenVal = item.length?.value;
    if (lenVal) {
      const m = parseFloat(extractString(lenVal));
      if (!isNaN(m) && m > 0) distKm = Math.round(m / 100) / 10;
    } else {
      const rawDesc = extractString(item.desc?.value);
      const matchKm = (name + ' ' + rawDesc).match(/(\d+(?:[.,]\d+)?)\s*km\b/i);
      if (matchKm) distKm = parseFloat(matchKm[1].replace(',', '.'));
    }

    const isBiking = name.toLowerCase().includes('rad') || name.toLowerCase().includes('bike') || name.toLowerCase().includes('cycle');
    const isHiking = name.toLowerCase().includes('wander') || name.toLowerCase().includes('steig') || name.toLowerCase().includes('pfad') || name.toLowerCase().includes('weg') || name.toLowerCase().includes('tour') || name.toLowerCase().includes('runde');
    const trailType = isBiking && isHiking ? 'both' : isBiking ? 'biking' : 'hiking';

    let diff = 'medium';
    const diffRaw = extractString(item.diff?.value).toLowerCase();
    if (diffRaw.includes('leicht') || diffRaw.includes('easy') || distKm < 10) diff = 'easy';
    else if (diffRaw.includes('schwer') || diffRaw.includes('hard') || distKm > 35) diff = 'hard';

    const durationHours = trailType === 'biking' ? Math.max(1, Math.round((distKm / 16) * 10) / 10) : Math.max(1, Math.round((distKm / 3.8) * 10) / 10);
    let desc = cleanHtml(extractString(item.desc?.value));
    if (desc.length > 450) desc = desc.slice(0, 447) + '...';

    const locality = extractString(item.locality?.value) || stateName;

    let imageUrl = extractString(item.image?.value);
    if (imageUrl && typeof imageUrl === 'string') imageUrl = imageUrl.replace(/^http:\/\//i, 'https://');
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      imageUrl = DEFAULT_TRAIL_IMAGES[Math.floor(Math.random() * DEFAULT_TRAIL_IMAGES.length)];
    }

    await db.run(
      `INSERT OR REPLACE INTO trails (
        id, name, type, region, state, country, distance_km, duration_hours,
        difficulty, elevation_gain_m, description, highlights, image_url,
        start_location, end_location, latitude, longitude, polyline,
        campsites_along_count, rating, search_query, source, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trailId,
        name,
        trailType,
        locality,
        stateName,
        'DE',
        distKm,
        durationHours,
        diff,
        Math.round(distKm * (diff === 'hard' ? 28 : diff === 'medium' ? 18 : 8)),
        desc,
        JSON.stringify([locality, `${distKm} km Tour`, `${diff === 'easy' ? 'Leichte' : diff === 'medium' ? 'Mittlere' : 'Anspruchsvolle'} Route`, 'Verifizierter DZT Open-Data Trail']),
        imageUrl,
        locality,
        locality,
        Math.round(lat * 1000) / 1000,
        Math.round(lon * 1000) / 1000,
        polyline.length > 0 ? JSON.stringify(polyline) : null,
        Math.min(48, Math.max(2, Math.round(distKm * 0.12))),
        4.8,
        `Camping in ${locality}`,
        'dzt_opendata',
        new Date().toISOString()
      ]
    );
    totalInserted++;
    uncommitted++;
    if (uncommitted >= 300) {
      await db.run('COMMIT');
      await db.run('BEGIN TRANSACTION');
      uncommitted = 0;
    }
  }

  await db.run('COMMIT');
  console.log(`  ✅ Inserted ${totalInserted} trails (${skippedNoGeo.length} skipped without coordinates).`);

  const allDbTrails = await db.all('SELECT * FROM trails ORDER BY state, name');
  console.log(`\n======================================================`);
  console.log(`🎉 TOTAL TRAILS IN DATABASE: ${allDbTrails.length}`);

  const stateCounts: Record<string, number> = {};
  for (const t of allDbTrails) {
    const st = t.state || 'Unbekannt';
    stateCounts[st] = (stateCounts[st] || 0) + 1;
  }
  for (const [st, count] of Object.entries(stateCounts)) {
    console.log(`   📍 ${st}: ${count} Touren`);
  }
  console.log(`======================================================\n`);

  const backupPaths = [
    path.resolve(process.cwd(), 'server/trails.json'),
    path.resolve(__dirname, '../../../server/trails.json')
  ];

  for (const tPath of backupPaths) {
    try {
      const parentDir = path.dirname(tPath);
      if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
      fs.writeFileSync(tPath, JSON.stringify(allDbTrails, null, 2), 'utf8');
      console.log(`💾 Backup saved to ${tPath}`);
    } catch (e: any) {
      console.warn(`Could not write backup to ${tPath}: ${e.message}`);
    }
  }
}

if (process.argv[1]?.includes('sync-all-trails')) {
  syncAllTrails()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error during trails sync:', err);
      process.exit(1);
    });
}
