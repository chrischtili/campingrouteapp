import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter"
];

// 16 German Bundesländer with their bounding boxes [minLat, minLon, maxLat, maxLon]
const GERMAN_STATES = [
  { name: "Baden-Württemberg", bbox: [47.53, 7.51, 49.79, 10.50] },
  { name: "Bayern", bbox: [47.27, 8.97, 50.57, 13.84] },
  { name: "Rheinland-Pfalz", bbox: [48.96, 6.11, 50.94, 8.51] },
  { name: "Hessen", bbox: [49.39, 7.77, 51.65, 10.24] },
  { name: "Nordrhein-Westfalen", bbox: [50.32, 5.86, 52.53, 9.46] },
  { name: "Niedersachsen", bbox: [51.29, 6.65, 53.89, 11.60] },
  { name: "Schleswig-Holstein", bbox: [53.38, 7.86, 55.06, 11.32] },
  { name: "Brandenburg", bbox: [51.35, 11.26, 53.56, 14.77] },
  { name: "Mecklenburg-Vorpommern", bbox: [53.11, 10.59, 54.69, 14.42] },
  { name: "Sachsen", bbox: [50.17, 11.87, 51.68, 15.04] },
  { name: "Sachsen-Anhalt", bbox: [50.93, 10.56, 53.07, 13.18] },
  { name: "Thüringen", bbox: [50.20, 9.87, 51.65, 12.65] },
  { name: "Saarland", bbox: [49.11, 6.35, 49.64, 7.41] },
  { name: "Berlin", bbox: [52.34, 13.08, 52.68, 13.76] },
  { name: "Hamburg", bbox: [53.39, 9.70, 53.74, 10.33] },
  { name: "Bremen", bbox: [53.00, 8.48, 53.58, 8.92] }
];

function determineState(lat, lon) {
  for (const st of GERMAN_STATES) {
    const [minLat, minLon, maxLat, maxLon] = st.bbox;
    if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
      return st.name;
    }
  }
  return "Deutschland";
}

async function queryOverpass(query, endpointIdx = 0) {
  const endpoint = OVERPASS_ENDPOINTS[endpointIdx % OVERPASS_ENDPOINTS.length];
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const postData = `data=${encodeURIComponent(query)}`;
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
        "User-Agent": "CampingRouteApp/1.0"
      },
      timeout: 25000
    };

    const req = (url.protocol === "https:" ? https : http).request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Overpass HTTP ${res.statusCode}`));
        }
        try {
          const parsed = JSON.parse(body);
          resolve(parsed.elements || []);
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Overpass timeout on ${endpoint}`));
    });

    req.write(postData);
    req.end();
  });
}

function parseOsmCulinaryElement(el, fallbackState) {
  const tags = el.tags || {};
  const lat = el.lat || (el.center && el.center.lat);
  const lon = el.lon || (el.center && el.center.lon);
  if (!lat || !lon) return null;

  let name = tags.name || tags.operator || tags["brand:wikidata_label"] || tags["addr:housename"];
  if (!name && tags.shop === "farm") name = `Hofladen ${tags["addr:city"] || tags["addr:street"] || ""}`.trim();
  if (!name && tags.craft === "winery") name = `Weingut ${tags["addr:city"] || tags["addr:street"] || ""}`.trim();
  if (!name && tags.amenity === "vending_machine") name = `24h Regiomat ${tags["addr:city"] || tags["addr:street"] || ""}`.trim();
  if (!name) return null;

  let type = "farm_shop";
  let subtypeLabel = "Hofladen & Direktvermarkter";

  if (tags.craft === "winery" || tags.winery === "yes" || tags.shop === "wine") {
    type = "winery";
    subtypeLabel = "Weingut & Winzerstube";
  } else if (tags.shop === "cheese" || tags.produce === "cheese") {
    type = "cheese_dairy";
    subtypeLabel = "Hofkäserei & Schaukäserei";
  } else if (tags.amenity === "vending_machine" || tags.shop === "vending_machine") {
    type = "regiomat";
    subtypeLabel = "24h Regiomat & Automat";
  } else if (tags.organic === "yes" || tags.organic === "only") {
    subtypeLabel = "Bio-Hofladen & Bioland/Demeter";
  }

  const products = [];
  if (tags["vending:food"] || tags.produce) {
    const rawProd = (tags["vending:food"] || "") + ";" + (tags.produce || "");
    for (const p of rawProd.split(/[;,]/)) {
      const trimmed = p.trim();
      if (trimmed && !products.includes(trimmed)) products.push(trimmed);
    }
  }

  if (products.length === 0) {
    if (type === "winery") products.push("Regionaler Wein", "Weinprobe", "Traubensaft");
    else if (type === "cheese_dairy") products.push("Hofkäse", "Heumilch", "Butter");
    else if (type === "regiomat") products.push("24/7 Eier", "Frische Milch", "Grillfleisch", "Snacks");
    else products.push("Frische Hofprodukte", "Eier", "Saisonales Obst & Gemüse");
  }

  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const city = tags["addr:city"] || tags["addr:suburb"] || tags["addr:village"] || tags["addr:town"];
  const postcode = tags["addr:postcode"];
  const addressParts = [street, [postcode, city].filter(Boolean).join(" ")].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(", ") : undefined;

  const state = determineState(lat, lon) || fallbackState;
  const hasCampsite = !!(tags["camping"] === "yes" || tags["caravan"] === "yes" || tags["tourism"] === "camp_pitch");

  let website = tags.website || tags["contact:website"] || tags["url"];
  if (website && !website.startsWith("http")) website = `https://${website}`;

  const phone = tags.phone || tags["contact:phone"];
  const openingHours = tags.opening_hours;

  let description = tags.description || tags.note;
  if (!description) {
    if (type === "winery") description = `Regionales Weingut in ${city || state}. Weinverkauf und Verkostung direkt vor Ort.`;
    else if (type === "cheese_dairy") description = `Handwerkliche Käserei und Hofladen mit regionalen Milch- und Käsespezialitäten.`;
    else if (type === "regiomat") description = `24 Stunden täglich geöffneter Verkaufsautomat für frische regionale Erzeugnisse.`;
    else description = `Traditioneller Erzeugerbetrieb und Hofladen mit frischen Lebensmitteln direkt vom Bauernhof.`;
  }

  return {
    id: `culinary-osm-${el.type}-${el.id}`,
    name,
    type,
    subtypeLabel,
    region: city ? `${city} (${state})` : state,
    state,
    country: "DE",
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
    address: address || `${city || state}, Deutschland`,
    description,
    products,
    hasCampsite,
    pitchNote: hasCampsite ? "Wohnmobilstellplatz direkt am Hof / Weingut vorhanden." : undefined,
    website,
    phone,
    openingHours,
    image_url: type === "winery"
      ? "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80"
      : type === "cheese_dairy"
      ? "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80"
      : "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
  };
}

