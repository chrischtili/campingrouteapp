const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = process.env.DIST_DIR || '/home/kopi/route-planner-pro/dist';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
const COUNTER_PATH = path.join(DATA_DIR, 'counter.json');
const FEEDBACK_PATH = path.join(DATA_DIR, 'feedback.json');
const ADMIN_USER = process.env.ADMIN_USER || 'kopi';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sugjax-jobnez-8meXdy';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const ALLOWED_PLACE_CATEGORIES = new Set(['camp_site', 'caravan_site']);
const CITYLIKE_ADDRESS_TYPES = new Set([
  'city',
  'town',
  'village',
  'hamlet',
  'municipality',
  'suburb',
  'quarter',
  'neighbourhood',
  'postcode'
]);
const REGION_ADDRESS_TYPES = new Set([
  'state',
  'region',
  'county',
  'province',
  'district',
  'sea',
  'island',
  'archipelago',
  'administrative'
]);
const REQUEST_HEADERS = {
  'User-Agent': 'CampingRoute/0.5.13 (+https://campingroute.app)',
  Accept: 'application/json'
};
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];
const NOMINATIM_TIMEOUT_MS = 8000;
const OVERPASS_TIMEOUT_MS = 8000;

function ensureJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
  }
}

function readJson(filePath, fallback) {
  ensureJsonFile(filePath, fallback);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return toLocalDateKey();
}

function incrementCounter() {
  const counter = readJson(COUNTER_PATH, {
    visits: 0,
    history: {},
    generations: { prompt: 0, route: 0, history: { prompt: {}, route: {} } }
  });
  counter.visits = Number(counter.visits || 0) + 1;
  counter.history = counter.history || {};
  counter.generations = counter.generations || { prompt: 0, route: 0, history: { prompt: {}, route: {} } };
  const key = todayKey();
  counter.history[key] = Number(counter.history[key] || 0) + 1;
  writeJson(COUNTER_PATH, counter);
  return counter;
}

function incrementGeneration(mode) {
  const counter = readJson(COUNTER_PATH, {
    visits: 0,
    history: {},
    generations: { prompt: 0, route: 0, history: { prompt: {}, route: {} } }
  });
  counter.history = counter.history || {};
  counter.generations = counter.generations || { prompt: 0, route: 0, history: { prompt: {}, route: {} } };
  counter.generations.history = counter.generations.history || { prompt: {}, route: {} };
  const normalizedMode = mode === 'route' ? 'route' : 'prompt';
  const key = todayKey();
  counter.generations[normalizedMode] = Number(counter.generations[normalizedMode] || 0) + 1;
  counter.generations.history[normalizedMode] = counter.generations.history[normalizedMode] || {};
  counter.generations.history[normalizedMode][key] = Number(counter.generations.history[normalizedMode][key] || 0) + 1;
  writeJson(COUNTER_PATH, counter);
  return counter.generations;
}

function getCounter() {
  const counter = readJson(COUNTER_PATH, {
    visits: 0,
    history: {},
    generations: { prompt: 0, route: 0, history: { prompt: {}, route: {} } }
  });
  const generationsHistory = counter.generations?.history || { prompt: {}, route: {} };
  return {
    success: true,
    data: {
      visits: Number(counter.visits || 0),
      history: counter.history || {},
      generations: {
        prompt: Number(counter.generations?.prompt || 0),
        route: Number(counter.generations?.route || 0),
        history: {
          prompt: generationsHistory.prompt || {},
          route: generationsHistory.route || {}
        }
      }
    },
    meta: {
      server: 'route-counter',
      version: 'feedback-v2',
      timestamp: new Date().toISOString()
    }
  };
}

function saveFeedback(payload) {
  const store = readJson(FEEDBACK_PATH, { feedback: [] });
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    rating: payload.rating === 'helpful' ? 'helpful' : 'not_helpful',
    message: typeof payload.message === 'string' ? payload.message.slice(0, 800) : '',
    mode: payload.mode === 'route' ? 'route' : 'prompt',
    language: typeof payload.language === 'string' ? payload.language.slice(0, 16) : 'unknown',
    provider: typeof payload.provider === 'string' ? payload.provider.slice(0, 40) : 'unknown',
    model: typeof payload.model === 'string' ? payload.model.slice(0, 80) : 'unknown',
    routeType: typeof payload.routeType === 'string' ? payload.routeType.slice(0, 40) : '',
    createdAt: new Date().toISOString()
  };
  store.feedback = Array.isArray(store.feedback) ? store.feedback : [];
  store.feedback.unshift(entry);
  store.feedback = store.feedback.slice(0, 1000);
  writeJson(FEEDBACK_PATH, store);
  return entry;
}

