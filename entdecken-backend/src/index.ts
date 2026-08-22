import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import { getDb } from "./db/db.js";
import { mcpServer, createMcpServer, MCP_TOOLS, executeMcpTool } from "./mcp-server.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import crypto from "crypto";
import { getAIProvider, chatJSON, chatText, testAIConnection, AIProviderConfig } from "./ai.js";
import { TARGET_COUNTRIES, COUNTRY_NAMES } from "./db/geo.js";
import {
  SearchIntent,
  BuiltQuery,
  REGION_BBOXES,
  buildSearchQuery,
  relaxIntent,
  validateIntent,
  buildIntentPrompt,
  resolveCityCoords,
  inferCountryFromQuery,
  inferTypesFromQuery,
  normalizeStateName,
  parseQueryIntent,
  haversineDistance,
  projectPointToRoute
} from "./search.js";

import { searchDztTrails, searchDztEvents, searchDztPois, getDztEntityDetails } from "./dzt.js";
import { FAMOUS_TRAILS, getNearbyTrails, Trail } from "./data/trails.js";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

export function resolveRequestAI(req: express.Request): AIProviderConfig {
  const customProvider = (req.headers['x-ai-provider'] || req.query.ai_provider) as string;
  const customKey = (req.headers['x-ai-key'] || req.query.ai_key) as string;
  const customModel = (req.headers['x-ai-model'] || req.query.ai_model) as string;

  if (customKey && customKey.trim()) {
    const provider = ((customProvider || 'gemini').toLowerCase()) as any;
    let defaultModel = 'gemini-3.7-flash';
    if (provider === 'deepseek') defaultModel = 'deepseek-v4-flash';
    else if (provider === 'openai') defaultModel = 'gpt-4o-mini';
    else if (provider === 'claude') defaultModel = 'claude-3-5-haiku-20241022';

    return {
      provider,
      apiKey: customKey.trim(),
      model: customModel && customModel.trim() ? customModel.trim() : defaultModel
    };
  }
  return getAIProvider();
}

interface CacheEntry {
  intent: SearchIntent;
  summary: string;
  recommended_ids?: string[];
  recommendation_title?: string;
  route?: any;
  route_polyline?: [number, number][];
  all_places?: any[];
  map_points?: any[];
}
const searchCache = new Map<string, CacheEntry>();

// Root info route
app.get("/api", (req, res) => {
  res.json({
    name: "CampingRoute API",
    status: "online",
    version: "1.0.0",
    mcp: "/mcp"
  });
});

