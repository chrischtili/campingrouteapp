const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadDotEnvFile(path.join(__dirname, '..', '.env'));

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = process.env.DIST_DIR || '/home/kopi/route-planner-pro/dist';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
const COUNTER_PATH = path.join(DATA_DIR, 'counter.json');
const FEEDBACK_PATH = path.join(DATA_DIR, 'feedback.json');
const PLACE_INDEX_PATH = process.env.PLACE_INDEX_PATH || path.join(DATA_DIR, 'place-index.json');
const ADMIN_USER = process.env.ADMIN_USER || 'kopi';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sugjax-jobnez-8meXdy';
const GEOAPIFY_API_KEY = String(process.env.GEOAPIFY_API_KEY || '').trim();
const GEOAPIFY_GEOCODING_URL = process.env.GEOAPIFY_GEOCODING_URL || 'https://api.geoapify.com/v1/geocode';

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
const OVERPASS_TIMEOUT_MS = 5000;
const GEOAPIFY_TIMEOUT_MS = 5000;
const PLACE_SEARCH_CACHE_TTL_MS = 20 * 60 * 1000;
const PLACE_SEARCH_CACHE_MAX_ENTRIES = 180;
const GEOCODE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const GEOCODE_CACHE_MAX_ENTRIES = 200;
const PLACE_SUGGESTION_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const PLACE_SUGGESTION_CACHE_MAX_ENTRIES = 250;
const ANALYTICS_EVENT_LIMIT = 400;
const placeSearchCache = new Map();
const geocodeCache = new Map();
const placeSuggestionCache = new Map();
let placeIndexState = {
  path: PLACE_INDEX_PATH,
  entries: [],
  loadedAt: null,
  error: null,
};
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const PLACE_RATE_LIMITS = {
  suggest: { max: 45, bucket: new Map() },
  search: { max: 10, bucket: new Map() }
};

function createCounterDefaults() {
  return {
    visits: 0,
    history: {},
    generations: {
      prompt: 0,
      route: 0,
      place_search: 0,
      place_search_solo: 0,
      place_select: 0,
      history: {
        prompt: {},
        route: {},
        place_search: {},
        place_search_solo: {},
        place_select: {}
      }
    },
    analytics: {
      searches: {
        dayKey: todayKey(),
        total: {
          solo: { camping: 0, stopover: 0, mixed: 0 },
          planner: { camping: 0, stopover: 0, mixed: 0 }
        },
        today: {
          solo: { camping: 0, stopover: 0, mixed: 0 },
          planner: { camping: 0, stopover: 0, mixed: 0 }
        }
      }
    }
  };
}

function normalizeCounter(counter) {
  const fallback = createCounterDefaults();
  const nextCounter = counter && typeof counter === 'object' ? counter : {};
  const nextGenerations = nextCounter.generations && typeof nextCounter.generations === 'object'
    ? nextCounter.generations
    : {};
  const nextHistory = nextGenerations.history && typeof nextGenerations.history === 'object'
    ? nextGenerations.history
    : {};
  const nextAnalytics = nextCounter.analytics && typeof nextCounter.analytics === 'object'
    ? nextCounter.analytics
    : {};
  const nextSearchAnalytics = nextAnalytics.searches && typeof nextAnalytics.searches === 'object' && !Array.isArray(nextAnalytics.searches)
    ? nextAnalytics.searches
    : {};
  const nextSearchTotal = nextSearchAnalytics.total && typeof nextSearchAnalytics.total === 'object'
    ? nextSearchAnalytics.total
    : {};
  const nextSearchToday = nextSearchAnalytics.today && typeof nextSearchAnalytics.today === 'object'
    ? nextSearchAnalytics.today
    : {};

  const normalizeSearchBucket = (bucket) => ({
    camping: Number(bucket?.camping || 0),
    stopover: Number(bucket?.stopover || 0),
    mixed: Number(bucket?.mixed || 0)
  });

  return {
    visits: Number(nextCounter.visits || 0),
    history: nextCounter.history && typeof nextCounter.history === 'object' ? nextCounter.history : {},
    generations: {
      prompt: Number(nextGenerations.prompt || 0),
      route: Number(nextGenerations.route || 0),
      place_search: Number(nextGenerations.place_search || 0),
      place_search_solo: Number(nextGenerations.place_search_solo || 0),
      place_select: Number(nextGenerations.place_select || 0),
      history: {
        prompt: nextHistory.prompt && typeof nextHistory.prompt === 'object' ? nextHistory.prompt : {},
        route: nextHistory.route && typeof nextHistory.route === 'object' ? nextHistory.route : {},
        place_search: nextHistory.place_search && typeof nextHistory.place_search === 'object' ? nextHistory.place_search : {},
        place_search_solo: nextHistory.place_search_solo && typeof nextHistory.place_search_solo === 'object' ? nextHistory.place_search_solo : {},
        place_select: nextHistory.place_select && typeof nextHistory.place_select === 'object' ? nextHistory.place_select : {}
      }
    },
    analytics: {
      searches: {
        dayKey: typeof nextSearchAnalytics.dayKey === 'string' ? nextSearchAnalytics.dayKey : todayKey(),
        total: {
          solo: normalizeSearchBucket(nextSearchTotal.solo),
          planner: normalizeSearchBucket(nextSearchTotal.planner)
        },
        today: {
          solo: normalizeSearchBucket(nextSearchToday.solo),
          planner: normalizeSearchBucket(nextSearchToday.planner)
        }
      }
    }
  };
}

