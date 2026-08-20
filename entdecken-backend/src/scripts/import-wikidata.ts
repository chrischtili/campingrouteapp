import { getDb } from '../db/db.js';
import crypto from 'crypto';
import { upsertPlace, NormalizedPlace } from './lib/import-utils.js';
import { computeRating } from '../db/geo.js';

interface WikidataResult {
  place: { value: string };
  placeLabel: { value: string };
  description?: { value: string };
  coords: { value: string };
  image?: { value: string };
  website?: { value: string };
}

const COUNTRIES = [
  { code: "DE", qid: "wd:Q183", name: "Germany" },
  { code: "AT", qid: "wd:Q40", name: "Austria" },
  { code: "CH", qid: "wd:Q39", name: "Switzerland" },
  { code: "DK", qid: "wd:Q35", name: "Denmark" },
  { code: "NO", qid: "wd:Q20", name: "Norway" },
  { code: "SE", qid: "wd:Q34", name: "Sweden" },
  { code: "FR", qid: "wd:Q142", name: "France" },
  { code: "IT", qid: "wd:Q38", name: "Italy" },
  { code: "NL", qid: "wd:Q55", name: "Netherlands" },
  { code: "BE", qid: "wd:Q31", name: "Belgium" },
  { code: "LU", qid: "wd:Q32", name: "Luxembourg" },
  { code: "FI", qid: "wd:Q33", name: "Finland" },
  { code: "ES", qid: "wd:Q29", name: "Spain" },
  { code: "PT", qid: "wd:Q45", name: "Portugal" },
  { code: "HR", qid: "wd:Q224", name: "Croatia" },
  { code: "GR", qid: "wd:Q41", name: "Greece" },
  { code: "SI", qid: "wd:Q215", name: "Slovenia" },
  { code: "CZ", qid: "wd:Q213", name: "Czechia" },
  { code: "PL", qid: "wd:Q36", name: "Poland" },
  { code: "HU", qid: "wd:Q28", name: "Hungary" },
  { code: "GB", qid: "wd:Q145", name: "United Kingdom" }
];

// Optional filter: COUNTRIES=ES,PT,HR npm run import-wikidata
const countriesFilter = (process.env.COUNTRIES || '')
  .split(',')
  .map(c => c.trim().toUpperCase())
  .filter(Boolean);

async function queryWikidataForCountry(countryCode: string, countryQid: string, limit: number = 600): Promise<WikidataResult[]> {
  console.log(`Querying Wikidata for premium sights in ${countryCode} (limit ${limit})...`);
  
    const sparqlQuery = `
    SELECT DISTINCT ?place ?placeLabel ?description ?coords ?image ?website WHERE {
      VALUES ?class { wd:Q23413 wd:Q46169 wd:Q570116 wd:Q30713 wd:Q2977 wd:Q11252 wd:Q49893 wd:Q108113 wd:Q16560 wd:Q43501 wd:Q22698 wd:Q5437 wd:Q11635 wd:Q174782 wd:Q16970 wd:Q41176 }
      ?place wdt:P31 ?class;
             wdt:P625 ?coords;
             wdt:P17 ${countryQid};
             wdt:P18 ?image;
             wikibase:sitelinks ?sitelinks.
      
      OPTIONAL { ?place wdt:P856 ?website. }
      
      SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "de,en,sv,no". 
        ?place rdfs:label ?placeLabel.
        ?place schema:description ?description.
      }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT ${limit}
  `;

  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}`;
  
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/sparql-results+json',
          'User-Agent': `CampingRoute/1.0 (christian.projekte@campingroute.app; country=${countryCode})`
        }
      });

      if (response.ok) {
        const data = await response.json() as { results: { bindings: WikidataResult[] } };
        return data.results.bindings || [];
      }

      console.warn(`Wikidata returned status ${response.status} for ${countryCode}. Retrying in 5 seconds... (${retries - 1} left)`);
    } catch (error) {
      console.error(`Wikidata query error for ${countryCode}:`, error, `Retrying in 5 seconds... (${retries - 1} left)`);
    }
    retries--;
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  return [];
}

function parseCoords(coordStr: string): { lat: number; lon: number } | null {
  const match = coordStr.match(/Point\(([-\d.]+)\s+([-\d.]+)\)/);
  if (match) {
    return {
      lon: parseFloat(match[1]),
      lat: parseFloat(match[2])
    };
  }
  return null;
}

async function run() {
  const db = await getDb();
  let totalImported = 0;

  const target = COUNTRIES.filter(c => countriesFilter.length === 0 || countriesFilter.includes(c.code));
  if (target.length === 0) {
    console.error(`No matching countries for filter: ${process.env.COUNTRIES}`);
    process.exit(1);
  }
  console.log(`Importing Wikidata sights for: ${target.map(c => c.code).join(', ')}`);

  for (const country of target) {
    let limit = 500;
    if (country.code === 'DE') limit = 1200;
    else if (country.code === 'FR' || country.code === 'IT') limit = 1000;
    else if (country.code === 'AT' || country.code === 'CH' || country.code === 'SE') limit = 800;

    const results = await queryWikidataForCountry(country.code, country.qid, limit);
    if (results.length === 0) {
      continue;
    }

    console.log(`Processing ${results.length} premium sights for ${country.name}...`);
    let countryImported = 0;

    for (const item of results) {
      const name = item.placeLabel.value;
      const coords = parseCoords(item.coords.value);
      if (!coords) continue;

      const wikidataId = item.place.value.split('/').pop() || crypto.randomUUID();
      const id = `wikidata-${wikidataId}`;
      
      const description = item.description?.value || null;
      const imageUrl = item.image?.value || null;
      const website = item.website?.value || null;
      const contact = website ? `Website: ${website}` : 'N/A';
      
      const rating = computeRating({
        hasWebsite: !!website,
        hasPhone: false,
        hasCity: false,
        hasDescription: !!description,
        hasAmenities: false,
        isAttraction: true
      });

      const place: NormalizedPlace = {
        id,
        name,
        type: 'attraction',
        latitude: coords.lat,
        longitude: coords.lon,
        country: country.code,
        description,
        image_url: imageUrl,
        rating,
        price: 'Varies (See website)',
        contact,
        website,
        address: `${name}, ${country.name}`,
        osm_id: `wikidata-${wikidataId}`,
        source: 'wikidata',
        data_quality: (website ? 1 : 0) + (description ? 1 : 0) + (imageUrl ? 1 : 0) >= 2 ? 2 : 1
      };

      await upsertPlace(db, place);
      countryImported++;
      totalImported++;
    }

    console.log(`Successfully imported ${countryImported} premium attractions for ${country.name}.`);
    // Throttle queries slightly to respect Wikidata rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`================================================`);
  console.log(`⭐ Wikidata Bulk Import Complete!`);
  console.log(`   Imported ${totalImported} premium sights with photos.`);
  console.log(`================================================`);
}

run().catch(console.error);