// DZT Knowledge Graph Endpoints
app.get("/api/dzt/trails", async (req, res) => {
  try {
    const region = req.query.region as string;
    const locality = req.query.locality as string;
    const keywords = req.query.keywords as string;
    const difficulty = req.query.difficulty as string;
    const maxLength = req.query.max_length_km ? Number(req.query.max_length_km) : undefined;

    const trails = await searchDztTrails({ region, locality, keywords, difficulty, max_length_km: maxLength });
    res.json({
      success: true,
      source: "Deutsche Zentrale für Tourismus e.V. (DZT) / Open Data Germany",
      data: trails.map((t: any) => ({
        id: t["@id"],
        name: t["schema:name"],
        description: t["schema:description"] ? t["schema:description"].replace(/<[^>]*>?/gm, '').slice(0, 350) : undefined,
        image: t["schema:image"] ? (Array.isArray(t["schema:image"]) ? t["schema:image"][0]?.["schema:contentUrl"] : t["schema:image"]?.["schema:contentUrl"]) : undefined
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/dzt/events", async (req, res) => {
  try {
    const region = req.query.region as string;
    const locality = req.query.locality as string;
    const keywords = req.query.keywords as string;
    const dateRangeStart = req.query.dateRangeStart as string;
    const dateRangeEnd = req.query.dateRangeEnd as string;

    const events = await searchDztEvents({ region, locality, keywords, dateRangeStart, dateRangeEnd });
    res.json({
      success: true,
      source: "Deutsche Zentrale für Tourismus e.V. (DZT) / Open Data Germany",
      data: events.map((e: any) => ({
        id: e["@id"],
        name: e["schema:name"],
        description: e["schema:description"] ? e["schema:description"].replace(/<[^>]*>?/gm, '').slice(0, 350) : undefined,
        address: e["schema:address"],
        startDate: e["schema:startDate"],
        image: e["schema:image"] ? (Array.isArray(e["schema:image"]) ? e["schema:image"][0]?.["schema:contentUrl"] : e["schema:image"]?.["schema:contentUrl"]) : undefined
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/dzt/pois", async (req, res) => {
  try {
    const region = req.query.region as string;
    const locality = req.query.locality as string;
    const keywords = req.query.keywords as string;
    const type = req.query.type as string;

    const pois = await searchDztPois({ region, locality, keywords, type });
    res.json({
      success: true,
      source: "Deutsche Zentrale für Tourismus e.V. (DZT) / Open Data Germany",
      data: pois.map((p: any) => ({
        id: p["@id"],
        name: p["schema:name"],
        description: p["schema:description"] ? p["schema:description"].replace(/<[^>]*>?/gm, '').slice(0, 350) : undefined,
        address: p["schema:address"],
        image: p["schema:image"] ? (Array.isArray(p["schema:image"]) ? p["schema:image"][0]?.["schema:contentUrl"] : p["schema:image"]?.["schema:contentUrl"]) : undefined
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test AI API Key endpoint
app.post("/api/ai/test-key", async (req, res) => {
  try {
    const { provider, model, apiKey } = req.body;
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ success: false, message: "Bitte gib einen gültigen API-Key ein." });
    }
    const prov = ((provider || 'gemini').toLowerCase()) as any;
    let defaultModel = 'gemini-3.7-flash';
    if (prov === 'deepseek') defaultModel = 'deepseek-v4-flash';
    else if (prov === 'openai') defaultModel = 'gpt-4o-mini';
    else if (prov === 'claude') defaultModel = 'claude-3-5-haiku-20241022';

    const result = await testAIConnection({
      provider: prov,
      model: model && model.trim() ? model.trim() : defaultModel,
      apiKey: apiKey.trim()
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Verbindungstest fehlgeschlagen' });
  }
});

// Country stats endpoint
app.get("/api/countries/stats", async (req, res) => {
  try {
    const db = await getDb();
    const stats = await db.all(`
      SELECT country, COUNT(*) as count 
      FROM places 
      WHERE type IN ('campground', 'caravan', 'glamping') 
      GROUP BY country
    `);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Country attractions stats endpoint
app.get("/api/countries/attraction-stats", async (req, res) => {
  try {
    const db = await getDb();
    const stats = await db.all(`
      SELECT country, COUNT(*) as count 
      FROM places 
      WHERE type = 'attraction' 
      GROUP BY country
    `);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Top attractions for a country
app.get("/api/countries/:country/attractions", async (req, res) => {
  const country = (req.params.country || "").toUpperCase();
  try {
    const db = await getDb();
    const attractions = await db.all(
      "SELECT * FROM places WHERE country = ? AND type = 'attraction' ORDER BY rating DESC LIMIT 6",
      [country]
    );
    res.json(attractions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby places of opposite type
app.get("/api/places/:id/nearby", async (req, res) => {
  const id = req.params.id;
  try {
    const db = await getDb();
    const place = await db.get("SELECT * FROM places WHERE id = ?", [id]);
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    const isAttraction = place.type === 'attraction';
    const targetTypes = isAttraction 
      ? "('campground', 'caravan', 'glamping')" 
      : "('attraction')";

    const nearby = await db.all(`
      SELECT *, 
        ((latitude - ?) * (latitude - ?)) + ((longitude - ?) * (longitude - ?)) AS distance_sq
      FROM places 
      WHERE type IN ${targetTypes} AND id != ?
      ORDER BY distance_sq ASC 
      LIMIT 4
    `, [place.latitude, place.latitude, place.longitude, place.longitude, id]);

    const nearbyWithDist = nearby.map(p => {
      const degDist = Math.sqrt(p.distance_sq);
      const kmDist = Math.round(degDist * 111 * 10) / 10;
      return {
        ...p,
        distance_km: kmDist
      };
    });

    res.json(nearbyWithDist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to load all trails from server/trails.json or fallback to FAMOUS_TRAILS
function getAllTrailsList(): Trail[] {
  const possiblePaths = [
    path.resolve(process.cwd(), "server/trails.json"),
    path.resolve(process.cwd(), "../server/trails.json"),
    path.resolve(__dirname, "../../server/trails.json"),
    path.resolve(__dirname, "../trails.json"),
    path.resolve(__dirname, "data/trails.json")
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r: any) => ({
            ...r,
            highlights: typeof r.highlights === 'string' ? JSON.parse(r.highlights || '[]') : (r.highlights || []),
            polyline: typeof r.polyline === 'string' ? JSON.parse(r.polyline || '[]') : r.polyline
          }));
        }
      } catch {}
    }
  }
  return FAMOUS_TRAILS;
}

// Helper to load all trails from SQLite trails table or fallback to server/trails.json
async function getTrailsFromDb(filterParams: {
  country?: string;
  state?: string;
  region?: string;
  type?: string;
  difficulty?: string;
  q?: string;
}): Promise<Trail[]> {
  try {
    const db = await getDb();
    const conditions: string[] = [];
    const params: any[] = [];

    if (filterParams.country) {
      conditions.push('LOWER(country) = LOWER(?)');
      params.push(filterParams.country);
    }
    if (filterParams.state && filterParams.state !== 'all' && filterParams.state !== 'Alle Bundesländer') {
      conditions.push('(state = ? OR region LIKE ?)');
      params.push(filterParams.state, `%${filterParams.state}%`);
    }
    if (filterParams.region) {
      conditions.push('(LOWER(region) LIKE LOWER(?) OR LOWER(state) LIKE LOWER(?))');
      params.push(`%${filterParams.region}%`, `%${filterParams.region}%`);
    }
    if (filterParams.type && filterParams.type !== 'all') {
      conditions.push('(type = ? OR type = ?)');
      params.push(filterParams.type, 'both');
    }
    if (filterParams.difficulty && filterParams.difficulty !== 'all') {
      conditions.push('difficulty = ?');
      params.push(filterParams.difficulty);
    }
    if (filterParams.q && filterParams.q.trim()) {
      const term = `%${filterParams.q.trim()}%`;
      conditions.push('(name LIKE ? OR region LIKE ? OR state LIKE ? OR description LIKE ?)');
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await db.all(`SELECT * FROM trails ${whereClause} LIMIT 10000`, params);

    if (rows && rows.length > 0) {
      return rows.map((r: any) => ({
        ...r,
        highlights: typeof r.highlights === 'string' ? JSON.parse(r.highlights || '[]') : (r.highlights || []),
        polyline: typeof r.polyline === 'string' ? JSON.parse(r.polyline || '[]') : r.polyline
      }));
    }
  } catch (e: any) {
    // Table might not exist yet, fallback to JSON
  }

  // Fallback to JSON
  let results: Trail[] = getAllTrailsList();
  if (filterParams.country) {
    results = results.filter((t: Trail) => (t.country || "DE").toLowerCase() === filterParams.country!.toLowerCase());
  }
  if (filterParams.state && filterParams.state !== "all" && filterParams.state !== "Alle Bundesländer") {
    results = results.filter((t: Trail) => t.state === filterParams.state || (t.region || "").includes(filterParams.state!));
  }
  if (filterParams.region) {
    results = results.filter((t: Trail) =>
      (t.region || "").toLowerCase().includes(filterParams.region!.toLowerCase()) ||
      (t.state || "").toLowerCase().includes(filterParams.region!.toLowerCase())
    );
  }
  if (filterParams.type && filterParams.type !== "all") {
    results = results.filter((t: Trail) => t.type === filterParams.type || t.type === "both");
  }
  if (filterParams.difficulty && filterParams.difficulty !== "all") {
    results = results.filter((t: Trail) => t.difficulty === filterParams.difficulty);
  }
  if (filterParams.q && filterParams.q.trim()) {
    const qLower = filterParams.q.trim().toLowerCase();
    results = results.filter((t: Trail) =>
      (t.name || "").toLowerCase().includes(qLower) ||
      (t.region || "").toLowerCase().includes(qLower) ||
      (t.state || "").toLowerCase().includes(qLower) ||
      (t.description || "").toLowerCase().includes(qLower)
    );
  }
  return results;
}

// Hiking & Biking Trails endpoint
app.get("/api/trails", async (req, res) => {
  const { region, state, type, difficulty, country, q } = req.query as {
    region?: string;
    state?: string;
    type?: string;
    difficulty?: string;
    country?: string;
    q?: string;
  };
  const results = await getTrailsFromDb({ region, state, type, difficulty, country, q });
  res.json(results);
});

// Single trail details with live/cached polyline geometry & start/end coords
app.get("/api/trails/details", async (req, res) => {
  const id = (req.query.id || req.query.trail_id || "") as string;
  const uriParam = (req.query.uri || "") as string;

  if (!id && !uriParam) {
    return res.status(400).json({ success: false, message: "Missing trail id or uri" });
  }

  let trail: Trail | undefined;
  try {
    const db = await getDb();
    const row = await db.get(`SELECT * FROM trails WHERE id = ? LIMIT 1`, [id]);
    if (row) {
      trail = {
        ...row,
        highlights: typeof row.highlights === 'string' ? JSON.parse(row.highlights || '[]') : (row.highlights || []),
        polyline: typeof row.polyline === 'string' ? JSON.parse(row.polyline || '[]') : row.polyline
      };
    }
  } catch {}

  if (!trail) {
    const allTrails = getAllTrailsList();
    trail = allTrails.find((t: Trail) => t.id === id || (uriParam && t.uri === uriParam));
  }

  let polyline: [number, number][] = trail?.polyline || [];
  let start_coords = trail?.start_coords;
  let end_coords = trail?.end_coords;

  // If no polyline yet and it's a DZT Open Data trail or URI is provided:
  const dztUri = uriParam || (id.startsWith("dzt-trail-") ? `https://mein.toubiz.de/api/v1/article/${id.replace("dzt-trail-", "")}` : trail?.uri);

  if (polyline.length === 0 && dztUri) {
    try {
      const details = await getDztEntityDetails(dztUri);
      if (details) {
        if (details.polyline && details.polyline.length > 0) {
          polyline = details.polyline;
        }
        if (details.startCoords) start_coords = details.startCoords;
        if (details.endCoords) end_coords = details.endCoords;
      }
    } catch (err: any) {
      console.error("[Trails] Error fetching DZT details for", dztUri, err.message);
    }
  }

  // Fallback: If still no polyline, generate a plausible 2-point line from start/end if available
  if (polyline.length === 0 && start_coords && end_coords) {
    polyline = [start_coords, end_coords];
  } else if (polyline.length === 0 && trail?.latitude && trail?.longitude) {
    // Single point fallback or around center
    polyline = [[trail.latitude, trail.longitude]];
  }

  res.json({
    success: true,
    trail: trail ? { ...trail, polyline, start_coords, end_coords } : null,
    polyline,
    start_coords: start_coords || (polyline.length > 0 ? polyline[0] : (trail ? [trail.latitude, trail.longitude] : undefined)),
    end_coords: end_coords || (polyline.length > 0 ? polyline[polyline.length - 1] : (trail ? [trail.latitude, trail.longitude] : undefined))
  });
});

// Nearby campsites along a trail (Spatial query within radius)
app.get("/api/trails/nearby-campsites", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const radiusKm = parseFloat((req.query.radius_km || req.query.radius || "25") as string);
    const limit = parseInt((req.query.limit || "30") as string, 10);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ success: false, message: "Valid lat and lon required" });
    }

    const db = await getDb();
    const dLat = radiusKm / 111.0;
    const dLon = radiusKm / (111.0 * Math.cos(lat * Math.PI / 180.0));

    const rows = await db.all(
      `SELECT id, name, type, city, address, rating, image_url, latitude, longitude, description, price, website
       FROM places
       WHERE type IN ('campground', 'caravan', 'glamping')
         AND latitude BETWEEN ? AND ?
         AND longitude BETWEEN ? AND ?`,
      [lat - dLat, lat + dLat, lon - dLon, lon + dLon]
    );

    const withDist = rows.map(r => {
      const dist = haversineDistance(lat, lon, r.latitude, r.longitude);
      return {
        ...r,
        distance_km: Math.round(dist * 10) / 10
      };
    })
    .filter(r => r.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);

    res.json({
      success: true,
      count: withDist.length,
      places: withDist.slice(0, limit)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Nearby trails for a campsite or place
app.get("/api/places/:id/nearby-trails", async (req, res) => {
  const id = req.params.id;
  try {
    const db = await getDb();
    const place = await db.get("SELECT latitude, longitude FROM places WHERE id = ?", [id]);
    if (!place || !place.latitude || !place.longitude) {
      return res.json([]);
    }
    const trailsFilePaths = [
      path.join(__dirname, "../src/data/trails.json"),
      path.join(__dirname, "../../server/trails.json"),
      path.join(__dirname, "data/trails.json")
    ];
    let allTrails = FAMOUS_TRAILS;
    for (const fp of trailsFilePaths) {
      if (fs.existsSync(fp)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(fp, "utf8"));
          if (Array.isArray(parsed)) {
            allTrails = parsed.map((r: any) => ({
              ...r,
              highlights: typeof r.highlights === 'string' ? JSON.parse(r.highlights || '[]') : (r.highlights || []),
              polyline: typeof r.polyline === 'string' ? JSON.parse(r.polyline || '[]') : r.polyline
            }));
          }
          break;
        } catch (_) {}
      }
    }
    const trails = getNearbyTrails(place.latitude, place.longitude, 50, allTrails);
    res.json(trails.slice(0, 4));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bounding box coordinate mappings for states, cantons, and popular tourism regions to bypass AI for static queries
const SUBDIVISION_QUERIES: { [key: string]: { sql: string; label: string } } = {
  // Germany states
  "Baden-Württemberg": { sql: "state = 'Baden-Württemberg'", label: "Baden-Württemberg" },
  "Bayern": { sql: "state = 'Bayern'", label: "Bayern" },
  "Berlin": { sql: "state = 'Berlin'", label: "Berlin" },
  "Brandenburg": { sql: "state = 'Brandenburg'", label: "Brandenburg" },
  "Bremen": { sql: "state = 'Bremen'", label: "Bremen" },
  "Hamburg": { sql: "state = 'Hamburg'", label: "Hamburg" },
  "Hessen": { sql: "state = 'Hessen'", label: "Hessen" },
  "Mecklenburg-Vorpommern": { sql: "state = 'Mecklenburg-Vorpommern'", label: "Mecklenburg-Vorpommern" },
  "Niedersachsen": { sql: "state = 'Niedersachsen'", label: "Niedersachsen" },
  "Nordrhein-Westfalen": { sql: "state = 'Nordrhein-Westfalen'", label: "Nordrhein-Westfalen" },
  "Rheinland-Pfalz": { sql: "state = 'Rheinland-Pfalz'", label: "Rheinland-Pfalz" },
  "Saarland": { sql: "state = 'Saarland'", label: "Saarland" },
  "Sachsen": { sql: "state = 'Sachsen'", label: "Sachsen" },
  "Sachsen-Anhalt": { sql: "state = 'Sachsen-Anhalt'", label: "Sachsen-Anhalt" },
  "Schleswig-Holstein": { sql: "state = 'Schleswig-Holstein'", label: "Schleswig-Holstein" },
  "Thüringen": { sql: "state = 'Thüringen'", label: "Thüringen" },

  // Austria states
  "Burgenland": { sql: "state = 'Burgenland'", label: "Burgenland" },
  "Kärnten": { sql: "state = 'Kärnten'", label: "Kärnten" },
  "Niederösterreich": { sql: "state = 'Niederösterreich'", label: "Niederösterreich" },
  "Oberösterreich": { sql: "state = 'Oberösterreich'", label: "Oberösterreich" },
  "Salzburg": { sql: "state = 'Salzburg'", label: "Salzburg" },
  "Steiermark": { sql: "state = 'Steiermark'", label: "Steiermark" },
  "Tirol": { sql: "state = 'Tirol'", label: "Tirol" },
  "Vorarlberg": { sql: "state = 'Vorarlberg'", label: "Vorarlberg" },
  "Wien": { sql: "state = 'Wien'", label: "Wien" },

  // Switzerland states (Cantons)
  "Graubünden": { sql: "state = 'Graubünden'", label: "Graubünden" },
  "Wallis": { sql: "state = 'Wallis'", label: "Wallis" },
  "Tessin": { sql: "state = 'Tessin'", label: "Tessin" },
  "Bern": { sql: "state = 'Bern'", label: "Bern" },
  "Zürich": { sql: "state = 'Zürich'", label: "Zürich" },
  "Luzern": { sql: "state = 'Luzern'", label: "Luzern" },
  "St. Gallen": { sql: "state = 'St. Gallen'", label: "St. Gallen" },
  "Waadt": { sql: "state = 'Waadt'", label: "Waadt" },
  "Neuenburg": { sql: "state = 'Neuenburg'", label: "Neuenburg" },
  "Freiburg": { sql: "state = 'Freiburg'", label: "Freiburg" },

  // Germany regions
  "Schwarzwald": { sql: "latitude BETWEEN 47.5 AND 49.0 AND longitude BETWEEN 7.5 AND 8.6 AND country = 'DE'", label: "Schwarzwald" },
  "Bodensee": { sql: "latitude BETWEEN 47.4 AND 47.9 AND longitude BETWEEN 8.9 AND 9.8", label: "Bodensee" },
  "Ostsee": { sql: "latitude BETWEEN 53.5 AND 55.0 AND longitude BETWEEN 9.5 AND 14.5 AND country = 'DE'", label: "Ostsee" },
  "Nordsee": { sql: "latitude BETWEEN 53.3 AND 55.1 AND longitude BETWEEN 6.5 AND 9.0 AND country = 'DE'", label: "Nordsee" },
  "Allgäu": { sql: "latitude BETWEEN 47.3 AND 47.9 AND longitude BETWEEN 9.5 AND 10.8 AND country = 'DE'", label: "Allgäu" },
  "Harz": { sql: "latitude BETWEEN 51.5 AND 52.0 AND longitude BETWEEN 10.0 AND 11.5 AND country = 'DE'", label: "Harz" },
  "Eifel": { sql: "latitude BETWEEN 49.7 AND 50.8 AND longitude BETWEEN 6.0 AND 7.5", label: "Eifel" },
  "Sächsische Schweiz": { sql: "latitude BETWEEN 50.8 AND 51.0 AND longitude BETWEEN 14.0 AND 14.4 AND country = 'DE'", label: "Sächsische Schweiz" },
  "Mosel": { sql: "(name LIKE '%Mosel%' OR address LIKE '%Mosel%' OR city LIKE '%Mosel%' OR description LIKE '%Mosel%') AND country = 'DE'", label: "Mosel" },
  "Bayerischer Wald": { sql: "latitude BETWEEN 48.7 AND 49.3 AND longitude BETWEEN 12.5 AND 13.9 AND country = 'DE'", label: "Bayerischer Wald" },
  "Spreewald": { sql: "latitude BETWEEN 51.8 AND 52.1 AND longitude BETWEEN 13.7 AND 14.2 AND country = 'DE'", label: "Spreewald" },
  "Mecklenburgische Seenplatte": { sql: "latitude BETWEEN 53.2 AND 53.7 AND longitude BETWEEN 12.1 AND 13.5 AND country = 'DE'", label: "Mecklenburgische Seenplatte" },
  "Lüneburger Heide": { sql: "latitude BETWEEN 52.7 AND 53.3 AND longitude BETWEEN 9.5 AND 10.8 AND country = 'DE'", label: "Lüneburger Heide" },

  // Austria regions
  "Salzkammergut": { sql: "latitude BETWEEN 47.5 AND 48.0 AND longitude BETWEEN 13.2 AND 14.0 AND country = 'AT'", label: "Salzkammergut" },
  "Wörthersee": { sql: "latitude BETWEEN 46.5 AND 46.7 AND longitude BETWEEN 14.0 AND 14.3 AND country = 'AT'", label: "Wörthersee" },
  "Zillertal": { sql: "latitude BETWEEN 47.0 AND 47.4 AND longitude BETWEEN 11.7 AND 12.0 AND country = 'AT'", label: "Zillertal" },
  "Ötztal": { sql: "latitude BETWEEN 46.8 AND 47.3 AND longitude BETWEEN 10.8 AND 11.2 AND country = 'AT'", label: "Ötztal" },
  "Achensee": { sql: "latitude BETWEEN 47.3 AND 47.6 AND longitude BETWEEN 11.6 AND 11.8 AND country = 'AT'", label: "Achensee" },
  "Arlberg": { sql: "latitude BETWEEN 47.1 AND 47.3 AND longitude BETWEEN 10.1 AND 10.3 AND country = 'AT'", label: "Arlberg" },
  "Grossglockner": { sql: "latitude BETWEEN 47.0 AND 47.2 AND longitude BETWEEN 12.6 AND 12.9 AND country = 'AT'", label: "Grossglockner" },
  "Wachau": { sql: "latitude BETWEEN 48.3 AND 48.5 AND longitude BETWEEN 15.3 AND 15.6 AND country = 'AT'", label: "Wachau" },
  "Dachstein": { sql: "latitude BETWEEN 47.4 AND 47.6 AND longitude BETWEEN 13.5 AND 13.8 AND country = 'AT'", label: "Dachstein" },
  "Bregenzerwald": { sql: "latitude BETWEEN 47.2 AND 47.5 AND longitude BETWEEN 9.8 AND 10.2 AND country = 'AT'", label: "Bregenzerwald" },
  "Kitzbüheler Alpen": { sql: "latitude BETWEEN 47.2 AND 47.5 AND longitude BETWEEN 11.8 AND 12.8 AND country = 'AT'", label: "Kitzbüheler Alpen" },
  "Neusiedlersee": { sql: "latitude BETWEEN 47.7 AND 48.0 AND longitude BETWEEN 16.7 AND 16.9 AND country = 'AT'", label: "Neusiedlersee" },

  // Italy regions
  "Gardasee": { sql: "latitude BETWEEN 45.4 AND 45.9 AND longitude BETWEEN 10.5 AND 10.9 AND country = 'IT'", label: "Gardasee" },
  "Südtirol": { sql: "latitude BETWEEN 46.2 AND 47.1 AND longitude BETWEEN 10.4 AND 12.5 AND country = 'IT'", label: "Südtirol" },
  "Dolomiten": { sql: "latitude BETWEEN 46.2 AND 46.8 AND longitude BETWEEN 11.5 AND 12.5 AND country = 'IT'", label: "Dolomiten" },
  "Toskana": { sql: "latitude BETWEEN 42.2 AND 44.5 AND longitude BETWEEN 9.6 AND 12.4 AND country = 'IT'", label: "Toskana" },
  "Amalfiküste": { sql: "latitude BETWEEN 40.6 AND 40.7 AND longitude BETWEEN 14.3 AND 14.7 AND country = 'IT'", label: "Amalfiküste" },
  "Comer See": { sql: "latitude BETWEEN 45.8 AND 46.2 AND longitude BETWEEN 9.1 AND 9.5 AND country = 'IT'", label: "Comer See" },
  "Adriaküste": { sql: "latitude BETWEEN 44.0 AND 45.8 AND longitude BETWEEN 12.0 AND 13.7 AND country = 'IT'", label: "Adriaküste" },

  // France regions
  "Côte d'Azur": { sql: "latitude BETWEEN 43.0 AND 43.8 AND longitude BETWEEN 5.8 AND 7.6 AND country = 'FR'", label: "Côte d'Azur" },
  "Provence": { sql: "latitude BETWEEN 43.0 AND 44.5 AND longitude BETWEEN 4.5 AND 7.0 AND country = 'FR'", label: "Provence" },
  "Französische Alpen": { sql: "latitude BETWEEN 44.0 AND 46.5 AND longitude BETWEEN 5.7 AND 7.2 AND country = 'FR'", label: "Französische Alpen" },
  "Bretagne": { sql: "latitude BETWEEN 47.2 AND 48.9 AND longitude BETWEEN -5.2 AND -1.5 AND country = 'FR'", label: "Bretagne" },
  "Korsika": { sql: "latitude BETWEEN 41.3 AND 43.1 AND longitude BETWEEN 8.5 AND 9.6 AND country = 'FR'", label: "Korsika" },

  // Norway regions
  "Lofoten": { sql: "latitude BETWEEN 67.8 AND 68.7 AND longitude BETWEEN 12.0 AND 15.0 AND country = 'NO'", label: "Lofoten" },

  // Netherlands regions
  "Texel": { sql: "latitude BETWEEN 53.0 AND 53.2 AND longitude BETWEEN 4.7 AND 4.9 AND country = 'NL'", label: "Texel" }
};

// Dynamic place counts for states and popular regions of a country
app.post("/api/countries/:country/subdivision-stats", async (req, res) => {
  const country = (req.params.country || "").toUpperCase();
  const { states = [], popular = [], type = 'camping' } = req.body;
  
  try {
    const db = await getDb();
    const stats: { [key: string]: number } = {};
    const targetTypes = type === 'attraction' 
      ? "('attraction')" 
      : "('campground', 'caravan', 'glamping')";

    const countPromises = [...states, ...popular].map(async (name) => {
      let count = 0;
      const cleanName = name.replace(/ \(Kanton\)/gi, '').replace(/ \(Luxemburg\)/gi, '').replace(/ \(Wallonien\)/gi, '').replace(/ \(Lappland\)/gi, '').trim();

      if (SUBDIVISION_QUERIES[cleanName]) {
        const query = `SELECT COUNT(*) as total FROM places WHERE ${SUBDIVISION_QUERIES[cleanName].sql} AND type IN ${targetTypes}`;
        const result = await db.get(query);
        count = result ? result.total : 0;
      } else if (REGION_BBOXES[cleanName]) {
        // Popular regions (incl. new countries) are resolved via coordinate boxes
        const b = REGION_BBOXES[cleanName];
        const bboxSql = `latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?`;
        const bboxParams: any[] = [b.latMin, b.latMax, b.lonMin, b.lonMax];
        if (b.country) {
          const q = `SELECT COUNT(*) as total FROM places WHERE ${bboxSql} AND country = ? AND type IN ${targetTypes}`;
          const result = await db.get(q, [...bboxParams, b.country]);
          count = result ? result.total : 0;
        } else {
          const q = `SELECT COUNT(*) as total FROM places WHERE ${bboxSql} AND type IN ${targetTypes}`;
          const result = await db.get(q, bboxParams);
          count = result ? result.total : 0;
        }
      } else {
        const query = `SELECT COUNT(*) as total FROM places WHERE country = ? AND (state = ? OR address LIKE ? OR name LIKE ? OR description LIKE ?) AND type IN ${targetTypes}`;
        const p = `%${cleanName}%`;
        const result = await db.get(query, [country, cleanName, p, p, p]);
        count = result ? result.total : 0;
      }
      stats[name] = count;
    });

    await Promise.all(countPromises);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Static queries for common searches (bypasses AI completely)
const STATIC_QUERIES: { [key: string]: { sql: string; summary: string; totalQuery: string } } = {
  // Countries - Attractions
  "sehenswürdigkeiten in deutschland": {
    sql: "SELECT * FROM places WHERE type = 'attraction' AND country = 'DE' ORDER BY rating DESC LIMIT ? OFFSET ?",
    totalQuery: "SELECT COUNT(*) AS total FROM places WHERE type = 'attraction' AND country = 'DE'",
    summary: "<p>Entdecke die beliebtesten Sehenswürdigkeiten und Ausflugsziele in <strong>Deutschland</strong>. Plane deine Route entlang dieser spektakulären Orte.</p>"
  },
  "attraktionen in deutschland": {
    sql: "SELECT * FROM places WHERE type = 'attraction' AND country = 'DE' ORDER BY rating DESC LIMIT ? OFFSET ?",
    totalQuery: "SELECT COUNT(*) AS total FROM places WHERE type = 'attraction' AND country = 'DE'",
    summary: "<p>Entdecke die beliebtesten Attraktionen und Ausflugsziele in <strong>Deutschland</strong>.</p>"
  },
  "sehenswürdigkeiten in österreich": {
    sql: "SELECT * FROM places WHERE type = 'attraction' AND country = 'AT' ORDER BY rating DESC LIMIT ? OFFSET ?",
    totalQuery: "SELECT COUNT(*) AS total FROM places WHERE type = 'attraction' AND country = 'AT'",
    summary: "<p>Entdecke die schönsten Sehenswürdigkeiten in <strong>Österreich</strong>.</p>"
  },
  "sehenswürdigkeiten in der schweiz": {
    sql: "SELECT * FROM places WHERE type = 'attraction' AND country = 'CH' ORDER BY rating DESC LIMIT ? OFFSET ?",
    totalQuery: "SELECT COUNT(*) AS total FROM places WHERE type = 'attraction' AND country = 'CH'",
    summary: "<p>Entdecke die beeindruckendsten Sehenswürdigkeiten in der <strong>Schweiz</strong>.</p>"
  },
  // German States - Camping
  "campingplätze in bayern": {
    sql: "SELECT * FROM places WHERE type IN ('campground', 'caravan', 'glamping') AND state = 'Bayern' AND country = 'DE' ORDER BY rating DESC LIMIT ? OFFSET ?",
    totalQuery: "SELECT COUNT(*) AS total FROM places WHERE type IN ('campground', 'caravan', 'glamping') AND state = 'Bayern' AND country = 'DE'",
    summary: "<p>Die besten <strong>Campingplätze in Bayern</strong> für deinen Urlaub – von den Alpen bis zu den Seen.</p>"
  },
  "camping in bayern": {
    sql: "SELECT * FROM places WHERE type IN ('campground', 'caravan', 'glamping') AND state = 'Bayern' AND country = 'DE' ORDER BY rating DESC LIMIT ? OFFSET ?",
    totalQuery: "SELECT COUNT(*) AS total FROM places WHERE type IN ('campground', 'caravan', 'glamping') AND state = 'Bayern' AND country = 'DE'",
    summary: "<p>Entdecke die besten Campingmöglichkeiten in <strong>Bayern</strong>.</p>"
  },
  "campingplätze in baden-württemberg": {
    sql: "SELECT * FROM places WHERE type IN ('campground', 'caravan', 'glamping') AND state = 'Baden-Württemberg' AND country = 'DE' ORDER BY rating DESC LIMIT ? OFFSET ?",
    totalQuery: "SELECT COUNT(*) AS total FROM places WHERE type IN ('campground', 'caravan', 'glamping') AND state = 'Baden-Württemberg' AND country = 'DE'",
    summary: "<p>Campingplätze in <strong>Baden-Württemberg</strong> – vom Schwarzwald bis zum Bodensee.</p>"
  },
  "camping in niedersachsen": {
    sql: "SELECT * FROM places WHERE type IN ('campground', 'caravan', 'glamping') AND state = 'Niedersachsen' AND country = 'DE' ORDER BY rating DESC LIMIT ? OFFSET ?",
    totalQuery: "SELECT COUNT(*) AS total FROM places WHERE type IN ('campground', 'caravan', 'glamping') AND state = 'Niedersachsen' AND country = 'DE'",
    summary: "<p>Campingplätze in <strong>Niedersachsen</strong> – von der Lüneburger Heide bis zur Nordsee.</p>"
  },
  // Attractions in states
  "sehenswürdigkeiten in bayern": {
    sql: "SELECT * FROM places WHERE type = 'attraction' AND state = 'Bayern' AND country = 'DE' ORDER BY rating DESC LIMIT ? OFFSET ?",
    totalQuery: "SELECT COUNT(*) AS total FROM places WHERE type = 'attraction' AND state = 'Bayern' AND country = 'DE'",
    summary: "<p>Die schönsten <strong>Sehenswürdigkeiten in Bayern</strong> – von Schlössern bis zu Naturwundern.</p>"
  },
  "schlösser in bayern": {
    sql: "SELECT * FROM places WHERE type = 'attraction' AND state = 'Bayern' AND country = 'DE' AND (name LIKE '%Schloss%' OR description LIKE '%Schloss%') ORDER BY rating DESC LIMIT ? OFFSET ?",
    totalQuery: "SELECT COUNT(*) AS total FROM places WHERE type = 'attraction' AND state = 'Bayern' AND country = 'DE' AND (name LIKE '%Schloss%' OR description LIKE '%Schloss%')",
    summary: "<p>Entdecke die prächtigsten <strong>Schlösser in Bayern</strong> – von Neuschwanstein bis zum Residenzschloss.</p>"
  }
};

// AI Search Endpoint (Natural Language query translated to SQL via Gemini, supporting pagination)
app.get("/api/search", async (req, res) => {
  const queryStr = (req.query.q as string || "").trim();
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const offset = (page - 1) * limit;
  
  try {
    const db = await getDb();
    
    // Check for static query match (case-insensitive, exact match)
    const normalizedQuery = queryStr.toLowerCase().replace(/\s+/g, " ").trim();
    for (const [pattern, staticQuery] of Object.entries(STATIC_QUERIES)) {
      if (normalizedQuery === pattern) {
        console.log(`Using static query for: "${queryStr}"`);
        const countResult = await db.get(staticQuery.totalQuery);
        const totalItems = countResult ? countResult.total : 0;
        const places = await db.all(staticQuery.sql, [limit, offset]);
        const mapPoints = await computeMapPoints(db, staticQuery.sql, []);
        return res.json({
          places,
          mapPoints,
          summary: staticQuery.summary,
          total: totalItems,
          page,
          limit
        });
      }
    }

    if (!queryStr) {
      const countryFilter = (req.query.country as string || "").trim();
      let sql = "SELECT * FROM places WHERE type = 'attraction' AND (website IS NOT NULL OR description IS NOT NULL AND description != '')";
      const params: any[] = [];
      if (countryFilter) {
        sql += " AND country = ?";
        params.push(countryFilter.toUpperCase());
      }
      sql += " AND rating >= 4.5 ORDER BY RANDOM() LIMIT 4";
      const places = await db.all(sql, params);
      return res.json({ places, summary: "", total: places.length, page, limit });
    }

    // Match "Sehenswürdigkeiten in [Land]" or "Attraktionen in [Land]"
    const attractionMatch = queryStr.match(/^(Sehenswürdigkeiten|Attraktionen|Ausflugsziele) in (Deutschland|Österreich|Schweiz|Norwegen|Dänemark|Schweden|Italien|Frankreich|Niederlande|Belgien|Luxemburg|Finnland|Spanien|Portugal|Kroatien|Griechenland|Slowenien|Tschechien|Polen|Ungarn|Großbritannien)$/i);
    if (attractionMatch) {
      const countryName = attractionMatch[2];
      const nameToCode: { [key: string]: string } = {
        "Deutschland": "DE", "Österreich": "AT", "Schweiz": "CH", "Norwegen": "NO", "Dänemark": "DK", "Schweden": "SE",
        "Italien": "IT", "Frankreich": "FR", "Niederlande": "NL", "Belgien": "BE", "Luxemburg": "LU", "Finnland": "FI",
        "Spanien": "ES", "Portugal": "PT", "Kroatien": "HR", "Griechenland": "GR", "Slowenien": "SI",
        "Tschechien": "CZ", "Polen": "PL", "Ungarn": "HU", "Großbritannien": "GB"
      };
      const countryCode = nameToCode[countryName];
      if (countryCode) {
        console.log(`Bypassing Gemini for country attractions query: "${queryStr}" -> country: "${countryCode}"`);
        
        const countQuery = `SELECT COUNT(*) AS total FROM places WHERE country = ? AND type = 'attraction'`;
        const countResult = await db.get(countQuery, [countryCode]);
        const totalItems = countResult ? countResult.total : 0;

        const sql = `SELECT * FROM places WHERE country = ? AND type = 'attraction' ORDER BY rating DESC LIMIT ? OFFSET ?`;
        const places = await db.all(sql, [countryCode, limit, offset]);
        const mapPoints = await computeMapPoints(db, sql, [countryCode]);

        const summary = `<p>Entdecke die beliebtesten ${totalItems} Sehenswürdigkeiten und Ausflugsziele in <strong>${countryName}</strong>. Plane deine Route entlang dieser spektakulären Orte.</p>`;

        return res.json({
          places,
          mapPoints,
          summary,
          total: totalItems,
          page,
          limit
        });
      }
    }

    // Match "Camping/Campingplätze/Stellplätze in [Land]" -> deterministic country query
    const campingMatch = queryStr.match(/^(Camping|Campingplätze|Stellplätze|Campingplätze und Stellplätze) in (Deutschland|Österreich|Schweiz|Norwegen|Dänemark|Schweden|Italien|Frankreich|Niederlande|Belgien|Luxemburg|Finnland|Spanien|Portugal|Kroatien|Griechenland|Slowenien|Tschechien|Polen|Ungarn|Großbritannien)$/i);
    if (campingMatch) {
      const countryName = campingMatch[2];
      const nameToCode: { [key: string]: string } = {
        "Deutschland": "DE", "Österreich": "AT", "Schweiz": "CH", "Norwegen": "NO", "Dänemark": "DK", "Schweden": "SE",
        "Italien": "IT", "Frankreich": "FR", "Niederlande": "NL", "Belgien": "BE", "Luxemburg": "LU", "Finnland": "FI",
        "Spanien": "ES", "Portugal": "PT", "Kroatien": "HR", "Griechenland": "GR", "Slowenien": "SI",
        "Tschechien": "CZ", "Polen": "PL", "Ungarn": "HU", "Großbritannien": "GB"
      };
      const countryCode = nameToCode[countryName];
      if (countryCode) {
        console.log(`Bypassing Gemini for country camping query: "${queryStr}" -> country: "${countryCode}"`);
        const countResult = await db.get(
          `SELECT COUNT(*) AS total FROM places WHERE country = ? AND type IN ('campground','caravan','glamping')`,
          [countryCode]
        );
        const totalItems = countResult ? countResult.total : 0;
        const sql = `SELECT * FROM places WHERE country = ? AND type IN ('campground','caravan','glamping') ORDER BY rating DESC LIMIT ? OFFSET ?`;
        const places = await db.all(sql, [countryCode, limit, offset]);
        const mapPoints = await computeMapPoints(db, sql, [countryCode]);
        const summary = `<p>Entdecke die ${totalItems} verifizierten Campingplätze und Stellplätze in <strong>${countryName}</strong> – von der Küste bis in die Berge.</p>`;
        return res.json({ places, mapPoints, summary, total: totalItems, page, limit });
      }
    }

    // Check if the query matches a state/province in the database dynamically (e.g. "Bayern", "Toskana", "Bretagne")
    const isAttractionQuery = /sehenswürdigkeiten|attraktionen|ausflugsziele/i.test(queryStr);
    const targetTypes = isAttractionQuery ? "('attraction')" : "('campground', 'caravan', 'glamping')";
    const typeLabel = isAttractionQuery ? "Sehenswürdigkeiten und Ausflugsziele" : "verifizierten Campingplätze und Stellplätze";

    // Check if the query matches a state/province in the database dynamically (e.g. "Bayern", "Toskana", "Bretagne")
    let dynamicStateMatch: any = null;
    const cleanQForState = queryStr
      .replace(/^(camping|sehenswürdigkeiten|attraktionen|ausflugsziele|schlösser|burgen|platz|plätze|stellplatz|stellplätze) (in|im|auf|an der|am|der)\s+/i, '')
      .replace(/^(und\s+)+/i, '')  // "Schlösser und Sehenswürdigkeiten" -> "Sehenswürdigkeiten"
      .trim();
    if (cleanQForState) {
      dynamicStateMatch = await db.get(
        "SELECT DISTINCT state, country FROM places WHERE LOWER(state) = ? LIMIT 1",
        [cleanQForState.toLowerCase()]
      );
    }

    if (dynamicStateMatch && dynamicStateMatch.state) {
      const stateVal = dynamicStateMatch.state;
      const countryVal = dynamicStateMatch.country;
      console.log(`Bypassing Gemini for dynamic state query: "${queryStr}" -> state: "${stateVal}", country: "${countryVal}", type: "${isAttractionQuery ? 'attraction' : 'camping'}"`);
      
      const countQuery = `SELECT COUNT(*) AS total FROM places WHERE state = ? AND country = ? AND type IN ${targetTypes}`;
      const countResult = await db.get(countQuery, [stateVal, countryVal]);
      const totalItems = countResult ? countResult.total : 0;

      const sql = `SELECT * FROM places WHERE state = ? AND country = ? AND type IN ${targetTypes} ORDER BY rating DESC LIMIT ? OFFSET ?`;
      const places = await db.all(sql, [stateVal, countryVal, limit, offset]);
      const mapPoints = await computeMapPoints(db, sql, [stateVal, countryVal]);

      const summary = `<p>Entdecke die besten ${totalItems} ${typeLabel} in <strong>${stateVal}</strong>. Unsere Live-Datenbank bietet dir eine Übersicht der am besten bewerteten Orte für deinen Urlaub.</p>`;

      return res.json({
        places,
        mapPoints,
        summary,
        total: totalItems,
        page,
        limit
      });
    }

    // Direct database matching for static subdivision/region clicks to bypass Gemini
    let matchedName = "";
    const cleanQ = queryStr.toLowerCase().trim();
    for (const key of Object.keys(SUBDIVISION_QUERIES)) {
      const lowerKey = key.toLowerCase();
      if (
        cleanQ === lowerKey || 
        cleanQ === `camping in ${lowerKey}` || 
        cleanQ === `camping im ${lowerKey}` || 
        cleanQ === `camping ${lowerKey}` ||
        cleanQ === `sehenswürdigkeiten in ${lowerKey}` ||
        cleanQ === `sehenswürdigkeiten im ${lowerKey}` ||
        cleanQ === `sehenswürdigkeiten ${lowerKey}`
      ) {
        matchedName = key;
        break;
      }
    }

    if (matchedName) {
      console.log(`Bypassing Gemini for static subdivision query: "${queryStr}" -> "${matchedName}", type: "${isAttractionQuery ? 'attraction' : 'camping'}"`);
      const matched = SUBDIVISION_QUERIES[matchedName];
      
      // Execute count query
      const countQuery = `SELECT COUNT(*) AS total FROM places WHERE ${matched.sql} AND type IN ${targetTypes}`;
      const countResult = await db.get(countQuery);
      const totalItems = countResult ? countResult.total : 0;

      // Execute search results query
      const sql = `SELECT * FROM places WHERE ${matched.sql} AND type IN ${targetTypes} ORDER BY rating DESC LIMIT ${limit} OFFSET ${offset}`;
      const places = await db.all(sql);
      const mapPoints = await computeMapPoints(db, sql, []);

      // Simple elegant static reiseführer summary
      const summary = `<p>Entdecke die besten ${totalItems} ${typeLabel} in <strong>${matched.label}</strong>. Unsere Live-Datenbank bietet dir eine Übersicht der am besten bewerteten Orte für deinen Urlaub.</p>`;

      return res.json({
        places,
        mapPoints,
        summary,
        total: totalItems,
        page,
        limit
      });
    }

    const aiConfig = resolveRequestAI(req);

    const cacheKey = queryStr.toLowerCase() + (aiConfig.apiKey ? `:${aiConfig.provider}:${aiConfig.model}` : '');
    const isRefresh = req.query.refresh === 'true' || req.query.nocache === 'true';
    if (!isRefresh && searchCache.has(cacheKey)) {
      const cached = searchCache.get(cacheKey)!;
      // Invalidate if cache entry is malformed, missing summary, or contains obsolete Mosel region box
      if (!cached.summary || !cached.intent || (cached.intent as any).region === 'Mosel') {
        searchCache.delete(cacheKey);
      } else if (cached.route && cached.all_places && cached.map_points) {
        console.log(`Hitting route search cache for: "${queryStr}" (Page ${page})`);
        const pagedPlaces = cached.all_places.slice(offset, offset + limit);
        return res.json({
          places: pagedPlaces,
          mapPoints: cached.map_points,
          summary: cached.summary,
          recommendationTitle: cached.recommendation_title || "",
          curatedIds: cached.recommended_ids || [],
          route: cached.route,
          routePolyline: cached.route_polyline,
          total: cached.all_places.length,
          page,
          limit
        });
      } else {
        console.log(`Hitting search cache for: "${queryStr}" (Page ${page})`);
        const cachedBuilt = buildSearchQuery(cached.intent);
        const cachedResult = await executeIntentSearch(db, cachedBuilt, limit, offset);
        let cachedPlaces = cachedResult.places;
        if (cached.recommended_ids && cached.recommended_ids.length > 0 && page === 1) {
          const missingIds = cached.recommended_ids.filter(id => !cachedResult.places.some(p => p.id === id));
          let extraCurated: any[] = [];
          if (missingIds.length > 0) {
            extraCurated = await db.all(`SELECT * FROM places WHERE id IN (${missingIds.map(() => '?').join(',')})`, missingIds);
          }
          const candidateMap = new Map([...cachedResult.places, ...extraCurated].map(p => [p.id, p]));
          const curatedPlaces = cached.recommended_ids
            .map(id => candidateMap.get(id))
            .filter(Boolean)
            .map(p => ({ ...p, is_curated: true }));
          const otherPlaces = cachedResult.places.filter(p => !cached.recommended_ids!.includes(p.id));
          cachedPlaces = [...curatedPlaces, ...otherPlaces].slice(0, limit);
        }
        const mapPoints = await computeMapPoints(db, `SELECT * FROM places WHERE ${cachedBuilt.whereSql}`, cachedBuilt.params, cachedBuilt.distance);
        return res.json({
          places: cachedPlaces,
          mapPoints,
          summary: cached.summary,
          recommendationTitle: cached.recommendation_title || "",
          curatedIds: cached.recommended_ids || [],
          route: cached.route,
          routePolyline: cached.route_polyline,
          total: cachedResult.total,
          page,
          limit
        });
      }
    }

    // --- Intent parsing: clear, structured queries are handled deterministically
    // (no AI call). The AI model is only used for ambiguous queries. In both cases
    // the SQL is built deterministically in code (see search.ts). ---
    let intent: SearchIntent = {};
    let usedModel = false;
    const parsed = parseQueryIntent(queryStr);
    if (parsed) {
      intent = parsed;
      console.log(`Deterministic intent for "${queryStr}": ${JSON.stringify(intent)}`);
    } else {
      // Direct place / city name matching for unstructured single place queries (e.g. "Bühlhof", "Elbphilharmonie", "Schloss Neuhausen")
      const directPlaces = await db.all(
        `SELECT * FROM places WHERE name LIKE ? OR (city IS NOT NULL AND LOWER(city) = ?) ORDER BY rating DESC LIMIT ? OFFSET ?`,
        [`%${queryStr}%`, queryStr.toLowerCase(), limit, offset]
      );
      if (directPlaces.length > 0 && !queryStr.includes(' nach ') && !queryStr.includes(' und ') && !queryStr.includes('route')) {
        const countRow = await db.get(
          `SELECT COUNT(*) as total FROM places WHERE name LIKE ? OR (city IS NOT NULL AND LOWER(city) = ?)`,
          [`%${queryStr}%`, queryStr.toLowerCase()]
        );
        const total = countRow?.total || directPlaces.length;
        const mapPoints = await computeMapPoints(db, `SELECT * FROM places WHERE name LIKE ? OR (city IS NOT NULL AND LOWER(city) = ?)`, [`%${queryStr}%`, queryStr.toLowerCase()]);
        console.log(`Direct database match for "${queryStr}": found ${total} places.`);
        return res.json({
          places: directPlaces,
          mapPoints,
          summary: `<p>Gefundene Orte und Reiseziele für <strong>„${queryStr}“</strong>.</p>`,
          total,
          page,
          limit
        });
      }

      if (!aiConfig.apiKey) {
        console.log(`No AI API key provided for ambiguous query "${queryStr}", using keyword fallback.`);
        const fallbackResult = await fallbackSearch(db, queryStr, limit, offset);
        return res.json({
          places: fallbackResult.places,
          summary: `<p>💡 <em>Tipp: Für intelligente KI-Kuration, erweiterte Natur-Suchen &amp; Etappen-Routen kannst du oben rechts unter <strong>🔑 KI-Einstellungen</strong> deinen eigenen kostenlosen Key (z. B. Google Gemini oder DeepSeek) hinterlegen.</em></p>`,
          total: fallbackResult.total,
          page,
          limit
        });
      } else {
      usedModel = true;
      try {
        const systemInstruction = await buildIntentPrompt(db);
        const prompt = `User query: "${queryStr}"`;
        const responseText = await chatJSON(aiConfig, systemInstruction, prompt);
        intent = validateIntent(JSON.parse(responseText.trim()));
      } catch (parseErr: any) {
        console.warn(`Could not parse AI intent for "${queryStr}":`, parseErr?.message || parseErr);
        intent = {};
      }
      console.log(`AI intent for "${queryStr}": ${JSON.stringify(intent)}`);
      }
    }

    // Code-level safety nets so missing fields never produce empty results.
    if (!intent.country) intent.country = inferCountryFromQuery(queryStr);
    if (!intent.types || intent.types.length === 0) intent.types = inferTypesFromQuery(queryStr);
    if (intent.state) intent.state = normalizeStateName(intent.country, intent.state);
    // "max 10 km" / "innerhalb von 30 km" / "Umkreis 15 km"
    if (!intent.radius_km) {
      const kmMatch = queryStr.match(/(\d{1,3})\s*(?:km|kilometer)/i);
      if (kmMatch) {
        const km = parseInt(kmMatch[1], 10);
        if (km >= 1 && km <= 300) intent.radius_km = km;
      }
    }
    // Target count (e.g. "4-5 Plätze", "3 Empfehlungen")
    if (!intent.target_count) {
      const countMatch = queryStr.match(/(?:schlage\s+(?:mir\s+)?|top\s+|die\s+)?(\d{1,2})\s*(?:-|bis\s*(\d{1,2})\s*)?(?:plätze|campingplätze|stellplätze|tipps|empfehlungen)/i);
      if (countMatch) {
        const num = parseInt(countMatch[2] || countMatch[1], 10);
        if (num >= 1 && num <= 30) intent.target_count = num;
      }
    }

    // If the model found no usable filters at all, fall back to keyword search.
    if (
      !intent.country && !intent.state && !intent.region && !intent.waterbody && !intent.valley && !intent.city &&
      (!intent.types || intent.types.length === 0) &&
      (!intent.amenities || intent.amenities.length === 0) &&
      (!intent.features || intent.features.length === 0) &&
      (!intent.keywords || intent.keywords.length === 0) &&
      !intent.free && !intent.max_price
    ) {
      console.log(`Empty intent for "${queryStr}", using keyword fallback.`);
      const fallbackResult = await fallbackSearch(db, queryStr, limit, offset);
      return res.json({
        places: fallbackResult.places,
        summary: "",
        total: fallbackResult.total,
        page,
        limit
      });
    }

    // Resolve a named city or landmark to coordinates (our DB first, model coords as fallback)
    let effectiveIntent = intent;
    if (intent.route) {
      const origCoords = await resolveCityCoords(db, intent.route.origin, intent.country, intent.route.origin_lat, intent.route.origin_lon);
      if (origCoords) {
        intent.route.origin_lat = origCoords.lat;
        intent.route.origin_lon = origCoords.lon;
        if (!intent.country && origCoords.country) intent.country = origCoords.country;
      }
      const destCoords = await resolveCityCoords(db, intent.route.destination, intent.country, intent.route.destination_lat, intent.route.destination_lon);
      if (destCoords) {
        intent.route.destination_lat = destCoords.lat;
        intent.route.destination_lon = destCoords.lon;
      }
      console.log(`Resolved route: "${intent.route.origin}" (${intent.route.origin_lat}, ${intent.route.origin_lon}) ➔ "${intent.route.destination}" (${intent.route.destination_lat}, ${intent.route.destination_lon})`);
    } else if (intent.city) {
      const cityCoords = await resolveCityCoords(db, intent.city, intent.country, intent.city_lat, intent.city_lon);
      if (cityCoords) {
        intent.city_lat = cityCoords.lat;
        intent.city_lon = cityCoords.lon;
      }
    } else if (intent.landmark) {
      const resolved = await resolveCityCoords(db, intent.landmark, intent.country, intent.city_lat, intent.city_lon);
      if (resolved) {
        intent.city = intent.landmark;
        intent.city_lat = resolved.lat;
        intent.city_lon = resolved.lon;
        if (resolved.country) intent.country = resolved.country;
      }
    } else if (intent.keywords && intent.keywords.length > 0) {
      // Some keywords are actually landmark names ("Zugspitze", "Neuschwanstein").
      for (const kw of intent.keywords) {
        const resolved = await resolveCityCoords(db, kw, null, null, null);
        if (resolved && resolved.country && TARGET_COUNTRIES.includes(resolved.country)) {
          console.log(`Promoting keyword "${kw}" to city in ${resolved.country} (${resolved.lat}, ${resolved.lon}).`);
          intent.city = kw;
          intent.city_lat = resolved.lat;
          intent.city_lon = resolved.lon;
          intent.country = resolved.country;
          intent.keywords = intent.keywords.filter(k => k !== kw);
          if (intent.keywords.length === 0) intent.keywords = null;
          break;
        }
      }
    }

    // --- Dedicated Route Corridor & Stopover Pipeline ---
    if (
      effectiveIntent.route &&
      typeof effectiveIntent.route.origin_lat === 'number' &&
      typeof effectiveIntent.route.destination_lat === 'number'
    ) {
      const r = effectiveIntent.route;
      const originLat = r.origin_lat!;
      const originLon = r.origin_lon!;
      const destLat = r.destination_lat!;
      const destLon = r.destination_lon!;

      const straightLineKm = haversineDistance(originLat, originLon, destLat, destLon);
      const estTotalKm = Math.round(straightLineKm * 1.25);
      const estTotalDriveHours = +(estTotalKm / 85).toFixed(1);

      let targetIntervalKm = r.interval_km;
      if (!targetIntervalKm && r.interval_hours) {
        targetIntervalKm = Math.round(r.interval_hours * 90);
      }
      if (!targetIntervalKm && r.num_stops) {
        targetIntervalKm = Math.round(estTotalKm / (r.num_stops + 1));
      }
      if (!targetIntervalKm || targetIntervalKm <= 50) {
        targetIntervalKm = 250;
      }

      const numStops = r.num_stops || Math.max(1, Math.min(6, Math.round(estTotalKm / targetIntervalKm)));
      const corridorWidthKm = r.corridor_width_km || 35;

      const builtRouteQuery = buildSearchQuery(effectiveIntent);
      const allBoxPlaces = await db.all(`SELECT * FROM places WHERE ${builtRouteQuery.whereSql}`, builtRouteQuery.params);

      const corridorCandidates: any[] = [];
      for (const p of allBoxPlaces) {
        const proj = projectPointToRoute(p.latitude, p.longitude, originLat, originLon, destLat, destLon);
        if (proj.distanceToRouteKm <= corridorWidthKm && proj.progressRatio >= 0.04 && proj.progressRatio <= 0.96) {
          const distAlongEst = Math.round(proj.distanceAlongKm * 1.25);
          const driveHoursEst = +(distAlongEst / 85).toFixed(1);
          corridorCandidates.push({
            ...p,
            distance_from_origin_km: distAlongEst,
            drive_time_hours: driveHoursEst,
            distance_to_route_km: Math.round(proj.distanceToRouteKm),
            progress_ratio: proj.progressRatio
          });
        }
      }

      corridorCandidates.sort((a, b) => a.distance_from_origin_km - b.distance_from_origin_km);

      // Determine stage target points based on interval (e.g. 250km, 500km) or evenly spaced
      const targetStopsCount = r.num_stops || Math.max(1, Math.min(5, Math.floor((estTotalKm - 40) / targetIntervalKm)));
      const stageCandidates: { stage: number; targetKm: number; estHours: number; places: any[] }[] = [];
      for (let s = 1; s <= targetStopsCount; s++) {
        let stageTargetKm = s * targetIntervalKm;
        if (stageTargetKm >= estTotalKm - 60) {
          stageTargetKm = Math.round((s / (targetStopsCount + 1)) * estTotalKm);
        }
        const stageEstHours = +(stageTargetKm / 85).toFixed(1);

        const inStage = corridorCandidates
          .filter(p => Math.abs(p.distance_from_origin_km - stageTargetKm) <= 120)
          .sort((a, b) => {
            const diffA = Math.abs(a.distance_from_origin_km - stageTargetKm);
            const diffB = Math.abs(b.distance_from_origin_km - stageTargetKm);
            const scoreA = (a.rating || 4.0) * 10 - diffA * 0.05;
            const scoreB = (b.rating || 4.0) * 10 - diffB * 0.05;
            return scoreB - scoreA;
          })
          .slice(0, 6);

        if (inStage.length > 0) {
          stageCandidates.push({
            stage: stageCandidates.length + 1,
            targetKm: stageTargetKm,
            estHours: stageEstHours,
            places: inStage
          });
        }
      }

      let recommendedIds: string[] = [];
      let recommendationTitle = `Empfohlene Zwischenstopps: ${r.origin} ➔ ${r.destination}`;
      let summaryHtml = "";
      let curatedStages: any[] = [];

      try {
        const routeCurationSystem = "Du bist ein erstklassiger Camping-Routenplaner und kuratierst die perfekten Zwischenstopps für eine längere Wohnmobil- bzw. Campingreise.";
        const routePrompt = `
          Der Benutzer sucht Zwischenstopps für folgende Reiseroute:
          - Start: ${r.origin}
          - Ziel: ${r.destination}
          - Gesamtdistanz: ca. ${estTotalKm} km (ca. ${estTotalDriveHours} Std. reine Fahrzeit)
          - Gewünschte Zwischenstopps: ${numStops} Etappen (im Abstand von ca. ${targetIntervalKm} km bzw. ${r.interval_hours || '2-3'} Std.)

          Hier sind die besten Plätze entlang der jeweiligen Etappen:
          ${JSON.stringify(stageCandidates.map(sc => ({
            stage: sc.stage,
            target_km_from_start: sc.targetKm,
            est_drive_hours_from_start: sc.estHours,
            candidates: sc.places.map(p => ({
              id: p.id,
              name: p.name,
              city: p.city || p.address,
              state: p.state,
              rating: p.rating,
              distance_from_start_km: p.distance_from_origin_km,
              drive_time_from_start_hours: p.drive_time_hours,
              distance_from_highway_km: p.distance_to_route_km,
              amenities: p.amenities,
              description: p.description ? p.description.slice(0, 180) : ""
            }))
          })))}

          Aufgabe:
          1. Wähle für jede der ${numStops} Etappen den besten 1 (oder maximal 2) Übernachtungsplatz aus, der verkehrsgünstig und attraktiv liegt.
          2. Gib alle ausgewählten Platz-IDs chronologisch (von Start zu Ziel) im Array "recommended_ids" zurück.
          3. Erstelle einen ansprechenden Titel in "recommendation_title" (z. B. "✨ Reiseroute & Top-Zwischenstopps: ${r.origin} ➔ ${r.destination}").
          4. Verfasse in "summary" einen klaren, übersichtlichen Reiseplan in einfachem HTML (nutze <p>, <strong>, <ul>, <li>), der die Etappen mit Kilometerstand, Fahrzeit und Platz-Highlights vorstellt. Verwende kein Markdown.
          5. Gib das Array "stages" zurück mit [{"stage_number": 1, "place_id": "...", "distance_km": ..., "drive_hours": ..., "stage_title": "..."}].

          Antworte AUSSCHLIESSLICH als JSON:
          {
            "recommended_ids": ["id1", "id2"],
            "recommendation_title": "...",
            "summary": "<p>...</p>",
            "stages": [{"stage_number": 1, "place_id": "id1", "distance_km": 245, "drive_hours": 2.6, "stage_title": "Etappe 1 (nach ca. 245 km)"}]
          }
        `;

        const curationResp = await chatJSON(aiConfig, routeCurationSystem, routePrompt);
        const cleanJson = curationResp.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed.recommended_ids)) {
          recommendedIds = parsed.recommended_ids.filter((id: any) => typeof id === "string");
        }
        if (parsed.recommendation_title) recommendationTitle = parsed.recommendation_title;
        if (parsed.summary) summaryHtml = parsed.summary.trim();
        if (Array.isArray(parsed.stages)) curatedStages = parsed.stages;
      } catch (curationErr) {
        console.warn("Route curation model error:", curationErr);
      }

      if (recommendedIds.length === 0) {
        for (const sc of stageCandidates) {
          if (sc.places.length > 0) recommendedIds.push(sc.places[0].id);
        }
      }

      if (!summaryHtml) {
        summaryHtml = `<p>Hier sind deine empfohlenen <strong>${recommendedIds.length} Zwischenstopps</strong> entlang der Route von <strong>${r.origin}</strong> nach <strong>${r.destination}</strong> (ca. ${estTotalKm} km Gesamtfahrstrecke).</p>`;
      }

      const candidateMap = new Map(corridorCandidates.map(p => [p.id, p]));
      const curatedPlaces = recommendedIds
        .map(id => candidateMap.get(id))
        .filter(Boolean)
        .map((p, idx) => ({ ...p, is_curated: true, stage_number: idx + 1 }));

      const otherCorridorPlaces = corridorCandidates.filter(p => !recommendedIds.includes(p.id));
      const combinedPlaces = [...curatedPlaces, ...otherCorridorPlaces];
      const pagedPlaces = combinedPlaces.slice(offset, offset + limit);

      const routePolyline: [number, number][] = [
        [originLat, originLon],
        ...curatedPlaces.map(p => [p.latitude, p.longitude] as [number, number]),
        [destLat, destLon]
      ];

      const routeMetadata = {
        origin: r.origin,
        destination: r.destination,
        originCoords: [originLat, originLon] as [number, number],
        destinationCoords: [destLat, destLon] as [number, number],
        totalKm: estTotalKm,
        totalDriveHours: estTotalDriveHours,
        numStops: recommendedIds.length,
        stages: curatedStages.length > 0 ? curatedStages : curatedPlaces.map((p, i) => ({
          stage_number: i + 1,
          place_id: p.id,
          distance_km: p.distance_from_origin_km,
          drive_hours: p.drive_time_hours,
          stage_title: `Etappe ${i + 1} (nach ca. ${p.distance_from_origin_km} km)`
        }))
      };

      const mapPoints = combinedPlaces.map(p => ({
        id: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        type: p.type,
        rating: p.rating,
        is_curated: !!p.is_curated,
        stage_number: (p as any).stage_number
      }));

      searchCache.set(cacheKey, {
        intent: effectiveIntent,
        summary: summaryHtml,
        recommended_ids: recommendedIds,
        recommendation_title: recommendationTitle,
        route: routeMetadata,
        route_polyline: routePolyline,
        all_places: combinedPlaces,
        map_points: mapPoints
      });

      return res.json({
        places: pagedPlaces,
        mapPoints,
        summary: summaryHtml,
        recommendationTitle,
        curatedIds: recommendedIds,
        route: routeMetadata,
        routePolyline,
        total: combinedPlaces.length,
        page,
        limit
      });
    }

    // Progressive relaxation: evaluate all intent variants (dropping soft
    // filters first) and pick the most precise one that still returns results.
    let result = await executeIntentSearch(db, buildSearchQuery(effectiveIntent), limit, offset);
    let best = result.total > 0 ? { intent: effectiveIntent, total: result.total, places: result.places } : null;
    for (const relaxed of relaxIntent(effectiveIntent)) {
      if (relaxed === effectiveIntent) continue;
      const r = await executeIntentSearch(db, buildSearchQuery(relaxed), limit, offset);
      if (r.total > 0 && (!best || r.total < best.total)) {
        best = { intent: relaxed, total: r.total, places: r.places };
      }
    }
    if (best && best.intent !== effectiveIntent) {
      console.log(`Relaxed intent for "${queryStr}" -> ${best.total} results.`);
      effectiveIntent = best.intent;
      result = { total: best.total, places: best.places };
    }

    // If relaxation ended up with no meaningful filter (the whole database), do a
    // proper keyword search instead so nonsense queries return an honest "no
    // results" rather than "here is everything".
    const hasLocationFilter = effectiveIntent.country || effectiveIntent.state || effectiveIntent.region || effectiveIntent.waterbody || effectiveIntent.valley || effectiveIntent.city || effectiveIntent.route;
    const hasTypeFilter = !!effectiveIntent.types && effectiveIntent.types.length > 0;
    if (!hasLocationFilter && !hasTypeFilter) {
      const fallbackResult = await fallbackSearch(db, queryStr, limit, offset);
      return res.json({
        places: fallbackResult.places,
        summary: "",
        total: fallbackResult.total,
        page,
        limit
      });
    }

    const totalItems = result.total;
    let pagedPlaces = result.places;
    let recommendedIds: string[] = [];
    let recommendationTitle = "";
    let summaryHtml = "";

    // Deterministic top-picks & template summary (Option A: no AI model call)
    if (usedModel) {
      try {
        const candidateResult = await executeIntentSearch(db, buildSearchQuery(effectiveIntent), 25, 0);
        const candidates = candidateResult.places;
        const targetCount = effectiveIntent.target_count || (queryStr.match(/(?:schlage\s+(?:mir\s+)?|top\s+|die\s+)?(\d{1,2})\s*(?:-|bis\s*(\d{1,2})\s*)?(?:plätze|campingplätze|stellplätze|tipps|empfehlungen)/i) ? 5 : 4);

        // Top picks by rating (then review count) - deterministic, no model call
        const sorted = [...candidates].sort(
          (a: any, b: any) => (b.rating || 0) - (a.rating || 0) || (b.review_count || 0) - (a.review_count || 0)
        );
        recommendedIds = sorted.slice(0, Math.max(1, Math.min(targetCount, 5))).map((p: any) => p.id);

        if (recommendedIds.length > 0) {
          recommendationTitle = `Unsere Top-${recommendedIds.length} passend zu deiner Suche`;
          const candidateMap = new Map(candidates.map((p: any) => [p.id, p]));
          const curatedPlaces = recommendedIds
            .map((id: string) => candidateMap.get(id))
            .filter(Boolean)
            .map((p: any) => ({ ...p, is_curated: true }));
          const otherPlaces = result.places.filter((p: any) => !recommendedIds.includes(p.id));
          const combined = [...curatedPlaces, ...otherPlaces];
          pagedPlaces = combined.slice(offset, offset + limit);
        }
      } catch (curationErr) {
        console.error("Deterministic curation failed:", curationErr);
      }
    }

    if (!summaryHtml) {
      const typeLabel = effectiveIntent.types && effectiveIntent.types.includes('attraction')
        ? 'Sehenswürdigkeiten und Ausflugsziele'
        : 'Campingplätze und Stellplätze';
      let loc = effectiveIntent.waterbody || effectiveIntent.valley || effectiveIntent.region || effectiveIntent.state || effectiveIntent.city || '';
      if (!loc && effectiveIntent.country) loc = COUNTRY_NAMES[effectiveIntent.country] || effectiveIntent.country;
      if (!loc) loc = 'deiner Region';
      summaryHtml = `<p>Entdecke die besten ${totalItems} ${typeLabel} in <strong>${loc}</strong> – direkt aus unserer verifizierten Datenbank.</p>`;
    }

    searchCache.set(cacheKey, { intent: effectiveIntent, summary: summaryHtml, recommended_ids: recommendedIds, recommendation_title: recommendationTitle });

    const mapBuilt = buildSearchQuery(effectiveIntent);
    const mapPoints = await computeMapPoints(db, `SELECT * FROM places WHERE ${mapBuilt.whereSql}`, mapBuilt.params, mapBuilt.distance);

    res.json({
      places: pagedPlaces,
      mapPoints,
      summary: summaryHtml,
      recommendationTitle,
      curatedIds: recommendedIds,
      total: totalItems,
      page,
      limit
    });

  } catch (error: any) {
    console.error("AI search failed or query was invalid, running keyword fallback:", error);
    try {
      const db = await getDb();
      const fallbackResult = await fallbackSearch(db, queryStr, limit, offset);
      res.json({
        places: fallbackResult.places,
        summary: "",
        total: fallbackResult.total,
        page,
        limit
      });
    } catch (fallbackError: any) {
      res.status(500).json({ error: fallbackError.message });
    }
  }
});

/**
 * Execute a deterministically built query. When a destination city is present,
 * results are ranked by distance from that city and include distance_km.
 */
async function executeIntentSearch(db: any, built: BuiltQuery, limit: number, offset: number) {
  const { whereSql, params, distance } = built;
  const countResult = await db.get(`SELECT COUNT(*) AS total FROM places WHERE ${whereSql}`, params);
  const total = countResult ? countResult.total : 0;

  let places: any[];
  if (distance) {
    const latCos = Math.cos((distance.lat * Math.PI) / 180);
    // NOTE: the coordinate placeholders live in the SELECT list and therefore
    // must be bound BEFORE the WHERE parameters.
    const sql = `SELECT *, ((latitude - ?) * (latitude - ?)) + ((longitude - ?) * (longitude - ?) * ${latCos} * ${latCos}) AS distance_sq
                 FROM places WHERE ${whereSql} ORDER BY distance_sq ASC LIMIT ? OFFSET ?`;
    const rows = await db.all(sql, [
      distance.lat, distance.lat, distance.lon, distance.lon,
      ...params, limit, offset
    ]);
    places = rows.map((p: any) => {
      const km = Math.round(Math.sqrt(p.distance_sq) * 111 * 10) / 10;
      return { ...p, distance_km: km };
    });
  } else {
    const sql = `SELECT * FROM places WHERE ${whereSql} ORDER BY rating DESC LIMIT ? OFFSET ?`;
    places = await db.all(sql, [...params, limit, offset]);
  }
  return { total, places };
}

/**
 * Compute lightweight map points (id, name, coords, type, rating) for all
 * matches of a query, capped for performance. Used to render a minimap of all
 * results next to the paginated list.
 */
async function computeMapPoints(
  db: any,
  selectSql: string,
  params: any[],
  distance?: { lat: number; lon: number }
): Promise<any[]> {
  const cap = 2000;
  const fromWhere = selectSql
    .replace(/^SELECT.*?FROM\s+/i, '')
    .replace(/\s+ORDER\s+BY\s+.*$/i, '');
  if (distance) {
    const latCos = Math.cos((distance.lat * Math.PI) / 180);
    const rows = await db.all(
      `SELECT id, name, latitude, longitude, type, rating, ((latitude - ?) * (latitude - ?)) + ((longitude - ?) * (longitude - ?) * ${latCos} * ${latCos}) AS distance_sq
       FROM ${fromWhere} ORDER BY distance_sq ASC LIMIT ${cap}`,
      [distance.lat, distance.lat, distance.lon, distance.lon, ...params]
    );
    return rows.map((r: any) => ({
      id: r.id, name: r.name, latitude: r.latitude, longitude: r.longitude, type: r.type, rating: r.rating,
      distance_km: Math.round(Math.sqrt(r.distance_sq) * 111 * 10) / 10
    }));
  }
  return db.all(
    `SELECT id, name, latitude, longitude, type, rating FROM ${fromWhere} ORDER BY rating DESC LIMIT ${cap}`,
    params
  );
}

// Helper function for local keyword search fallback (supporting pagination)
// Predefined state/country mappings for exact filtering
const STATE_MAP: { [key: string]: { country?: string; state?: string } } = {
  // Germany states
  "bayern": { country: "DE", state: "Bayern" },
  "baden-württemberg": { country: "DE", state: "Baden-Württemberg" },
  "baden-wurtemberg": { country: "DE", state: "Baden-Württemberg" },
  "nordrhein-westfalen": { country: "DE", state: "Nordrhein-Westfalen" },
  "niedersachsen": { country: "DE", state: "Niedersachsen" },
  "hessen": { country: "DE", state: "Hessen" },
  "rheinland-pfalz": { country: "DE", state: "Rheinland-Pfalz" },
  "sachsen": { country: "DE", state: "Sachsen" },
  "thüringen": { country: "DE", state: "Thüringen" },
  "brandenburg": { country: "DE", state: "Brandenburg" },
  "mecklenburg-vorpommern": { country: "DE", state: "Mecklenburg-Vorpommern" },
  "schleswig-holstein": { country: "DE", state: "Schleswig-Holstein" },
  "saarland": { country: "DE", state: "Saarland" },
  "berlin": { country: "DE", state: "Berlin" },
  "hamburg": { country: "DE", state: "Hamburg" },
  "bremen": { country: "DE", state: "Bremen" },
  "sachsen-anhalt": { country: "DE", state: "Sachsen-Anhalt" },
  // Austria states
  "tirol": { country: "AT", state: "Tirol" },
  "oberösterreich": { country: "AT", state: "Oberösterreich" },
  "niederösterreich": { country: "AT", state: "Niederösterreich" },
  "wien": { country: "AT", state: "Wien" },
  "salzburg": { country: "AT", state: "Salzburg" },
  "steiermark": { country: "AT", state: "Steiermark" },
  "kärnten": { country: "AT", state: "Kärnten" },
  "burgenland": { country: "AT", state: "Burgenland" },
  "vorarlberg": { country: "AT", state: "Vorarlberg" },
  // Switzerland cantons
  "zürich": { country: "CH", state: "Zürich" },
  "bern": { country: "CH", state: "Bern" },
  "wallis": { country: "CH", state: "Wallis" },
  "tessin": { country: "CH", state: "Tessin" },
  "graubünden": { country: "CH", state: "Graubünden" },
  "luzern": { country: "CH", state: "Luzern" },
  "st. gallen": { country: "CH", state: "St. Gallen" },
  "waadt": { country: "CH", state: "Waadt" },
  "neuenburg": { country: "CH", state: "Neuenburg" },
  "freiburg": { country: "CH", state: "Freiburg" },
  // Popular regions
  "schwarzwald": { country: "DE" },
  "bodensee": {},
  "ostsee": { country: "DE" },
  "nordsee": { country: "DE" },
  "allgäu": { country: "DE" },
  "harz": { country: "DE" },
  "eifel": {},
  "sächsische schweiz": { country: "DE" },
  "mosel": { country: "DE" },
  "bayerischer wald": { country: "DE" },
  "to skana": { country: "IT" },
  "toskana": { country: "IT" },
  "südtirol": { country: "IT" },
  "dolomiten": { country: "IT" },
  "gardasee": { country: "IT" },
  "côte d'azur": { country: "FR" },
  "provence": { country: "FR" },
  "lofoten": { country: "NO" },
  "texel": { country: "NL" }
};

const FALLBACK_STOP_WORDS = new Set([
  'und', 'oder', 'der', 'die', 'das', 'dem', 'den', 'des', 'ein', 'eine', 'einen', 'einem', 'einer',
  'mit', 'für', 'fuer', 'in', 'im', 'am', 'an', 'auf', 'aus', 'von', 'zu', 'nach', 'bei', 'direkt',
  'suche', 'suchen', 'sucht', 'finde', 'finden', 'schlage', 'vor', 'bitte', 'gibt', 'es',
  'wunderschöne', 'wunderschönen', 'wunderschöner', 'schöne', 'schönen', 'schöner', 'beste', 'besten', 'bester',
  'topp', 'top', 'gut', 'gute', 'guten', 'guter', 'tolle', 'tollen', 'toller'
]);

async function fallbackSearch(db: any, queryStr: string, limit: number, offset: number) {
  const normalizedQuery = queryStr.toLowerCase();
  let sql = "SELECT * FROM places WHERE 1=1";
  const params: any[] = [];

  // Type filter
  if (/(sehenswürdigkeit|sehenswuerdigkeit|attraktion|ausflugsziel|ausflugsziele)/i.test(normalizedQuery)) {
    sql += " AND type = 'attraction'";
  } else if (/(camping|campingplatz|campingplätze|stellplatz|stellplätze|wohnmobil|glamping|zelten)/i.test(normalizedQuery)) {
    sql += " AND type IN ('campground', 'caravan', 'glamping')";
  }
  
  // Check for state/country in query and apply EXACT filters
  let stateFilterApplied = false;
  for (const [key, mapping] of Object.entries(STATE_MAP)) {
    if (normalizedQuery.includes(key)) {
      if (mapping.country) {
        sql += " AND country = ?";
        params.push(mapping.country);
      }
      if (mapping.state) {
        sql += " AND state = ?";
        params.push(mapping.state);
        stateFilterApplied = true;
      }
      const regex = new RegExp(key, "gi");
      queryStr = queryStr.replace(regex, "");
      break;
    }
  }
  
  // Extract keywords, filtering out stop words and numbers
  const rawTokens = queryStr
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length >= 3 && !FALLBACK_STOP_WORDS.has(k) && !/^\d+$/.test(k));
  
  // Remove type keywords from content matching since we already filtered on type
  const contentTokens = rawTokens.filter(t => !['camping', 'campingplatz', 'campingplätze', 'stellplatz', 'stellplätze', 'wohnmobil', 'glamping', 'attraktion', 'attraktionen', 'sehenswürdigkeit', 'sehenswürdigkeiten', 'plätze', 'platz'].includes(t));

  if (contentTokens.length > 0) {
    for (const token of contentTokens) {
      // Wort-genaues Matching über FTS (kein Substring-Treffer wie "elbe"->"Tegelberg")
      const expr = ['name', 'description', 'address', 'city', 'amenities']
        .map((c) => `${c}:"${token.replace(/["'\\]/g, ' ').trim()}"`)
        .join(' OR ');
      sql += " AND EXISTS (SELECT 1 FROM places_fts WHERE rowid = places.rowid AND places_fts MATCH ?)";
      params.push(expr);
    }
  }
  
  // Calculate total count
  const countSql = sql.replace("SELECT *", "SELECT COUNT(*) AS total");
  const countResult = await db.get(countSql, params);
  const total = countResult ? countResult.total : 0;

  sql += ` ORDER BY rating DESC LIMIT ${limit} OFFSET ${offset}`;
  const places = await db.all(sql, params);
  return { places, total };
}

// --- REST API Endpoints ---

// Search/List places
app.get("/api/places", async (req, res) => {
  try {
    const db = await getDb();
    const { query, type, country, minLat, maxLat, minLon, maxLon } = req.query;

    let sql = "SELECT * FROM places WHERE 1=1";
    const params: any[] = [];

    if (query) {
      sql += " AND (name LIKE ? OR description LIKE ? OR address LIKE ?)";
      const q = `%${query}%`;
      params.push(q, q, q);
    }
    if (type) {
      sql += " AND type = ?";
      params.push(type);
    }
    if (country) {
      sql += " AND country = ?";
      params.push((country as string).toUpperCase());
    }
    if (minLat && maxLat && minLon && maxLon) {
      sql += " AND latitude >= ? AND latitude <= ? AND longitude >= ? AND longitude <= ?";
      params.push(
        parseFloat(minLat as string),
        parseFloat(maxLat as string),
        parseFloat(minLon as string),
        parseFloat(maxLon as string)
      );
    }

    sql += " ORDER BY rating DESC LIMIT 3000";
    const places = await db.all(sql, params);
    res.json(places);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single place detail
app.get("/api/places/:id", async (req, res) => {
  try {
    const db = await getDb();
    const place = await db.get("SELECT * FROM places WHERE id = ?", [req.params.id]);
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }
    res.json(place);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get reviews for a place
app.get("/api/places/:id/reviews", async (req, res) => {
  try {
    const db = await getDb();
    const reviews = await db.all("SELECT * FROM reviews WHERE place_id = ? ORDER BY created_at DESC", [req.params.id]);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add a review
app.post("/api/places/:id/reviews", async (req, res) => {
  try {
    const db = await getDb();
    const { author, content, rating } = req.body;
    const placeId = req.params.id;

    if (!author || !content || !rating) {
      return res.status(400).json({ error: "Author, content, and rating are required." });
    }

    const reviewId = crypto.randomUUID();
    const createdAt = new Date().toISOString().split("T")[0];

    await db.run(
      "INSERT INTO reviews (id, place_id, author, content, rating, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [reviewId, placeId, author, content, parseInt(rating), createdAt]
    );

    // Update average rating
    const stats = await db.get("SELECT AVG(rating) as avgRating FROM reviews WHERE place_id = ?", [placeId]);
    if (stats && stats.avgRating) {
      await db.run("UPDATE places SET rating = ? WHERE id = ?", [parseFloat(stats.avgRating.toFixed(1)), placeId]);
    }

    const newReview = await db.get("SELECT * FROM reviews WHERE id = ?", [reviewId]);
    res.status(201).json(newReview);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all travel lists
app.get("/api/lists", async (req, res) => {
  try {
    const db = await getDb();
    const lists = await db.all("SELECT * FROM lists ORDER BY created_at DESC");
    
    const listsWithCounts = await Promise.all(
      lists.map(async (list) => {
        const countObj = await db.get("SELECT COUNT(*) as count FROM list_items WHERE list_id = ?", [list.id]);
        return {
          ...list,
          item_count: countObj?.count || 0
        };
      })
    );
    res.json(listsWithCounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new list
app.post("/api/lists", async (req, res) => {
  try {
    const db = await getDb();
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "List name is required." });
    }

    const listId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await db.run(
      "INSERT INTO lists (id, name, description, is_private, created_at) VALUES (?, ?, ?, 1, ?)",
      [listId, name, description || "", createdAt]
    );

    const newList = await db.get("SELECT * FROM lists WHERE id = ?", [listId]);
    res.status(201).json(newList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save a place to a list
app.post("/api/lists/:id/items", async (req, res) => {
  try {
    const db = await getDb();
    const { place_id } = req.body;
    const listId = req.params.id;

    if (!place_id) {
      return res.status(400).json({ error: "place_id is required." });
    }

    await db.run(
      "INSERT OR IGNORE INTO list_items (list_id, place_id, added_at) VALUES (?, ?, ?)",
      [listId, place_id, new Date().toISOString()]
    );

    res.status(201).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a place from a list
app.delete("/api/lists/:id/items/:placeId", async (req, res) => {
  try {
    const db = await getDb();
    const { id, placeId } = req.params;

    await db.run("DELETE FROM list_items WHERE list_id = ? AND place_id = ?", [id, placeId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get items in a specific list
app.get("/api/lists/:id/items", async (req, res) => {
  try {
    const db = await getDb();
    const items = await db.all(`
      SELECT p.*, li.added_at 
      FROM list_items li
      JOIN places p ON li.place_id = p.id
      WHERE li.list_id = ?
      ORDER BY li.added_at DESC
    `, [req.params.id]);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Server Startup & Transport Selection ---

const isStdioMode = process.argv.includes("--stdio") || process.argv.includes("-s");

if (isStdioMode) {
  // Run strictly as a Stdio MCP Server (for CLI integration like Claude Desktop)
  console.error("Starting CampingRoute MCP Server in stdio mode...");
  const transport = new StdioServerTransport();
  mcpServer.connect(transport).catch((err) => {
    console.error("Failed to start Stdio MCP transport:", err);
  });
} else {
  // Start Express API & SSE MCP Server Transport
  const PORT = process.env.PORT || 3000;
  
  const mcpTransports = new Map<string, SSEServerTransport>();

  app.get("/mcp", async (req, res) => {
    console.log("New SSE connection established for MCP client");
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "campingroute.app";
    const isLocal = String(host).includes("localhost") || String(host).includes("127.0.0.1");
    const base = isLocal ? `http://${host}` : `${proto}://${host}`;
    const messagesUrl = `${base}/discover/messages`;

    res.setHeader("X-Accel-Buffering", "no");

    const transport = new SSEServerTransport(messagesUrl, res);
    mcpTransports.set(transport.sessionId, transport);

    transport.onclose = () => {
      console.log(`MCP SSE session closed: ${transport.sessionId}`);
      mcpTransports.delete(transport.sessionId);
    };

    const server = createMcpServer();
    try {
      await server.connect(transport);
    } catch (err) {
      console.error("Failed to connect MCP server to SSE transport:", err);
      mcpTransports.delete(transport.sessionId);
    }
  });

  const handleMcpPost = async (req: express.Request, res: express.Response) => {
    const sessionId = (req.query.sessionId as string) || (req.headers["x-session-id"] as string) || (req.headers["mcp-session-id"] as string);
    const transport = sessionId ? mcpTransports.get(sessionId) : null;
    
    if (transport) {
      try {
        await transport.handlePostMessage(req, res, req.body);
        return;
      } catch (err: any) {
        console.error("Error in transport.handlePostMessage:", err);
      }
    }

    // Direct JSON-RPC Protocol Handling (Streamable HTTP / Go MCP client fallback)
    const msg = req.body;
    if (msg && typeof msg === "object") {
      const id = msg.id ?? null;
      const method = msg.method;

      if (method === "initialize") {
        res.json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: { listChanged: true }
            },
            serverInfo: {
              name: "campingroute",
              version: "1.0.0"
            }
          }
        });
        return;
      }

      if (method === "notifications/initialized" || method === "notifications/cancelled") {
        res.status(200).json({ jsonrpc: "2.0", id, result: {} });
        return;
      }

      if (method === "ping") {
        res.json({ jsonrpc: "2.0", id, result: {} });
        return;
      }

      if (method === "tools/list") {
        res.json({
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS
          }
        });
        return;
      }

      if (method === "tools/call") {
        try {
          const { name, arguments: toolArgs } = msg.params || {};
          const result = await executeMcpTool(name, toolArgs);
          res.json({
            jsonrpc: "2.0",
            id,
            result
          });
        } catch (err: any) {
          res.status(200).json({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32603,
              message: err?.message || "Internal tool execution error"
            }
          });
        }
        return;
      }
    }

    res.status(400).send("Invalid JSON-RPC or Session not found");
  };

  app.post("/mcp", handleMcpPost);
  app.post("/messages", handleMcpPost);

  // Ensure all places in target countries have their state assigned from GPS coords
  try {
    const db = await getDb();
    const unassigned = await db.get("SELECT COUNT(*) as count FROM places WHERE country = 'DE' AND (state IS NULL OR state = '')");
    if (unassigned && unassigned.count > 0) {
      console.log(`[GeoState] Found ${unassigned.count} places in DE without state. Assigning from coordinates...`);
      import("./scripts/update-all-states.js")
        .then(m => m.assignGeoStates(db))
        .catch(err => console.warn("[GeoState] Auto-assign warning:", err.message));
    }
  } catch (err) {
    console.warn("[GeoState] Check warning:", err);
  }

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 CampingRoute is running!`);
    console.log(`   - Web API: http://localhost:${PORT}`);
    console.log(`   - MCP SSE Endpoint: http://localhost:${PORT}/mcp`);
    console.log(`===============================================`);
  });
}