function sanitizeText(value, maxLength = 120) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function sanitizeCategoryList(entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => String(entry || '').trim())
    .filter((entry) => ALLOWED_PLACE_CATEGORIES.has(entry))
    .slice(0, 4);
}

function clampNumber(value, min, max, fallback = min) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(numeric, max));
}

function normalizeFinderSurface(value) {
  return value === 'solo' ? 'solo' : 'planner';
}

function normalizeFinderVariant(value) {
  return value === 'camping' || value === 'stopover' ? value : 'mixed';
}

function buildCounterAnalytics(counter) {
  return {
    searches: {
      summary: counter.analytics.searches
    }
  };
}

function recordGenerationAnalytics(counter, mode, details = {}) {
  counter.analytics = counter.analytics || createCounterDefaults().analytics;

  if (mode === 'place_search' || mode === 'place_search_solo') {
    const currentDayKey = todayKey();
    if (counter.analytics.searches.dayKey !== currentDayKey) {
      counter.analytics.searches.dayKey = currentDayKey;
      counter.analytics.searches.today = {
        solo: { camping: 0, stopover: 0, mixed: 0 },
        planner: { camping: 0, stopover: 0, mixed: 0 }
      };
    }

    const surface = normalizeFinderSurface(details.surface || (mode === 'place_search_solo' ? 'solo' : 'planner'));
    const variant = normalizeFinderVariant(details.variant);
    counter.analytics.searches.total[surface][variant] += 1;
    counter.analytics.searches.today[surface][variant] += 1;
    return;
  }
}

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

function normalizePlaceIndexEntry(entry) {
  const category = String(entry?.category || '').trim();
  const lat = toNumber(entry?.lat, NaN);
  const lon = toNumber(entry?.lon, NaN);

  if (!ALLOWED_PLACE_CATEGORIES.has(category) || Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }

  return {
    id: String(entry?.id || `${category}-${lat},${lon}`),
    name: String(entry?.name || 'Unbenannter Platz').trim() || 'Unbenannter Platz',
    category,
    lat,
    lon,
    locality: String(entry?.locality || '').trim(),
    country: String(entry?.country || '').trim(),
    address: String(entry?.address || '').trim(),
    website: String(entry?.website || '').trim(),
    phone: String(entry?.phone || '').trim(),
    openingHours: String(entry?.openingHours || entry?.opening_hours || '').trim(),
    fee: String(entry?.fee || '').trim(),
    description: String(entry?.description || '').trim(),
    hasToilets: entry?.hasToilets === true || entry?.toilets === true,
    hasShowers: entry?.hasShowers === true || entry?.showers === true,
    hasPowerSupply: entry?.hasPowerSupply === true || entry?.powerSupply === true || entry?.power_supply === true,
    hasDumpStation: entry?.hasDumpStation === true || entry?.dumpStation === true || entry?.dump_station === true,
    imageUrl: String(entry?.imageUrl || '').trim(),
    imageAttribution: String(entry?.imageAttribution || '').trim(),
    sourceUrl: String(entry?.sourceUrl || '').trim(),
  };
}

