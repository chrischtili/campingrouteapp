import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  Cpu, Sparkles, Copy, Check, Terminal, ExternalLink, ShieldCheck, 
  Search, MapPin, Compass, Calendar, Castle, Star, BookmarkCheck, 
  ArrowRight, BookOpen, Layers, Zap, Code2, CheckCircle2, ChevronRight
} from "lucide-react";
import { Navbar } from "@/components/route-planner/Navbar";
import { Footer } from "@/components/route-planner/Footer";
import { AppBreadcrumbs } from "@/components/AppBreadcrumbs";
import { Button } from "@/components/ui/button";

export const MCP_TOOLS_CATALOG = [
  {
    name: "search_places",
    cat: "camping",
    icon: Compass,
    title: {
      de: "Camping- & Stellplätze suchen",
      en: "Search Campsites & Pitches",
      fr: "Rechercher campings & aires",
      it: "Cerca campeggi e aree sosta",
      nl: "Zoek campings & camperplaatsen"
    },
    desc: {
      de: "Sucht europaweit nach über 20.000 verifizierten Campingplätzen, Wohnmobilstellplätzen & Glamping mit Geokoordinaten, Ausstattung und Kontakt-Links.",
      en: "Searches over 20,000 verified campsites, RV pitches & glamping across Europe with geo-coordinates, amenities, and direct website links.",
      fr: "Recherche plus de 20 000 campings et aires vérifiés en Europe avec coordonnées, équipements et liens web.",
      it: "Cerca oltre 20.000 campeggi e aree camper verificati in tutta Europa con coordinate, servizi e link web.",
      nl: "Zoekt meer dan 20.000 geverifieerde campings en camperplaatsen in Europa met coördinaten en voorzieningen."
    },
    params: '{ "query": "Bodensee", "country": "DE", "type": "camp_site", "limit": 10 }',
    examplePrompt: "Finde mir 5 ruhige Campingplätze direkt am Bodensee mit Strom und Seezugang."
  },
  {
    name: "get_place_details",
    cat: "camping",
    icon: MapPin,
    title: {
      de: "Platzdetails abrufen",
      en: "Get Place Details",
      fr: "Obtenir les détails du lieu",
      it: "Dettagli luogo",
      nl: "Plaatsdetails ophalen"
    },
    desc: {
      de: "Liefert vollständige Stammdaten, Öffnungszeiten, Sanitär-Ausstattung, Telefon, Website und Routen-Anfahrtsinfos zu einem bestimmten Platz.",
      en: "Provides complete master data, opening dates, sanitary amenities, phone, website, and arrival hints for a specific place.",
      fr: "Fournit les données complètes, périodes d'ouverture, sanitaires, téléphone et accès pour un lieu précis.",
      it: "Fornisce dati anagrafici completi, periodi di apertura, servizi igienici e recapiti del campeggio.",
      nl: "Biedt complete gegevens, openingstijden, sanitair, telefoon en adresgegevens van een specifieke plaats."
    },
    params: '{ "place_id": 48291 }',
    examplePrompt: "Welche Ausstattung und Kontaktdaten hat der Campingplatz Park Camping Lindau?"
  },
  {
    name: "get_german_trails",
    cat: "trails",
    icon: Compass,
    title: {
      de: "Wander- & Radfernwege (DZT)",
      en: "Hiking & Cycling Trails (DZT)",
      fr: "Sentiers de randonnée & vélo (DZT)",
      it: "Sentieri trekking e ciclabili (DZT)",
      nl: "Wandel- & fietsroutes (DZT)"
    },
    desc: {
      de: "Greift auf 19.000+ offizielle Wander- und Fernradwege des DZT Knowledge Graphs zu – inklusive GPX-Streckenverlauf, Höhenmetern und Etappen-Camping.",
      en: "Access 19,000+ official hiking and long-distance cycling routes from the DZT Knowledge Graph – including GPX track, elevation, and nearby camping.",
      fr: "Accède à 19 000+ itinéraires de randonnée et cyclables officiels avec tracés GPX et campings d'étape.",
      it: "Accedi a oltre 19.000 itinerari ufficiali con traccia GPX, dislivello e campeggi lungo il percorso.",
      nl: "Toegang tot 19.000+ officiële wandel- en fietsroutes met GPX-tracks en overnachtingsplekken."
    },
    params: '{ "region": "Schwarzwald", "type": "hiking", "limit": 5 }',
    examplePrompt: "Welche zertifizierten Premium-Wanderwege gibt es im Schwarzwald mit Campingplätzen in der Nähe?"
  },
  {
    name: "get_german_events",
    cat: "events",
    icon: Calendar,
    title: {
      de: "Weinfeste & Kulturveranstaltungen",
      en: "Wine Festivals & Events",
      fr: "Fêtes du vin & événements",
      it: "Feste del vino ed eventi",
      nl: "Wijnfeesten & evenementen"
    },
    desc: {
      de: "Findet verifizierte Weinfeste, Festivals, Märkte und kulturelle Highlights in ganz Deutschland mit Camping- und Stellplatzempfehlungen.",
      en: "Finds verified wine festivals, markets, cultural highlights across Germany with nearby camping and stopover tips.",
      fr: "Trouve les fêtes du vin, marchés et événements culturels en Allemagne avec conseils camping.",
      it: "Trova feste del vino, mercati ed eventi culturali in Germania con suggerimenti di campeggio.",
      nl: "Vindt wijnfeesten, markten en evenementen in Duitsland met campingtips in de buurt."
    },
    params: '{ "month": "09", "region": "Rheinland-Pfalz", "category": "wine" }',
    examplePrompt: "Welche Weinfeste finden im September in der Pfalz statt und wo kann man dort mit dem Camper stehen?"
  },
  {
    name: "get_german_pois",
    cat: "highlights",
    icon: Castle,
    title: {
      de: "Sehenswürdigkeiten & Schlösser",
      en: "Tourist Sights & Castles",
      fr: "Monuments & Châteaux",
      it: "Attrazioni e Castelli",
      nl: "Bezienswaardigheden & Kastelen"
    },
    desc: {
      de: "Liefert Kultur- und Natur-Highlights, Burgen, Schlösser und UNESCO-Welterbestätten entlang europäischer Roadtrip-Routen.",
      en: "Delivers cultural and natural landmarks, castles, palaces, and UNESCO world heritage sites along European road trip routes.",
      fr: "Fournit les monuments, châteaux et sites UNESCO le long des routes de road trip en Europe.",
      it: "Fornisce monumenti storici, castelli e siti UNESCO lungo gli itinerari di viaggio.",
      nl: "Biedt kastelen, paleizen en UNESCO-werelderfgoedlocaties langs Europese reisroutes."
    },
    params: '{ "near_location": "Heidelberg", "radius_km": 30 }',
    examplePrompt: "Suche historische Schlösser und Ausflugsziele im Umkreis von 30 km um Heidelberg."
  },
  {
    name: "get_reviews",
    cat: "reviews",
    icon: Star,
    title: {
      de: "Erfahrungsberichte & Bewertungen",
      en: "Reviews & Ratings",
      fr: "Avis & Notes",
      it: "Recensioni e valutazioni",
      nl: "Reviews & Beoordelingen"
    },
    desc: {
      de: "Ruft echte Bewertungen und Feedback von Campern zu Sauberkeit, Ruhe, Lage und Preis-Leistung ab.",
      en: "Fetches authentic camper reviews regarding cleanliness, tranquility, location, and value for money.",
      fr: "Récupère les avis récents de campeurs sur la propreté, le calme et les équipements.",
      it: "Recupera recensioni reali di camperisti su pulizia, tranquillità e rapporto qualità-prezzo.",
      nl: "Haalt beoordelingen op van kampeerders over rust, sanitair en prijs-kwaliteitverhouding."
    },
    params: '{ "place_id": 12890 }',
    examplePrompt: "Gibt es aktuelle Erfahrungsberichte zur Ruhe und Sanitärqualität dieses Campingplatzes?"
  }
];

