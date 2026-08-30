import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.CAMPINGROUTE_DB_PATH
  ? path.resolve(process.env.CAMPINGROUTE_DB_PATH)
  : path.resolve(__dirname, '../../campingroute_eu.db');

let dbConnection: Database | null = null;

const NEW_COLUMNS: { name: string; ddl: string }[] = [
  { name: 'state', ddl: 'ALTER TABLE places ADD COLUMN state TEXT' },
  { name: 'city', ddl: 'ALTER TABLE places ADD COLUMN city TEXT' },
  { name: 'postal_code', ddl: 'ALTER TABLE places ADD COLUMN postal_code TEXT' },
  { name: 'street', ddl: 'ALTER TABLE places ADD COLUMN street TEXT' },
  { name: 'image_url', ddl: 'ALTER TABLE places ADD COLUMN image_url TEXT' },
  { name: 'website', ddl: 'ALTER TABLE places ADD COLUMN website TEXT' },
  { name: 'phone', ddl: 'ALTER TABLE places ADD COLUMN phone TEXT' },
  { name: 'price_min', ddl: 'ALTER TABLE places ADD COLUMN price_min REAL' },
  { name: 'price_max', ddl: 'ALTER TABLE places ADD COLUMN price_max REAL' },
  { name: 'currency', ddl: 'ALTER TABLE places ADD COLUMN currency TEXT' },
  { name: 'is_free', ddl: 'ALTER TABLE places ADD COLUMN is_free INTEGER DEFAULT 0' },
  { name: 'review_count', ddl: 'ALTER TABLE places ADD COLUMN review_count INTEGER DEFAULT 0' },
  { name: 'source', ddl: 'ALTER TABLE places ADD COLUMN source TEXT' },
  { name: 'data_quality', ddl: 'ALTER TABLE places ADD COLUMN data_quality INTEGER DEFAULT 0' },
  { name: 'last_updated', ddl: 'ALTER TABLE places ADD COLUMN last_updated TEXT' }
];