function getFeedbackSummary() {
  const store = readJson(FEEDBACK_PATH, { feedback: [] });
  const items = Array.isArray(store.feedback) ? store.feedback : [];
  const helpful = items.filter((item) => item.rating === 'helpful').length;
  const comments = items.filter((item) => item.message && item.message.trim()).length;
  const route = items.filter((item) => item.mode === 'route').length;
  const prompt = items.filter((item) => item.mode === 'prompt').length;
  const history = items.reduce((acc, item) => {
    const key = item.createdAt ? toLocalDateKey(new Date(item.createdAt)) : todayKey();
    acc[key] = Number(acc[key] || 0) + 1;
    return acc;
  }, {});
  const today = Number(history[todayKey()] || 0);
  return {
    success: true,
    summary: {
      total: items.length,
      helpful,
      notHelpful: items.length - helpful,
      comments,
      route,
      prompt,
      today,
      history
    },
    latest: items.slice(0, 25),
    meta: {
      timestamp: new Date().toISOString()
    }
  };
}

function isAuthorized(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Basic ')) return false;
  const value = Buffer.from(auth.slice(6), 'base64').toString('utf8');
  return value === `${ADMIN_USER}:${ADMIN_PASSWORD}`;
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 100000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoundingBoxArea(boundingbox) {
  if (!Array.isArray(boundingbox) || boundingbox.length !== 4) return null;
  const south = toNumber(boundingbox[0], NaN);
  const north = toNumber(boundingbox[1], NaN);
  const west = toNumber(boundingbox[2], NaN);
  const east = toNumber(boundingbox[3], NaN);
  if ([south, north, west, east].some((value) => Number.isNaN(value))) return null;
  return Math.abs(north - south) * Math.abs(east - west);
}

function parseBoundingBox(boundingbox) {
  if (!Array.isArray(boundingbox) || boundingbox.length !== 4) return null;
  const south = toNumber(boundingbox[0], NaN);
  const north = toNumber(boundingbox[1], NaN);
  const west = toNumber(boundingbox[2], NaN);
  const east = toNumber(boundingbox[3], NaN);
  if ([south, north, west, east].some((value) => Number.isNaN(value))) return null;
  return { south, north, west, east };
}

function isPointInsideBoundingBox(lat, lon, boundingBox) {
  if (!boundingBox) return false;
  return lat >= boundingBox.south && lat <= boundingBox.north && lon >= boundingBox.west && lon <= boundingBox.east;
}

function hasLocalityAddress(result) {
  const address = result && typeof result.address === 'object' ? result.address : {};
  return [
    'city',
    'town',
    'village',
    'hamlet',
    'municipality',
    'suburb',
    'quarter',
    'neighbourhood'
  ].some((key) => typeof address[key] === 'string' && address[key].trim());
}

function isRegionResult(result) {
  const addressType = String(result?.addresstype || '').toLowerCase();
  const type = String(result?.type || '').toLowerCase();
  const placeClass = String(result?.class || '').toLowerCase();
  const area = parseBoundingBoxArea(result?.boundingbox);
  if (CITYLIKE_ADDRESS_TYPES.has(addressType) || hasLocalityAddress(result)) return false;
  if (placeClass === 'place' && !REGION_ADDRESS_TYPES.has(addressType)) return false;
  if (REGION_ADDRESS_TYPES.has(addressType)) return true;
  if (placeClass === 'boundary' || type === 'administrative') return true;
  if (!CITYLIKE_ADDRESS_TYPES.has(addressType) && area !== null && area > 0.35) return true;
  return false;
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeoutMs = Number(options.timeoutMs || 0);
  const timeoutId =
    timeoutMs > 0
      ? setTimeout(() => {
          controller.abort(new Error(`upstream_timeout_${timeoutMs}`));
        }, timeoutMs)
      : null;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...REQUEST_HEADERS,
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      throw new Error(`upstream_timeout_${timeoutMs}`);
    }
    throw error;
  }

  if (timeoutId) clearTimeout(timeoutId);
  if (!response.ok) {
    throw new Error(`upstream_${response.status}`);
  }
  return response.json();
}