export default function McpServerPage() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<"claude" | "cursor" | "antigravity" | "curl">("claude");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const endpointUrl = "https://campingroute.app/discover/mcp";

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2200);
  };

  const claudeDesktopConfig = JSON.stringify({
    mcpServers: {
      campingroute: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-sse", endpointUrl]
      }
    }
  }, null, 2);

  const cursorConfig = JSON.stringify({
    mcpServers: {
      campingroute: {
        url: endpointUrl,
        type: "sse"
      }
    }
  }, null, 2);

  const antigravityConfig = JSON.stringify({
    mcpServers: {
      campingroute: {
        serverUrl: endpointUrl
      }
    }
  }, null, 2);

  const curlExample = `curl -N -H "Accept: text/event-stream" "${endpointUrl}"`;

  const filteredTools = selectedCat === "all" 
    ? MCP_TOOLS_CATALOG 
    : MCP_TOOLS_CATALOG.filter(t => t.cat === selectedCat);

  const lang = (i18n.language || "de").slice(0, 2) as "de" | "en" | "fr" | "it" | "nl";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground dark:text-white transition-colors selection:bg-emerald-500 selection:text-white">
      <Navbar />
      <div className="pt-16 sm:pt-20">
        <AppBreadcrumbs />
      </div>

      <main className="flex-1 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16 pt-8">

          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent p-8 sm:p-12 lg:p-16 dark:border-emerald-500/30 dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-slate-900">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl pointer-events-none" />
            <div className="relative max-w-3xl space-y-6">
              
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-300/80 bg-emerald-100/60 dark:border-emerald-700/60 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold tracking-wide uppercase shadow-xs">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t("mcpPage.badge", "Model Context Protocol (MCP)")}</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">{t("mcpPage.badgeLive", "v1.0 Live")}</span>
                </div>
                <a
                  href="https://mcpservers.org/servers/campingroute-app-mcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:opacity-90 transition-opacity"
                  title="Official Listing on mcpservers.org"
                >
                  <img
                    src="https://mcpservers.org/badge.svg"
                    alt="Listed on mcpservers.org"
                    className="h-6"
                  />
                </a>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                CampingRoute <span className="text-emerald-600 dark:text-emerald-400">MCP-Server</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
                {t("mcpPage.subtitle", "Verbinde Claude Desktop, Cursor IDE, Antigravity oder deine eigenen KI-Agenten direkt mit unserer europäischen Camping-, Wander-, Genuss- und Event-Datenbank.")}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("mcpPage.pillVerifiedPlaces", "20.000+ Verifizierte Plätze")}</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("mcpPage.pillTrails", "DZT Wander- & Radwege")}</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("mcpPage.pillLiveEndpoint", "SSE Live Endpoint")}</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs" title="60 Requests / 5 Minuten pro IP">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("mcpPage.pillRateLimit", "Rate Limit: 60 Req / 5 Min")}</span>
                </div>
              </div>

              {/* Endpoint Fast-Copy Bar */}
              <div className="pt-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800">
                  <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-emerald-400 select-all overflow-x-auto">
                    <span className="text-slate-500 font-sans font-bold">{t("mcpPage.endpointLabel", "SSE Endpoint:")}</span>
                    <span>{endpointUrl}</span>
                  </div>
                  <Button
                    onClick={() => handleCopy(endpointUrl, "hero-url")}
                    className="sm:ml-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0 transition-transform active:scale-95"
                  >
                    {copiedSection === "hero-url" ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5" />
                        <span>{t("mcpPage.copied", "Kopiert!")}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1.5" />
                        <span>{t("mcpPage.copyUrl", "URL kopieren")}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

            </div>
          </section>

          {/* Quick Setup Guide with Tabs */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {t("mcpPage.integrationGuide", "Integration Guide")}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                  {t("mcpPage.integrationTitle", "In 60 Sekunden mit deiner KI verbinden")}
                </h2>
              </div>
              
              {/* Tab Selector */}
              <div className="flex flex-wrap items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setActiveTab("claude")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "claude"
                      ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Claude Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("cursor")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "cursor"
                      ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Cursor IDE
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("antigravity")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "antigravity"
                      ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Antigravity / Gemini CLI
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("curl")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "curl"
                      ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  cURL / Python
                </button>
              </div>
            </div>

            {/* Tab Content Box */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm">
              {activeTab === "claude" && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {t("mcpPage.claudeTitle", "Konfiguration für Claude Desktop")}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t("mcpPage.claudeDesc", "Füge folgenden Eintrag in deine claude_desktop_config.json ein:")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCopy(claudeDesktopConfig, "claude-json")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                    >
                      {copiedSection === "claude-json" ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copiedSection === "claude-json" ? t("mcpPage.copied", "Kopiert!") : t("mcpPage.copyJson", "JSON Kopieren")}
                    </Button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                    <code>{claudeDesktopConfig}</code>
                  </pre>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    📍 <strong>Pfad auf macOS:</strong> <code className="text-slate-700 dark:text-slate-300">~/Library/Application Support/Claude/claude_desktop_config.json</code>
                  </p>
                </div>
              )}

              {activeTab === "cursor" && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {t("mcpPage.cursorTitle", "Konfiguration für Cursor IDE")}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t("mcpPage.cursorDesc", "Trage den SSE-Server unter Cursor Settings ➔ Features ➔ MCP Servers oder in .cursor/mcp.json ein:")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCopy(cursorConfig, "cursor-json")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                    >
                      {copiedSection === "cursor-json" ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copiedSection === "cursor-json" ? t("mcpPage.copied", "Kopiert!") : t("mcpPage.copyJson", "JSON Kopieren")}
                    </Button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                    <code>{cursorConfig}</code>
                  </pre>
                </div>
              )}

              {activeTab === "antigravity" && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {t("mcpPage.antigravityTitle", "Antigravity / Gemini CLI MCP Konfiguration")}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t("mcpPage.antigravityDesc", "Integriere den Server in deiner ~/.gemini/antigravity/mcp_config.json:")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCopy(antigravityConfig, "antigravity-json")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                    >
                      {copiedSection === "antigravity-json" ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copiedSection === "antigravity-json" ? t("mcpPage.copied", "Kopiert!") : t("mcpPage.copyJson", "JSON Kopieren")}
                    </Button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                    <code>{antigravityConfig}</code>
                  </pre>
                </div>
              )}

              {activeTab === "curl" && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {t("mcpPage.curlTitle", "cURL & direkte SSE-Verbindung testen")}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t("mcpPage.curlDesc", "Teste den Live-Stream direkt über das Terminal:")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCopy(curlExample, "curl-code")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                    >
                      {copiedSection === "curl-code" ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copiedSection === "curl-code" ? t("mcpPage.copied", "Kopiert!") : t("mcpPage.copyCmd", "Befehl Kopieren")}
                    </Button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                    <code>{curlExample}</code>
                  </pre>
                </div>
              )}
            </div>
          </section>

          {/* Available MCP Tools Catalog */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {t("mcpPage.toolsDirectory", "MCP Tools Katalog")}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                  {t("mcpPage.toolsTitle", "{{count}} Spezialisierte Camping- & Reise-Tools", { count: MCP_TOOLS_CATALOG.length })}
                </h2>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: `${t("mcpPage.catAllPrefix", "✨ Alle")} (${MCP_TOOLS_CATALOG.length})` },
                  { id: "camping", label: `${t("mcpPage.catCampingPrefix", "🏕️ Camping")} (${MCP_TOOLS_CATALOG.filter(t => t.cat === "camping").length})` },
                  { id: "trails", label: `${t("mcpPage.catTrailsPrefix", "🥾 Wandern & Rad")} (${MCP_TOOLS_CATALOG.filter(t => t.cat === "trails").length})` },
                  { id: "events", label: `${t("mcpPage.catEventsPrefix", "📅 Events & Weinfeste")} (${MCP_TOOLS_CATALOG.filter(t => t.cat === "events").length})` },
                  { id: "highlights", label: `${t("mcpPage.catPoisPrefix", "🏰 POIs & Kultur")} (${MCP_TOOLS_CATALOG.filter(t => t.cat === "highlights").length})` },
                  { id: "reviews", label: `${t("mcpPage.catReviewsPrefix", "⭐ Bewertungen")} (${MCP_TOOLS_CATALOG.filter(t => t.cat === "reviews").length})` },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCat(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCat === cat.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTools.map((tool) => {
                const IconComponent = tool.icon;
                const titleText = tool.title[lang] || tool.title.de;
                const descText = tool.desc[lang] || tool.desc.de;

                return (
                  <div
                    key={tool.name}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                              {titleText}
                            </h3>
                            <code className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {tool.name}
                            </code>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {descText}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {t("mcpPage.examplePrompt", "Beispiel-Prompt an die KI:")}
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-200 italic border border-slate-100 dark:border-slate-700/50">
                          "{tool.examplePrompt}"
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Interactive CTA to Prompt Assistant */}
          <section className="rounded-3xl border border-emerald-300/40 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {t("mcpPage.ctaTitle", "Bereit für den nächsten Roadtrip?")}
              </h3>
              <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
                {t("mcpPage.ctaDesc", "Erstelle mit unserem Prompt-Assistenten maßgeschneiderte KI-Prompts für perfekte Camping- und Wohnmobiltouren.")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3.5 shrink-0">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 px-6 py-3.5 text-sm font-black shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-emerald-950 font-black">{t("mcpPage.ctaPromptBtn", "Zum Prompt-Assistenten")}</span>
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
