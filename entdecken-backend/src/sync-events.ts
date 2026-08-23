import { getDb } from './db/db.js';
import { searchDztEvents } from './dzt.js';

const CATEGORY_FALLBACK_IMAGES: Record<string, string[]> = {
  wine: [
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80"
  ],
  culture: [
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80"
  ],
  festival: [
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80"
  ],
  market: [
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1200&q=80"
  ],
  sport: [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80"
  ],
  all: [
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80"
  ]
};

function getFallbackImage(category: string, id: string): string {
  const list = CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.all;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % list.length;
  return list[idx];
}

function cleanHtmlText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\*\*/g, '')
    .trim();
}

const GERMAN_STATES = [
  "Baden-Württemberg",
  "Bayern",
  "Rheinland-Pfalz",
  "Hessen",
  "Nordrhein-Westfalen",
  "Niedersachsen",
  "Schleswig-Holstein",
  "Mecklenburg-Vorpommern",
  "Sachsen",
  "Sachsen-Anhalt",
  "Thüringen",
  "Brandenburg",
  "Berlin",
  "Hamburg",
  "Bremen",
  "Saarland"
];

const SEARCH_CONFIGS = [
  { category: 'wine', keywords: 'Wein,Weinprobe,Weinfest,Kulinarik,Winzer' },
  { category: 'culture', keywords: 'Kultur,Brauchtum,Mittelalter,Theater,Ausstellung,Schloss' },
  { category: 'festival', keywords: 'Festival,Musik,Open Air,Konzert,Lichtkunst' },
  { category: 'market', keywords: 'Markt,Wochenmarkt,Handwerk,Bauernmarkt,Stadtfest' },
  { category: 'sport', keywords: 'Sport,Wandern,Lauf,Rad,Marathon' }
];

export async function syncEventsFromDzt() {
  console.log("=== Starting DZT Events Synchronization ===");
  const db = await getDb();
  const today = new Date().toISOString().split("T")[0];
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const seenIds = new Set<string>();

  for (const cfg of SEARCH_CONFIGS) {
    console.log(`\n🔍 Fetching category: ${cfg.category} (${cfg.keywords})...`);
    
    // 1. Broad Germany search
    try {
      const generalEvents = await searchDztEvents({
        keywords: cfg.keywords,
        dateRangeStart: today,
        dateRangeEnd: nextYear
      });
      console.log(`   Found ${generalEvents.length} events across Germany`);
      for (const e of generalEvents) {
        await saveEvent(db, e, cfg.category, undefined, seenIds);
      }
    } catch (err: any) {
      console.error(`   Error in broad search:`, err.message);
    }

    // 2. Regional searches for top tourism states
    for (const state of ["Baden-Württemberg", "Bayern", "Rheinland-Pfalz", "Hessen", "Sachsen", "Schleswig-Holstein"]) {
      try {
        const regionalEvents = await searchDztEvents({
          keywords: cfg.keywords,
          region: state,
          dateRangeStart: today,
          dateRangeEnd: nextYear
        });
        if (regionalEvents.length > 0) {
          console.log(`   Found ${regionalEvents.length} events in ${state}`);
          for (const e of regionalEvents) {
            await saveEvent(db, e, cfg.category, state, seenIds);
          }
        }
      } catch (err: any) {
        console.error(`   Error in ${state} search:`, err.message);
      }
    }
  }

  const finalCount = await db.get("SELECT COUNT(*) as count FROM events");
  console.log(`\n✅ Synchronization complete! Total events in database: ${finalCount?.count || 0}`);
}

