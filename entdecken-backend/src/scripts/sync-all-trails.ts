import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../db/db.js';
import { assignState } from '../db/geo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DZT_API_KEY = process.env.DZT_API_KEY || '647e87679f71e0ec10f66056ad0721ef';

function callDztMcp(tool: string, args: Record<string, any>): Promise<any[]> {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: tool, arguments: args }
    });

    const req = https.request(
      {
        hostname: 'proxy.opendatagermany.io',
        path: '/api/its/mcp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': DZT_API_KEY,
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 25000
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            let content = parsed.result?.structuredContent;
            if (!content && parsed.result?.content?.[0]?.text) {
              try {
                content = JSON.parse(parsed.result.content[0].text);
              } catch (e) {}
            }
            const graph = content?.['@graph'] || (Array.isArray(content) ? content : []);
            resolve(Array.isArray(graph) ? graph : []);
          } catch (e) {
            resolve([]);
          }
        });
      }
    );

    req.on('error', () => resolve([]));
    req.on('timeout', () => {
      req.destroy();
      resolve([]);
    });

    req.write(payload);
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

// Comprehensive query targets covering all regions, districts, valleys, and cities across Germany
const SEARCH_TARGETS: { locality?: string; region?: string; keywords?: string; fallbackState: string }[] = [
  // --- Baden-Württemberg ---
  { locality: 'Heilbronn', fallbackState: 'Baden-Württemberg' },
  { locality: 'Heidelberg', fallbackState: 'Baden-Württemberg' },
  { locality: 'Mannheim', fallbackState: 'Baden-Württemberg' },
  { locality: 'Karlsruhe', fallbackState: 'Baden-Württemberg' },
  { locality: 'Pforzheim', fallbackState: 'Baden-Württemberg' },
  { locality: 'Baden-Baden', fallbackState: 'Baden-Württemberg' },
  { locality: 'Stuttgart', fallbackState: 'Baden-Württemberg' },
  { locality: 'Ludwigsburg', fallbackState: 'Baden-Württemberg' },
  { locality: 'Esslingen', fallbackState: 'Baden-Württemberg' },
  { locality: 'Göppingen', fallbackState: 'Baden-Württemberg' },
  { locality: 'Schwäbisch Hall', fallbackState: 'Baden-Württemberg' },
  { locality: 'Künzelsau', fallbackState: 'Baden-Württemberg' },
  { locality: 'Crailsheim', fallbackState: 'Baden-Württemberg' },
  { locality: 'Tauberbischofsheim', fallbackState: 'Baden-Württemberg' },
  { locality: 'Mosbach', fallbackState: 'Baden-Württemberg' },
  { locality: 'Sinsheim', fallbackState: 'Baden-Württemberg' },
  { locality: 'Tübingen', fallbackState: 'Baden-Württemberg' },
  { locality: 'Reutlingen', fallbackState: 'Baden-Württemberg' },
  { locality: 'Freudenstadt', fallbackState: 'Baden-Württemberg' },
  { locality: 'Calw', fallbackState: 'Baden-Württemberg' },
  { locality: 'Rottweil', fallbackState: 'Baden-Württemberg' },
  { locality: 'Balingen', fallbackState: 'Baden-Württemberg' },
  { locality: 'Villingen-Schwenningen', fallbackState: 'Baden-Württemberg' },
  { locality: 'Freiburg', fallbackState: 'Baden-Württemberg' },
  { locality: 'Lörrach', fallbackState: 'Baden-Württemberg' },
  { locality: 'Waldshut', fallbackState: 'Baden-Württemberg' },
  { locality: 'Konstanz', fallbackState: 'Baden-Württemberg' },
  { locality: 'Friedrichshafen', fallbackState: 'Baden-Württemberg' },
  { locality: 'Ravensburg', fallbackState: 'Baden-Württemberg' },
  { locality: 'Ulm', fallbackState: 'Baden-Württemberg' },
  { locality: 'Aalen', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Odenwald', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Kraichgau', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Stromberg', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Hohenlohe', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Taubertal', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Neckar', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Kocher', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Jagst', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Schwarzwald', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Nordschwarzwald', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Hochschwarzwald', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Schwäbische Alb', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Bodensee', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Hegau', fallbackState: 'Baden-Württemberg' },
  { keywords: 'Donautal', fallbackState: 'Baden-Württemberg' },
  { region: 'Baden-Württemberg', fallbackState: 'Baden-Württemberg' },

  // --- Bayern ---
  { region: 'Allgäu', fallbackState: 'Bayern' },
  { region: 'Bayerischer Wald', fallbackState: 'Bayern' },
  { region: 'Fränkische Schweiz', fallbackState: 'Bayern' },
  { region: 'Altmühltal', fallbackState: 'Bayern' },
  { region: 'Chiemsee-Alpenland', fallbackState: 'Bayern' },
  { region: 'Berchtesgadener Land', fallbackState: 'Bayern' },
  { region: 'Tegernsee Schliersee', fallbackState: 'Bayern' },
  { region: 'Zugspitz Region', fallbackState: 'Bayern' },
  { region: 'Fichtelgebirge', fallbackState: 'Bayern' },
  { region: 'Frankenwald', fallbackState: 'Bayern' },
  { region: 'Rhön', fallbackState: 'Bayern' },
  { region: 'Spessart', fallbackState: 'Bayern' },
  { region: 'Steigerwald', fallbackState: 'Bayern' },
  { region: 'Fränkisches Seenland', fallbackState: 'Bayern' },
  { region: 'Oberpfälzer Wald', fallbackState: 'Bayern' },
  { region: 'Bayerischer Jura', fallbackState: 'Bayern' },
  { locality: 'München', fallbackState: 'Bayern' },
  { locality: 'Nürnberg', fallbackState: 'Bayern' },
  { locality: 'Augsburg', fallbackState: 'Bayern' },
  { locality: 'Würzburg', fallbackState: 'Bayern' },
  { locality: 'Regensburg', fallbackState: 'Bayern' },
  { locality: 'Bamberg', fallbackState: 'Bayern' },
  { locality: 'Passau', fallbackState: 'Bayern' },
  { region: 'Bayern', fallbackState: 'Bayern' },

  // --- Hessen ---
  { region: 'Taunus', fallbackState: 'Hessen' },
  { region: 'Vogelsberg', fallbackState: 'Hessen' },
  { region: 'Kellerwald-Edersee', fallbackState: 'Hessen' },
  { region: 'Westerwald', fallbackState: 'Hessen' },
  { region: 'Lahntal', fallbackState: 'Hessen' },
  { region: 'Nordhessen', fallbackState: 'Hessen' },
  { region: 'Rheingau', fallbackState: 'Hessen' },
  { region: 'Bergstraße', fallbackState: 'Hessen' },
  { locality: 'Frankfurt', fallbackState: 'Hessen' },
  { locality: 'Wiesbaden', fallbackState: 'Hessen' },
  { locality: 'Kassel', fallbackState: 'Hessen' },
  { locality: 'Darmstadt', fallbackState: 'Hessen' },
  { locality: 'Fulda', fallbackState: 'Hessen' },
  { locality: 'Marburg', fallbackState: 'Hessen' },
  { region: 'Hessen', fallbackState: 'Hessen' },

  // --- Nordrhein-Westfalen ---
  { region: 'Sauerland', fallbackState: 'Nordrhein-Westfalen' },
  { region: 'Siegerland-Wittgenstein', fallbackState: 'Nordrhein-Westfalen' },
  { region: 'Bergisches Land', fallbackState: 'Nordrhein-Westfalen' },
  { region: 'Teutoburger Wald', fallbackState: 'Nordrhein-Westfalen' },
  { region: 'Münsterland', fallbackState: 'Nordrhein-Westfalen' },
  { region: 'Nordeifel', fallbackState: 'Nordrhein-Westfalen' },
  { region: 'Niederrhein', fallbackState: 'Nordrhein-Westfalen' },
  { region: 'Ruhrgebiet', fallbackState: 'Nordrhein-Westfalen' },
  { region: 'Siebengebirge', fallbackState: 'Nordrhein-Westfalen' },
  { locality: 'Köln', fallbackState: 'Nordrhein-Westfalen' },
  { locality: 'Düsseldorf', fallbackState: 'Nordrhein-Westfalen' },
  { locality: 'Bonn', fallbackState: 'Nordrhein-Westfalen' },
  { locality: 'Aachen', fallbackState: 'Nordrhein-Westfalen' },
  { locality: 'Münster', fallbackState: 'Nordrhein-Westfalen' },
  { locality: 'Bielefeld', fallbackState: 'Nordrhein-Westfalen' },
  { locality: 'Winterberg', fallbackState: 'Nordrhein-Westfalen' },
  { region: 'Nordrhein-Westfalen', fallbackState: 'Nordrhein-Westfalen' },

  // --- Rheinland-Pfalz & Saarland ---
  { region: 'Mosel', fallbackState: 'Rheinland-Pfalz' },
  { region: 'Vulkaneifel', fallbackState: 'Rheinland-Pfalz' },
  { region: 'Hunsrück', fallbackState: 'Rheinland-Pfalz' },
  { region: 'Pfälzerwald', fallbackState: 'Rheinland-Pfalz' },
  { region: 'Mittelrhein', fallbackState: 'Rheinland-Pfalz' },
  { region: 'Rheinhessen', fallbackState: 'Rheinland-Pfalz' },
  { region: 'Naheland', fallbackState: 'Rheinland-Pfalz' },
  { region: 'Ahrtal', fallbackState: 'Rheinland-Pfalz' },
  { locality: 'Mainz', fallbackState: 'Rheinland-Pfalz' },
  { locality: 'Koblenz', fallbackState: 'Rheinland-Pfalz' },
  { locality: 'Trier', fallbackState: 'Rheinland-Pfalz' },
  { region: 'Saarschleifenland', fallbackState: 'Saarland' },
  { locality: 'Saarbrücken', fallbackState: 'Saarland' },

  // --- Niedersachsen, Bremen & Hamburg ---
  { region: 'Harz', fallbackState: 'Niedersachsen' },
  { region: 'Lüneburger Heide', fallbackState: 'Niedersachsen' },
  { region: 'Weserbergland', fallbackState: 'Niedersachsen' },
  { region: 'Ostfriesland', fallbackState: 'Niedersachsen' },
  { region: 'Nordseeküste', fallbackState: 'Niedersachsen' },
  { region: 'Osnabrücker Land', fallbackState: 'Niedersachsen' },
  { region: 'Emsland', fallbackState: 'Niedersachsen' },
  { locality: 'Hannover', fallbackState: 'Niedersachsen' },
  { locality: 'Braunschweig', fallbackState: 'Niedersachsen' },
  { locality: 'Göttingen', fallbackState: 'Niedersachsen' },
  { locality: 'Bremen', fallbackState: 'Bremen' },
  { locality: 'Hamburg', fallbackState: 'Hamburg' },

  // --- Sachsen, Thüringen & Sachsen-Anhalt ---
  { region: 'Sächsische Schweiz', fallbackState: 'Sachsen' },
  { region: 'Erzgebirge', fallbackState: 'Sachsen' },
  { region: 'Vogtland', fallbackState: 'Sachsen' },
  { region: 'Oberlausitz', fallbackState: 'Sachsen' },
  { locality: 'Dresden', fallbackState: 'Sachsen' },
  { locality: 'Leipzig', fallbackState: 'Sachsen' },
  { region: 'Thüringer Wald', fallbackState: 'Thüringen' },
  { region: 'Hainich', fallbackState: 'Thüringen' },
  { locality: 'Erfurt', fallbackState: 'Thüringen' },
  { locality: 'Weimar', fallbackState: 'Thüringen' },
  { region: 'Harz Sachsen-Anhalt', fallbackState: 'Sachsen-Anhalt' },
  { region: 'Saale-Unstrut', fallbackState: 'Sachsen-Anhalt' },
  { locality: 'Magdeburg', fallbackState: 'Sachsen-Anhalt' },
  { locality: 'Halle', fallbackState: 'Sachsen-Anhalt' },

  // --- Mecklenburg-Vorpommern, Brandenburg & Berlin ---
  { region: 'Mecklenburgische Seenplatte', fallbackState: 'Mecklenburg-Vorpommern' },
  { region: 'Rügen', fallbackState: 'Mecklenburg-Vorpommern' },
  { region: 'Usedom', fallbackState: 'Mecklenburg-Vorpommern' },
  { region: 'Fischland-Darß-Zingst', fallbackState: 'Mecklenburg-Vorpommern' },
  { locality: 'Rostock', fallbackState: 'Mecklenburg-Vorpommern' },
  { locality: 'Schwerin', fallbackState: 'Mecklenburg-Vorpommern' },
  { region: 'Spreewald', fallbackState: 'Brandenburg' },
  { region: 'Uckermark', fallbackState: 'Brandenburg' },
  { region: 'Havelland', fallbackState: 'Brandenburg' },
  { locality: 'Potsdam', fallbackState: 'Brandenburg' },
  { locality: 'Berlin', fallbackState: 'Berlin' },
  { region: 'Holsteinische Schweiz', fallbackState: 'Schleswig-Holstein' },
  { region: 'Nordfriesland', fallbackState: 'Schleswig-Holstein' },
  { locality: 'Kiel', fallbackState: 'Schleswig-Holstein' },
  { locality: 'Lübeck', fallbackState: 'Schleswig-Holstein' }
];

