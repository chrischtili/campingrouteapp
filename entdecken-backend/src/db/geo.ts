import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');

export const TARGET_COUNTRIES = [
  'DE', 'AT', 'CH', 'DK', 'NO', 'SE', 'FR', 'IT', 'NL', 'BE', 'LU', 'FI',
  'ES', 'PT', 'HR', 'GR', 'SI', 'CZ', 'PL', 'HU', 'GB'
];

// German + English country names used to strip trailing "Deutschland"-style segments
// from addresses and to localize generated descriptions.
export const COUNTRY_NAMES: { [key: string]: string } = {
  DE: 'Deutschland',
  AT: 'Österreich',
  CH: 'Schweiz',
  DK: 'Dänemark',
  NO: 'Norwegen',
  SE: 'Schweden',
  FR: 'Frankreich',
  IT: 'Italien',
  NL: 'Niederlande',
  BE: 'Belgien',
  LU: 'Luxemburg',
  FI: 'Finnland',
  ES: 'Spanien',
  PT: 'Portugal',
  HR: 'Kroatien',
  GR: 'Griechenland',
  SI: 'Slowenien',
  CZ: 'Tschechien',
  PL: 'Polen',
  HU: 'Ungarn',
  GB: 'Großbritannien'
};

const COUNTRY_NAME_ALIASES = new Set<string>([
  ...Object.values(COUNTRY_NAMES).map(n => n.toLowerCase()),
  ...['germany', 'austria', 'switzerland', 'denmark', 'norway', 'sweden', 'france', 'italy', 'netherlands', 'holland', 'belgium', 'luxembourg', 'finland', 'europe',
    'spain', 'portugal', 'croatia', 'greece', 'slovenia', 'czechia', 'czech', 'czech republic', 'poland', 'hungary', 'united kingdom', 'uk', 'great britain', 'england', 'scotland', 'wales']
]);

// Loose bounding boxes per country used as a first geofence during imports.
// Precise polygon validation happens in the data-quality migration.
export const COUNTRY_BBOXES: { [key: string]: [number, number, number, number] } = {
  DE: [47.0, 5.8, 55.2, 15.2],
  AT: [46.2, 9.5, 49.1, 17.2],
  CH: [45.8, 5.9, 47.9, 10.5],
  DK: [54.5, 8.0, 57.9, 12.8],
  NO: [57.9, 4.5, 71.3, 31.3],
  SE: [55.3, 10.9, 69.1, 24.2],
  FR: [41.3, -5.2, 51.1, 9.6],
  IT: [36.6, 6.6, 47.1, 18.6],
  NL: [50.7, 3.3, 53.7, 7.2],
  BE: [49.5, 2.5, 51.5, 6.4],
  LU: [49.4, 5.7, 50.2, 6.6],
  FI: [59.8, 19.5, 70.1, 31.6],
  ES: [35.9, -9.5, 43.9, 4.4],
  PT: [36.9, -9.6, 42.2, -6.2],
  HR: [42.3, 13.4, 46.6, 19.5],
  GR: [34.8, 19.4, 41.8, 29.6],
  SI: [45.4, 13.4, 46.9, 16.6],
  CZ: [48.5, 12.1, 51.1, 18.9],
  PL: [49.0, 14.1, 55.0, 24.2],
  HU: [45.7, 16.1, 48.6, 22.9],
  GB: [49.8, -8.7, 60.9, 1.8]
};

interface PolygonFeature {
  code: string;
  bbox: [number, number, number, number]; // minLon, minLat, maxLon, maxLat
  coordinates: any[][][]; // either Polygon ring(s) or MultiPolygon rings
}

let countriesCache: PolygonFeature[] | null = null;

