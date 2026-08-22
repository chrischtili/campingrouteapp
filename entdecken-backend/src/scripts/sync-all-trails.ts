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
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on('end', () => {
          try {
            const body = Buffer.concat(chunks).toString('utf8');
            const parsed = JSON.parse(body);
            const bindings = parsed?.results?.bindings || [];
            resolve(Array.isArray(bindings) ? bindings : []);
          } catch (e: any) {
            reject(new Error(`Failed to parse SPARQL response: ${e.message}`));
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
  typePrefix: 'odta' | 'schema';
  type: 'hiking' | 'biking' | 'both';
}

const TRAIL_TYPE_GROUPS: TrailTypeGroup[] = [
  { subtype: 'HikingTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'HikingRoute', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'LongDistanceHikeTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'WinterHikeTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'PilgrimageTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'MountaineeringTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'AlpineTourTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'MountainTourTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'NordicWalkingTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'TrailRunning', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'ViaFerrata', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'SightseeingTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'NatureTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'CityTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'CityTour', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'PanoramaTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'BikeTourTrail', typePrefix: 'odta', type: 'biking' },
  { subtype: 'BicycleRoute', typePrefix: 'odta', type: 'biking' },
  { subtype: 'LongDistanceBikeTourTrail', typePrefix: 'odta', type: 'biking' },
  { subtype: 'MountainBikeTourTrail', typePrefix: 'odta', type: 'biking' },
  { subtype: 'RacingBikeTourTrail', typePrefix: 'odta', type: 'biking' },
  { subtype: 'GravelBikeTrail', typePrefix: 'odta', type: 'biking' },
  { subtype: 'ScenicRoute', typePrefix: 'odta', type: 'biking' },
  { subtype: 'InlineSkatingTrail', typePrefix: 'odta', type: 'biking' },
  { subtype: 'WaterTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'CanoeTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'CanoeTour', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'ThematicTrail', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'RoundTrip', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'Tour', typePrefix: 'odta', type: 'hiking' },
  { subtype: 'TouristTrip', typePrefix: 'schema', type: 'hiking' }
];

function isBikeSubtype(type: string): boolean {
  return /Bike|Rad|Cycle|InlineSkating|Motor|Gravel|Scenic/i.test(type);
}

export async function syncAllTrails() {
  console.log('🚀 Starting Comprehensive DZT Open Data Trails Sync across ALL German Regions...\n');
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

  const skippedNoGeo: string[] = [];
  const batchSize = 2000;

  for (const group of TRAIL_TYPE_GROUPS) {
    let groupInserted = 0;
    process.stdout.write(`  Querying ${group.subtype}... `);

    for (let offset = 0; offset < 50000; offset += batchSize) {
      const query = `
PREFIX schema: <https://schema.org/>
PREFIX odta: <https://odta.io/voc/>

SELECT ?id ?name ?lat ?lon ?startLat ?startLon ?line ?length ?diff ?desc ?image ?locality
WHERE {
  ?id a ${group.typePrefix}:${group.subtype} ;
      schema:name ?name .
  OPTIONAL {
    ?id schema:geo ?geo .
    OPTIONAL { ?geo schema:latitude ?lat ; schema:longitude ?lon . }
    OPTIONAL { ?geo schema:line ?line . }
  }
  OPTIONAL {
    ?id odta:startLocation ?startLoc .
    ?startLoc schema:geo ?startGeo .
    ?startGeo schema:latitude ?startLat ; schema:longitude ?startLon .
    OPTIONAL { ?startLoc schema:addressLocality ?locality . }
  }
  OPTIONAL { ?id odta:length ?lenObj . ?lenObj schema:value ?length . }
  OPTIONAL { ?id odta:difficulty ?diffObj . ?diffObj schema:name ?diff . }
  OPTIONAL { ?id schema:description ?desc . }
  OPTIONAL { ?id schema:image ?image . }
}
LIMIT ${batchSize} OFFSET ${offset}
`;

      let rows: any[] = [];
      try {
        rows = await runSparql(query);
      } catch (err: any) {
        break;
      }

      if (!rows || rows.length === 0) break;

      await db.run('BEGIN TRANSACTION');

      for (const item of rows) {
        const rawId = extractString(item.id?.value || item.id);
        const name = extractString(item.name?.value || item.name).trim();
        if (!name || !rawId) continue;
        const normName = name.toLowerCase();
        if (seenIds.has(rawId) || seenNames.has(normName)) continue;
        seenIds.add(rawId);
        seenNames.add(normName);

        let trailType = group.type;
        const lname = normName;
        if (group.subtype === 'Trail' || group.subtype === 'ThematicTrail' || group.subtype === 'Tour' || group.subtype === 'TouristTrip' || group.subtype === 'RoundTrip') {
          const looksBike = /rad|bike|cycle|radweg|radtour|radfernweg|mountainbike|veloroute/.test(lname);
          const looksHike = /wander|steig|pfad|rundweg|lehrpfad|weg|tour|runde|hike|trekking|spazier/.test(lname);
          if (looksBike && !looksHike) trailType = 'biking';
          else if (looksHike) trailType = 'hiking';
          else trailType = 'hiking';
        } else if (isBikeSubtype(group.subtype)) {
          trailType = 'biking';
        } else if (group.type === 'hiking') {
          trailType = 'hiking';
        }

        let lat = 0;
        let lon = 0;
        if (item.lat && item.lon) {
          const pLat = parseFloat(extractString(item.lat.value || item.lat));
          const pLon = parseFloat(extractString(item.lon.value || item.lon));
          const fixed = fixLatLng(pLat, pLon);
          lat = fixed[0];
          lon = fixed[1];
        }

        if ((!lat || !lon || isNaN(lat) || lat === 0) && item.startLat && item.startLon) {
          const sLat = parseFloat(extractString(item.startLat.value || item.startLat));
          const sLon = parseFloat(extractString(item.startLon.value || item.startLon));
          const fixed = fixLatLng(sLat, sLon);
          lat = fixed[0];
          lon = fixed[1];
        }

        if ((!lat || !lon || isNaN(lat) || lat === 0) && item.partLat && item.partLon) {
          const ptLat = parseFloat(extractString(item.partLat.value || item.partLat));
          const ptLon = parseFloat(extractString(item.partLon.value || item.partLon));
          const fixed = fixLatLng(ptLat, ptLon);
          lat = fixed[0];
          lon = fixed[1];
        }

        if ((!lat || !lon || isNaN(lat) || lat === 0) && item.line) {
          const lineStr = extractString(item.line.value || item.line);
          if (lineStr && typeof lineStr === 'string') {
            const first = lineStr.trim().split(/\s+/)[0];
            const parts = (first || '').split(',').map(Number);
            const [c1, c2] = parts;
            const fixed = fixLatLng(c1, c2);
            lat = fixed[0];
            lon = fixed[1];
          }
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
        let desc = cleanHtml(extractString(item.desc?.value || item.desc));
        if (desc.length > 450) desc = desc.slice(0, 447) + '...';
        const locality = extractString(item.locality?.value || item.locality) || stateName;

        let imageUrl = extractString(item.image?.value || item.image);
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
            null,
            Math.min(48, Math.max(2, Math.round(distKm * 0.12))),
            4.8,
            `Camping in ${locality}`,
            'dzt_opendata',
            new Date().toISOString()
          ]
        );
        totalInserted++;
        groupInserted++;
      }
      await db.run('COMMIT');

      if (rows.length < batchSize) break;
    }
    console.log(`+${groupInserted} imported`);
  }

  console.log(`\n  ✅ Ingestion complete: ${totalInserted} trails inserted into database (${skippedNoGeo.length} skipped without coordinates).`);

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