export async function syncAllTrails() {
  console.log('🚀 Starting Comprehensive Live Open Data Trails Ingestion into SQLite Database...\n');
  const db = await getDb();

  // Create table if not exists
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

  // 1. Clear trails table for clean, fresh Open Data ingestion
  console.log('🧹 Clearing trails table for fresh Open Data Germany ingestion...');
  await db.exec('DELETE FROM trails;');

  // 2. Fetch fresh live data from DZT Open Data Germany across all targets
  console.log(`📡 Fetching live trails across ${SEARCH_TARGETS.length} cities, regions & districts...`);
  
  for (const target of SEARCH_TARGETS) {
    const queryParams: Record<string, any> = {};
    let label = '';
    if (target.locality) {
      queryParams.locality = target.locality;
      label = `City: ${target.locality}`;
    } else if (target.region) {
      queryParams.region = target.region;
      label = `Region: ${target.region}`;
    } else if (target.keywords) {
      queryParams.keywords = target.keywords;
      label = `Keyword: ${target.keywords}`;
    }

    process.stdout.write(`  Querying ${label} (${target.fallbackState})... `);
    const results = await callDztMcp('get_trails_by_criteria', queryParams);
    
    let addedCount = 0;
    if (results.length > 0) {
      await db.run('BEGIN TRANSACTION');
      for (const t of results) {
        const name = extractString(t['schema:name'] || t.name).trim();
        if (!name) continue;
        const normName = name.toLowerCase();
        if (seenNames.has(normName)) continue;
        seenNames.add(normName);

        const rawId = extractString(t['@id'] || t.id);
        const trailId = `dzt-trail-${rawId.split('/').pop() || Math.random().toString(36).slice(2, 9)}`;

        let lat = 0;
        let lon = 0;
        const geo = t['schema:geo'] || t.geo;
        if (geo) {
          lat = parseFloat(extractString(geo['schema:latitude'] || geo.latitude));
          lon = parseFloat(extractString(geo['schema:longitude'] || geo.longitude));
        }

        const startLoc = t['odta:startLocation'] || t.startLocation;
        if ((!lat || isNaN(lat)) && startLoc) {
          const sGeo = startLoc['schema:geo'] || startLoc.geo;
          if (sGeo) {
            lat = parseFloat(extractString(sGeo['schema:latitude'] || sGeo.latitude));
            lon = parseFloat(extractString(sGeo['schema:longitude'] || sGeo.longitude));
          }
        }

        let polyline: [number, number][] = [];
        const lineStr = extractString(geo?.['schema:line'] || geo?.line || t['schema:line'] || t.line);
        if (lineStr && typeof lineStr === 'string') {
          const pairs = lineStr.trim().split(/\s+/);
          polyline = pairs.map(p => {
            const [c1, c2] = p.split(',').map(Number);
            return fixLatLng(c1, c2);
          }).filter(([la, lo]) => la !== 0 && lo !== 0);

          if ((!lat || isNaN(lat) || lat === 0) && polyline.length > 0) {
            lat = polyline[0][0];
            lon = polyline[0][1];
          }
        }

        if (isNaN(lat) || isNaN(lon) || lat === 0) continue;
        const fixed = fixLatLng(lat, lon);
        lat = fixed[0];
        lon = fixed[1];

        if (lat < 47.0 || lat > 55.5 || lon < 5.5 || lon > 15.5) continue;

        let stateName = await assignState('DE', lat, lon);
        if (!stateName) stateName = target.fallbackState;

        let distKm = 12;
        const lenVal = t['odta:length'] || t.length;
        if (lenVal) {
          const m = parseFloat(extractString(lenVal['schema:value'] || lenVal.value || lenVal));
          if (!isNaN(m) && m > 0) distKm = Math.round(m / 100) / 10;
        } else {
          const rawDesc = extractString(t['schema:description'] || t.description);
          const matchKm = (name + ' ' + rawDesc).match(/(\d+(?:[.,]\d+)?)\s*km\b/i);
          if (matchKm) distKm = parseFloat(matchKm[1].replace(',', '.'));
        }

        const isBiking = name.toLowerCase().includes('rad') || name.toLowerCase().includes('bike') || name.toLowerCase().includes('cycle');
        const isHiking = name.toLowerCase().includes('wander') || name.toLowerCase().includes('steig') || name.toLowerCase().includes('pfad') || name.toLowerCase().includes('weg');
        const trailType = isBiking && isHiking ? 'both' : isBiking ? 'biking' : 'hiking';

        let diff = 'medium';
        const diffObj = t['odta:difficulty'] || t.difficulty;
        const diffRaw = extractString(diffObj?.['schema:name'] || diffObj?.name || diffObj).toLowerCase();
        if (diffRaw.includes('leicht') || diffRaw.includes('easy') || distKm < 10) diff = 'easy';
        else if (diffRaw.includes('schwer') || diffRaw.includes('hard') || distKm > 35) diff = 'hard';

        const durationHours = trailType === 'biking' ? Math.max(1, Math.round((distKm / 16) * 10) / 10) : Math.max(1, Math.round((distKm / 3.8) * 10) / 10);
        let desc = cleanHtml(extractString(t['schema:description'] || t.description));
        if (desc.length > 450) desc = desc.slice(0, 447) + '...';

        const locality = target.locality || target.region || extractString(startLoc?.['schema:addressLocality'] || startLoc?.addressLocality) || stateName;
        
        let imageUrl = '';
        const img = t['schema:image'] || t.image;
        if (img) {
          if (Array.isArray(img)) imageUrl = extractString(img[0]?.['schema:contentUrl'] || img[0]?.contentUrl || img[0]);
          else imageUrl = extractString(img?.['schema:contentUrl'] || img?.contentUrl || img);
        }
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
        addedCount++;
        totalInserted++;
      }
      await db.run('COMMIT');
    }
    console.log(`+${addedCount} new`);
  }

  // 3. Final Summary & Database Stats
  const allDbTrails = await db.all('SELECT * FROM trails ORDER BY state, name');
  console.log(`\n======================================================`);
  console.log(`🎉 TOTAL TRAILS IN DATABASE: ${allDbTrails.length}`);
  
  // Breakdown by state
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