async function geocodePlace(query) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
  });
  const results = await fetchJson(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    timeoutMs: NOMINATIM_TIMEOUT_MS,
  });
  if (!Array.isArray(results) || results.length === 0) return null;
  return results.find((entry) => !isRegionResult(entry)) || results[0];
}

function buildOverpassQuery({ lat, lon, categories, limit, radius }) {
  const rawLimit = Math.max(20, Math.min(limit * 8, 160));
  const body = categories
    .map((category) => `nwr(around:${radius},${lat},${lon})["tourism"="${category}"];`)
    .join('\n');

  return `[out:json][timeout:25];
(
${body}
);
out center tags ${rawLimit};`;
}

function buildOverpassBoundingBoxQuery({ boundingBox, categories, limit }) {
  const rawLimit = Math.max(30, Math.min(limit * 12, 220));
  const body = categories
    .map(
      (category) =>
        `nwr(${boundingBox.south},${boundingBox.west},${boundingBox.north},${boundingBox.east})["tourism"="${category}"];`
    )
    .join('\n');

  return `[out:json][timeout:25];
(
${body}
);
out center tags ${rawLimit};`;
}

async function fetchOverpassData(query) {
  let lastError = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      return await fetchJson(endpoint, {
        method: 'POST',
        timeoutMs: OVERPASS_TIMEOUT_MS,
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: query,
      });
    } catch (error) {
      console.warn(`[places] overpass failed via ${endpoint}: ${error.message}`);
      lastError = error;
    }
  }

  throw lastError || new Error('searchFailed');
}