function loadPlaceIndexFromDisk() {
  if (!fs.existsSync(PLACE_INDEX_PATH)) {
    placeIndexState = {
      path: PLACE_INDEX_PATH,
      entries: [],
      loadedAt: null,
      error: null,
    };
    return;
  }

  try {
    const payload = JSON.parse(fs.readFileSync(PLACE_INDEX_PATH, 'utf8'));
    const rawEntries = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.entries)
        ? payload.entries
        : [];
    const entries = rawEntries.map(normalizePlaceIndexEntry).filter(Boolean);

    placeIndexState = {
      path: PLACE_INDEX_PATH,
      entries,
      loadedAt: new Date().toISOString(),
      error: null,
    };
  } catch (error) {
    placeIndexState = {
      path: PLACE_INDEX_PATH,
      entries: [],
      loadedAt: null,
      error: error instanceof Error ? error.message : 'unknown_error',
    };
  }
}

function getPlaceIndexEntries() {
  return Array.isArray(placeIndexState.entries) ? placeIndexState.entries : [];
}

function getClientIp(req) {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (forwardedFor) return forwardedFor;
  return (
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

function isRateLimited(req, key) {
  const config = PLACE_RATE_LIMITS[key];
  if (!config) return false;

  const now = Date.now();
  const ip = getClientIp(req);
  const entry = config.bucket.get(ip);

  if (!entry || now >= entry.resetAt) {
    config.bucket.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count += 1;
  }

  if (config.bucket.size > 5000) {
    for (const [bucketIp, bucketEntry] of config.bucket.entries()) {
      if (now >= bucketEntry.resetAt) {
        config.bucket.delete(bucketIp);
      }
    }
  }

  return (config.bucket.get(ip)?.count || 0) > config.max;
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
  const counter = normalizeCounter(readJson(COUNTER_PATH, createCounterDefaults()));
  counter.visits += 1;
  const key = todayKey();
  counter.history[key] = Number(counter.history[key] || 0) + 1;
  writeJson(COUNTER_PATH, counter);
  return counter;
}

function incrementGeneration(mode, details) {
  const counter = normalizeCounter(readJson(COUNTER_PATH, createCounterDefaults()));
  const allowedModes = new Set(['prompt', 'route', 'place_search', 'place_search_solo', 'place_select']);
  const normalizedMode = allowedModes.has(mode) ? mode : 'prompt';
  const key = todayKey();
  counter.generations[normalizedMode] = Number(counter.generations[normalizedMode] || 0) + 1;
  counter.generations.history[normalizedMode] = counter.generations.history[normalizedMode] || {};
  counter.generations.history[normalizedMode][key] = Number(counter.generations.history[normalizedMode][key] || 0) + 1;
  recordGenerationAnalytics(counter, normalizedMode, details);
  writeJson(COUNTER_PATH, counter);
  return counter.generations;
}

function getCounter() {
  const counter = normalizeCounter(readJson(COUNTER_PATH, createCounterDefaults()));
  const generationsHistory = counter.generations.history;
  const analytics = buildCounterAnalytics(counter);
  return {
    success: true,
    data: {
      visits: counter.visits,
      history: counter.history,
      generations: {
        prompt: counter.generations.prompt,
        route: counter.generations.route,
        place_search: counter.generations.place_search,
        place_search_solo: counter.generations.place_search_solo,
        place_select: counter.generations.place_select,
        history: {
          prompt: generationsHistory.prompt,
          route: generationsHistory.route,
          place_search: generationsHistory.place_search,
          place_search_solo: generationsHistory.place_search_solo,
          place_select: generationsHistory.place_select
        }
      },
      analytics
    },
    meta: {
      server: 'route-counter',
      version: 'analytics-v3',
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

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function getPlaceSearchCacheKey(query, categories, limit, locationOverride = null) {
  return JSON.stringify({
    query: normalizeText(query),
    categories: [...categories].sort(),
    limit,
    location: locationOverride
      ? {
          lat: Number(Number(locationOverride.lat || 0).toFixed(4)),
          lon: Number(Number(locationOverride.lon || 0).toFixed(4)),
          boundingBox: locationOverride.boundingBox || null,
        }
      : null,
  });
}

function normalizeDisplayLabel(value) {
  return String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}

function readPlaceSearchCache(cacheKey) {
  const entry = placeSearchCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > PLACE_SEARCH_CACHE_TTL_MS) {
    placeSearchCache.delete(cacheKey);
    return null;
  }
  return entry.value;
}

function writePlaceSearchCache(cacheKey, value) {
  placeSearchCache.set(cacheKey, {
    createdAt: Date.now(),
    value,
  });

  if (placeSearchCache.size <= PLACE_SEARCH_CACHE_MAX_ENTRIES) return;

  const oldestKey = placeSearchCache.keys().next().value;
  if (oldestKey) {
    placeSearchCache.delete(oldestKey);
  }
}

function readTimedCache(cache, cacheKey, ttlMs) {
  const entry = cache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > ttlMs) {
    cache.delete(cacheKey);
    return null;
  }
  return entry.value;
}

function writeTimedCache(cache, cacheKey, value, maxEntries) {
  cache.set(cacheKey, {
    createdAt: Date.now(),
    value,
  });

  if (cache.size <= maxEntries) return;

  const oldestKey = cache.keys().next().value;
  if (oldestKey) {
    cache.delete(oldestKey);
  }
}

function getGeocodeCacheKey(query) {
  return normalizeText(query);
}

function getPlaceSuggestionCacheKey(query, limit) {
  return JSON.stringify({
    query: normalizeText(query),
    limit,
  });
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

function normalizeGeoapifyFeature(feature) {
  const properties = feature && typeof feature.properties === 'object' ? feature.properties : {};
  const geometry = feature && typeof feature.geometry === 'object' ? feature.geometry : {};
  const coordinates = Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
  const lon = toNumber(properties.lon, toNumber(coordinates[0], NaN));
  const lat = toNumber(properties.lat, toNumber(coordinates[1], NaN));
  const bboxObject = properties && typeof properties.bbox === 'object' ? properties.bbox : null;
  const rawBoundingBox = Array.isArray(feature?.bbox)
    ? feature.bbox
    : bboxObject
      ? [bboxObject.lat1, bboxObject.lat2, bboxObject.lon1, bboxObject.lon2]
      : null;
  const boundingBox = Array.isArray(rawBoundingBox) && rawBoundingBox.length === 4
    ? [
        toNumber(rawBoundingBox[0], NaN),
        toNumber(rawBoundingBox[1], NaN),
        toNumber(rawBoundingBox[2], NaN),
        toNumber(rawBoundingBox[3], NaN),
      ]
    : null;
  const locality =
    properties.city ||
    properties.town ||
    properties.village ||
    properties.hamlet ||
    properties.municipality ||
    properties.suburb ||
    properties.quarter ||
    properties.county ||
    '';
  const name =
    locality ||
    properties.name ||
    properties.address_line1 ||
    (typeof properties.formatted === 'string' ? properties.formatted.split(',')[0] : '') ||
    '';
  const addressType = String(
    properties.result_type ||
      properties.datasource?.sourcename ||
      properties.category ||
      properties.place_type ||
      '',
  ).toLowerCase();

  return {
    name: String(name || '').trim(),
    lat,
    lon,
    boundingbox: boundingBox,
    display_name: normalizeDisplayLabel(properties.formatted || properties.address_line1 || name),
    addresstype: addressType,
    class: addressType === 'administrative' ? 'boundary' : 'place',
    type: addressType,
    address: {
      city: properties.city || '',
      town: properties.town || '',
      village: properties.village || '',
      hamlet: properties.hamlet || '',
      municipality: properties.municipality || '',
      suburb: properties.suburb || '',
      quarter: properties.quarter || '',
      neighbourhood: properties.neighbourhood || '',
      county: properties.county || '',
      state: properties.state || '',
      region: properties.region || '',
      country: properties.country || '',
    },
  };
}

async function geocodePlaceWithNominatim(query) {
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
  const normalizedQuery = normalizeText(query);
  const directLocalityMatch = results.find((entry) => {
    const address = entry && typeof entry.address === 'object' ? entry.address : {};
    const labels = [
      entry?.name,
      address.city,
      address.town,
      address.village,
      address.hamlet,
      address.municipality,
      address.suburb,
      address.quarter,
      address.neighbourhood,
      typeof entry?.display_name === 'string' ? entry.display_name.split(',')[0] : '',
    ];

    return labels.some((label) => normalizeText(label) === normalizedQuery);
  });

  if (directLocalityMatch) {
    return directLocalityMatch;
  }
  return results.find((entry) => !isRegionResult(entry)) || results[0];
}

async function geocodePlaceWithGeoapify(query) {
  const cacheKey = getGeocodeCacheKey(query);
  const cachedResult = readTimedCache(geocodeCache, cacheKey, GEOCODE_CACHE_TTL_MS);
  if (cachedResult !== null) {
    return cachedResult;
  }

  const params = new URLSearchParams({
    text: query,
    apiKey: GEOAPIFY_API_KEY,
    limit: '5',
  });
  const response = await fetchJson(`${GEOAPIFY_GEOCODING_URL}/search?${params.toString()}`, {
    timeoutMs: GEOAPIFY_TIMEOUT_MS,
  });
  const results = Array.isArray(response?.features)
    ? response.features
        .map(normalizeGeoapifyFeature)
        .filter((entry) => entry && !Number.isNaN(entry.lat) && !Number.isNaN(entry.lon))
    : [];

  if (results.length === 0) {
    writeTimedCache(geocodeCache, cacheKey, null, GEOCODE_CACHE_MAX_ENTRIES);
    return null;
  }

  const normalizedQuery = normalizeText(query);
  const directLocalityMatch = results.find((entry) => {
    const address = entry && typeof entry.address === 'object' ? entry.address : {};
    const labels = [
      entry?.name,
      address.city,
      address.town,
      address.village,
      address.hamlet,
      address.municipality,
      address.suburb,
      address.quarter,
      address.neighbourhood,
      typeof entry?.display_name === 'string' ? entry.display_name.split(',')[0] : '',
    ];

    return labels.some((label) => normalizeText(label) === normalizedQuery);
  });

  const finalResult = directLocalityMatch || results.find((entry) => !isRegionResult(entry)) || results[0];
  writeTimedCache(geocodeCache, cacheKey, finalResult || null, GEOCODE_CACHE_MAX_ENTRIES);
  return finalResult;
}

async function geocodePlace(query) {
  if (GEOAPIFY_API_KEY) {
    try {
      return await geocodePlaceWithGeoapify(query);
    } catch (error) {
      console.warn(`[places] geoapify geocode failed for "${query}": ${error.message}`);
    }
  }

  return geocodePlaceWithNominatim(query);
}

async function geocodePlaceSuggestionsWithNominatim(query, limit = 6) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: String(Math.max(3, Math.min(limit * 2, 10))),
  });
  const results = await fetchJson(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    timeoutMs: NOMINATIM_TIMEOUT_MS,
  });
  if (!Array.isArray(results) || results.length === 0) return [];

  const filteredResults = results.filter((entry) => !isRegionResult(entry));
  const shortlist = filteredResults.length > 0 ? filteredResults : results;
  const seen = new Set();

  return shortlist
    .map((entry) => {
      const address = entry && typeof entry.address === 'object' ? entry.address : {};
      const name =
        entry?.name ||
        address.city ||
        address.town ||
        address.village ||
        address.hamlet ||
        address.municipality ||
        address.suburb ||
        address.quarter ||
        address.neighbourhood ||
        '';
      const locality =
        address.city ||
        address.town ||
        address.village ||
        address.hamlet ||
        address.municipality ||
        address.suburb ||
        address.quarter ||
        address.neighbourhood ||
        name;
      const region = address.state || address.county || address.region || '';
      const country = address.country || '';
      const boundingBox = Array.isArray(entry?.boundingbox) && entry.boundingbox.length === 4 ? entry.boundingbox.join(',') : '';
      const label = normalizeDisplayLabel(entry?.display_name || [locality, region, country].filter(Boolean).join(', '));
      return {
        id: `${entry?.osm_type || 'nominatim'}-${entry?.osm_id || entry?.place_id || name}`,
        name: String(name || locality || label).trim(),
        locality: String(locality || '').trim(),
        region: String(region || '').trim(),
        country: String(country || '').trim(),
        label,
        lat: toNumber(entry?.lat, NaN),
        lon: toNumber(entry?.lon, NaN),
        boundingBox,
        importance: Number(entry?.importance || 0),
      };
    })
    .filter((entry) => entry.name && entry.label && !Number.isNaN(entry.lat) && !Number.isNaN(entry.lon))
    .filter((entry) => {
      const dedupeKey = `${normalizeText(entry.name)}|${normalizeText(entry.label)}`;
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    })
    .sort((left, right) => right.importance - left.importance)
    .slice(0, limit);
}

