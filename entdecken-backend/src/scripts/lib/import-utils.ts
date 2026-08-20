import { Database } from 'sqlite';
import {
  buildAmenitiesFromTags,
  buildGenericDescription,
  computeRating,
  extractAddressParts,
  parsePrice,
  COUNTRY_NAMES
} from '../../db/geo.js';

/**
 * Normalized representation of a place used by all importers so that every
 * source writes the full, structured schema (no more invented data).
 */
export interface NormalizedPlace {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string | null;
  city?: string | null;
  postal_code?: string | null;
  street?: string | null;
  description?: string | null;
  amenities?: string | null;
  image_url?: string | null;
  rating?: number | null;
  price?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  currency?: string | null;
  is_free?: boolean;
  contact?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  osm_id?: string | null;
  source?: string;
  data_quality?: number;
}

export interface OsmTags {
  name?: string;
  description?: string;
  'addr:country'?: string;
  'addr:city'?: string;
  'addr:street'?: string;
  'addr:housenumber'?: string;
  'addr:postcode'?: string;
  website?: string;
  phone?: string;
  'contact:website'?: string;
  'contact:phone'?: string;
  fee?: string;
  charge?: string;
  glamping?: string;
  cabin?: string;
  yurt?: string;
  [key: string]: string | undefined;
}

export function determineType(rawTourism: string | undefined, tags: OsmTags): string {
  let type = rawTourism === 'camp_site' ? 'campground' :
    rawTourism === 'caravan_site' ? 'caravan' : 'attraction';
  if (tags.glamping === 'yes' || tags.cabin === 'yes' || tags.yurt === 'yes') {
    type = 'glamping';
  }
  return type;
}

function cleanContactValue(v: string | undefined): string | null {
  const t = (v || '').trim();
  if (!t || t === 'N/A' || t === '-') return null;
  return t;
}

/**
 * Build the contact/website/phone fields from raw OSM contact tags.
 */
export function buildContact(phoneRaw?: string, websiteRaw?: string): {
  contact: string;
  website: string | null;
  phone: string | null;
} {
  const phone = cleanContactValue(phoneRaw);
  const website = cleanContactValue(websiteRaw);
  const parts = [phone, website].filter(Boolean);
  return {
    contact: parts.length > 0 ? parts.join(' | ') : 'N/A',
    website,
    phone
  };
}

/**
 * Build a full address string plus structured parts from OSM addr tags.
 */
export function buildAddress(tags: OsmTags, country: string): {
  address: string;
  city: string | null;
  postal_code: string | null;
  street: string | null;
} {
  const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ') || null;
  const city = cleanContactValue(tags['addr:city']) || null;
  const postal = cleanContactValue(tags['addr:postcode']) || null;
  const address = [street, postal, city].filter(Boolean).join(', ') || COUNTRY_NAMES[country] || country;

  // Fallback: try to parse whatever address-like text we got
  let c = city, p = postal, s = street;
  if (!c && !p && !s) {
    const parts = extractAddressParts(address);
    c = parts.city || null;
    p = parts.postal_code || null;
    s = parts.street || null;
  }
  return { address, city: c, postal_code: p, street: s };
}

export interface OsmPlaceInput {
  id: string;
  tags: OsmTags;
  lat: number;
  lon: number;
  country: string;
  osmId: string;
  source?: string;
}

/**
 * Build a fully normalized place record from an OSM element. Never invents
 * ratings or amenities — everything derives from real tags.
 */
export function osmToPlace(input: OsmPlaceInput): NormalizedPlace {
  const { id, tags, lat, lon, country, osmId, source } = input;
  const type = determineType(tags.tourism, tags);
  const { contact, website, phone } = buildContact(
    tags.phone || tags['contact:phone'],
    tags.website || tags['contact:website']
  );
  const { address, city, postal_code, street } = buildAddress(tags, country);
  const amenities = buildAmenitiesFromTags(tags, type);
  const price = tags.charge || (tags.fee === 'no' ? 'Free' : null);
  const parsed = price ? parsePrice(price) : { price_min: null, price_max: null, currency: null, is_free: false };

  const rawDescription = cleanContactValue(tags.description);
  const description = rawDescription || buildGenericDescription(type, city, stateOf(tags), country);
  const hasRealDescription = !!rawDescription;

  const rating = computeRating({
    hasWebsite: !!website,
    hasPhone: !!phone,
    hasCity: !!city,
    hasDescription: hasRealDescription,
    hasAmenities: amenities.length > 0,
    isAttraction: type === 'attraction'
  });

  const dataQuality = (city ? 1 : 0) + (website ? 1 : 0) + (hasRealDescription ? 1 : 0) + (amenities ? 1 : 0);

  return {
    id,
    name: tags.name || '',
    type,
    latitude: lat,
    longitude: lon,
    country,
    city,
    postal_code,
    street,
    description,
    amenities: amenities || null,
    rating,
    price: price || null,
    price_min: parsed.price_min,
    price_max: parsed.price_max,
    currency: parsed.currency,
    is_free: parsed.is_free,
    contact,
    website,
    phone,
    address,
    osm_id: osmId,
    source: source || 'osm'
  };
}

function stateOf(tags: OsmTags): string | null {
  // Importers typically don't have state info; kept as a hook for future tag mapping
  return null;
}

/**
 * Insert (or update) a normalized place into the database.
 *
 * NOTE: deliberately NOT "INSERT OR REPLACE": REPLACE silently drops the
 * conflicting row without firing the AFTER DELETE trigger, which leaves orphaned
 * entries in the FTS5 index. ON CONFLICT DO UPDATE fires the AFTER UPDATE
 * trigger instead (same rowid), keeping the search index perfectly in sync.
 */
export async function upsertPlace(db: Database, p: NormalizedPlace): Promise<void> {
  await db.run(
    `INSERT INTO places (
      id, name, type, latitude, longitude, country, state, city, postal_code, street,
      description, amenities, image_url, rating, review_count, price, price_min, price_max,
      currency, is_free, contact, website, phone, address, osm_id, source, data_quality, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, type = excluded.type, latitude = excluded.latitude, longitude = excluded.longitude,
      country = excluded.country, state = excluded.state, city = excluded.city, postal_code = excluded.postal_code,
      street = excluded.street, description = excluded.description, amenities = excluded.amenities,
      image_url = excluded.image_url, rating = excluded.rating, price = excluded.price,
      price_min = excluded.price_min, price_max = excluded.price_max, currency = excluded.currency,
      is_free = excluded.is_free, contact = excluded.contact, website = excluded.website, phone = excluded.phone,
      address = excluded.address, osm_id = excluded.osm_id, source = excluded.source,
      data_quality = excluded.data_quality, last_updated = excluded.last_updated`,
    [
      p.id, p.name, p.type, p.latitude, p.longitude, p.country, p.state || null, p.city || null,
      p.postal_code || null, p.street || null, p.description || null, p.amenities || null,
      p.image_url || null, p.rating ?? 4.0, p.price || null, p.price_min ?? null, p.price_max ?? null,
      p.currency || null, p.is_free ? 1 : 0, p.contact || 'N/A', p.website || null, p.phone || null,
      p.address || null, p.osm_id || null, p.source || null, p.data_quality ?? 1, new Date().toISOString()
    ]
  );
}
