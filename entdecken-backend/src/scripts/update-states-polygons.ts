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

async function run() {
  const db = await getDb();
  
  console.log("Ensuring 'state' column exists in 'places' table...");
  try {
    await db.run("ALTER TABLE places ADD COLUMN state TEXT");
    console.log("Added 'state' column to 'places' table.");
  } catch (e) {
    // Column already exists
    console.log("'state' column already exists.");
  }

  // 1. Fetch Germany GeoJSON
  console.log("Fetching Germany states GeoJSON...");
  const deRes = await fetch("https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/germany.geojson");
  const deGeo = await deRes.json() as any;
  console.log(`Loaded Germany GeoJSON with ${deGeo.features.length} features.`);

  // 2. Fetch Switzerland GeoJSON
  console.log("Fetching Switzerland cantons GeoJSON...");
  const chRes = await fetch("https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/switzerland.geojson");
  const chGeo = await chRes.json() as any;
  console.log(`Loaded Switzerland GeoJSON with ${chGeo.features.length} features.`);

  // 3. Fetch Austria GeoJSON
  console.log("Fetching Austria states GeoJSON...");
  const atRes = await fetch("https://raw.githubusercontent.com/ginseng666/GeoJSON-TopoJSON-Austria/master/2021/simplified-95/laender_95_geo.json");
  const atGeo = await atRes.json() as any;
  console.log(`Loaded Austria GeoJSON with ${atGeo.features.length} features.`);

  // Map Austria names to standard German labels
  const atNameMap: { [key: string]: string } = {
    "Burgenland": "Burgenland",
    "Kärnten": "Kärnten",
    "Niederösterreich": "Niederösterreich",
    "Oberösterreich": "Oberösterreich",
    "Salzburg": "Salzburg",
    "Steiermark": "Steiermark",
    "Tirol": "Tirol",
    "Vorarlberg": "Vorarlberg",
    "Wien": "Wien"
  };

  // Map Switzerland names to standard German labels
  const chNameMap: { [key: string]: string } = {
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
    "Genève": "Genf"
  };

  console.log("Loading all places for Germany, Austria, and Switzerland...");
  const places = await db.all("SELECT id, name, latitude, longitude, country FROM places WHERE country IN ('DE', 'AT', 'CH')");
  console.log(`Loaded ${places.length} places to process.`);

  let updatedCount = 0;
  
  // Prepare transaction statement
  const stmt = await db.prepare("UPDATE places SET state = ? WHERE id = ?");

  for (const place of places) {
    let stateName: string | null = null;
    const point: [number, number] = [place.longitude, place.latitude];

    if (place.country === 'DE') {
      for (const feature of deGeo.features) {
        if (checkContainment(point, feature.geometry)) {
          stateName = feature.properties.name;
          break;
        }
      }
    } else if (place.country === 'CH') {
      for (const feature of chGeo.features) {
        if (checkContainment(point, feature.geometry)) {
          const rawName = feature.properties.name;
          stateName = chNameMap[rawName] || rawName;
          break;
        }
      }
    } else if (place.country === 'AT') {
      for (const feature of atGeo.features) {
        if (checkContainment(point, feature.geometry)) {
          const rawName = feature.properties.name;
          stateName = atNameMap[rawName] || rawName;
          break;
        }
      }
    }

    if (stateName) {
      await stmt.run(stateName, place.id);
      updatedCount++;
      if (updatedCount % 500 === 0) {
        console.log(`Progress: Assigned state to ${updatedCount}/${places.length} places...`);
      }
    }
  }

  await stmt.finalize();
  console.log(`\nSuccessfully assigned highly accurate geo-states to ${updatedCount} places in Germany, Austria, and Switzerland!`);
}

run().catch(console.error);