async function geocodePlaceSuggestionsWithGeoapify(query, limit = 6) {
  const cacheKey = getPlaceSuggestionCacheKey(query, limit);
  const cachedSuggestions = readTimedCache(placeSuggestionCache, cacheKey, PLACE_SUGGESTION_CACHE_TTL_MS);
  if (cachedSuggestions !== null) {
    return cachedSuggestions;
  }

  const params = new URLSearchParams({
    text: query,
    apiKey: GEOAPIFY_API_KEY,
    limit: String(Math.max(3, Math.min(limit * 2, 10))),
  });
  const response = await fetchJson(`${GEOAPIFY_GEOCODING_URL}/autocomplete?${params.toString()}`, {
    timeoutMs: GEOAPIFY_TIMEOUT_MS,
  });
  const suggestions = Array.isArray(response?.features)
    ? response.features
        .map((feature) => {
          const normalized = normalizeGeoapifyFeature(feature);
          if (!normalized || Number.isNaN(normalized.lat) || Number.isNaN(normalized.lon) || isRegionResult(normalized)) {
            return null;
          }

          const address = normalized.address || {};
          const locality =
            address.city ||
            address.town ||
            address.village ||
            address.hamlet ||
            address.municipality ||
            address.suburb ||
            address.quarter ||
            normalized.name;
          const region = address.state || address.county || address.region || '';
          const country = address.country || '';

          return {
            id: `geoapify-${feature?.properties?.place_id || `${normalized.lat},${normalized.lon}`}`,
            name: String(normalized.name || locality || '').trim(),
            locality: String(locality || '').trim(),
            region: String(region || '').trim(),
            country: String(country || '').trim(),
            label: normalizeDisplayLabel(
              feature?.properties?.formatted || [locality, region, country].filter(Boolean).join(', '),
            ),
            lat: normalized.lat,
            lon: normalized.lon,
            boundingBox: Array.isArray(normalized.boundingbox) ? normalized.boundingbox.join(',') : '',
          };
        })
        .filter(
          (entry) =>
            entry &&
            entry.name &&
            entry.label &&
            !Number.isNaN(entry.lat) &&
            !Number.isNaN(entry.lon),
        )
        .slice(0, limit)
    : [];

  writeTimedCache(placeSuggestionCache, cacheKey, suggestions, PLACE_SUGGESTION_CACHE_MAX_ENTRIES);
  return suggestions;
}

