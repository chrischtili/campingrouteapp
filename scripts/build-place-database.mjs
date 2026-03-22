import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

import { dedupeEntries, loadInputEntries } from "./build-place-index.mjs";

function stringValue(value) {
  return String(value || "").trim();
}

function normalizeText(value) {
  return stringValue(value).toLowerCase();
}

function sqliteValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

function ensureSqliteAvailable() {
  try {
    execFileSync("sqlite3", ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    throw new Error(
      `sqlite3 binary not available. Install sqlite3 first (${error instanceof Error ? error.message : "unknown_error"}).`
    );
  }
}

function normalizeDatabaseEntry(entry) {
  return {
    id: stringValue(entry.id),
    name: stringValue(entry.name) || "Unbenannter Platz",
    nameNormalized: normalizeText(entry.name),
    category: stringValue(entry.category),
    lat: Number(entry.lat),
    lon: Number(entry.lon),
    locality: stringValue(entry.locality),
    localityNormalized: normalizeText(entry.locality),
    country: stringValue(entry.country),
    address: stringValue(entry.address),
    addressNormalized: normalizeText(entry.address),
    website: stringValue(entry.website),
    phone: stringValue(entry.phone),
    openingHours: stringValue(entry.openingHours || entry.opening_hours),
    fee: stringValue(entry.fee),
    description: stringValue(entry.description),
    hasToilets: entry.hasToilets === true,
    hasShowers: entry.hasShowers === true,
    hasPowerSupply: entry.hasPowerSupply === true,
    hasDumpStation: entry.hasDumpStation === true,
    imageUrl: stringValue(entry.imageUrl),
    imageAttribution: stringValue(entry.imageAttribution),
    sourceUrl: stringValue(entry.sourceUrl),
  };
}

function ensureUniqueIds(entries) {
  const seen = new Map();

  return entries.map((entry) => {
    const baseId = stringValue(entry.id) || `${entry.category}-${entry.lat},${entry.lon}`;
    const currentCount = seen.get(baseId) || 0;
    seen.set(baseId, currentCount + 1);

    if (currentCount === 0) {
      return {
        ...entry,
        id: baseId,
      };
    }

    return {
      ...entry,
      id: `${baseId}#${currentCount + 1}`,
    };
  });
}

function buildSchemaSql() {
  return `
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA temp_store = MEMORY;
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS metadata;
DROP TABLE IF EXISTS places;

CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE places (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL,
  category TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  locality TEXT NOT NULL DEFAULT '',
  locality_normalized TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  address_normalized TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  opening_hours TEXT NOT NULL DEFAULT '',
  fee TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  has_toilets INTEGER NOT NULL DEFAULT 0,
  has_showers INTEGER NOT NULL DEFAULT 0,
  has_power_supply INTEGER NOT NULL DEFAULT 0,
  has_dump_station INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  image_attribution TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_places_category ON places (category);
CREATE INDEX idx_places_lat_lon ON places (lat, lon);
CREATE INDEX idx_places_locality ON places (locality_normalized);
CREATE INDEX idx_places_name ON places (name_normalized);
CREATE INDEX idx_places_address ON places (address_normalized);
`.trim();
}

function buildMetadataSql({ entryCount, sourceLabel }) {
  const generatedAt = new Date().toISOString();

  return `
INSERT INTO metadata (key, value) VALUES
  ('version', '1'),
  ('generated_at', ${sqliteValue(generatedAt)}),
  ('source', ${sqliteValue(sourceLabel)}),
  ('entry_count', ${sqliteValue(String(entryCount))});
`.trim();
}

function buildInsertSql(entries) {
  if (entries.length === 0) {
    return "";
  }

  const values = entries
    .map((entry) => {
      const normalized = normalizeDatabaseEntry(entry);
      return `(
${sqliteValue(normalized.id)},
${sqliteValue(normalized.name)},
${sqliteValue(normalized.nameNormalized)},
${sqliteValue(normalized.category)},
${sqliteValue(normalized.lat)},
${sqliteValue(normalized.lon)},
${sqliteValue(normalized.locality)},
${sqliteValue(normalized.localityNormalized)},
${sqliteValue(normalized.country)},
${sqliteValue(normalized.address)},
${sqliteValue(normalized.addressNormalized)},
${sqliteValue(normalized.website)},
${sqliteValue(normalized.phone)},
${sqliteValue(normalized.openingHours)},
${sqliteValue(normalized.fee)},
${sqliteValue(normalized.description)},
${sqliteValue(normalized.hasToilets)},
${sqliteValue(normalized.hasShowers)},
${sqliteValue(normalized.hasPowerSupply)},
${sqliteValue(normalized.hasDumpStation)},
${sqliteValue(normalized.imageUrl)},
${sqliteValue(normalized.imageAttribution)},
${sqliteValue(normalized.sourceUrl)}
)`;
    })
    .join(",\n");

  return `
INSERT INTO places (
  id,
  name,
  name_normalized,
  category,
  lat,
  lon,
  locality,
  locality_normalized,
  country,
  address,
  address_normalized,
  website,
  phone,
  opening_hours,
  fee,
  description,
  has_toilets,
  has_showers,
  has_power_supply,
  has_dump_station,
  image_url,
  image_attribution,
  source_url
)
VALUES
${values};
`.trim();
}

function executeSqlite(dbPath, sql) {
  execFileSync("sqlite3", [dbPath], {
    input: `${sql}\n`,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: 16 * 1024 * 1024,
  });
}

export function buildPlaceDatabaseFromPayload(payload, outputPath, sourceLabel = "unknown_source") {
  ensureSqliteAvailable();

  const entries = ensureUniqueIds(dedupeEntries(loadInputEntries(payload)));
  const resolvedOutputPath = path.resolve(process.cwd(), outputPath);
  const tempOutputPath = `${resolvedOutputPath}.tmp`;
  const tempSqlPath = path.join(os.tmpdir(), `place-db-${Date.now()}-${Math.random().toString(16).slice(2)}.sql`);

  fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });

  try {
    if (fs.existsSync(tempOutputPath)) {
      fs.unlinkSync(tempOutputPath);
    }
    const sqlParts = [buildSchemaSql(), "BEGIN;"];

    const batchSize = 400;
    for (let index = 0; index < entries.length; index += batchSize) {
      const batch = entries.slice(index, index + batchSize);
      const batchSql = buildInsertSql(batch);
      if (batchSql) {
        sqlParts.push(batchSql);
      }
    }

    sqlParts.push(buildMetadataSql({ entryCount: entries.length, sourceLabel }));
    sqlParts.push("COMMIT;");
    sqlParts.push("ANALYZE;");
    fs.writeFileSync(tempSqlPath, `${sqlParts.join("\n\n")}\n`);

    executeSqlite(tempOutputPath, fs.readFileSync(tempSqlPath, "utf8"));

    fs.renameSync(tempOutputPath, resolvedOutputPath);
    return entries;
  } catch (error) {
    if (fs.existsSync(tempOutputPath)) {
      fs.unlinkSync(tempOutputPath);
    }
    throw error;
  } finally {
    if (fs.existsSync(tempSqlPath)) {
      fs.unlinkSync(tempSqlPath);
    }
  }
}

export function buildPlaceDatabaseFromFile(inputPath, outputPath) {
  const resolvedInputPath = path.resolve(process.cwd(), inputPath);
  const payload = JSON.parse(fs.readFileSync(resolvedInputPath, "utf8"));
  return buildPlaceDatabaseFromPayload(payload, outputPath, path.basename(resolvedInputPath));
}

const currentFilePath = fileURLToPath(import.meta.url);
const invokedScriptPath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (currentFilePath === invokedScriptPath) {
  const [, , inputArg, outputArg = "places.sqlite"] = process.argv;

  if (!inputArg) {
    console.error("Usage: node scripts/build-place-database.mjs <input.json|input.geojson> [output.sqlite]");
    process.exit(1);
  }

  const entries = buildPlaceDatabaseFromFile(inputArg, outputArg);
  const outputPath = path.resolve(process.cwd(), outputArg);

  console.log(`Place database written: ${outputPath}`);
  console.log(`Entries: ${entries.length}`);
  console.log(`Temp dir used: ${os.tmpdir()}`);
}
