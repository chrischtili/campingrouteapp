import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

const distIndexHtmlPath = resolve(process.cwd(), "dist/index.html");

if (!existsSync(distIndexHtmlPath)) {
  console.error("dist/index.html does not exist. Run vite build first.");
  process.exit(1);
}

const baseHtml = readFileSync(distIndexHtmlPath, "utf8");

const PAGES = [
  // Genuss / Hofläden & Winzer Hub
  {
    paths: [
      "dist/entdecken/genuss/index.html",
      "dist/entdecken/weingueter/index.html",
      "dist/entdecken/hoflaeden/index.html",
      "dist/entdecken/culinary/index.html",
      "dist/discover/genuss/index.html",
      "dist/discover/culinary/index.html",
      "dist/discover/wineries/index.html",
      "dist/discover/farm-shops/index.html"
    ],
    title: "Hofläden, Winzer & 24h-Regiomaten in Deutschland – Camping & Direktvermarkter | CampingRoute",
    description: "Entdecke über 1.500 Winzerstuben, Hofläden, Käsereien und 24h-Regiomaten in Deutschland mit passenden Campingplätzen und Wohnmobilstellplätzen in der Nähe.",
    keywords: "Hofladen Camping, Winzer Stellplatz, Weingut Wohnmobil, Regiomat Stellplatz, Direktvermarkter Deutschland, Hofkäserei Stellplatz, Camping beim Winzer, Landvergnügen Alternative, Bauernhof Stellplatz",
    canonical: "https://campingroute.app/entdecken/genuss",
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Hofläden, Winzer & Regiomaten Deutschland",
      "description": "Entdecke über 1.500 Winzerstuben, Hofläden, Käsereien und 24h-Regiomaten in Deutschland mit passenden Campingplätzen und Wohnmobilstellplätzen in der Nähe.",
      "url": "https://campingroute.app/entdecken/genuss"
    }
  },

  // Wander- & Radwege Hub
  {
    paths: [
      "dist/entdecken/touren/index.html",
      "dist/entdecken/wanderwege/index.html",
      "dist/entdecken/trails/index.html",
      "dist/entdecken/wandern/index.html",
      "dist/entdecken/radwege/index.html",
      "dist/discover/trails/index.html",
      "dist/discover/touren/index.html",
      "dist/discover/wanderwege/index.html",
      "dist/discover/hiking/index.html"
    ],
    title: "Wander- & Radwege mit Campingplätzen in Deutschland | CampingRoute",
    description: "Über 670 offizielle Fernwanderwege, Radrouten und Rundtouren des DZT Knowledge Graphs mit Übernachtungs- und Campingmöglichkeiten entlang der Strecke.",
    keywords: "Wanderwege Camping, Radwege Campingplatz, Fernwanderwege Deutschland, DZT Touren, Radtour Wohnmobil, Wandern und Camping, GPX Wanderwege Camping",
    canonical: "https://campingroute.app/entdecken/touren",
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Wander- & Radwege mit Campingplätzen",
      "description": "Über 670 offizielle Fernwanderwege, Radrouten und Rundtouren mit Übernachtungs- und Campingmöglichkeiten entlang der Strecke.",
      "url": "https://campingroute.app/entdecken/touren"
    }
  },

  // Events & Weinfeste Hub
  {
    paths: [
      "dist/entdecken/events/index.html",
      "dist/entdecken/veranstaltungen/index.html",
      "dist/entdecken/feste/index.html",
      "dist/discover/events/index.html",
      "dist/discover/festivals/index.html"
    ],
    title: "Veranstaltungen, Weinfeste & Kultur in Deutschland – Camping & Events | CampingRoute",
    description: "Offizielle Feste, Märkte, Weinfeste und Kultur-Events in ganz Deutschland mit Camping- und Stellplatztipps in der direkten Umgebung.",
    keywords: "Weinfeste Deutschland, Veranstaltungen Camping, Events Wohnmobil Stellplatz, Kulturfeste Deutschland, Märkte Deutschland Camping",
    canonical: "https://campingroute.app/entdecken/events",
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Veranstaltungen & Kultur-Events Deutschland",
      "description": "Offizielle Feste, Märkte, Weinfeste und Kultur-Events in ganz Deutschland mit Camping- und Stellplatztipps in der direkten Umgebung.",
      "url": "https://campingroute.app/entdecken/events"
    }
  },

  // Camping Hub
  {
    paths: [
      "dist/entdecken/camping/index.html",
      "dist/entdecken/campingplaetze/index.html",
      "dist/entdecken/stellplaetze/index.html",
      "dist/discover/camping/index.html",
      "dist/discover/campgrounds/index.html",
      "dist/discover/pitches/index.html"
    ],
    title: "Campingplätze & Wohnmobilstellplätze in Europa – Entdecken | CampingRoute",
    description: "Finde über 20.000 verifizierte Campingplätze und Wohnmobilstellplätze in Deutschland, Italien, Frankreich, Skandinavien und ganz Europa.",
    keywords: "Campingplätze Europa, Wohnmobilstellplätze Europa, Campingurlaub, Stellplatzkarte",
    canonical: "https://campingroute.app/entdecken/camping"
  },

  // Highlights & Sehenswürdigkeiten Hub
  {
    paths: [
      "dist/entdecken/highlights/index.html",
      "dist/entdecken/sehenswuerdigkeiten/index.html",
      "dist/discover/highlights/index.html",
      "dist/discover/attractions/index.html"
    ],
    title: "Sehenswürdigkeiten & Ausflugsziele in Europa mit Camping | CampingRoute",
    description: "Schlösser, Naturparks, UNESCO-Welterbestätten und Ausflugsziele in Europa mit passenden Übernachtungsmöglichkeiten für Camper.",
    keywords: "Sehenswürdigkeiten Camping, Ausflugsziele Wohnmobil, Attraktionen Europa",
    canonical: "https://campingroute.app/entdecken/highlights"
  },

  // Haupt-Entdecken Seiten
  {
    paths: [
      "dist/entdecken/index.html",
      "dist/discover/index.html",
      "dist/decouvrir/index.html",
      "dist/scopri/index.html",
      "dist/ontdekken/index.html"
    ],
    title: "Camping & Stellplätze in Europa entdecken – Über 37.000 Orte | CampingRoute",
    description: "Entdecke über 37.000 verifizierte Campingplätze, Wohnmobilstellplätze, Glamping-Unterkünfte und Sehenswürdigkeiten in Europa mit interaktiver Karte.",
    keywords: "Camping entdecken, Stellplätze entdecken, Campingkarte Europa, Wohnmobil Europa Karte",
    canonical: "https://campingroute.app/discover"
  },

  // Finder Tools
  {
    paths: [
      "dist/campingplatz-finder/index.html"
    ],
    title: "Campingplatz Finder: Finde die besten Campingplätze in Europa | CampingRoute",
    description: "Finde die schönsten Campingplätze für Zelt, Wohnwagen und Wohnmobil in ganz Europa mit KI-Unterstützung.",
    keywords: "Campingplatz Finder, Campingplätze Europa, Campingurlaub suchen, Campingplatzsuche",
    canonical: "https://campingroute.app/campingplatz-finder"
  },
  {
    paths: [
      "dist/stellplatz-finder/index.html"
    ],
    title: "Wohnmobilstellplatz Finder: Schnelle Stellplatzsuche in Europa | CampingRoute",
    description: "Finde Wohnmobilstellplätze und Übernachtungsplätze in ganz Europa für deine Wohnmobil- und Camper-Reise.",
    keywords: "Stellplatz Finder, Wohnmobilstellplatz suchen, Wohnmobilstellplätze Europa, Stellplatzsuche",
    canonical: "https://campingroute.app/stellplatz-finder"
  },
  {
    paths: [
      "dist/prompt-generator/index.html"
    ],
    title: "KI-Prompt-Generator für Wohnmobil- & Camping-Routen | CampingRoute",
    description: "Erstelle maßgeschneiderte KI-Prompts für ChatGPT, Claude & Gemini zur perfekten Wohnmobil-Routenplanung inkl. GPX-Export.",
    keywords: "Camping KI Prompt Generator, Wohnmobil Prompt Generator, Roadtrip Prompt ChatGPT, KI Routenplaner Prompt",
    canonical: "https://campingroute.app/prompt-generator"
  }
];