async function saveEvent(db: any, e: any, defaultCategory: string, defaultState: string | undefined, seenIds: Set<string>) {
  const id = e["@id"] || e.id;
  if (!id || seenIds.has(id)) return;
  seenIds.add(id);

  const name = cleanHtmlText(e["schema:name"] || e.name || "Veranstaltung");
  if (!name || name.length < 3) return;

  const rawDesc = e["schema:description"] || e.description || "";
  const cleanedDesc = cleanHtmlText(rawDesc);
  const shortDesc = cleanedDesc.slice(0, 350);

  const loc = e["schema:location"];
  const addr = loc?.["schema:address"] || e["schema:address"];
  const locality = cleanHtmlText(addr?.["schema:addressLocality"] || addr?.["addressLocality"] || (typeof addr === "string" ? addr : ""));
  const postalCode = addr?.["schema:postalCode"] || addr?.["postalCode"] || "";
  const streetAddress = cleanHtmlText(addr?.["schema:streetAddress"] || addr?.["streetAddress"] || "");

  // Determine state
  let state = defaultState;
  if (!state && locality) {
    for (const st of GERMAN_STATES) {
      if (locality.toLowerCase().includes(st.toLowerCase()) || rawDesc.toLowerCase().includes(st.toLowerCase())) {
        state = st;
        break;
      }
    }
  }

  const geo = loc?.["schema:geo"] || e["schema:geo"];
  const lat = geo ? Number(geo["schema:latitude"]?.["@value"] || geo["schema:latitude"] || geo.latitude) : null;
  const lon = geo ? Number(geo["schema:longitude"]?.["@value"] || geo["schema:longitude"] || geo.longitude) : null;

  const startDate = e["schema:startDate"] || e.startDate || new Date().toISOString().split("T")[0];
  const endDate = e["schema:endDate"] || e.endDate || null;

  const rawImg = e["schema:image"];
  let rawUrl: any = undefined;
  if (typeof rawImg === "string") {
    rawUrl = rawImg;
  } else if (Array.isArray(rawImg)) {
    const first = rawImg[0];
    rawUrl = typeof first === "string" ? first : (first?.["schema:contentUrl"] || first?.contentUrl || first?.url);
  } else if (typeof rawImg === "object" && rawImg !== null) {
    rawUrl = rawImg["schema:contentUrl"] || rawImg.contentUrl || rawImg.url;
  }
  if (typeof rawUrl === "object" && rawUrl?.["@value"]) {
    rawUrl = rawUrl["@value"];
  }

  let imageUrl = typeof rawUrl === "string" ? rawUrl : undefined;
  let imageCopyright = typeof rawImg === "object" ? (rawImg?.["schema:copyrightHolder"]?.["schema:name"] || rawImg?.["schema:copyrightNotice"] || rawImg?.["schema:license"]) : undefined;

  // Filter broken or invalid images and use curated fallback
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("http") || imageUrl.includes("example.com")) {
    imageUrl = getFallbackImage(defaultCategory, id);
    imageCopyright = "Unsplash (Free Commercial Use) / Open Data";
  }

  // Category determination
  let category = defaultCategory;
  const fullText = (name + " " + cleanedDesc).toLowerCase();
  if (fullText.includes("wein") || fullText.includes("winzer") || fullText.includes("verkostung")) {
    category = "wine";
  } else if (fullText.includes("markt") || fullText.includes("messe") || fullText.includes("basar")) {
    category = "market";
  } else if (fullText.includes("festival") || fullText.includes("konzert") || fullText.includes("musik")) {
    category = "festival";
  } else if (fullText.includes("kultur") || fullText.includes("theater") || fullText.includes("museum") || fullText.includes("schloss")) {
    category = "culture";
  } else if (fullText.includes("sport") || fullText.includes("lauf") || fullText.includes("rad") || fullText.includes("wander")) {
    category = "sport";
  }

  const rawTypes = Array.isArray(e["@type"]) ? e["@type"] : (e["@type"] ? [e["@type"]] : []);
  const typesJson = JSON.stringify(rawTypes.map((t: string) => String(t).split("/").pop() || t));

  const url = e["schema:url"] || e.url || (typeof id === "string" && id.startsWith("http") ? id : undefined);

  await db.run(
    `INSERT INTO events (
      id, name, description, full_description, category, locality, postal_code,
      street_address, state, country, latitude, longitude, start_date, end_date,
      types, image_url, image_copyright, url, source, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      description=excluded.description,
      full_description=excluded.full_description,
      category=excluded.category,
      locality=excluded.locality,
      postal_code=excluded.postal_code,
      street_address=excluded.street_address,
      state=excluded.state,
      latitude=excluded.latitude,
      longitude=excluded.longitude,
      start_date=excluded.start_date,
      end_date=excluded.end_date,
      types=excluded.types,
      image_url=excluded.image_url,
      image_copyright=excluded.image_copyright,
      url=excluded.url,
      last_updated=datetime('now')`,
    [
      id,
      name,
      shortDesc,
      cleanedDesc,
      category,
      locality || null,
      postalCode || null,
      streetAddress || null,
      state || null,
      "DE",
      lat && !isNaN(lat) ? lat : null,
      lon && !isNaN(lon) ? lon : null,
      startDate,
      endDate,
      typesJson,
      imageUrl,
      imageCopyright || null,
      url || null,
      "dzt_opendata"
    ]
  );
}

// Allow direct execution
if (process.argv[1]?.endsWith('sync-events.ts') || process.argv[1]?.endsWith('sync-events.js')) {
  syncEventsFromDzt().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
  });
}
