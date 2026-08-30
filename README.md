# 🚐 Camping Route - KI Wohnmobil Routenplaner & Entdecken (v0.7.1)

[![Version](https://img.shields.io/badge/version-v0.7.1-emerald.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-PolyForm_Noncommercial_1.0.0-blue.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

**Die smarte Plattform für Wohnmobil-Reisende, Camper & Roadtripper in Europa – mit KI-Routenplaner, interaktivem Entdecken-Portal, Themenwelten und MCP-KI-Integration!**

👉 **Live Demo**: [https://campingroute.app](https://campingroute.app)

---

## 🌟 Neu in Version 0.7.1

- 🧭 **Themenwelten für Camper & Roadtripper (`/entdecken`)**:
  - 🏕️ **Camping- & Wohnmobilstellplätze**: Über 20.000 verifizierte Orte mit KI-Suche und direkter Routenübernahme.
  - 🍇 **Hofläden & Winzer**: Weingüter, Bio-Bauernhöfe, Käsereien & 24h-Regiomaten direkt ab Erzeuger mit Stellplätzen in der Nähe.
  - 🥾 **Wander- & Radwege**: Offizielle Fernwander- und Radrouten (u.a. DZT Knowledge Graph) mit GPX-Tracks & Campingplätzen entlang der Strecke.
  - 📅 **Events & Weinfeste**: Weinfeste, Märkte, Festivals & Kultur in ganz Deutschland.
  - 🏰 **Sehenswürdigkeiten**: Schlösser, Burgen, Naturparke und Highlights in ganz Europa.
- 🌐 **Vollständige Mehrsprachigkeit & SEO-Optimierung**:
  - 5 Sprachen (Deutsch 🇩🇪, English 🇬🇧, Français 🇫🇷, Italiano 🇮🇹, Nederlands 🇳🇱) vollständig integriert.
  - Dynamische, lokalisierte Metatags (Titel, Description, Keywords, OpenGraph & hreflang) für alle Entdecken-Hubs und Finder-Seiten.
  - Automatische Breadcrumb-Navigation auf allen Unterseiten.
- 📱 **Responsives Header-Layout & UI-Polishing**:
  - Optimierte Navigation für mobile Geräte, Tablets und Desktops ohne Überlappungen.
  - Schneller Alias-Redirect von `/app` auf den `/prompt-generator`.
- 🤖 **Bring Your Own Key (BYOK) KI-Architektur**:
  - Eigener API-Key (Gemini, OpenAI, Anthropic, Mistral, Perplexity, OpenRouter) sicher im Browser hinterlegbar.
  - Smarte 0€-Deterministische Suche für klare Suchanfragen ohne API-Kosten.
- 🔌 **Model Context Protocol (MCP) Server & Landingpage (`/mcp`)**:
  - Dedizierte interaktive Dokumentationsseite `/mcp` mit 1-Klick-Setups für Claude Desktop, Cursor IDE, Antigravity und Python/cURL.
  - Vollständiger Tool-Katalog aller 10 MCP-Tools (Camping, Wanderwege, Events, Sights, Reviews, Reiselisten).
  - Integrierter SSE-Live-Endpoint (`/discover/mcp`) zur direkten Anbindung an KI-Agenten.

---

## 📦 Kern-Features

### 🎯 KI-Prompt-Assistent & Routenplaner
- 7-Schritte-Assistent für optimal strukturierte Reise- und Routen-Prompts.
- Fahrzeugspezifische Filter (Länge, Höhe, Gesamtgewicht, Führerscheinklasse, Maut-/Fährenpräferenzen).
- Kompatibel mit allen gängigen KI-Modellen (ChatGPT, Gemini, Claude, Mistral, Perplexity).

### 📍 GPX-Export & Offline-Nutzung
- Direkter Download strukturierter GPX-Dateien (Wegpunkte, Tracks und Etappen für Garmin, OsmAnd, Locus Map).
- Lokale Speicherung im Browser ohne Registrierungszwang.
- Druck- und PDF-optimierte Reiseunterlagen.

### 🏕️ Entdecken & Spot-Finder
- Suche nach Kriterien (Lage am See, Berge, Hundefreundlich, Ver- & Entsorgung, Strom).
- Detailansichten mit direkten Links zur Website, Kontaktdaten und Anfahrtsinformationen.

---

## 💻 Tech Stack & Architektur

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Leaflet / OpenStreetMap
- **Backend**: Node.js / Express (Port 3002 für API & Static Dist, Port 3000 für Entdecken-Suche & MCP)
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

# 3. Entdecken-Backend Abhängigkeiten installieren
cd entdecken-backend
npm install
cd ..

# 4. Entwicklungs-Server starten
# Terminal 1: Entdecken-Backend
cd entdecken-backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

---

## 📄 Lizenz
 
PolyForm Noncommercial License 1.0.0 © 2026 [chrischtili](https://github.com/chrischtili)
