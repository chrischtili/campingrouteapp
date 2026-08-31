# 🚐 CampingRoute – Der KI-Prompt-Assistent für Wohnmobil- & Camping-Touren (v0.8.0)

[![Version](https://img.shields.io/badge/version-v0.8.0-emerald.svg)](https://github.com/chrischtili/campingrouteapp)
[![Listed on mcpservers.org](https://mcpservers.org/badge.svg)](https://mcpservers.org/servers/campingroute-app-mcp)
[![License](https://img.shields.io/badge/license-PolyForm_Noncommercial_1.0.0-blue.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

**Die fokussierte Plattform für Wohnmobil-Reisende, Camper & Roadtripper in Europa – mit strukturiertem KI-Prompt-Assistenten und offizieller MCP-Server-Integration für deine bevorzugten KI-Tools (ChatGPT, Claude, Gemini, Cursor IDE, Antigravity)!**

👉 **Live-Anwendung**: [https://campingroute.app](https://campingroute.app)  
🔌 **MCP Server Listing**: [https://mcpservers.org/servers/campingroute-app-mcp](https://mcpservers.org/servers/campingroute-app-mcp)

---

## 🌟 Neu in Version 0.8.0

- 🎯 **Fokussierter Prompt-Assistent als Startseite**:
  - Direkt auf den Punkt: Route, Zwischenziele, Fahrzeugmaße (Höhe, Länge, Gewicht), Autarkie-Kriterien, Mautpräferenzen und Interessen in einem nahtlosen Flow.
  - Generiert perfekt strukturierte Prompts inklusive Etappenplanung, Zeitfenstern, Stellplatzvorschlägen und GPX-Code-Blöcken.
- 🔌 **Model Context Protocol (MCP) Server**:
  - Gelistet auf [mcpservers.org](https://mcpservers.org/servers/campingroute-app-mcp).
  - Bindet über 20.000 verifizierte Campingplätze, offizielle DZT Wander- & Radwege, POIs, Schlösser, Events & Weinfeste direkt in Claude Desktop, Cursor IDE oder Antigravity ein.
- 🌐 **Vollständige Mehrsprachigkeit (i18n)**:
  - 5 Sprachen (Deutsch 🇩🇪, English 🇬🇧, Français 🇫🇷, Italiano 🇮🇹, Nederlands 🇳🇱).
  - Dynamische, lokalisierte SEO-Metatags, Breadcrumb-Navigation und dedizierte Sitemap.
- 💬 **Dedizierte Feedback-Seite & Datenschutz**:
  - Keine störenden Popups: Eigene Feedback-Seite unter `/feedback`.
  - Maximale Datensparsamkeit: Lokale Erstellung der Prompts im Browser ohne Übermittlung sensibler Reisedaten an Dritte.

---

## 📦 Kern-Funktionen

### 🎯 KI-Prompt-Assistent & Routenplaner
- Maßgeschneiderte Prompts für ChatGPT, Gemini, Claude, Mistral oder Perplexity.
- Exakte Berücksichtigung von Fahrzeugbeschränkungen (z. B. 3,5t Limit, Durchfahrtshöhen).
- GPX-kompatible Routenplanung für Garmin, OsmAnd, Locus Map etc.

### 🔌 MCP Server für Entwickler & KI-Clients
- **SSE-Live-Endpoint**: `https://campingroute.app/discover/mcp`
- 1-Klick-Konfiguration für Claude Desktop, Cursor IDE und Antigravity / Gemini CLI.

---

## 💻 Tech Stack & Architektur

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion
- **Backend**: Node.js / Express (Port 3002 für Static Dist & API, Port 3000 für MCP SSE Server)
- **Datenbanken**: SQLite (`places.sqlite`, `campingroute_eu.db`) + Geodaten-Indizes
- **Internationalisierung**: react-i18next (DE, EN, NL, FR, IT)

---

## 🚀 Lokale Entwicklung

```bash
# 1. Repository klonen
git clone https://github.com/chrischtili/campingrouteapp.git
cd campingrouteapp

# 2. Frontend-Abhängigkeiten installieren
npm install

# 3. Entdecken-/MCP-Backend Abhängigkeiten installieren
cd entdecken-backend
npm install
cd ..

# 4. Entwicklungs-Server starten
# Terminal 1: Backend (MCP Server & SQLite APIs)
cd entdecken-backend && npm run dev

# Terminal 2: Frontend (Vite)
npm run dev
```

---

## 📄 Lizenz
 
PolyForm Noncommercial License 1.0.0 © 2026 [chrischtili](https://github.com/chrischtili)
