# 🚐 Camping Route - KI Wohnmobil Routenplaner (v0.6.1)

[![Version](https://img.shields.io/badge/version-v0.6.1-emerald.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

**Der KI-Routenplaner speziell für Wohnmobile, Camper & Roadtrips in Europa!**

👉 **Live Demo**: [https://campingroute.app](https://campingroute.app)

---

## 🌟 Neues Sightseer-Design & Updates (v0.6.1)

- **Sightseer-Design Redesign**: Komplett überarbeitete Benutzeroberfläche inspiriert von Sightseer – inklusive robuster Pinned Tab-Navbar, klarem Canvas-Hintergrund (`#f9fafb` / `#090d16`), 3-Stufen-Roadtrip-Banner und abgerundeten Karten-Containern.
- **100% DSGVO-Konforme Lokale Schriften**: Sämtliche Google Fonts CDN-Aufrufe wurden durch lokal gehostete `@fontsource/plus-jakarta-sans` ersetzt. Keine externen Schriftarten-Verbindungen.
- **Pinned Tab Navigation**: Schneller Wechsel zwischen Prompt-Assistent, Campingplatz-Finder und Stellplatz-Finder direkt über die obere Menüleiste.
- **Optimierter Dark Mode**: Einheitliches, augenschonendes Slate-Dark-Design ohne veraltete Schatten- oder Gradienten-Altlasten.

---

## 📦 Core Features

### 🎯 KI-Prompt-Assistent
- 7-Schritte-Assistent für perfekt strukturierte KI-Prompts.
- Fahrzeugspezifische Angaben (Länge, Höhe, Gewicht, Führerschein, Ausrüstung).
- Erstellt optimierte Prompts für ChatGPT, Gemini, Perplexity, Claude & Mistral.

### 🏕️ Campingplatz- & Stellplatz-Finder
- Integrierte Direkt-Suche für europäische Camping- und Stellplätze via OpenStreetMap (OSM).
- Detaillierte Filter und direkte Einbindung von Suchergebnissen als Etappen in deine Route.

### 📍 GPX-Export & Offline-Speicherung
- Direkter Download von GPX-Dateien (Wegpunkte, Tracks, Routen für Garmin / OsmAnd / Locus).
- Lokale Speicherung im Browser ohne Registrierung.
- PDF- und Druck-optimierte Reiseplaner-Ausgabe.

---

## 💻 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, `@fontsource/plus-jakarta-sans`, shadcn/ui, Framer Motion
- **Internationalisierung**: react-i18next (DE, EN, NL, FR, IT)
- **Geodaten**: Leaflet, OpenStreetMap, Nominatim

---

## 🚀 Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/chrischtili/campingrouteapp.git
cd campingrouteapp

# Abhängigkeiten installieren
npm install

# Entwicklungs-Server starten
npm run dev

# Production Build erstellen
npm run build
```

---

## 📄 Lizenz / License

MIT © [chrischtili](https://github.com/chrischtili)