export async function getDb(): Promise<Database> {
  if (dbConnection) return dbConnection;

  dbConnection = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys + WAL for better concurrent read/write behavior
  await dbConnection.run('PRAGMA foreign_keys = ON');
  await dbConnection.run('PRAGMA journal_mode = WAL');
  await dbConnection.run('PRAGMA synchronous = NORMAL');

  // Create tables if they don't exist
  await dbConnection.exec(`
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      country TEXT NOT NULL,
      state TEXT,
      city TEXT,
      postal_code TEXT,
      street TEXT,
      description TEXT,
      amenities TEXT,
      image_url TEXT,
      rating REAL DEFAULT 4.0,
      review_count INTEGER DEFAULT 0,
      price TEXT,
      price_min REAL,
      price_max REAL,
      currency TEXT,
      is_free INTEGER DEFAULT 0,
      contact TEXT,
      website TEXT,
      phone TEXT,
      address TEXT,
      osm_id TEXT UNIQUE,
      source TEXT,
      data_quality INTEGER DEFAULT 0,
      last_updated TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      place_id TEXT NOT NULL,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      rating INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      device_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      is_private INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_lists_device_id ON lists(device_id);

    CREATE TABLE IF NOT EXISTS list_items (
      list_id TEXT NOT NULL,
      place_id TEXT NOT NULL,
      added_at TEXT NOT NULL,
      PRIMARY KEY (list_id, place_id),
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
    );

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

    CREATE TABLE IF NOT EXISTS events (
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
    );

    CREATE TABLE IF NOT EXISTS culinary_spots (
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
    );

    CREATE INDEX IF NOT EXISTS idx_culinary_type ON culinary_spots(type);
    CREATE INDEX IF NOT EXISTS idx_culinary_state ON culinary_spots(state);
    CREATE INDEX IF NOT EXISTS idx_culinary_lat_lon ON culinary_spots(latitude, longitude);
  `);

  // Add any missing columns for existing databases (idempotent migrations)
  const existingCols = await dbConnection.all("PRAGMA table_info(places)");
  const existingNames = new Set(existingCols.map((c: any) => c.name));
  for (const col of NEW_COLUMNS) {
    if (!existingNames.has(col.name)) {
      try {
        await dbConnection.run(col.ddl);
        console.log(`[db] Added column "${col.name}" to places table.`);
      } catch (e: any) {
        console.warn(`[db] Could not add column ${col.name}: ${e.message}`);
      }
    }
  }

  // Idempotent migration for lists table (device_id)
  try {
    const listCols = await dbConnection.all("PRAGMA table_info(lists)");
    const listColNames = new Set(listCols.map((c: any) => c.name));
    if (!listColNames.has('device_id')) {
      await dbConnection.run("ALTER TABLE lists ADD COLUMN device_id TEXT");
      await dbConnection.run("CREATE INDEX IF NOT EXISTS idx_lists_device_id ON lists(device_id)");
      console.log("[db] Added column 'device_id' to lists table.");
    }
  } catch (e: any) {
    console.warn(`[db] Could not migrate lists table: ${e.message}`);
  }

  // Performance indexes for the queries used by the app and the AI
  await dbConnection.exec(`
    CREATE INDEX IF NOT EXISTS idx_places_country_type ON places(country, type);
    CREATE INDEX IF NOT EXISTS idx_places_type ON places(type);
    CREATE INDEX IF NOT EXISTS idx_places_state ON places(state);
    CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
    CREATE INDEX IF NOT EXISTS idx_places_coords ON places(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_places_rating ON places(rating DESC);
    CREATE INDEX IF NOT EXISTS idx_trails_state ON trails(state);
    CREATE INDEX IF NOT EXISTS idx_trails_country ON trails(country);
    CREATE INDEX IF NOT EXISTS idx_trails_coords ON trails(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_trails_type ON trails(type);
    CREATE INDEX IF NOT EXISTS idx_events_state ON events(state);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
  `);

  // Full-text search (FTS5) table kept in sync via triggers. Used by the keyword
  // fallback search and useful for future query expansion. Self-contained (not
  // external content): the 'delete' special command of external-content FTS5
  // tables proved unreliable with this dataset (SQLITE_CORRUPT on delete).
  await dbConnection.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS places_fts USING fts5(
      name,
      description,
      address,
      city,
      amenities,
      state,
      tokenize='unicode61 remove_diacritics 2'
    );

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
  `);

  // Auto-seed events from events_seed.json if events table is empty
  try {
    const eventCount = await dbConnection.get("SELECT COUNT(*) as count FROM events");
    if (!eventCount || eventCount.count === 0) {
      const candidates = [
        path.resolve(__dirname, '../data/events_seed.json'),
        path.resolve(__dirname, '../../src/data/events_seed.json'),
        path.resolve(__dirname, './data/events_seed.json')
      ];
      let seedPath: string | null = null;
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          seedPath = p;
          break;
        }
      }
      if (seedPath) {
        const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
        if (Array.isArray(seedData) && seedData.length > 0) {
          console.log(`[db] Auto-seeding ${seedData.length} events from ${path.basename(seedPath)}...`);
          for (const e of seedData) {
            await dbConnection.run(
              `INSERT OR REPLACE INTO events (
                id, name, description, full_description, category, locality, postal_code,
                street_address, state, country, latitude, longitude, start_date, end_date,
                types, image_url, image_copyright, url, source, last_updated
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
              [
                e.id,
                e.name,
                e.description,
                e.full_description || e.fullDescription || e.description,
                e.category || 'all',
                e.locality,
                e.postal_code || e.postalCode,
                e.street_address || e.streetAddress,
                e.state,
                e.country || 'DE',
                e.latitude,
                e.longitude,
                e.start_date || e.startDate,
                e.end_date || e.endDate || null,
                typeof e.types === 'string' ? e.types : JSON.stringify(e.types || []),
                e.image_url,
                e.image_copyright,
                e.url,
                e.source || 'dzt_opendata'
              ]
            );
          }
          console.log(`[db] Successfully auto-seeded ${seedData.length} events!`);
        }
      }
    }
  } catch (err: any) {
    console.warn('[db] Note on event auto-seeding:', err.message);
  }

  return dbConnection;
}