function transformHtml(html, page) {
  let res = html;
  
  if (page.title) {
    res = res.replace(/<title>[\s\S]*?<\/title>/i, `<title>${page.title}</title>`);
  }
  if (page.description) {
    res = res.replace(/<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${page.description.replace(/"/g, "&quot;")}" />`);
  }
  if (page.keywords) {
    res = res.replace(/<meta\s+name=["']keywords["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="keywords" content="${page.keywords.replace(/"/g, "&quot;")}" />`);
  }
  if (page.canonical) {
    res = res.replace(/<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="canonical" href="${page.canonical}" />`);
  }
  if (page.title) {
    res = res.replace(/<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${page.title.replace(/"/g, "&quot;")}" />`);
    res = res.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:title" content="${page.title.replace(/"/g, "&quot;")}" />`);
  }
  if (page.description) {
    res = res.replace(/<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${page.description.replace(/"/g, "&quot;")}" />`);
    res = res.replace(/<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:description" content="${page.description.replace(/"/g, "&quot;")}" />`);
  }
  if (page.canonical) {
    res = res.replace(/<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:url" content="${page.canonical}" />`);
  }

  if (page.schema) {
    const schemaTag = `<script id="page-jsonld" type="application/ld+json">\n${JSON.stringify(page.schema, null, 2)}\n</script>\n`;
    res = res.replace("</head>", `${schemaTag}</head>`);
  }

  return res;
}

let count = 0;
for (const page of PAGES) {
  const transformed = transformHtml(baseHtml, page);
  for (const relPath of page.paths) {
    const fullPath = resolve(process.cwd(), relPath);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, transformed, "utf8");
    count++;
  }
}

console.log(`[SEO Generator] Successfully generated ${count} dedicated static SEO HTML pages in dist/!`);