async function fetchOverpassPlaces({ lat, lon, categories, limit, boundingbox }) {
  const radiusPlan = [2500, 6000, 12000];
  const mergedElements = [];
  const seen = new Set();
  let lastError = null;

  const cityBoundingBox = parseBoundingBox(boundingbox);
  const boundingBoxArea = parseBoundingBoxArea(boundingbox);

  if (cityBoundingBox && boundingBoxArea !== null && boundingBoxArea <= 0.08) {
    try {
      const boundingBoxData = await fetchOverpassData(
        buildOverpassBoundingBoxQuery({
          boundingBox: cityBoundingBox,
          categories,
          limit,
        })
      );

      if (Array.isArray(boundingBoxData?.elements)) {
        for (const element of boundingBoxData.elements) {
          const key = `${element.type}-${element.id}`;
          if (seen.has(key)) continue;
          seen.add(key);
          mergedElements.push(element);
        }
      }
    } catch (error) {
      lastError = error;
    }

    if (mergedElements.length >= Math.max(limit * 2, 10)) {
      return { elements: mergedElements };
    }
  }

  for (const radius of radiusPlan) {
    let radiusData = null;

    try {
      radiusData = await fetchOverpassData(
        buildOverpassQuery({
          lat,
          lon,
          categories,
          limit,
          radius,
        })
      );
    } catch (error) {
      lastError = error;
    }

    if (!radiusData || !Array.isArray(radiusData.elements)) {
      continue;
    }

    for (const element of radiusData.elements) {
      const key = `${element.type}-${element.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      mergedElements.push(element);
    }

    if (mergedElements.length >= Math.max(limit * 3, 15)) {
      break;
    }
  }

  if (mergedElements.length > 0) {
    return { elements: mergedElements };
  }

  throw lastError || new Error('searchFailed');
}

function deriveLocality(tags = {}) {
  return (
    tags['addr:city'] ||
    tags['addr:town'] ||
    tags['addr:village'] ||
    tags['addr:hamlet'] ||
    tags['addr:municipality'] ||
    tags['addr:suburb'] ||
    tags['addr:quarter'] ||
    tags['addr:neighbourhood'] ||
    tags['addr:place'] ||
    tags['is_in:city'] ||
    tags['is_in:town'] ||
    tags['contact:city'] ||
    ''
  );
}

function deriveCountry(tags = {}) {
  return tags['addr:country'] || String(tags['addr:country_code'] || '').toUpperCase() || '';
}

function deriveAddress(tags = {}) {
  if (typeof tags['addr:full'] === 'string' && tags['addr:full'].trim()) {
    return tags['addr:full'].trim();
  }
  if (typeof tags.address === 'string' && tags.address.trim()) {
    return tags.address.trim();
  }

  const parts = [
    tags['addr:street'],
    tags['addr:housenumber'],
    tags['addr:place'],
    tags['addr:suburb'],
    tags['addr:quarter'],
    tags['addr:neighbourhood'],
    tags['addr:postcode'],
    tags['addr:city_district'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || tags['addr:hamlet'],
    tags['addr:state'],
    tags['addr:country'],
  ].filter(Boolean);
  return parts.join(', ');
}

function deriveDescription(tags = {}) {
  return tags.description || tags.note || tags['description:de'] || '';
}

function isUnnamedPlace(name) {
  return !name || /^unbenannter platz$/i.test(String(name).trim());
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function scorePlaceResult(entry, searchContext) {
  const { lat, lon, query, categoryPriority, boundingBox } = searchContext;
  let score = 0;
  const normalizedQuery = normalizeText(query);
  const normalizedName = normalizeText(entry.name);
  const normalizedLocality = normalizeText(entry.locality);
  const normalizedAddress = normalizeText(entry.address);
  const distanceKm = calculateDistanceKm(lat, lon, entry.lat, entry.lon);

  if (!isUnnamedPlace(entry.name)) score += 40;
  else score -= 35;

  if (normalizedName === normalizedQuery) score += 40;
  else if (normalizedName.includes(normalizedQuery) && normalizedQuery) score += 18;

  if (normalizedLocality === normalizedQuery) score += 40;
  else if (normalizedLocality.includes(normalizedQuery) && normalizedQuery) score += 22;

  if (normalizedAddress.includes(normalizedQuery) && normalizedQuery) score += 16;
  if (isPointInsideBoundingBox(entry.lat, entry.lon, boundingBox)) score += 45;
  if (entry.address) score += 8;
  if (entry.locality) score += 10;
  if (entry.website) score += 6;
  if (entry.phone) score += 3;
  if (entry.hasPowerSupply) score += 2;
  if (entry.hasToilets) score += 2;
  if (entry.hasShowers) score += 2;
  if (entry.hasDumpStation) score += 2;

  score += Math.max(0, 28 - Math.min(distanceKm * 1.5, 28));
  score += Math.max(0, 10 - categoryPriority.indexOf(entry.category));

  return score;
}

function toPlaceResult(element) {
  const tags = element.tags || {};
  const category = tags.tourism;
  const lat = toNumber(element.lat, NaN);
  const lon = toNumber(element.lon, NaN);
  const centerLat = toNumber(element.center?.lat, NaN);
  const centerLon = toNumber(element.center?.lon, NaN);
  const finalLat = Number.isNaN(lat) ? centerLat : lat;
  const finalLon = Number.isNaN(lon) ? centerLon : lon;

  return {
    id: `${element.type}-${element.id}`,
    name: tags.name || 'Unbenannter Platz',
    category,
    lat: finalLat,
    lon: finalLon,
    locality: deriveLocality(tags),
    country: deriveCountry(tags),
    address: deriveAddress(tags),
    website: tags.website || tags.contactWebsite || tags['contact:website'] || '',
    phone: tags.phone || tags['contact:phone'] || '',
    openingHours: tags.opening_hours || '',
    fee: tags.fee || '',
    description: deriveDescription(tags),
    hasToilets: tags.toilets === 'yes',
    hasShowers: tags.showers === 'yes',
    hasPowerSupply: tags.power_supply === 'yes',
    hasDumpStation: tags.sanitary_dump_station === 'yes',
    imageUrl: '',
    imageAttribution: '',
    sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
  };
}

async function searchPlaces(query, categories, limit) {
  const place = await geocodePlace(query);
  if (!place) return { results: [] };
  if (isRegionResult(place)) {
    return { error: 'region_not_supported' };
  }

  const lat = toNumber(place.lat, NaN);
  const lon = toNumber(place.lon, NaN);
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return { results: [] };
  }

  let overpassData;
  const boundingBox = parseBoundingBox(place.boundingbox);
  try {
    overpassData = await fetchOverpassPlaces({
      lat,
      lon,
      categories,
      limit,
      boundingbox: place.boundingbox,
    });
  } catch (error) {
    if (String(error?.message || '').startsWith('upstream_')) {
      console.warn(`[places] returning empty results for "${query}" after upstream failure: ${error.message}`);
      return { results: [] };
    }
    throw error;
  }
  const categoryPriority = Array.isArray(categories) && categories.length > 0 ? categories : ['camp_site', 'caravan_site'];
  const seen = new Set();
  const rawResults = Array.isArray(overpassData?.elements)
    ? overpassData.elements
        .filter((element) => {
          const tourism = element?.tags?.tourism;
          return ALLOWED_PLACE_CATEGORIES.has(tourism);
        })
        .map(toPlaceResult)
        .filter((entry) => {
          if (!entry.name || Number.isNaN(entry.lat) || Number.isNaN(entry.lon)) return false;
          if (seen.has(entry.id)) return false;
          seen.add(entry.id);
          return true;
        })
    : [];

  const sortedResults = rawResults.sort((left, right) => {
    const leftScore = scorePlaceResult(left, { lat, lon, query, categoryPriority, boundingBox });
    const rightScore = scorePlaceResult(right, { lat, lon, query, categoryPriority, boundingBox });
    return rightScore - leftScore;
  });

  const namedResults = sortedResults.filter((entry) => !isUnnamedPlace(entry.name));
  const unnamedResults = sortedResults.filter((entry) => isUnnamedPlace(entry.name));
  const results = [...namedResults, ...unnamedResults].slice(0, limit);

  return { results };
}

function serveStatic(req, res, pathname) {
  let filePath = pathname === '/' ? path.join(DIST_DIR, 'index.html') : path.join(DIST_DIR, pathname);
  if (!filePath.startsWith(DIST_DIR)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'
    });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'POST' && pathname === '/api/count-visit') {
      const counter = incrementCounter();
      sendJson(res, 200, { success: true, visits: counter.visits });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/count-generation') {
      const body = await readBody(req);
      const generations = incrementGeneration(body?.mode);
      sendJson(res, 200, { success: true, generations });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/feedback') {
      const body = await readBody(req);
      const saved = saveFeedback(body);
      sendJson(res, 200, { success: true, id: saved.id });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/places/search') {
      const query = String(url.searchParams.get('q') || '').trim();
      const limit = Math.max(1, Math.min(toNumber(url.searchParams.get('limit'), 8), 12));
      const categories = url.searchParams
        .getAll('category')
        .map((entry) => String(entry || '').trim())
        .filter((entry) => ALLOWED_PLACE_CATEGORIES.has(entry));

      if (query.length < 2 || categories.length === 0) {
        sendJson(res, 400, { error: 'searchFailed' });
        return;
      }

      const placeSearch = await searchPlaces(query, categories, limit);
      if (placeSearch.error) {
        sendJson(res, 400, { error: placeSearch.error });
        return;
      }

      sendJson(res, 200, { results: placeSearch.results || [] });
      return;
    }

    if (pathname === '/api/admin/counter') {
      if (!isAuthorized(req)) {
        sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      sendJson(res, 200, getCounter());
      return;
    }

    if (pathname === '/api/admin/feedback') {
      if (!isAuthorized(req)) {
        sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      sendJson(res, 200, getFeedbackSummary());
      return;
    }

    serveStatic(req, res, pathname);
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Internal Server Error' });
  }
});

server.listen(PORT, HOST, () => {
  ensureJsonFile(COUNTER_PATH, { visits: 0, history: {}, generations: { prompt: 0, route: 0, history: { prompt: {}, route: {} } } });
  ensureJsonFile(FEEDBACK_PATH, { feedback: [] });
  console.log(`Server läuft auf http://${HOST}:${PORT}`);
  console.log(`Dist: ${DIST_DIR}`);
  console.log(`Data: ${DATA_DIR}`);
});
