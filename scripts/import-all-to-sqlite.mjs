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
  console.log("=================================================");
  console.log("🚀 Starting CampingRoute Full SQLite DB Migration");
  console.log("=================================================\n");

  const targetDbs = [
    path.resolve(__dirname, "../server/places.sqlite"),
    path.resolve(__dirname, "../places.sqlite"),
    path.resolve(__dirname, "../entdecken-backend/campingroute_eu.db")
  ];

  for (const dbPath of targetDbs) {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

    console.log(`📦 Configuring & populating SQLite Database: ${dbPath}`);

    const sqlChunks = [
      "PRAGMA journal_mode = WAL;",
      "PRAGMA synchronous = NORMAL;",

      // 1. Trails Schema
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

      // 2. Culinary Spots (Wineries, Farm shops, Cheese dairies, Regiomats) Schema
      `CREATE TABLE IF NOT EXISTS culinary_spots (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'farm_shop',
        subtype_label TEXT,
        region TEXT,
        state TEXT,
        country TEXT NOT NULL DEFAULT 'DE',
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT,
        description TEXT,
        products TEXT,
        has_campsite INTEGER DEFAULT 0,
        image_url TEXT,
        source TEXT DEFAULT 'osm_dzt',
        last_updated TEXT
      );`,
      "CREATE INDEX IF NOT EXISTS idx_culinary_type ON culinary_spots(type);",
      "CREATE INDEX IF NOT EXISTS idx_culinary_state ON culinary_spots(state);",
      "CREATE INDEX IF NOT EXISTS idx_culinary_lat_lon ON culinary_spots(latitude, longitude);",

      // 3. Events Schema
      `CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        full_description TEXT,
        category TEXT NOT NULL DEFAULT 'all',
        locality TEXT,
        postal_code TEXT,
        street_address TEXT,
        state TEXT,
        country TEXT NOT NULL DEFAULT 'DE',
        latitude REAL,
        longitude REAL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        types TEXT,
        image_url TEXT,
        image_copyright TEXT,
        url TEXT,
        source TEXT DEFAULT 'dzt_opendata',
        last_updated TEXT
      );`,
      "CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);",
      "CREATE INDEX IF NOT EXISTS idx_events_state ON events(state);",
      "CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);",
      "CREATE INDEX IF NOT EXISTS idx_events_lat_lon ON events(latitude, longitude);"
    ];

    // Load Culinary data
    const culinarySources = [
      path.resolve(__dirname, "../server/culinary.json"),
      path.resolve(__dirname, "../entdecken-backend/src/data/culinary.ts")
    ];

    let culinaryData = [];
    if (fs.existsSync(culinarySources[0])) {
      try { culinaryData = JSON.parse(fs.readFileSync(culinarySources[0], "utf8")); } catch {}
    }

    if (culinaryData.length > 0) {
      sqlChunks.push("BEGIN TRANSACTION;");
      for (const s of culinaryData) {
        sqlChunks.push(`INSERT OR REPLACE INTO culinary_spots (
          id, name, type, subtype_label, region, state, country,
          latitude, longitude, address, description, products,
          has_campsite, image_url, source, last_updated
        ) VALUES (
          ${sqliteValue(s.id)}, ${sqliteValue(s.name)}, ${sqliteValue(s.type)}, ${sqliteValue(s.subtypeLabel)},
          ${sqliteValue(s.region)}, ${sqliteValue(s.state)}, ${sqliteValue(s.country || 'DE')},
          ${sqliteValue(s.latitude)}, ${sqliteValue(s.longitude)}, ${sqliteValue(s.address)},
          ${sqliteValue(s.description)}, ${sqliteValue(s.products)},
          ${s.hasCampsite ? 1 : 0}, ${sqliteValue(s.image_url)}, 'osm_dzt', ${sqliteValue(new Date().toISOString())}
        );`);
      }
      sqlChunks.push("COMMIT;");
    }

    const sqlScript = sqlChunks.join("\n");
    execFileSync("sqlite3", [dbPath], {
      input: sqlScript,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 64
    });

    const trailsCount = execFileSync("sqlite3", [dbPath, "SELECT COUNT(*) FROM trails;"], { encoding: "utf8" }).trim();
    const culinaryCount = execFileSync("sqlite3", [dbPath, "SELECT COUNT(*) FROM culinary_spots;"], { encoding: "utf8" }).trim();
    const eventsCount = execFileSync("sqlite3", [dbPath, "SELECT COUNT(*) FROM events;"], { encoding: "utf8" }).trim();

    console.log(`   ✅ DB Summary for ${path.basename(dbPath)}:`);
    console.log(`      🥾 Trails: ${trailsCount}`);
    console.log(`      🍇 Kulinarik (Hofläden & Winzer): ${culinaryCount}`);
    console.log(`      📅 Events: ${eventsCount}\n`);
  }

  console.log("=================================================");
  console.log("🎉 All tables & indexes successfully configured in SQLite!");
  console.log("=================================================");
}

main().catch(console.error);
