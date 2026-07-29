# 🚐 Camping Route - KI Wohnmobil Routenplaner

[![Version](https://img.shields.io/badge/version-v0.5.9-blue.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

**Der KI-Routenplaner speziell für Wohnmobile & Camper!**

👉 **Live Demo**: [https://campingroute.app](https://campingroute.app)

[English version below](#-english-version)

---

## 🌟 Highlights (v0.5.9)

- **GEO & AEO Optimierung**: Vollständige Unterstützung für KI-Suchmaschinen (Perplexity, ChatGPT, Google AI Overviews) via dynamische Schema.org JSON-LD (FAQPage, HowTo & WebApplication).
- **Strukturierte Mikrodaten**: HTML5-Microdata in FAQs für direkte KI-Zitate und Direct Answers.
- **Exklusive Suchplattformen**: Die KI sucht exklusiv auf camping.info und stellplatz.info nach passenden Übernachtungsmöglichkeiten.
- **Öffnungszeiten-Check**: Aktive Prüfung, ob Plätze zur geplanten Reisezeit geöffnet haben (mit Nutzerwarnung bei geschlossenen Plätzen).

## 📦 Features

### 🎯 KI-Prompt-Planer
- 7-Schritte-Assistent für die perfekte Routenstruktur.
- Fahrzeugspezifische Angaben (Größe, Gewicht, Vorlieben).
- Generiert optimierte Prompts für alle gängigen KI-Modelle.

### 🏕️ Platzfinder
- Integrierte Suche nach Camping- und Stellplätzen via OpenStreetMap (OSM).
- Detailansichten mit Ausstattung (Strom, Wasser, Toilets) und direkten Links.
- Übernahme von Fundstellen mit einem Klick in deine Route.

### 📥 Export & Integration
- Unterstützung für **GPX-Datei-Downloads** (Garmin-Wegpunkte oder Route+Track).
- Lokales Speichern von Planungen im Browser (kein Login nötig).
- PDF- und Druck-optimierte Ausgabe des Reiseplans.

## 💻 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **I18n**: react-i18next (5 Sprachen)
- **Maps**: Leaflet / OpenStreetMap

---

## 🌍 English Version

**The AI Route Planner specifically for RVs & Campers!**

### 🌟 Highlights (v0.5.9)

- **GEO & AEO Optimization**: Full support for AI search engines (Perplexity, ChatGPT, Google AI Overviews) via dynamic Schema.org JSON-LD (FAQPage, HowTo & WebApplication).
- **Structured Microdata**: HTML5 microdata in FAQs for direct AI snippet citations.
- **Exclusive Search Platforms**: The AI searches exclusively on camping.info and stellplatz.info for suitable overnights.
- **Opening Hours Check**: Active verification if places are open during your planned travel time.

### 📦 Features

- **AI Prompt Planner**: 7-step assistant for perfect route structure.
- **Place Finder**: Integrated search for campsites and stopovers via OpenStreetMap.
- **Export & Integration**: Support for GPX downloads, local saving, and PDF/Print output.

### 🛠 Installation

```bash
npm install
npm run dev
```

---

## 📄 Lizenz / License

MIT - [chrischtili](https://github.com/chrischtili)
