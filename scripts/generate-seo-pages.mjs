import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

const distIndexHtmlPath = resolve(process.cwd(), "dist/index.html");

if (!existsSync(distIndexHtmlPath)) {
  console.error("dist/index.html does not exist. Run vite build first.");
  process.exit(1);
}

const baseHtml = readFileSync(distIndexHtmlPath, "utf8");

const PAGES = [
  // MCP Server
  {
    paths: [
      "dist/mcp/index.html",
      "dist/mcp-server/index.html"
    ],
    title: "CampingRoute MCP Server – Model Context Protocol für Camping & Routen | CampingRoute",
    description: "Integriere 20.000+ Campingplätze, DZT Touren, Winzer & Hofläden direkt in Cursor, Claude Desktop, Windsurf und andere MCP-Clients.",
    keywords: "CampingRoute MCP, Model Context Protocol Camping, Claude Desktop MCP, Cursor MCP Camping, AI Camping Tools",
    canonical: "https://campingroute.app/mcp"
  },

  // Impressum
  {
    paths: [
      "dist/impressum/index.html"
    ],
    title: "Impressum | CampingRoute",
    description: "Rechtliche Angaben und Kontaktinformationen von CampingRoute.",
    keywords: "CampingRoute Impressum, Kontakt, Rechtliche Hinweise",
    canonical: "https://campingroute.app/impressum"
  },

  // Datenschutz
  {
    paths: [
      "dist/datenschutz/index.html"
    ],
    title: "Datenschutzerklärung | CampingRoute",
    description: "Datenschutzerklärung und Informationen zur Datenverarbeitung von CampingRoute.",
    keywords: "CampingRoute Datenschutz, Privatsphäre, DSGVO",
    canonical: "https://campingroute.app/datenschutz"
  },

  // Feedback
  {
    paths: [
      "dist/feedback/index.html"
    ],
    title: "Feedback & Anregungen | CampingRoute",
    description: "Gib uns Feedback zur CampingRoute App und teile deine Ideen und Wünsche mit uns.",
    keywords: "CampingRoute Feedback, Anregungen, Kontakt",
    canonical: "https://campingroute.app/feedback"
  },

  // Prompt-Generator (Startseite / Direktlink)
  {
    paths: [
      "dist/prompt-generator/index.html"
    ],
    title: "Kostenloser KI-Reiseplaner & Prompt-Generator für Camping, Glamping & Ferienunterkünfte | CampingRoute",
    description: "Erstelle 100% kostenlos maßgeschneiderte KI-Prompts für ChatGPT, Claude & Gemini zur perfekten Routenplanung für Wohnmobil, Wohnwagen, Pkw, Zelt, Glamping, Ferienwohnung & Ferienhaus inkl. GPX-Export.",
    keywords: "kostenloser Camping KI Prompt Generator, Wohnmobil Prompt Generator kostenlos, Glamping Routenplaner, Roadtrip Prompt ChatGPT, Ferienwohnung Routenplaner KI, Ferienhaus Route, KI Routenplaner Prompt kostenlos",
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
