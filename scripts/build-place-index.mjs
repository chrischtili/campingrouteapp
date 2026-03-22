import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function toNumber(value, fallback = NaN) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringValue(value) {
  return String(value || "").trim();
}

function deriveLocality(tags = {}) {
  return (
    tags["addr:city"] ||
    tags["addr:town"] ||
    tags["addr:village"] ||
    tags["addr:hamlet"] ||
    tags["addr:municipality"] ||
    tags["addr:suburb"] ||
    tags["addr:quarter"] ||
    tags["addr:neighbourhood"] ||
    tags.city ||
    tags.town ||
    tags.village ||
    tags.locality ||
    ""
  );
}

function deriveCountry(tags = {}) {
  return tags["addr:country"] || tags.country || String(tags["addr:country_code"] || "").toUpperCase() || "";
}

function deriveAddress(tags = {}) {
  if (typeof tags["addr:full"] === "string" && tags["addr:full"].trim()) {
    return tags["addr:full"].trim();
  }
  if (typeof tags.address === "string" && tags.address.trim()) {
    return tags.address.trim();
  }

  const parts = [
    tags["addr:street"],
    tags["addr:housenumber"],
    tags["addr:place"],
    tags["addr:postcode"],
    tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || tags.city || tags.town || tags.village,
    tags["addr:state"] || tags.state,
    tags["addr:country"] || tags.country,
  ].filter(Boolean);

  return parts.join(", ");
}

function geometryToPoint(feature) {
  const geometry = feature?.geometry || {};
  const bbox = Array.isArray(feature?.bbox) ? feature.bbox : null;

  if (geometry.type === "Point" && Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
    return {
      lon: toNumber(geometry.coordinates[0]),
      lat: toNumber(geometry.coordinates[1]),
    };
  }

  if (bbox && bbox.length === 4) {
    return {
      lon: (toNumber(bbox[0], 0) + toNumber(bbox[2], 0)) / 2,
      lat: (toNumber(bbox[1], 0) + toNumber(bbox[3], 0)) / 2,
    };
  }

  return {
    lon: toNumber(feature?.properties?.lon),
    lat: toNumber(feature?.properties?.lat),
  };
}

function normalizeFromOverpassElement(element) {
  const tags = element?.tags || {};
  const category = stringValue(tags.tourism);
  const lat = toNumber(element?.lat, toNumber(element?.center?.lat));
  const lon = toNumber(element?.lon, toNumber(element?.center?.lon));

  if (!["camp_site", "caravan_site"].includes(category) || Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }

  return {
    id: `${element.type || "element"}-${element.id || `${lat},${lon}`}`,
    name: stringValue(tags.name) || "Unbenannter Platz",
    category,
    lat,
    lon,
    locality: stringValue(deriveLocality(tags)),
    country: stringValue(deriveCountry(tags)),
    address: stringValue(deriveAddress(tags)),
    website: stringValue(tags.website || tags.contactWebsite || tags["contact:website"]),
    phone: stringValue(tags.phone || tags["contact:phone"]),
    openingHours: stringValue(tags.opening_hours),
    fee: stringValue(tags.fee),
    description: stringValue(tags.description || tags.note || tags["description:de"]),
    hasToilets: tags.toilets === "yes",
    hasShowers: tags.showers === "yes",
    hasPowerSupply: tags.power_supply === "yes",
    hasDumpStation: tags.sanitary_dump_station === "yes",
    imageUrl: "",
    imageAttribution: "",
    sourceUrl: `https://www.openstreetmap.org/${element.type || "node"}/${element.id || ""}`,
  };
}

