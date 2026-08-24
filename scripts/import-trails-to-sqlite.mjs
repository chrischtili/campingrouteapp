import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function sqliteValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "object") return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function ensureSqliteAvailable() {
  try {
    execFileSync("sqlite3", ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    throw new Error(`sqlite3 binary not available. Install sqlite3 first (${error.message}).`);
  }
}

async function main() {
  ensureSqliteAvailable();

  const sourceJson = path.resolve(__dirname, "../server/trails.json");
  if (!fs.existsSync(sourceJson)) {
    console.error(`Source trails.json not found at ${sourceJson}`);
    process.exit(1);
  }

  const trails = JSON.parse(fs.readFileSync(sourceJson, "utf8"));
  console.log(`🚀 Read ${trails.length} trails from ${sourceJson}`);

  const targetDbs = [
    path.resolve(__dirname, "../server/places.sqlite"),
    path.resolve(__dirname, "../places.sqlite"),
    path.resolve(__dirname, "../entdecken-backend/campingroute_eu.db")
  ];

  for (const dbPath of targetDbs) {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

    console.log(`\n📦 Importing trails into SQLite: ${dbPath}`);

    const sqlChunks = [
      "PRAGMA journal_mode = WAL;",
      "PRAGMA synchronous = NORMAL;",
      `CREATE TABLE IF NOT EXISTS trails (
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
      );`,
      "CREATE INDEX IF NOT EXISTS idx_trails_state ON trails(state);",
      "CREATE INDEX IF NOT EXISTS idx_trails_type ON trails(type);",
      "CREATE INDEX IF NOT EXISTS idx_trails_difficulty ON trails(difficulty);",
      "CREATE INDEX IF NOT EXISTS idx_trails_lat_lon ON trails(latitude, longitude);",
      "CREATE INDEX IF NOT EXISTS idx_trails_distance ON trails(distance_km);",
      "BEGIN TRANSACTION;"
    ];

    let batchCount = 0;
    for (const t of trails) {
      const id = t.id || `trail-${Math.random().toString(36).substring(2, 9)}`;
      const name = t.name || "Unbenannte Tour";
      const type = t.type || "hiking";
      const region = t.region || "";
      const state = t.state || "";
      const country = t.country || "DE";
      const distance_km = Number(t.distance_km) || 10.0;
      const duration_hours = t.duration_hours ? Number(t.duration_hours) : null;
      const difficulty = t.difficulty || "medium";
      const elevation_gain_m = t.elevation_gain_m ? Number(t.elevation_gain_m) : null;
      const description = t.description || "";
      const highlights = Array.isArray(t.highlights) ? JSON.stringify(t.highlights) : (typeof t.highlights === "string" ? t.highlights : "[]");
      const image_url = t.image_url || "";
      const start_location = t.start_location || "";
      const end_location = t.end_location || "";
      const latitude = Number(t.latitude) || 0;
      const longitude = Number(t.longitude) || 0;
      const polyline = (t.polyline && Array.isArray(t.polyline) && t.polyline.length > 0) ? JSON.stringify(t.polyline) : null;
      const campsites_along_count = Number(t.campsites_along_count) || 0;
      const rating = Number(t.rating) || 4.8;
      const search_query = t.search_query || "";
      const source = t.source || "dzt_opendata";
      const last_updated = t.last_updated || new Date().toISOString();

      sqlChunks.push(`INSERT OR REPLACE INTO trails (
        id, name, type, region, state, country, distance_km, duration_hours,
        difficulty, elevation_gain_m, description, highlights, image_url,
        start_location, end_location, latitude, longitude, polyline,
        campsites_along_count, rating, search_query, source, last_updated
      ) VALUES (
        ${sqliteValue(id)}, ${sqliteValue(name)}, ${sqliteValue(type)}, ${sqliteValue(region)},
        ${sqliteValue(state)}, ${sqliteValue(country)}, ${sqliteValue(distance_km)}, ${sqliteValue(duration_hours)},
        ${sqliteValue(difficulty)}, ${sqliteValue(elevation_gain_m)}, ${sqliteValue(description)}, ${sqliteValue(highlights)},
        ${sqliteValue(image_url)}, ${sqliteValue(start_location)}, ${sqliteValue(end_location)}, ${sqliteValue(latitude)},
        ${sqliteValue(longitude)}, ${sqliteValue(polyline)}, ${sqliteValue(campsites_along_count)}, ${sqliteValue(rating)},
        ${sqliteValue(search_query)}, ${sqliteValue(source)}, ${sqliteValue(last_updated)}
      );`);

      batchCount++;
      if (batchCount % 2000 === 0) {
        sqlChunks.push("COMMIT;");
        sqlChunks.push("BEGIN TRANSACTION;");
      }
    }

    sqlChunks.push("COMMIT;");

    const sqlScript = sqlChunks.join("\n");
    execFileSync("sqlite3", [dbPath], {
      input: sqlScript,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 128
    });

    const countOutput = execFileSync("sqlite3", [dbPath, "SELECT COUNT(*) FROM trails;"], { encoding: "utf8" }).trim();
    console.log(`✅ Success: ${countOutput} trails are now stored & indexed in ${dbPath}`);
  }
}

main().catch(console.error);
