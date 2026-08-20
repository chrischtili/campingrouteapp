# 🚐 Camping Route - KI Wohnmobil Routenplaner & Entdecken (v0.7.0)

[![Version](https://img.shields.io/badge/version-v0.7.0-emerald.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

**Die smarte Plattform für Wohnmobil-Reisende, Camper & Roadtripper in Europa – mit KI-Routenplaner, interaktivem Entdecken-Portal und MCP-KI-Integration!**

👉 **Live Demo**: [https://campingroute.app](https://campingroute.app)

---

## 🌟 Neu in Version 0.7.0

- 🧭 **Neues „Entdecken“-Portal (`/entdecken`)**:
  - Interaktive Kartensuche für verifizierte Camping- & Stellplätze in ganz Europa (aus OpenStreetMap mit geprüfter Webadresse).
  - Sehenswürdigkeiten & Highlights direkt aus Wikidata mit Bildern und Hintergrundinfos.
  - Schnelle Länderfilter (Deutschland 🇩🇪, Österreich 🇦🇹, Schweiz 🇨🇭, Italien 🇮🇹, Frankreich 🇫🇷, Schweden 🇸🇪, Niederlande 🇳🇱, Dänemark 🇩🇰).
- 🤖 **Bring Your Own Key (BYOK) KI-Architektur**:
  - Volle Kontrolle über KI-Kosten: Eigener API-Key (Gemini, OpenAI, Anthropic, Mistral, Perplexity, OpenRouter) im Browser hinterlegbar.
  - Smarte 0€-Deterministische Suche für klare Suchanfragen ohne API-Kosten.
- 🔌 **Model Context Protocol (MCP) Server**:
  - Integrierter MCP-Server zur direkten Anbindung an Cursor, Claude Desktop oder KI-Agenten, um Camping- & Routendaten abzufragen.
- 🎨 **Modernes UI-Design & Breadcrumb-Navigation**:
  - Elegantes Dark/Light-Theme, nahtlose Breadcrumb-Navigation und 100% DSGVO-konforme lokale Schriftarten (`@fontsource/plus-jakarta-sans`).

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

MIT © [chrischtili](https://github.com/chrischtili)
