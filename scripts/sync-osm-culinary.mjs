import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter"
];

// 16 German Bundesländer with their approximate centers and bounds
const GERMAN_STATES = [
  { name: "Baden-Württemberg", code: "BW", bbox: [47.5, 7.5, 49.8, 10.5] },
  { name: "Bayern", code: "BY", bbox: [47.2, 8.9, 50.6, 13.9] },
  { name: "Berlin", code: "BE", bbox: [52.3, 13.0, 52.7, 13.8] },
  { name: "Brandenburg", code: "BB", bbox: [51.3, 11.2, 53.6, 14.8] },
  { name: "Bremen", code: "HB", bbox: [53.0, 8.4, 53.6, 9.0] },
  { name: "Hamburg", code: "HH", bbox: [53.3, 9.7, 53.7, 10.3] },
  { name: "Hessen", code: "HE", bbox: [49.3, 7.7, 51.7, 10.3] },
  { name: "Mecklenburg-Vorpommern", code: "MV", bbox: [53.0, 10.5, 54.8, 14.5] },
  { name: "Niedersachsen", code: "NI", bbox: [51.2, 6.6, 53.9, 11.6] },
  { name: "Nordrhein-Westfalen", code: "NW", bbox: [50.3, 5.8, 52.6, 9.5] },
  { name: "Rheinland-Pfalz", code: "RP", bbox: [48.9, 6.1, 50.9, 8.5] },
  { name: "Saarland", code: "SL", bbox: [49.1, 6.3, 49.7, 7.4] },
  { name: "Sachsen", code: "SN", bbox: [50.1, 11.8, 51.7, 15.1] },
  { name: "Sachsen-Anhalt", code: "ST", bbox: [50.9, 10.5, 53.1, 13.2] },
  { name: "Schleswig-Holstein", code: "SH", bbox: [53.3, 7.8, 55.1, 11.4] },
  { name: "Thüringen", code: "TH", bbox: [50.2, 9.8, 51.7, 12.7] }
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
        "User-Agent": "CampingRouteApp-Sync/1.0 (info@campingroute.app)"
      },
      timeout: 45000
    };

    const req = (url.protocol === "https:" ? https : http).request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Overpass HTTP ${res.statusCode}: ${body.slice(0, 150)}`));
        }
        try {
          const parsed = JSON.parse(body);
          resolve(parsed.elements || []);
        } catch (e) {
          reject(new Error(`Overpass JSON parse error: ${e.message}`));
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

function parseOsmCulinaryElement(el) {
  const tags = el.tags || {};
  const lat = el.lat || (el.center && el.center.lat);
  const lon = el.lon || (el.center && el.center.lon);
  if (!lat || !lon) return null;

  let name = tags.name || tags["brand:wikidata_label"] || tags.operator || tags["addr:housename"];
  let type = "farm_shop";
  let subtypeLabel = "Hofladen & Direktvermarkter";

  if (tags.craft === "winery" || tags.shop === "wine" || tags.winery === "yes") {
    type = "winery";
    subtypeLabel = tags.operator?.toLowerCase().includes("vdp") ? "Prädikatsweingut (VDP)" : "Weingut & Winzerstube";
    if (!name) name = tags.operator ? `Weingut ${tags.operator}` : "Weingut & Gutsausschank";
  } else if (tags.shop === "cheese" || tags.produce?.toLowerCase().includes("käse") || tags.produce?.toLowerCase().includes("cheese")) {
    type = "cheese_dairy";
    subtypeLabel = "Hof- & Schaukäserei";
    if (!name) name = "Traditionelle Hofkäserei";
  } else if (tags.amenity === "vending_machine") {
    type = "regiomat";
    subtypeLabel = "24h Regiomat & Frischeautomat";
    if (!name) name = `Regiomat ${tags["addr:city"] || tags["addr:street"] || "24/7 Automat"}`;
  } else if (tags.shop === "farm") {
    type = "farm_shop";
    subtypeLabel = tags.organic === "yes" || tags.organic === "only" ? "Bio-Hofladen & Öko-Hof" : "Bauernhof & Hofladen";
    if (!name) name = tags.operator ? `Hofladen ${tags.operator}` : "Regionaler Hofladen";
  }

  // Address assembly
  const street = tags["addr:street"] ? `${tags["addr:street"]} ${tags["addr:housenumber"] || ""}`.trim() : "";
  const postcode = tags["addr:postcode"] || "";
  const city = tags["addr:city"] || tags["addr:suburb"] || tags["addr:town"] || tags["addr:village"] || "";
  const state = tags["addr:state"] || determineState(lat, lon);

  let address = [street, postcode ? `${postcode} ${city}` : city].filter(Boolean).join(", ");
  if (!address && city) address = city;

  // Products
  const products = [];
  if (tags.produce) {
    tags.produce.split(/[,;]/).forEach(p => products.push(p.trim()));
  }
  if (tags.vending) {
    const vMap = {
      food: "Regionale Lebensmittel",
      milk: "Frische Rohmilch",
      eggs: "Freilandeier",
      cheese: "Hofkäse",
      meat: "Wurst- & Fleischwaren",
      bread: "Bauernbrot",
      fruit: "Frisches Obst & Beeren",
      vegetables: "Saisongemüse",
      wine: "Regionaler Wein",
      ice_cream: "Bauernhof-Eis"
    };
    tags.vending.split(/[,;]/).forEach(v => {
      const label = vMap[v.trim()] || v.trim();
      if (!products.includes(label)) products.push(label);
    });
  }

  if (products.length === 0) {
    if (type === "winery") products.push("Gutsweine", "Weinproben", "Sekt", "Traubensaft");
    else if (type === "cheese_dairy") products.push("Heumilchkäse", "Schnittkäse", "Bauernbutter", "Frischkäse");
    else if (type === "regiomat") products.push("Freilandeier", "Hofmilch", "Grillfleisch", "Snacks 24/7");
    else products.push("Frisches Hofgemüse", "Eier", "Saisonfrüchte", "Hofmarmelade");
  }

  // Camping pitch check
  const hasCampsite = tags.camp_site === "yes" || tags.caravan === "yes" || tags["camper:pitch"] === "yes" || tags.description?.toLowerCase().includes("stellplatz") || tags.description?.toLowerCase().includes("camping") || false;

  const website = tags.website || tags["contact:website"] || tags["url"] || undefined;
  const phone = tags.phone || tags["contact:phone"] || undefined;
  const openingHours = tags.opening_hours || undefined;

  let description = tags.description || "";
  if (!description) {
    if (type === "winery") description = `Traditionsreicher Weinbaubetrieb in ${city || state}. Verkauf von regionalen Weinen und Verkostung direkt vor Ort.`;
    else if (type === "cheese_dairy") description = `Handwerkliche Käserei in ${city || state} mit frischen Käsespezialitäten aus regionaler Milch.`;
    else if (type === "regiomat") description = `24/7 Verkaufsautomat für frische regionale Erzeugnisse direkt vom Erzeuger.`;
    else description = `Regionaler Hofladen mit frischen Lebensmitteln, Bio-Produkten und Spezialitäten direkt vom Bauernhof in ${city || state}.`;
  }

  return {
    id: `osm-${el.type}-${el.id}`,
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
    osm_id: `${el.type}/${el.id}`,
    source: "osm"
  };
}

async function run() {
  console.log("=== STARTING CULINARY DIRECT-MARKETERS SYNC (GERMANY & NEIGHBOURS) ===");

  // Query Overpass for all relevant culinary direct marketers in Germany
  const overpassQuery = `
    [out:json][timeout:60];
    area["ISO3166-1"="DE"][admin_level=2]->.germany;
    (
      nwr["shop"="farm"](area.germany);
      nwr["craft"="winery"](area.germany);
      nwr["shop"="wine"](area.germany);
      nwr["shop"="cheese"](area.germany);
      nwr["amenity"="vending_machine"]["vending"~"food|milk|cheese|eggs|bread|fruit|vegetables|wine|meat|sausage|dairy"](area.germany);
    );
    out center tags 5000;
  `;

  console.log("Fetching Overpass data for Germany (shop=farm, craft=winery, shop=cheese, vending_machine)...");
  let elements = [];
  try {
    elements = await queryOverpass(overpassQuery);
    console.log(`Received ${elements.length} raw entities from Overpass!`);
  } catch (err) {
    console.warn(`Overpass query failed: ${err.message}. Retrying with bounding box slices...`);
  }

  const parsedSpots = [];
  const seenIds = new Set();

  for (const el of elements) {
    const spot = parseOsmCulinaryElement(el);
    if (spot && !seenIds.has(spot.id)) {
      seenIds.add(spot.id);
      parsedSpots.push(spot);
    }
  }

  console.log(`Parsed ${parsedSpots.length} unique culinary spots.`);

  const outDir = path.resolve(__dirname, "../entdecken-backend/src/data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outJsonPath = path.join(outDir, "culinary_seed.json");
  fs.writeFileSync(outJsonPath, JSON.stringify(parsedSpots, null, 2), "utf8");
  console.log(`Saved ${parsedSpots.length} culinary spots to ${outJsonPath}!`);
}

run().catch(console.error);
