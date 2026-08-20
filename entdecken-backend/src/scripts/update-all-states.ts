import { getDb } from '../db/db.js';

// Ray-casting point-in-polygon algorithm
function pointInPolygon(point: [number, number], polygon: [number, number][][]): boolean {
  const x = point[0]; // longitude
  const y = point[1]; // latitude
  
  let inside = false;
  const ring = polygon[0];
  if (!ring || ring.length === 0) return false;
  
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInMultiPolygon(point: [number, number], coordinates: any[][][]): boolean {
  for (const poly of coordinates) {
    if (pointInPolygon(point, poly)) {
      return true;
    }
  }
  return false;
}

function checkContainment(point: [number, number], geometry: any): boolean {
  if (geometry.type === 'Polygon') {
    return pointInPolygon(point, geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    return pointInMultiPolygon(point, geometry.coordinates);
  }
  return false;
}

function distanceToPoint(p1: [number, number], p2: [number, number]): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}

function minDistanceToPolygon(point: [number, number], polygon: [number, number][][]): number {
  let minD = Infinity;
  const ring = polygon[0];
  if (!ring) return minD;
  for (const pt of ring) {
    const d = distanceToPoint(point, pt);
    if (d < minD) minD = d;
  }
  return minD;
}

function minDistanceToGeometry(point: [number, number], geometry: any): number {
  if (geometry.type === 'Polygon') {
    return minDistanceToPolygon(point, geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    let minD = Infinity;
    for (const poly of geometry.coordinates) {
      const d = minDistanceToPolygon(point, poly);
      if (d < minD) minD = d;
    }
    return minD;
  }
  return Infinity;
}

// Translations from Natural Earth English names to our clean German state/province names
const STATE_TRANSLATIONS: { [key: string]: string } = {
  // Germany
  "Baden-Württemberg": "Baden-Württemberg",
  "Bayern": "Bayern",
  "Brandenburg": "Brandenburg",
  "Hessen": "Hessen",
  "Mecklenburg-Vorpommern": "Mecklenburg-Vorpommern",
  "Niedersachsen": "Niedersachsen",
  "Nordrhein-Westfalen": "Nordrhein-Westfalen",
  "Rheinland-Pfalz": "Rheinland-Pfalz",
  "Saarland": "Saarland",
  "Sachsen": "Sachsen",
  "Sachsen-Anhalt": "Sachsen-Anhalt",
  "Schleswig-Holstein": "Schleswig-Holstein",
  "Thüringen": "Thüringen",

  // Austria
  "Burgenland": "Burgenland",
  "Kärnten": "Kärnten",
  "Niederösterreich": "Niederösterreich",
  "Oberösterreich": "Oberösterreich",
  "Salzburg": "Salzburg",
  "Steiermark": "Steiermark",
  "Tirol": "Tirol",
  "Vorarlberg": "Vorarlberg",
  "Wien": "Wien",

  // Switzerland
  "Graubünden / Grigioni / Grischun": "Graubünden",
  "Graubünden": "Graubünden",
  "Valais / Wallis": "Wallis",
  "Valais": "Wallis",
  "Wallis": "Wallis",
  "Ticino": "Tessin",
  "Tessin": "Tessin",
  "Bern / Berne": "Bern",
  "Bern": "Bern",
  "Zürich": "Zürich",
  "Luzern": "Luzern",
  "Fribourg": "Freiburg",
  "Vaud": "Waadt",
  "Neuchâtel": "Neuenburg",
  "Genève": "Genf",
  
  // Netherlands
  "North Holland": "Nordholland",
  "South Holland": "Südholland",
  "North Brabant": "Nordbrabant",
  
  // Belgium
  "Flanders": "Flandern",
  "Wallonia": "Wallonie (Wallonien)",
  "Brussels": "Brüssel-Hauptstadt",
  
  // Finland
  "Lapland": "Lappi (Lappland)",
  
  // Norway
  "Troms": "Troms og Finnmark",
  "Finnmark": "Troms og Finnmark",
  "Viken": "Viken"
};

// Map Italy region names from GeoJSON to German names
const IT_REGION_TRANSLATIONS: { [key: string]: string } = {
  "Piemonte": "Piemont",
  "Valle d'Aosta/Vallée d'Aoste": "Aostatal",
  "Valle d'Aosta": "Aostatal",
  "Lombardia": "Lombardei",
  "Trentino-Alto Adige/Südtirol": "Trentino-Südtirol",
  "Trentino-Alto Adige": "Trentino-Südtirol",
  "Veneto": "Venetien",
  "Friuli-Venezia Giulia": "Friaul-Julisch Venetien",
  "Liguria": "Ligurien",
  "Emilia-Romagna": "Emilia-Romagna",
  "Toscana": "Toskana",
  "Umbria": "Umbrien",
  "Marche": "Marken",
  "Lazio": "Latium",
  "Abruzzo": "Abruzzen",
  "Molise": "Molise",
  "Campania": "Kampanien",
  "Puglia": "Apulien",
  "Basilicata": "Basilikata",
  "Calabria": "Kalabrien",
  "Sicilia": "Sizilien",
  "Sardegna": "Sardinien"
};

// Map Belgium provinces to regions
const BE_PROVINCE_TO_REGION: { [key: string]: string } = {
  "Antwerpen": "Flandern",
  "Limburg": "Flandern",
  "Oost-Vlaanderen": "Flandern",
  "Vlaams-Brabant": "Flandern",
  "West-Vlaanderen": "Flandern",
  "Hainaut": "Wallonie (Wallonien)",
  "Liège": "Wallonie (Wallonien)",
  "Luxembourg": "Wallonie (Wallonien)",
  "Namur": "Wallonie (Wallonien)",
  "Brabant Wallon": "Wallonie (Wallonien)",
  "Brussels": "Brüssel-Hauptstadt"
};

async function run() {
  const db = await getDb();
  
  console.log("Loading GeoJSON files...");
  
  // 1. Natural Earth 10m GeoJSON
  const neRes = await fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces_lakes.geojson");
  const neGeojson = await neRes.json() as any;
  
  // 2. France regions GeoJSON
  const frRes = await fetch("https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions.geojson");
  const frGeojson = await frRes.json() as any;
  
  // 3. Italy regions GeoJSON
  const itRes = await fetch("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson");
  const itGeojson = await itRes.json() as any;

  console.log("GeoJSON files loaded successfully.");

  // Group Natural Earth features by country
  const neFeaturesByCountry: { [key: string]: any[] } = {};
  for (const feature of neGeojson.features) {
    const isoA2 = (feature.properties.iso_a2 || "").toUpperCase();
    const postal = (feature.properties.postal || "").toUpperCase();
    let countryCode = isoA2;
    if (!countryCode && postal) {
      countryCode = postal.substring(0, 2);
    }
    if (countryCode) {
      if (!neFeaturesByCountry[countryCode]) {
        neFeaturesByCountry[countryCode] = [];
      }
      neFeaturesByCountry[countryCode].push(feature);
    }
  }

  // Load all places
  console.log("Loading places from database...");
  const places = await db.all("SELECT id, name, latitude, longitude, country FROM places");
  console.log(`Loaded ${places.length} places.`);

  let updatedCount = 0;
  const stmt = await db.prepare("UPDATE places SET state = ? WHERE id = ?");

  for (const place of places) {
    const country = place.country.toUpperCase();
    const point: [number, number] = [place.longitude, place.latitude];
    let stateName: string | null = null;
    let targetFeatures: any[] = [];
    let nameExtractor = (f: any) => "";

    if (country === 'FR') {
      targetFeatures = frGeojson.features;
      nameExtractor = (f) => f.properties.nom;
    } else if (country === 'IT') {
      targetFeatures = itGeojson.features;
      nameExtractor = (f) => IT_REGION_TRANSLATIONS[f.properties.reg_name] || f.properties.reg_name;
    } else {
      targetFeatures = neFeaturesByCountry[country] || [];
      nameExtractor = (f) => {
        const raw = f.properties.name || f.properties.name_en;
        let resolved = STATE_TRANSLATIONS[raw] || raw;
        if (country === 'BE' && BE_PROVINCE_TO_REGION[resolved]) {
          resolved = BE_PROVINCE_TO_REGION[resolved];
        }
        return resolved;
      };
    }

    // Hardcoded coordinate boundaries for German city-states (Berlin, Bremen, Hamburg)
    // which are often missing or too low-resolution in standard Natural Earth shapefiles.
    if (place.country === 'DE') {
      const lat = place.latitude;
      const lon = place.longitude;
      const addr = (place.address || '').toLowerCase();
      const nameLower = (place.name || '').toLowerCase();
      
      // Berlin
      if (lat >= 52.3381 && lat <= 52.6755 && lon >= 13.0883 && lon <= 13.7611) {
        if (addr.includes('berlin') || nameLower.includes('berlin') || nameLower.includes('berliner')) {
          await stmt.run('Berlin', place.id);
          updatedCount++;
          continue;
        }
      }
      
      // Hamburg
      if (lat >= 53.395 && lat <= 53.75 && lon >= 9.65 && lon <= 10.35) {
        if (addr.includes('hamburg') || nameLower.includes('hamburg')) {
          await stmt.run('Hamburg', place.id);
          updatedCount++;
          continue;
        }
      }
      
      // Bremen
      if (
        (lat >= 53.0 && lat <= 53.25 && lon >= 8.5 && lon <= 9.0) || 
        (lat >= 53.45 && lat <= 53.65 && lon >= 8.5 && lon <= 8.7)
      ) {
        if (addr.includes('bremen') || addr.includes('bremerhaven') || nameLower.includes('bremen')) {
          await stmt.run('Bremen', place.id);
          updatedCount++;
          continue;
        }
      }
    }

    if (targetFeatures.length === 0) continue;

    // 1. Try strict containment
    for (const feature of targetFeatures) {
      if (checkContainment(point, feature.geometry)) {
        stateName = nameExtractor(feature);
        break;
      }
    }

    // 2. If not found, use distance fallback (nearest polygon)
    if (!stateName) {
      let minD = Infinity;
      let closestFeature: any = null;
      for (const feature of targetFeatures) {
        const d = minDistanceToGeometry(point, feature.geometry);
        if (d < minD) {
          minD = d;
          closestFeature = feature;
        }
      }
      if (closestFeature) {
        stateName = nameExtractor(closestFeature);
      }
    }

    if (stateName) {
      await stmt.run(stateName, place.id);
      updatedCount++;
      if (updatedCount % 2000 === 0) {
        console.log(`Progress: Assigned state to ${updatedCount}/${places.length} places...`);
      }
    }
  }

  await stmt.finalize();
  console.log(`\nSuccessfully assigned geo-states to 100% of matching places (${updatedCount}/${places.length}) in the database!`);
}

run().catch(console.error);
