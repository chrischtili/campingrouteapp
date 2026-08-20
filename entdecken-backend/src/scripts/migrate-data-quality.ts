import { getDb } from '../db/db.js';
import {
  TARGET_COUNTRIES,
  loadCountries,
  pointInCountry,
  assignState,
  extractAddressParts,
  parsePrice,
  computeRating,
  buildGenericDescription,
  COUNTRY_NAMES
} from '../db/geo.js';

const GENERIC_DESCRIPTION_RE =
  /^(A verified|A beautiful|A historic site and popular travel destination|Ein wunderschöner, verifizierter|A [a-z]+ located in)/i;

function stripImages(description: string | null | undefined): { text: string; imageUrl: string | null } {
  if (!description) return { text: '', imageUrl: null };
  const matches = [...description.matchAll(/!\[.*?\]\((.*?)\)/g)];
  const imageUrl = matches.length > 0 ? matches[0][1].trim() : null;
  const text = description.replace(/!\[.*?\]\(.*?\)/g, '').trim();
  return { text, imageUrl };
}

function isGenericDescription(text: string): boolean {
  return GENERIC_DESCRIPTION_RE.test(text.trim());
}

async function run() {
  const db = await getDb();
  console.log('Loading country polygons...');
  const countries = await loadCountries();

  console.log('Loading review statistics...');
  const reviewStats = await db.all(`
    SELECT place_id, COUNT(*) as cnt, ROUND(AVG(rating), 1) as avgRating
    FROM reviews GROUP BY place_id
  `);
  const reviewMap = new Map<string, { cnt: number; avgRating: number }>();
  for (const r of reviewStats) {
    reviewMap.set(r.place_id, { cnt: r.cnt, avgRating: r.avgRating });
  }

  console.log('Loading places...');
  const places = await db.all('SELECT * FROM places');
  console.log(`Loaded ${places.length} places.`);

  const deleteIds: string[] = [];
  let reassigned = 0;
  let fixedCity = 0;
  let fixedPrice = 0;
  let fixedImage = 0;
  let fixedDesc = 0;
  let fixedAmenities = 0;
  let fixedRating = 0;
  let fixedState = 0;

  const upd = await db.prepare(`
    UPDATE places SET
      country = ?, state = ?, city = ?, postal_code = ?, street = ?,
      description = ?, amenities = ?, image_url = ?, rating = ?, review_count = ?,
      price_min = ?, price_max = ?, currency = ?, is_free = ?,
      website = ?, phone = ?, source = ?, data_quality = ?, last_updated = ?
    WHERE id = ?
  `);

  for (const p of places) {
    // 1. Correct / validate country using real polygons
    const trueCountry = pointInCountry(p.latitude, p.longitude, countries);
    let country = p.country.toUpperCase();

    if (trueCountry && !TARGET_COUNTRIES.includes(trueCountry)) {
      // Clearly outside our target region (e.g. Poland, Czechia) -> remove
      deleteIds.push(p.id);
      continue;
    }
    if (!trueCountry && !TARGET_COUNTRIES.includes(country)) {
      // Cannot validate and not a target country -> remove
      deleteIds.push(p.id);
      continue;
    }
    if (trueCountry && trueCountry !== country) {
      country = trueCountry;
      reassigned++;
    }

    // 2. State/region assignment for countries with polygon data
    let state = p.state || null;
    if (['DE', 'AT', 'CH', 'FR', 'IT', 'NL'].includes(country)) {
      const assigned = await assignState(country, p.latitude, p.longitude);
      if (assigned) {
        if (assigned !== state) fixedState++;
        state = assigned;
      } else if (country !== p.country) {
        state = null;
      }
    }

    // 3. Address -> structured parts
    const addr = extractAddressParts(p.address);
    if (addr.city) fixedCity++;
    if (addr.postal_code || addr.city || addr.street) {
      // only overwrite address fields we actually extracted
      if (!addr.city && state && p.address && p.address.toLowerCase().includes(state.toLowerCase())) {
        addr.city = state;
      }
    }

    // 4. Extract image from description
    const { text: descText, imageUrl } = stripImages(p.description);
    const existingImage = imageUrl || p.image_url || null;
    if (imageUrl) fixedImage++;

    // 5. Honest description for generic placeholders
    let description = descText || p.description || '';
    const isGeneric = isGenericDescription(description) || (description === '' && !p.description);
    if (isGeneric) {
      description = buildGenericDescription(p.type, addr.city || null, state, country);
      fixedDesc++;
    }

    // 6. Remove invented default amenities (they were fake placeholders)
    let amenities = p.amenities || '';
    if (amenities === 'wifi,showers' || amenities === 'parking,restrooms,guided-tours,photography') {
      amenities = '';
      fixedAmenities++;
    }

    // 7. Rating: real reviews win, otherwise a data-quality based score
    const rev = reviewMap.get(p.id);
    let rating = p.rating ?? 4.0;
    const reviewCount = rev ? rev.cnt : 0;
    if (rev && rev.cnt > 0) {
      rating = rev.avgRating;
    } else {
      const newRating = computeRating({
        hasWebsite: !!(p.website || (p.contact && p.contact.includes('http'))),
        hasPhone: !!(p.phone || (p.contact && p.contact.includes('|'))),
        hasCity: !!addr.city,
        hasDescription: !isGeneric,
        hasAmenities: amenities.length > 0,
        isAttraction: p.type === 'attraction'
      });
      if (Math.abs(newRating - (p.rating ?? 0)) > 0.001) fixedRating++;
      rating = newRating;
    }

    // 8. Normalized price fields
    const price = p.price || null;
    const parsed = price ? parsePrice(price) : { price_min: null, price_max: null, currency: null, is_free: false };
    if (parsed.price_min !== null || parsed.currency || parsed.is_free) fixedPrice++;

    // 9. Website / phone from structured contact
    let website = p.website || null;
    let phone = p.phone || null;
    if (!website && p.contact) {
      const m = p.contact.match(/https?:\/\/[^\s|]+/i);
      if (m) website = m[0];
    }
    if (!phone && p.contact) {
      const seg = p.contact.split('|').map((s: string) => s.trim()).find((s: string) => /^[+0-9(][0-9\s()/.-]{5,}$/.test(s));
      if (seg) phone = seg;
    }

    // 10. Source
    let source = p.source || null;
    if (!source) {
      if (p.id.startsWith('wikidata-') || (p.osm_id || '').startsWith('wikidata-')) source = 'wikidata';
      else if (p.id.startsWith('custom-')) source = 'custom';
      else if (p.id.startsWith('osm-')) source = 'osm';
    }

    // 11. Data quality score (0 = basic, 2 = rich)
    let dq = 0;
    if (addr.city) dq++;
    if (website) dq++;
    if (!isGeneric && description) dq++;
    if (amenities) dq++;
    if (dq >= 3) dq = 2;
    else if (dq >= 1) dq = 1;

    await upd.run(
      country, state, addr.city || null, addr.postal_code || null, addr.street || null,
      description, amenities || null, existingImage, rating, reviewCount,
      parsed.price_min, parsed.price_max, parsed.currency, parsed.is_free ? 1 : 0,
      website, phone, source, dq, new Date().toISOString(),
      p.id
    );
  }
  await upd.finalize();

  // Delete rows that are not in the target region
  if (deleteIds.length > 0) {
    console.log(`Deleting ${deleteIds.length} places outside the target countries...`);
    const chunkSize = 500;
    for (let i = 0; i < deleteIds.length; i += chunkSize) {
      const chunk = deleteIds.slice(i, i + chunkSize);
      const ph = chunk.map(() => '?').join(',');
      await db.run(`DELETE FROM places WHERE id IN (${ph})`, chunk);
    }
  }

  // Remove Dutch Caribbean islands (outside the European scope)
  const caribbean = await db.run("DELETE FROM places WHERE country = 'NL' AND state IN ('St. Eustatius','Bonaire','Saba')");
  if ((caribbean.changes || 0) > 0) console.log(`Removed ${caribbean.changes} places on the Dutch Caribbean islands.`);

  console.log('Rebuilding full-text search index...');
  try {
    await db.run("DELETE FROM places_fts");
    await db.exec(`
      INSERT INTO places_fts(rowid, name, description, address, city, amenities, state)
      SELECT rowid, name, description, address, city, amenities, state FROM places
    `);
  } catch (e: any) {
    console.warn('FTS rebuild skipped:', e.message);
  }

  const counts = await db.get('SELECT COUNT(*) as total FROM places');
  console.log('================================================');
  console.log('⭐ Data Quality Migration Complete!');
  console.log(`   Countries reassigned: ${reassigned}`);
  console.log(`   States corrected:     ${fixedState}`);
  console.log(`   Cities extracted:     ${fixedCity}`);
  console.log(`   Prices structured:    ${fixedPrice}`);
  console.log(`   Images extracted:     ${fixedImage}`);
  console.log(`   Descriptions fixed:   ${fixedDesc}`);
  console.log(`   Fake amenities removed: ${fixedAmenities}`);
  console.log(`   Ratings recomputed:   ${fixedRating}`);
  console.log(`   Places removed:       ${deleteIds.length}`);
  console.log(`   Remaining places:     ${counts.total}`);
  console.log('================================================');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
