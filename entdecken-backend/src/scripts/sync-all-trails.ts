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
        timeout: 120000
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

// Trail subtypes grouped by activity, queried separately (each is one cheap SPARQL
// call since odta:Trail + a fixed subtype avoids the cartesian blowup that made a
// single "SELECT DISTINCT" over all subtypes time out).
interface TrailTypeGroup {
  subtype: string;
  type: 'hiking' | 'biking' | 'both';
}

const TRAIL_TYPE_GROUPS: TrailTypeGroup[] = [
  { subtype: 'HikingTrail', type: 'hiking' },
  { subtype: 'LongDistanceHikeTrail', type: 'hiking' },
  { subtype: 'WinterHikeTrail', type: 'hiking' },
  { subtype: 'PilgrimageTrail', type: 'hiking' },
  { subtype: 'MountaineeringTrail', type: 'hiking' },
  { subtype: 'AlpineTourTrail', type: 'hiking' },
  { subtype: 'MountainTourTrail', type: 'hiking' },
  { subtype: 'NordicWalkingTrail', type: 'hiking' },
  { subtype: 'TrailRunning', type: 'hiking' },
  { subtype: 'ViaFerrata', type: 'hiking' },
  { subtype: 'SightseeingTrail', type: 'hiking' },
  { subtype: 'PanoramaTrail', type: 'hiking' },
  { subtype: 'BikeTourTrail', type: 'biking' },
  { subtype: 'LongDistanceBikeTourTrail', type: 'biking' },
  { subtype: 'MountainBikeTourTrail', type: 'biking' },
  { subtype: 'RacingBikeTourTrail', type: 'biking' },
  { subtype: 'InlineSkatingTrail', type: 'biking' },
  { subtype: 'ThematicTrail', type: 'hiking' }
];

// ThematicTrail is a supertype of several others; we query the specific hiking and
// biking types first, then only add ThematicTrail rows that are not already present.
function isBikeSubtype(type: string): boolean {
  return /Bike|Rad|Cycle|InlineSkating|Motor/i.test(type);
}

export async function syncAllTrails() {
  console.log('🚀 Starting DZT Open Data Trails Sync via SPARQL (odta:Trail subtypes)...\n');
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

  // The MCP tool "get_trails_by_criteria" is capped at 50 results per call with no
  // pagination, so it can never return the full dataset. SPARQL returns everything.
  // The core class is odta:Trail with many subtypes; coordinates live in the
  // schema:line polyline ("lon,lat,alt lon,lat,alt ...").
  const skippedNoGeo: string[] = [];
  await db.run('BEGIN TRANSACTION');
  let uncommitted = 0;

  for (const group of TRAIL_TYPE_GROUPS) {
    const query = `
PREFIX schema: <https://schema.org/>
PREFIX odta: <https://odta.io/voc/>

SELECT ?id ?name ?line ?length ?diff
WHERE {
  ?id a odta:${group.subtype} ; schema:name ?name .
  OPTIONAL { ?id schema:geo ?geo . ?geo schema:line ?line }
  OPTIONAL { ?id odta:length ?lenObj . ?lenObj schema:value ?length }
  OPTIONAL { ?id odta:difficulty ?diffObj . ?diffObj schema:name ?diff }
}
LIMIT 30000
`;

    process.stdout.write(`  Querying ${group.subtype}... `);
    let rows: any[] = [];
    try {
      rows = await runSparql(query);
    } catch (err: any) {
      console.log(`⚠️ error: ${err.message}`);
      continue;
    }
    console.log(`${rows.length} rows`);

    for (const item of rows) {
      const rawId = extractString(item.id?.value || item.id);
      const name = extractString(item.name?.value || item.name).trim();
      if (!name || !rawId) continue;
      const normName = name.toLowerCase();
      if (seenIds.has(rawId) || seenNames.has(normName)) continue;
      seenIds.add(rawId);
      seenNames.add(normName);

      // Determine trail type: the subtype group wins; fall back to name inference
      let trailType = group.type;
      const lname = normName;
      if (group.subtype === 'ThematicTrail') {
        // ThematicTrail overlaps other types; use name heuristics
        const looksBike = /rad|bike|cycle|radweg|radtour|radfernweg/.test(lname);
        const looksHike = /wander|steig|pfad|rundweg|lehrpfad|weg|tour|runde/.test(lname);
        if (looksBike && !looksHike) trailType = 'biking';
        else if (looksHike) trailType = 'hiking';
        else trailType = 'hiking';
      } else if (isBikeSubtype(group.subtype)) {
        trailType = 'biking';
      } else if (group.type === 'hiking') {
        trailType = 'hiking';
      }

      // Coordinates come from the schema:line polyline ("lon,lat,alt lon,lat,alt ...").
      // We only need the start point; the full linestring is not stored (it would
      // otherwise make trails.json enormous).
      let lat = 0;
      let lon = 0;
      const lineStr = extractString(item.line?.value || item.line);
      if (lineStr && typeof lineStr === 'string') {
        const first = lineStr.trim().split(/\s+/)[0];
        const parts = (first || '').split(',').map(Number);
        const [c1, c2] = parts;
        const fixed = fixLatLng(c1, c2);
        lat = fixed[0];
        lon = fixed[1];
      }

      if (!lat || !lon || lat < 47.0 || lat > 55.5 || lon < 5.5 || lon > 15.5) {
        skippedNoGeo.push(name);
        continue;
      }

      const trailId = `dzt-trail-${rawId.split('/').pop() || Math.random().toString(36).slice(2, 9)}`;

      let stateName = await assignState('DE', lat, lon);
      if (!stateName) stateName = 'Deutschland';

      let distKm = 12;
      const lenVal = item.length?.value;
      if (lenVal) {
        const m = parseFloat(extractString(lenVal));
        if (!isNaN(m) && m > 0) distKm = Math.round(m / 100) / 10;
      }

      let diff = 'medium';
      const diffRaw = extractString(item.diff?.value).toLowerCase();
      if (diffRaw.includes('leicht') || diffRaw.includes('easy') || diffRaw.includes('leichte') || distKm < 10) diff = 'easy';
      else if (diffRaw.includes('schwer') || diffRaw.includes('hard') || diffRaw.includes('anspruch') || distKm > 35) diff = 'hard';

      const durationHours = trailType === 'biking' ? Math.max(1, Math.round((distKm / 16) * 10) / 10) : Math.max(1, Math.round((distKm / 3.8) * 10) / 10);
      const desc = '';
      const locality = stateName;

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
          DEFAULT_TRAIL_IMAGES[Math.floor(Math.random() * DEFAULT_TRAIL_IMAGES.length)],
          locality,
          locality,
          Math.round(lat * 1000) / 1000,
          Math.round(lon * 1000) / 1000,
          null,
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
