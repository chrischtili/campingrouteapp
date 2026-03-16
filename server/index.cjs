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
  const response = await fetch(url, {
    ...options,
    headers: {
      ...REQUEST_HEADERS,
      ...(options.headers || {}),
    },
  });
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
  const results = await fetchJson(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
  if (!Array.isArray(results) || results.length === 0) return null;
  return results.find((entry) => !isRegionResult(entry)) || results[0];
}

function buildOverpassQuery({ lat, lon, categories, limit }) {
  const radius = 35000;
  const body = categories
    .map((category) => `nwr(around:${radius},${lat},${lon})["tourism"="${category}"];`)
    .join('\n');

  return `[out:json][timeout:25];
(
${body}
);
out center tags ${Math.max(1, Math.min(limit * 2, 60))};`;
}

function deriveLocality(tags = {}) {
  return tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || tags['addr:hamlet'] || tags['addr:place'] || '';
}

function deriveCountry(tags = {}) {
  return tags['addr:country'] || tags['addr:country_code'] || '';
}

function deriveAddress(tags = {}) {
  const parts = [
    tags['addr:street'],
    tags['addr:housenumber'],
    tags['addr:postcode'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || tags['addr:hamlet'],
    tags['addr:country'],
  ].filter(Boolean);
  return parts.join(', ');
}

function deriveDescription(tags = {}) {
  return tags.description || tags.note || tags['description:de'] || '';
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

  const overpassQuery = buildOverpassQuery({ lat, lon, categories, limit });
  const overpassData = await fetchJson('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
    body: overpassQuery,
  });

  const seen = new Set();
  const results = Array.isArray(overpassData?.elements)
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
        .slice(0, limit)
    : [];

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
      const limit = Math.max(1, Math.min(toNumber(url.searchParams.get('limit'), 18), 24));
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