async function run() {
  console.log("=== SYNCING CULINARY DIRECT-MARKETERS BY REGION ===");
  const parsedSpots = [];
  const seenIds = new Set();

  // Load existing spots if present
  const serverJsonPath = path.resolve(__dirname, "../server/culinary.json");
  if (fs.existsSync(serverJsonPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(serverJsonPath, "utf8"));
      for (const s of existing) {
        if (s.id && !seenIds.has(s.id)) {
          seenIds.add(s.id);
          parsedSpots.push(s);
        }
      }
      console.log(`Loaded ${parsedSpots.length} existing spots.`);
    } catch (e) {
      console.warn("Could not load existing spots:", e.message);
    }
  }

  for (let i = 0; i < GERMAN_STATES.length; i++) {
    const st = GERMAN_STATES[i];
    const existingCountForState = parsedSpots.filter(s => s.state === st.name).length;
    if (existingCountForState >= 150) {
      console.log(`[${i + 1}/${GERMAN_STATES.length}] Skipping ${st.name} (already has ${existingCountForState} spots)`);
      continue;
    }

    const [minLat, minLon, maxLat, maxLon] = st.bbox;
    console.log(`[${i + 1}/${GERMAN_STATES.length}] Fetching ${st.name} (currently has ${existingCountForState})...`);

    const query = `
      [out:json][timeout:35];
      (
        node["shop"="farm"](${minLat},${minLon},${maxLat},${maxLon});
        node["craft"="winery"](${minLat},${minLon},${maxLat},${maxLon});
        node["shop"="cheese"](${minLat},${minLon},${maxLat},${maxLon});
        node["amenity"="vending_machine"](${minLat},${minLon},${maxLat},${maxLon});
      );
      out center 500;
    `;

    let success = false;
    for (let attempt = 0; attempt < OVERPASS_ENDPOINTS.length && !success; attempt++) {
      try {
        const elements = await queryOverpass(query, attempt);
        console.log(` -> Found ${elements.length} places in ${st.name} via endpoint ${attempt}`);
        let added = 0;
        for (const el of elements) {
          const spot = parseOsmCulinaryElement(el, st.name);
          if (spot && !seenIds.has(spot.id)) {
            seenIds.add(spot.id);
            parsedSpots.push(spot);
            added++;
          }
        }
        console.log(` -> Added ${added} new unique spots for ${st.name}`);
        success = true;
      } catch (err) {
        console.warn(` -> Attempt ${attempt + 1} failed for ${st.name}: ${err.message}`);
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\n=== TOTAL UNIQUE SPOTS: ${parsedSpots.length} ===`);

  if (parsedSpots.length > 50) {
    fs.writeFileSync(serverJsonPath, JSON.stringify(parsedSpots, null, 2), "utf8");

    const backendTsPath = path.resolve(__dirname, "../entdecken-backend/src/data/culinary.ts");
    const backendContent = `export interface CulinarySpot {
  id: string;
  name: string;
  type: 'winery' | 'farm_shop' | 'cheese_dairy' | 'regiomat';
  subtypeLabel: string;
  region: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  products: string[];
  hasCampsite: boolean;
  pitchNote?: string;
  website?: string;
  phone?: string;
  image_url?: string;
  openingHours?: string;
}

export const CULINARY_SPOTS: CulinarySpot[] = ${JSON.stringify(parsedSpots, null, 2)};
`;
    fs.writeFileSync(backendTsPath, backendContent, "utf8");

    const frontendTsPath = path.resolve(__dirname, "../src/data/culinarySpots.ts");
    fs.writeFileSync(frontendTsPath, backendContent, "utf8");

    console.log(`✅ Successfully saved ${parsedSpots.length} spots to server, backend, and frontend!`);
  }
}

run().catch(console.error);
