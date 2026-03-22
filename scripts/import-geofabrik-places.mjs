import fs from "fs";
import os from "os";
import path from "path";
import readline from "readline";
import { execFileSync } from "child_process";

import { dedupeEntries, loadInputEntries, writePlaceIndex } from "./build-place-index.mjs";
import { buildPlaceDatabaseFromPayload } from "./build-place-database.mjs";

const DEFAULT_FILTERS = ["nwr/tourism=camp_site", "nwr/tourism=caravan_site"];

function printUsage() {
  console.error(
    "Usage: node scripts/import-geofabrik-places.mjs <input.osm.pbf ...> [--index-out=place-index.json] [--db-out=places.sqlite] [--keep-temp]"
  );
}

function ensureCommandAvailable(command) {
  try {
    execFileSync(command, ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    throw new Error(
      `${command} binary not available. Please install it first (${error instanceof Error ? error.message : "unknown_error"}).`
    );
  }
}

function parseArgs(argv) {
  const inputFiles = [];
  let indexOut = "";
  let dbOut = "";
  let keepTemp = false;

  for (const arg of argv) {
    if (arg.startsWith("--index-out=")) {
      indexOut = arg.slice("--index-out=".length).trim();
      continue;
    }

    if (arg.startsWith("--db-out=")) {
      dbOut = arg.slice("--db-out=".length).trim();
      continue;
    }

    if (arg === "--keep-temp") {
      keepTemp = true;
      continue;
    }

    inputFiles.push(arg);
  }

  return { inputFiles, indexOut, dbOut, keepTemp };
}

function runOsmium(args) {
  execFileSync("osmium", args, {
    encoding: "utf8",
    stdio: ["ignore", "inherit", "inherit"],
    maxBuffer: 32 * 1024 * 1024,
  });
}

async function parseGeoJsonSequence(filePath) {
  const stream = fs.createReadStream(filePath, "utf8");
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });
  const features = [];

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const normalized = trimmed.charCodeAt(0) === 0x1e ? trimmed.slice(1) : trimmed;
    features.push(JSON.parse(normalized));
  }

  return features;
}

async function collectEntriesFromPbf(inputPath, keepTemp = false) {
  const resolvedInputPath = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(resolvedInputPath)) {
    throw new Error(`Input file not found: ${resolvedInputPath}`);
  }

  const tmpBase = path.join(
    os.tmpdir(),
    `campingroute-import-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
  const filteredPath = `${tmpBase}.filtered.osm.pbf`;
  const geojsonSeqPath = `${tmpBase}.geojsonseq`;

  try {
    runOsmium([
      "tags-filter",
      resolvedInputPath,
      ...DEFAULT_FILTERS,
      "-o",
      filteredPath,
      "-O",
    ]);

    runOsmium([
      "export",
      filteredPath,
      "-f",
      "geojsonseq",
      "--geometry-types=point,polygon",
      "--add-unique-id=type_id",
      "--format-option=print_record_separator=false",
      "-o",
      geojsonSeqPath,
      "-O",
    ]);

    const features = await parseGeoJsonSequence(geojsonSeqPath);
    const entries = dedupeEntries(loadInputEntries({ type: "FeatureCollection", features }));
    console.log(`[import:places] ${path.basename(resolvedInputPath)} -> ${entries.length} normalized entries`);
    return entries;
  } finally {
    if (!keepTemp) {
      if (fs.existsSync(filteredPath)) fs.unlinkSync(filteredPath);
      if (fs.existsSync(geojsonSeqPath)) fs.unlinkSync(geojsonSeqPath);
    }
  }
}

async function main() {
  const { inputFiles, indexOut, dbOut, keepTemp } = parseArgs(process.argv.slice(2));

  if (inputFiles.length === 0 || (!indexOut && !dbOut)) {
    printUsage();
    process.exit(1);
  }

  ensureCommandAvailable("osmium");

  const allEntries = [];
  for (const inputFile of inputFiles) {
    const entries = await collectEntriesFromPbf(inputFile, keepTemp);
    allEntries.push(...entries);
  }

  const dedupedEntries = dedupeEntries(allEntries);
  const sourceLabel = inputFiles.map((filePath) => path.basename(filePath)).join(", ");

  if (indexOut) {
    const resolvedIndexPath = path.resolve(process.cwd(), indexOut);
    fs.mkdirSync(path.dirname(resolvedIndexPath), { recursive: true });
    writePlaceIndex(resolvedIndexPath, dedupedEntries, `geofabrik:${sourceLabel}`);
    console.log(`Place index written: ${resolvedIndexPath}`);
  }

  if (dbOut) {
    const resolvedDbPath = path.resolve(process.cwd(), dbOut);
    buildPlaceDatabaseFromPayload(dedupedEntries, resolvedDbPath, `geofabrik:${sourceLabel}`);
    console.log(`Place database written: ${resolvedDbPath}`);
  }

  console.log(`Entries: ${dedupedEntries.length}`);
}

main().catch((error) => {
  console.error(`[import:places] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
