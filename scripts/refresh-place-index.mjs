import fs from "fs";
import path from "path";
import { dedupeEntries, loadInputEntries, writePlaceIndex } from "./build-place-index.mjs";

const DEFAULT_OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.PLACE_INDEX_FETCH_TIMEOUT_MS || "45000", 10);
const MAX_SUBDIVISION_DEPTH = Number.parseInt(process.env.PLACE_INDEX_SUBDIVISION_DEPTH || "2", 10);

function printUsage() {
  console.error(
    "Usage: node scripts/refresh-place-index.mjs [--bbox=south,west,north,east] [--bbox-file=regions.json ...] [output.json]"
  );
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normalizeBbox(value, label = "bbox") {
  const parts = Array.isArray(value) ? value : String(value || "").split(",");
  if (parts.length !== 4) {
    throw new Error(`Invalid ${label}: expected south,west,north,east`);
  }

  const numbers = parts.map((part) => toNumber(part));
  if (numbers.some((part) => Number.isNaN(part))) {
    throw new Error(`Invalid ${label}: expected numeric south,west,north,east values`);
  }

  const [south, west, north, east] = numbers;
  if (south >= north || west >= east) {
    throw new Error(`Invalid ${label}: expected south < north and west < east`);
  }

  return [south, west, north, east];
}

function parseArgs(argv) {
  const bboxes = [];
  const bboxFiles = [];
  let outputArg = "place-index.json";

  for (const arg of argv) {
    if (arg.startsWith("--bbox=")) {
      bboxes.push({
        name: `bbox-${bboxes.length + 1}`,
        bbox: normalizeBbox(arg.slice("--bbox=".length), `--bbox #${bboxes.length + 1}`),
      });
      continue;
    }

    if (arg.startsWith("--bbox-file=")) {
      const value = arg.slice("--bbox-file=".length).trim();
      if (value) {
        bboxFiles.push(value);
      }
      continue;
    }

    outputArg = arg;
  }

  return { bboxes, bboxFiles, outputArg };
}

function loadBboxesFromFile(filePath) {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  const payload = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  const input = Array.isArray(payload) ? payload : Array.isArray(payload?.regions) ? payload.regions : [];

  return input.map((region, index) => {
    if (Array.isArray(region)) {
      return {
        name: `file-bbox-${index + 1}`,
        bbox: normalizeBbox(region, `bbox-file entry #${index + 1}`),
      };
    }

    return {
      name: String(region?.name || `file-bbox-${index + 1}`),
      bbox: normalizeBbox(region?.bbox, `bbox-file entry "${region?.name || index + 1}"`),
    };
  });
}

function buildOverpassQuery([south, west, north, east]) {
  return `
[out:json][timeout:60];
(
  nwr["tourism"="camp_site"](${south},${west},${north},${east});
  nwr["tourism"="caravan_site"](${south},${west},${north},${east});
);
out center tags;
`.trim();
}

function splitBbox([south, west, north, east]) {
  const midLat = (south + north) / 2;
  const midLon = (west + east) / 2;

  return [
    [south, west, midLat, midLon],
    [south, midLon, midLat, east],
    [midLat, west, north, midLon],
    [midLat, midLon, north, east],
  ];
}

async function fetchOverpassJson(endpoint, query, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body: query,
      signal: controller.signal,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`http_${response.status}`);
    }

    return JSON.parse(text);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`upstream_timeout_${timeoutMs}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRegionElements(region, endpoints, timeoutMs) {
  return fetchRegionElementsRecursive(region, endpoints, timeoutMs, 0);
}

async function fetchRegionElementsRecursive(region, endpoints, timeoutMs, depth) {
  const query = buildOverpassQuery(region.bbox);
  const failures = [];

  for (const endpoint of endpoints) {
    try {
      const payload = await fetchOverpassJson(endpoint, query, timeoutMs);
      const elements = Array.isArray(payload?.elements) ? payload.elements : [];
      console.log(`[place-index] ${region.name}: ${elements.length} raw elements via ${endpoint}`);
      return elements;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || "unknown_error");
      failures.push({ endpoint, message });
      console.warn(`[place-index] ${region.name} failed via ${endpoint}: ${message}`);
    }
  }

  if (depth < MAX_SUBDIVISION_DEPTH) {
    console.warn(`[place-index] subdividing ${region.name} after upstream failure`);
    const childRegions = splitBbox(region.bbox).map((bbox, index) => ({
      name: `${region.name} / Teil ${index + 1}`,
      bbox,
    }));

    const childElements = [];
    for (const childRegion of childRegions) {
      try {
        const elements = await fetchRegionElementsRecursive(childRegion, endpoints, timeoutMs, depth + 1);
        childElements.push(...elements);
      } catch (childError) {
        console.warn(
          `[place-index] ${childRegion.name} failed after subdivision: ${
            childError instanceof Error ? childError.message : String(childError || "unknown_error")
          }`
        );
      }
    }

    if (childElements.length > 0) {
      return childElements;
    }
  }

  throw new Error(failures[0]?.message || `failed_to_fetch_${region.name}`);
}

async function main() {
  const { bboxes, bboxFiles, outputArg } = parseArgs(process.argv.slice(2));
  const fileRegions = bboxFiles.flatMap((filePath) => loadBboxesFromFile(filePath));
  const regions = [...bboxes, ...fileRegions];

  if (regions.length === 0) {
    printUsage();
    process.exit(1);
  }

  const endpoints = String(process.env.OVERPASS_ENDPOINTS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const effectiveEndpoints = endpoints.length > 0 ? endpoints : DEFAULT_OVERPASS_ENDPOINTS;
  const outputPath = path.resolve(process.cwd(), outputArg);
  const collectedElements = [];
  const failedRegions = [];

  for (const region of regions) {
    try {
      const elements = await fetchRegionElements(region, effectiveEndpoints, DEFAULT_TIMEOUT_MS);
      collectedElements.push(...elements);
    } catch (error) {
      failedRegions.push({
        name: region.name,
        message: error instanceof Error ? error.message : String(error || "unknown_error"),
      });
    }
  }

  if (collectedElements.length === 0) {
    throw new Error(
      failedRegions.length > 0
        ? `No place data fetched. Failed regions: ${failedRegions.map((entry) => `${entry.name} (${entry.message})`).join(", ")}`
        : "No place data fetched."
    );
  }

  const entries = dedupeEntries(loadInputEntries({ elements: collectedElements }));
  writePlaceIndex(outputPath, entries, `overpass:${regions.map((region) => region.name).join(", ")}`);

  console.log(`Place index written: ${outputPath}`);
  console.log(`Regions fetched: ${regions.length - failedRegions.length}/${regions.length}`);
  console.log(`Entries: ${entries.length}`);

  if (failedRegions.length > 0) {
    console.warn(
      `[place-index] partial refresh: failed regions = ${failedRegions
        .map((entry) => `${entry.name} (${entry.message})`)
        .join(", ")}`
    );
  }
}

main().catch((error) => {
  console.error(`[place-index] refresh failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