async function geocodePlaceSuggestions(query, limit = 6) {
  if (GEOAPIFY_API_KEY) {
    try {
      return await geocodePlaceSuggestionsWithGeoapify(query, limit);
    } catch (error) {
      console.warn(`[places] geoapify suggest failed for "${query}": ${error.message}`);
    }
  }

  return geocodePlaceSuggestionsWithNominatim(query, limit);
}

function buildOverpassQuery({ lat, lon, categories, limit, radius }) {
  const rawLimit = Math.max(24, Math.min(limit * 10, 180));
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
  const attempts = OVERPASS_ENDPOINTS.map((endpoint) =>
    fetchJson(endpoint, {
      method: 'POST',
      timeoutMs: OVERPASS_TIMEOUT_MS,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: query,
    }).catch((error) => {
      throw {
        endpoint,
        message: error instanceof Error ? error.message : String(error || 'unknown_error'),
      };
    })
  );

  try {
    return await Promise.any(attempts);
  } catch (error) {
    const failures = Array.isArray(error?.errors) ? error.errors : [];
    failures.forEach((failure) => {
      console.warn(`[places] overpass failed via ${failure.endpoint}: ${failure.message}`);
    });
    throw new Error(failures[0]?.message || 'searchFailed');
  }
}

async function fetchOverpassPlaces({ lat, lon, categories, limit, boundingbox }) {
  const radiusPlan = [12000, 24000];
  const mergedElements = [];
  const seen = new Set();
  let lastError = null;

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

    if (mergedElements.length >= Math.max(limit * 3, 18)) {
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

  if (normalizedLocality === normalizedQuery) score += 34;
  else if (normalizedLocality.includes(normalizedQuery) && normalizedQuery) score += 18;

  if (normalizedAddress.includes(normalizedQuery) && normalizedQuery) score += 16;
  if (isPointInsideBoundingBox(entry.lat, entry.lon, boundingBox)) score += 16;
  if (entry.address) score += 8;
  if (entry.locality) score += 10;
  if (entry.website) score += 6;
  if (entry.phone) score += 3;
  if (entry.hasPowerSupply) score += 2;
  if (entry.hasToilets) score += 2;
  if (entry.hasShowers) score += 2;
  if (entry.hasDumpStation) score += 2;

  score += Math.max(0, 36 - Math.min(distanceKm * 1.2, 36));
  if (distanceKm <= 12) score += 10;
  else if (distanceKm <= 20) score += 4;
  score += Math.max(0, 10 - categoryPriority.indexOf(entry.category));

  return score;
}

function mergePreferredNearbyResults(entries, limit, searchContext) {
  const topEntries = entries.slice(0, limit);
  const selectedIds = new Set(topEntries.map((entry) => entry.id));

  const nearbyOutskirts = entries
    .filter((entry) => !selectedIds.has(entry.id))
    .filter((entry) => calculateDistanceKm(searchContext.lat, searchContext.lon, entry.lat, entry.lon) <= 12)
    .filter((entry) => !isPointInsideBoundingBox(entry.lat, entry.lon, searchContext.boundingBox))
    .filter((entry) => !isUnnamedPlace(entry.name));

  if (nearbyOutskirts.length === 0) {
    return topEntries;
  }

  const requiredNearby = Math.min(2, nearbyOutskirts.length);
  const preservedHead = topEntries.slice(0, Math.max(0, limit - requiredNearby));
  const merged = [...preservedHead, ...nearbyOutskirts.slice(0, requiredNearby)];
  const deduped = [];
  const seen = new Set();

  for (const entry of merged) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    deduped.push(entry);
  }

  for (const entry of topEntries) {
    if (deduped.length >= limit) break;
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    deduped.push(entry);
  }

  return deduped.slice(0, limit);
}