async function ensureDataDir(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function download(url: string, dest: string): Promise<void> {
  await ensureDataDir();
  const res = await fetch(url, { headers: { 'User-Agent': 'CampingRoute/1.0 (christian.projekte@campingroute.app)' } });
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function loadJson(url: string, filename: string): Promise<any> {
  await ensureDataDir();
  const dest = path.join(DATA_DIR, filename);
  if (!fs.existsSync(dest)) {
    await download(url, dest);
    console.log(`[geo] Downloaded ${filename} (cached to ${dest}).`);
  }
  return JSON.parse(fs.readFileSync(dest, 'utf-8'));
}

function pointInRing(point: [number, number], ring: number[][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point: [number, number], coordinates: any[][][]): boolean {
  for (const poly of coordinates) {
    const ring = poly[0];
    if (ring && ring.length >= 3) {
      // skip "hole" rings; outer ring is the first
      if (pointInRing(point, ring)) {
        // ensure not in a hole (subsequent rings)
        let inHole = false;
        for (let h = 1; h < poly.length; h++) {
          if (poly[h].length >= 3 && pointInRing(point, poly[h])) { inHole = true; break; }
        }
        if (!inHole) return true;
      }
    }
  }
  return false;
}

function geometryToCoordinates(geometry: any): any[][][] {
  if (geometry.type === 'Polygon') {
    return [geometry.coordinates];
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates;
  }
  return [];
}

function computeBbox(coordinates: any[][][]): [number, number, number, number] {
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  for (const poly of coordinates) {
    const ring = poly[0];
    if (!ring) continue;
    for (const pt of ring) {
      if (pt[0] < minLon) minLon = pt[0];
      if (pt[0] > maxLon) maxLon = pt[0];
      if (pt[1] < minLat) minLat = pt[1];
      if (pt[1] > maxLat) maxLat = pt[1];
    }
  }
  return [minLon, minLat, maxLon, maxLat];
}

/**
 * Load a cached world countries GeoJSON (Natural Earth 110m admin_0) and return
 * compact polygon features keyed by ISO 3166-1 alpha-2 code.
 */
export async function loadCountries(): Promise<PolygonFeature[]> {
  if (countriesCache) return countriesCache;
  const geo = await loadJson(
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
    'countries-110m.geojson'
  );
  const features: PolygonFeature[] = [];
  for (const feature of geo.features || []) {
    // Prefer the "everyone" (EH) code: in Natural Earth, France and Norway carry
    // ISO_A2="-99" because of disputed territories, with the real code in ISO_A2_EH.
    const props = feature.properties || {};
    let code = ((props.ISO_A2_EH || props.ISO_A2 || '').trim()).toUpperCase();
    if (!code || code === '-99') continue;
    const coordinates = geometryToCoordinates(feature.geometry);
    if (coordinates.length === 0) continue;
    features.push({ code, bbox: computeBbox(coordinates), coordinates });
  }
  countriesCache = features;
  return features;
}

/**
 * Return the ISO country code containing the given point, or null if the point
 * falls outside all known polygons (e.g. open sea).
 */
export function pointInCountry(lat: number, lon: number, countries?: PolygonFeature[]): string | null {
  const features = countries || countriesCache || [];
  for (const feature of features) {
    const [minLon, minLat, maxLon, maxLat] = feature.bbox;
    if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) continue;
    if (pointInPolygon([lon, lat], feature.coordinates)) {
      return feature.code;
    }
  }
  return null;
}

/**
 * Best-effort parsing of a free-form address into street, postal code and city.
 * Falls back to empty strings when the input is not structured enough.
 */
export function extractAddressParts(address: string | null | undefined): { street: string; postal_code: string; city: string } {
  const empty = { street: '', postal_code: '', city: '' };
  if (!address) return empty;

  let parts = address.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return empty;

  // Strip trailing country name segment (e.g. "Deutschland", "Norway", "Europe")
  const lastLower = parts[parts.length - 1].toLowerCase();
  if (COUNTRY_NAME_ALIASES.has(lastLower)) parts.pop();
  if (parts.length === 0) return empty;

  let street = '';
  let postal = '';
  let city = '';

  // Prefer a segment containing a postal code (4-5 digits).
  for (let i = parts.length - 1; i >= 0; i--) {
    const seg = parts[i];
    const pm = seg.match(/\b(\d{4,5})\b/);
    if (pm) {
      postal = pm[1];
      const rest = seg.slice(seg.indexOf(pm[1]) + pm[1].length).trim().replace(/^[\s,-]+/, '');
      if (rest.length >= 2 && !/^\d+$/.test(rest)) {
        city = rest;
      } else if (i > 0) {
        city = parts[i - 1];
      }
      street = parts.slice(0, i).join(', ');
      break;
    }
  }

  if (!postal) {
    if (parts.length >= 2) {
      city = parts[parts.length - 1];
      street = parts.slice(0, -1).join(', ');
    } else {
      const seg = parts[0];
      if (/\d/.test(seg)) {
        street = seg;
      } else if (seg.length >= 2 && !COUNTRY_NAME_ALIASES.has(seg.toLowerCase())) {
        city = seg;
      }
    }
  }

  if (/^europe$/i.test(city)) city = '';
  // Clean up over-long "cities" that are actually full addresses
  if (city && (city.length > 60 || /^\d+$/.test(city))) city = '';

  return { street, postal_code: postal, city };
}

function extractNumbers(s: string): number[] {
  // Handles "12,50", "12.50", "1.700" (thousands), "0,40€/h"
  const matches = s.match(/\d[\d\s]*[.,]?\d*/g) || [];
  return matches
    .map(m => {
      const t = m.replace(/\s/g, '').replace(/\.(?=\d{3}$)/, '');
      const n = parseFloat(t.replace(/,/g, '.'));
      return isFinite(n) ? n : NaN;
    })
    .filter(n => !isNaN(n) && n <= 100000);
}

function extractCurrency(s: string): string | null {
  const lower = s.toLowerCase();
  if (/(€|eur)/.test(lower)) return 'EUR';
  if (/chf|sfr/.test(lower)) return 'CHF';
  if (/sek/.test(lower)) return 'SEK';
  if (/nok/.test(lower)) return 'NOK';
  if (/dkk/.test(lower)) return 'DKK';
  if (/\$|usd/.test(lower)) return 'USD';
  if (/gbp|£/.test(lower)) return 'GBP';
  if (/czk|kč|kč/.test(lower)) return 'CZK';
  return null;
}

/**
 * Parse the free-form price column into structured fields. The raw string stays
 * in `price` for display; the structured fields enable filtering/comparison.
 */
export function parsePrice(price: string | null | undefined): {
  price_min: number | null;
  price_max: number | null;
  currency: string | null;
  is_free: boolean;
} {
  const out = { price_min: null as number | null, price_max: null as number | null, currency: null as string | null, is_free: false };
  if (!price) return out;
  const p = String(price).trim();
  if (!p) return out;
  const lower = p.toLowerCase();

  const nums = extractNumbers(p);
  const positive = nums.filter(n => n > 0);

  if (/(kostenlos|free|gratis|kein eintritt)/.test(lower)) {
    if (positive.length === 0) {
      out.is_free = true;
      return out;
    }
  }

  if (nums.length > 0) {
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    if (min === 0 && max === 0) {
      out.is_free = true;
      return out;
    }
    out.price_min = min;
    out.price_max = max;
  }

  out.currency = extractCurrency(p);
  return out;
}

/**
 * Data-completeness based rating. The old random ratings were meaningless; this
 * produces a stable, defensible quality score that rewards verified, documented
 * places so that ORDER BY rating actually means something.
 */
export function computeRating(opts: {
  hasWebsite: boolean;
  hasPhone: boolean;
  hasCity: boolean;
  hasDescription: boolean;
  hasAmenities: boolean;
  isAttraction: boolean;
}): number {
  let r = 3.9;
  if (opts.hasWebsite) r += 0.3;
  if (opts.hasPhone) r += 0.1;
  if (opts.hasCity) r += 0.1;
  if (opts.hasDescription) r += 0.2;
  if (opts.hasAmenities) r += 0.1;
  if (opts.isAttraction) r += 0.1;
  return Math.min(5, Math.round(r * 10) / 10);
}

/**
 * Generate an honest, localized German description when no real description is
 * available. Always truthful (type + location), never fabricated content.
 */
export function buildGenericDescription(
  type: string,
  city: string | null | undefined,
  state: string | null | undefined,
  country: string
): string {
  const labels: { [key: string]: string } = {
    campground: 'Campingplatz',
    caravan: 'Wohnmobilstellplatz',
    glamping: 'Glamping-Platz',
    attraction: 'Sehenswürdigkeit'
  };
  const label = labels[type] || 'Platz';
  const loc = [city, state].filter(Boolean).join(', ');
  if (loc) {
    return `${label} in ${loc}, ${COUNTRY_NAMES[country] || country}.`;
  }
  return `${label} in ${COUNTRY_NAMES[country] || country}.`;
}

// --- Subdivision (state/region) assignment for countries we have precise
// polygon data for: DE, AT, CH, FR, IT. Names are normalized to German labels
// used consistently across the app (see REGIONS_BY_COUNTRY in the frontend).

const SUBDIVISION_SOURCES: { [key: string]: { url: string; nameKey: string; map?: { [k: string]: string } } } = {
  DE: {
    url: 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/germany.geojson',
    nameKey: 'properties.name'
  },
  AT: {
    url: 'https://raw.githubusercontent.com/ginseng666/GeoJSON-TopoJSON-Austria/master/2021/simplified-95/laender_95_geo.json',
    nameKey: 'properties.name'
  },
  CH: {
    url: 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/switzerland.geojson',
    nameKey: 'properties.name',
    map: {
      'Graubünden / Grigioni / Grischun': 'Graubünden',
      'Graubünden': 'Graubünden',
      'Valais / Wallis': 'Wallis',
      'Valais': 'Wallis',
      'Wallis': 'Wallis',
      'Ticino': 'Tessin',
      'Tessin': 'Tessin',
      'Bern / Berne': 'Bern',
      'Bern': 'Bern',
      'Zürich': 'Zürich',
      'Luzern': 'Luzern',
      'Fribourg': 'Freiburg',
      'Vaud': 'Waadt',
      'Neuchâtel': 'Neuenburg',
      'Genève': 'Genf'
    }
  },
  FR: {
    url: 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions.geojson',
    nameKey: 'properties.nom'
  },
  NL: {
    url: 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/the-netherlands.geojson',
    nameKey: 'properties.name'
  },
  IT: {
    url: 'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson',
    nameKey: 'properties.reg_name',
    map: {
      'Piemonte': 'Piemont',
      "Valle d'Aosta/Vallée d'Aoste": 'Aostatal',
      "Valle d'Aosta": 'Aostatal',
      'Lombardia': 'Lombardei',
      'Trentino-Alto Adige/Südtirol': 'Trentino-Südtirol',
      'Trentino-Alto Adige': 'Trentino-Südtirol',
      'Veneto': 'Venetien',
      'Friuli-Venezia Giulia': 'Friaul-Julisch Venetien',
      'Liguria': 'Ligurien',
      'Emilia-Romagna': 'Emilia-Romagna',
      'Toscana': 'Toskana',
      'Umbria': 'Umbrien',
      'Marche': 'Marken',
      'Lazio': 'Latium',
      'Abruzzo': 'Abruzzen',
      'Molise': 'Molise',
      'Campania': 'Kampanien',
      'Puglia': 'Apulien',
      'Basilicata': 'Basilikata',
      'Calabria': 'Kalabrien',
      'Sicilia': 'Sizilien',
      'Sardegna': 'Sardinien'
    }
  }
};

interface SubdivisionFeature {
  name: string;
  bbox: [number, number, number, number];
  coordinates: any[][][];
}

let subdivisionCache: { [key: string]: SubdivisionFeature[] } = {};

export async function loadSubdivisions(country: string): Promise<SubdivisionFeature[]> {
  if (subdivisionCache[country]) return subdivisionCache[country];
  const src = SUBDIVISION_SOURCES[country];
  if (!src) return [];

  const filename = `subdivisions-${country.toLowerCase()}.geojson`;
  const geo = await loadJson(src.url, filename);
  const features: SubdivisionFeature[] = [];
  for (const feature of geo.features || []) {
    const nameRaw = src.nameKey.split('.').reduce((o, k) => (o ? o[k] : undefined), feature) as string | undefined;
    if (!nameRaw) continue;
    const name = (src.map && src.map[nameRaw]) || nameRaw;
    const coordinates = geometryToCoordinates(feature.geometry);
    if (coordinates.length === 0) continue;
    features.push({ name, bbox: computeBbox(coordinates), coordinates });
  }
  subdivisionCache[country] = features;
  return features;
}

/**
 * Determine the state/region for a coordinate in DE, AT, CH, FR or IT. Returns
 * null for unsupported countries or if the point is outside all polygons.
 */
export async function assignState(country: string, lat: number, lon: number): Promise<string | null> {
  if (!SUBDIVISION_SOURCES[country]) return null;
  const features = await loadSubdivisions(country);
  for (const feature of features) {
    const [minLon, minLat, maxLon, maxLat] = feature.bbox;
    if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) continue;
    if (pointInPolygon([lon, lat], feature.coordinates)) {
      return feature.name;
    }
  }
  return null;
}

/**
 * Build the amenities string strictly from known OSM tags. Returns '' when
 * nothing is actually known (never invents defaults).
 */
export function buildAmenitiesFromTags(tags: any, type: string): string {
  const list: string[] = [];
  if (tags.power_supply === 'yes' || tags.power_supply === 'some') list.push('hookups');
  if (tags.water === 'yes') list.push('water');
  if (tags.internet_access && tags.internet_access !== 'no') list.push('wifi');
  if (tags.shower === 'yes') list.push('showers');
  if (tags.toilets === 'yes') list.push('toilets');
  if (tags.fee === 'no') list.push('free');
  if (tags.pets === 'yes') list.push('pets-allowed');
  if (tags.playground === 'yes') list.push('playground');
  if (tags.sauna === 'yes') list.push('sauna');
  if (tags.swimming_pool === 'yes' || tags.leisure === 'swimming_pool') list.push('pool');
  if (tags.shop === 'yes' || tags.shop) list.push('shop');
  if (tags.restaurant === 'yes' || tags.food === 'yes') list.push('restaurant');
  if (tags.barrier === 'entrance') list.push('beach');
  if (type === 'glamping') list.push('glamping');
  return list.join(',');
}
