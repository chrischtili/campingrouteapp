import { getDb } from '../db/db.js';
import { searchDztPois, searchDztTrails } from '../dzt.js';

const GERMAN_REGIONS = [
  'Baden-Württemberg',
  'Bayern',
  'Hessen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Schleswig-Holstein',
  'Niedersachsen',
  'Mecklenburg-Vorpommern',
  'Brandenburg',
  'Sachsen',
  'Sachsen-Anhalt',
  'Thüringen',
  'Saarland',
  'Berlin',
  'Hamburg',
  'Bremen'
];

const KEYWORD_SETS = [
  'Schloss,Burg,Denkmal',
  'See,Naturpark,Nationalpark',
  'Museum,Galerie,Kultur',
  'Aussichtspunkt,Panoramablick',
  'Freizeitpark,Erlebnispark,Therme',
  'Campingplatz,Stellplatz,Wohnmobil'
];

function normalizeName(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '');
}

async function runEnrichment() {
  console.log('=== Starting DZT Knowledge Graph Data Enrichment ===\n');
  const db = await getDb();

  let totalFetched = 0;
  let totalEnriched = 0;
  let totalInserted = 0;

  for (const region of GERMAN_REGIONS) {
    console.log(`\n📍 Processing Region: ${region}...`);

    for (const keywords of KEYWORD_SETS) {
      try {
        const pois = await searchDztPois({ region, keywords });
        totalFetched += pois.length;

        for (const poi of pois) {
          const name = poi['schema:name'];
          if (!name) continue;

          const rawDesc = poi['schema:description'] || '';
          const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '').trim();

          const image = poi['schema:image'];
          const imageUrl = Array.isArray(image)
            ? image[0]?.['schema:contentUrl']
            : image?.['schema:contentUrl'];

          const addr = poi['schema:address'] || {};
          const city = addr['schema:adressLocality'] || addr['schema:addressLocality'] || '';
          const postalCode = addr['schema:postalCode'] || '';
          const street = addr['schema:streetAddress'] || '';

          const norm = normalizeName(name);

          // 1. Try to find a match in existing places
          const existingMatches = await db.all(
            `SELECT id, name, type, description, image_url, source FROM places WHERE country = 'DE' AND (name LIKE ? OR city LIKE ?)`,
            [`%${name.slice(0, 15)}%`, city ? `%${city}%` : '%---%']
          );

          let matched = false;
          for (const candidate of existingMatches) {
            const candNorm = normalizeName(candidate.name);
            if (candNorm.includes(norm) || norm.includes(candNorm)) {
              matched = true;

              // Enrich description if empty or short
              const updateFields: string[] = [];
              const updateParams: any[] = [];

              if (cleanDesc && (!candidate.description || candidate.description.length < cleanDesc.length)) {
                updateFields.push('description = ?');
                updateParams.push(cleanDesc);
              }

              if (imageUrl && !candidate.image_url) {
                updateFields.push('image_url = ?');
                updateParams.push(imageUrl);
              }

              if (updateFields.length > 0) {
                updateFields.push('source = ?');
                updateParams.push('dzt,osm');
                updateParams.push(candidate.id);

                await db.run(
                  `UPDATE places SET ${updateFields.join(', ')} WHERE id = ?`,
                  updateParams
                );
                totalEnriched++;
                console.log(`  ✨ Enriched: ${candidate.name} (${candidate.type}) in ${city || region}`);
              }
              break;
            }
          }
        }

        // Polite delay between API requests
        await new Promise((r) => setTimeout(r, 400));
      } catch (err: any) {
        console.error(`  ⚠️ Error fetching ${keywords} in ${region}:`, err.message);
      }
    }
  }

  console.log('\n========================================');
  console.log('🎉 DZT Enrichment Summary:');
  console.log(`   Total DZT Items Processed: ${totalFetched}`);
  console.log(`   Existing Places Enriched with DZT Text/Images: ${totalEnriched}`);
  console.log('========================================\n');
}

runEnrichment()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