function normalizeFromGeoJsonFeature(feature) {
  const properties = feature?.properties || {};
  const tags = properties.tags && typeof properties.tags === "object" ? properties.tags : properties;
  const category = stringValue(tags.tourism || properties.category);
  const point = geometryToPoint(feature);

  if (!["camp_site", "caravan_site"].includes(category) || Number.isNaN(point.lat) || Number.isNaN(point.lon)) {
    return null;
  }

  return {
    id: stringValue(properties.id || properties["@id"] || `${category}-${point.lat},${point.lon}`),
    name: stringValue(tags.name || properties.name) || "Unbenannter Platz",
    category,
    lat: point.lat,
    lon: point.lon,
    locality: stringValue(deriveLocality(tags)),
    country: stringValue(deriveCountry(tags)),
    address: stringValue(deriveAddress(tags)),
    website: stringValue(tags.website || tags["contact:website"] || properties.website),
    phone: stringValue(tags.phone || tags["contact:phone"] || properties.phone),
    openingHours: stringValue(tags.opening_hours || properties.opening_hours),
    fee: stringValue(tags.fee || properties.fee),
    description: stringValue(tags.description || properties.description),
    hasToilets: tags.toilets === "yes" || properties.hasToilets === true,
    hasShowers: tags.showers === "yes" || properties.hasShowers === true,
    hasPowerSupply: tags.power_supply === "yes" || properties.hasPowerSupply === true,
    hasDumpStation: tags.sanitary_dump_station === "yes" || properties.hasDumpStation === true,
    imageUrl: stringValue(properties.imageUrl),
    imageAttribution: stringValue(properties.imageAttribution),
    sourceUrl: stringValue(properties.sourceUrl),
  };
}

function normalizeExistingEntry(entry) {
  const category = stringValue(entry?.category);
  const lat = toNumber(entry?.lat);
  const lon = toNumber(entry?.lon);

  if (!["camp_site", "caravan_site"].includes(category) || Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }

  return {
    id: stringValue(entry.id || `${category}-${lat},${lon}`),
    name: stringValue(entry.name) || "Unbenannter Platz",
    category,
    lat,
    lon,
    locality: stringValue(entry.locality),
    country: stringValue(entry.country),
    address: stringValue(entry.address),
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

export function loadInputEntries(payload) {
  if (Array.isArray(payload)) {
    return payload.map(normalizeExistingEntry).filter(Boolean);
  }

  if (Array.isArray(payload?.elements)) {
    return payload.elements.map(normalizeFromOverpassElement).filter(Boolean);
  }

  if (payload?.type === "FeatureCollection" && Array.isArray(payload.features)) {
    return payload.features.map(normalizeFromGeoJsonFeature).filter(Boolean);
  }

  if (Array.isArray(payload?.entries)) {
    return payload.entries.map(normalizeExistingEntry).filter(Boolean);
  }

  throw new Error("Unsupported input format. Expected Overpass JSON, GeoJSON FeatureCollection, or an array of entries.");
}

export function dedupeEntries(entries) {
  const deduped = [];
  const seen = new Set();

  for (const entry of entries) {
    const key = `${entry.category}|${entry.name.toLowerCase()}|${entry.lat.toFixed(5)}|${entry.lon.toFixed(5)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }

  return deduped;
}

export function writePlaceIndex(outputPath, entries, sourceLabel) {
  const output = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: sourceLabel,
    entryCount: entries.length,
    entries,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
}

export function buildPlaceIndexFromFile(inputPath, outputPath) {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const entries = dedupeEntries(loadInputEntries(raw));
  writePlaceIndex(outputPath, entries, path.basename(inputPath));
  return entries;
}

const currentFilePath = fileURLToPath(import.meta.url);
const invokedScriptPath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (currentFilePath === invokedScriptPath) {
  const [, , inputArg, outputArg = "place-index.json"] = process.argv;

  if (!inputArg) {
    console.error("Usage: node scripts/build-place-index.mjs <input.json|input.geojson> [output.json]");
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const outputPath = path.resolve(process.cwd(), outputArg);
  const entries = buildPlaceIndexFromFile(inputPath, outputPath);

  console.log(`Place index written: ${outputPath}`);
  console.log(`Entries: ${entries.length}`);
}