function searchPlacesInLocalIndex({ query, categories, limit, lat, lon, boundingBox }) {
  const entries = getPlaceIndexEntries();
  if (entries.length === 0) {
    return [];
  }

  const normalizedQuery = normalizeText(query);
  const categoryPriority = Array.isArray(categories) && categories.length > 0 ? categories : ['camp_site', 'caravan_site'];
  const candidates = entries.filter((entry) => {
    if (!categoryPriority.includes(entry.category)) {
      return false;
    }

    const distanceKm = calculateDistanceKm(lat, lon, entry.lat, entry.lon);
    const normalizedName = normalizeText(entry.name);
    const normalizedLocality = normalizeText(entry.locality);
    const normalizedAddress = normalizeText(entry.address);
    const matchesText =
      Boolean(normalizedQuery) &&
      (normalizedName.includes(normalizedQuery) ||
        normalizedLocality.includes(normalizedQuery) ||
        normalizedAddress.includes(normalizedQuery));

    if (distanceKm <= 45) {
      return true;
    }

    return matchesText;
  });

  const sortedResults = candidates.sort((left, right) => {
    const leftScore = scorePlaceResult(left, { lat, lon, query, categoryPriority, boundingBox });
    const rightScore = scorePlaceResult(right, { lat, lon, query, categoryPriority, boundingBox });
    return rightScore - leftScore;
  });

  const namedResults = sortedResults.filter((entry) => !isUnnamedPlace(entry.name));
  const unnamedResults = sortedResults.filter((entry) => isUnnamedPlace(entry.name));
  const orderedResults = [...namedResults, ...unnamedResults];

  return mergePreferredNearbyResults(orderedResults, limit, { lat, lon, boundingBox });
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

async function searchPlaces(query, categories, limit, locationOverride = null) {
  const cacheKey = getPlaceSearchCacheKey(query, categories, limit, locationOverride);
  const cachedResult = readPlaceSearchCache(cacheKey);
  if (cachedResult) return cachedResult;

  let lat = NaN;
  let lon = NaN;
  let boundingBox = null;

  if (locationOverride && Number.isFinite(locationOverride.lat) && Number.isFinite(locationOverride.lon)) {
    lat = Number(locationOverride.lat);
    lon = Number(locationOverride.lon);
    boundingBox = locationOverride.boundingBox || null;
  } else {
    const place = await geocodePlace(query);
    if (!place) return { results: [] };
    if (isRegionResult(place)) {
      return { error: 'region_not_supported' };
    }

    lat = toNumber(place.lat, NaN);
    lon = toNumber(place.lon, NaN);
    boundingBox = parseBoundingBox(place.boundingbox);
  }

  if (Number.isNaN(lat) || Number.isNaN(lon)) return { results: [] };

  const localIndexResults = searchPlacesInLocalIndex({
    query,
    categories,
    limit,
    lat,
    lon,
    boundingBox,
  });

  if (localIndexResults.length >= Math.min(limit, 4)) {
    const result = { results: localIndexResults };
    writePlaceSearchCache(cacheKey, result);
    return result;
  }

  let overpassData;
  try {
    overpassData = await fetchOverpassPlaces({
      lat,
      lon,
      categories,
      limit,
      boundingbox: boundingBox ? [boundingBox.south, boundingBox.north, boundingBox.west, boundingBox.east] : null,
    });
  } catch (error) {
    if (String(error?.message || '').startsWith('upstream_')) {
      if (localIndexResults.length > 0) {
        console.warn(
          `[places] upstream failure for "${query}" (${error.message}); returning ${localIndexResults.length} local index result(s)`
        );
        const partialResult = { results: localIndexResults };
        writePlaceSearchCache(cacheKey, partialResult);
        return partialResult;
      }
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
  const orderedResults = [...namedResults, ...unnamedResults];
  let results = mergePreferredNearbyResults(orderedResults, limit, { lat, lon, boundingBox });

  if (localIndexResults.length > 0) {
    const mergedResults = [...localIndexResults, ...results];
    const deduped = [];
    const seenResultIds = new Set();

    for (const entry of mergedResults) {
      if (seenResultIds.has(entry.id)) continue;
      seenResultIds.add(entry.id);
      deduped.push(entry);
    }

    const categoryPriority = Array.isArray(categories) && categories.length > 0 ? categories : ['camp_site', 'caravan_site'];
    const reSorted = deduped.sort((left, right) => {
      const leftScore = scorePlaceResult(left, { lat, lon, query, categoryPriority, boundingBox });
      const rightScore = scorePlaceResult(right, { lat, lon, query, categoryPriority, boundingBox });
      return rightScore - leftScore;
    });
    results = mergePreferredNearbyResults(reSorted, limit, { lat, lon, boundingBox });
  }

  const result = { results };
  writePlaceSearchCache(cacheKey, result);
  return result;
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
  const host = String(req.headers.host || '').toLowerCase();
  const pathname = url.pathname;

  try {
    if (host.startsWith('www.campingroute.app')) {
      const redirectUrl = `https://campingroute.app${url.pathname}${url.search}`;
      res.writeHead(308, { Location: redirectUrl });
      res.end();
      return;
    }

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
      const generations = incrementGeneration(body?.mode, body?.details);
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
      if (isRateLimited(req, 'search')) {
        sendJson(res, 429, { error: 'rateLimited' });
        return;
      }

      const query = String(url.searchParams.get('q') || '').trim();
      const limit = Math.max(1, Math.min(toNumber(url.searchParams.get('limit'), 8), 12));
      const lat = toNumber(url.searchParams.get('lat'), NaN);
      const lon = toNumber(url.searchParams.get('lon'), NaN);
      const bboxRaw = String(url.searchParams.get('bbox') || '').trim();
      const bboxParts = bboxRaw ? bboxRaw.split(',').map((entry) => entry.trim()) : [];
      const overrideBoundingBox = bboxParts.length === 4 ? parseBoundingBox(bboxParts) : null;
      const categories = url.searchParams
        .getAll('category')
        .map((entry) => String(entry || '').trim())
        .filter((entry) => ALLOWED_PLACE_CATEGORIES.has(entry));

      if (query.length < 2 || categories.length === 0) {
        sendJson(res, 400, { error: 'searchFailed' });
        return;
      }

      const locationOverride =
        Number.isFinite(lat) && Number.isFinite(lon)
          ? { lat, lon, boundingBox: overrideBoundingBox }
          : null;

      const placeSearch = await searchPlaces(query, categories, limit, locationOverride);
      if (placeSearch.error) {
        sendJson(res, 400, { error: placeSearch.error });
        return;
      }

      sendJson(res, 200, { results: placeSearch.results || [] });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/places/suggest') {
      if (isRateLimited(req, 'suggest')) {
        sendJson(res, 429, { error: 'rateLimited' });
        return;
      }

      const query = String(url.searchParams.get('q') || '').trim();
      const limit = Math.max(1, Math.min(toNumber(url.searchParams.get('limit'), 6), 8));

      if (query.length < 2) {
        sendJson(res, 200, { suggestions: [] });
        return;
      }

      const suggestions = await geocodePlaceSuggestions(query, limit);
      sendJson(res, 200, { suggestions });
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
  ensureJsonFile(COUNTER_PATH, createCounterDefaults());
  ensureJsonFile(FEEDBACK_PATH, { feedback: [] });
  loadPlaceIndexFromDisk();
  console.log(`Server läuft auf http://${HOST}:${PORT}`);
  console.log(`Dist: ${DIST_DIR}`);
  console.log(`Data: ${DATA_DIR}`);
  if (placeIndexState.entries.length > 0) {
    console.log(`Place index: ${placeIndexState.entries.length} Einträge aus ${placeIndexState.path}`);
  } else if (placeIndexState.error) {
    console.warn(`Place index konnte nicht geladen werden (${placeIndexState.path}): ${placeIndexState.error}`);
  } else {
    console.log(`Place index: nicht vorhanden (${placeIndexState.path}), Overpass-Fallback aktiv`);
  }
});
