# 🚐 Camping Route - KI-Routenplaner für Camping- und Roadtrip-Routen

[![Version](https://img.shields.io/badge/version-v0.5.13-blue.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

**Der KI-Routenplaner für Wohnmobil, Wohnwagen, Zelt und Motorrad – mit passenden Stopps, Etappen und GPX-Export.**

👉 **Live Demo**: [https://campingroute.app](https://campingroute.app)

---

## 🌟 Highlights (v0.5.13)

- **Neues Planer-Panel**: Der Routenplaner öffnet sich jetzt als seitliches Overlay statt als langer Seitenblock.
- **Platzfinder direkt im Planer**: Campingplätze und Stellplätze lassen sich ortsbasiert suchen und direkt als Ziel oder Zwischenziel übernehmen.
- **Lokale Planungen verbessert**: Die letzten fünf Planungen können im Browser gespeichert, geladen, exportiert und importiert werden.
- **Beispielroute direkt über die Navigation**: Der Navbar-Link öffnet den passenden FAQ-Eintrag automatisch.
- **Fahrzeuglogik erweitert**: Pkw mit Zelt, Pkw mit Dachzelt, Fahrrad mit Zelt und Motorrad + Zelt sind sauber abgebildet; irrelevante Felder werden ausgeblendet und nicht in den Prompt übernommen.
- **Prompt und UI sprachlich neutraler**: Formulierungen passen jetzt besser zu unterschiedlichen Fahrzeugtypen und internationalen Zielen.
- **Vollständig mehrsprachig**: Deutsch 🇩🇪, Englisch 🇬🇧, Niederländisch 🇳🇱, Französisch 🇫🇷, Italienisch 🇮🇹.
- **100% kostenlos** – Prompt-Erstellung ohne API-Kosten möglich.

---

[![Support CampingRoute](https://img.shields.io/badge/Support%20CampingRoute-40DCA5?style=for-the-badge&logo=buymeacoffee&logoColor=ffffff&labelColor=000000)](https://www.buymeacoffee.com/campingroute)

## 📦 Features

### 🎯 Routenplanung
- Einseiten-Planer mit klaren Sektionen statt starrem Wizard.
- Etappenoptimierung mit Pausen und Alternativrouten.
- Prompt-Erstellung für ChatGPT, Claude und andere KI-Tools.

### 🚐 Fahrzeugintegration
- Größe, Gewicht, Führerscheinklasse und technische Ausstattung.
- Kraftstoffart und technische Ausstattung (Solar, Batterie, Toilettensystem).
- Spezifische Anforderungen werden direkt in den KI-Prompt übernommen.

### 🏕️ Übernachtungen & Interessen
- Stellplatz-Suche nach Kriterien (Campingplatz, Wildcampen, Bauernhof etc.).
- Ausstattung (Strom, Wasser, Hunde erlaubt, Pool).
- Aktivitäten-Filter (Wandern, Kultur, Gastronomie, Fotografie).

### 📥 Export & Integration
- **GPX-Datei-Anweisung** für Navigationsgeräte im generierten Prompt.
- Lokaler Export und Import kompletter Planungen.
- In Zwischenablage kopieren für die Nutzung in ChatGPT, Claude oder anderen KI-Tools.

## 💻 Technische Details

### Unterstützter KI-Workflow
| Modus | Beschreibung |
|-------|--------------|
| Prompt generieren | Erzeugt einen fertigen Prompt für externe KI-Tools |
| Externe KI | Nutzung in ChatGPT, Claude oder vergleichbaren Tools |

### Tech-Stack
- **Frontend**: React 18, TypeScript, Vite
- **Internationalisierung**: i18next, react-i18next
- **UI**: ShadCN, Tailwind CSS, Framer Motion
- **Routing**: React Router v6

## 🚀 Installation

```bash
# Repository klonen
git clone https://github.com/chrischtili/campingrouteapp.git
cd campingrouteapp

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## 🔮 Roadmap

- [ ] Benutzerkonten mit Routenspeicherung
- [ ] Community-Features (Route teilen & bewerten)
- [ ] Token-basierte KI-Routengenerierung
- [ ] Integration mit Navigations-Apps (Komoot, Garmin)
- [ ] Erweiterung auf weitere Sprachen (Spanisch, Polnisch)

## 🤝 Beitragende

- [chrischtili](https://github.com/chrischtili) - Lead Developer
- [Gemini CLI](https://github.com/google/gemini-cli) - KI-Entwicklungsassistent

## 📄 Lizenz

MIT License - [Details](LICENSE)

---

# 🚐 Camping Route - AI Prompt Generator for Motorhomes

[![Version](https://img.shields.io/badge/version-v0.5.13-blue.svg)](https://github.com/chrischtili/campingrouteapp)

**The intelligent AI route planner for RVs, caravans, tents, and motorcycles – now international!**

---

## 🌟 Highlights (v0.5.13)

- **New planner panel**: the route planner now opens as a side overlay instead of a long page block.
- **Place finder inside the planner**: campsites and motorhome pitches can be searched by town and inserted directly as destination or stopover.
- **Improved local planning storage**: the last five plans can be stored in the browser, reopened, exported, and imported again.
- **Sample route available from the navigation**: the navbar link opens the matching FAQ entry automatically.
- **Expanded vehicle logic**: car + tent, car + roof tent, bicycle + tent, and motorcycle + tent are now handled cleanly; irrelevant fields are hidden and excluded from prompts.
- **More neutral prompt and UI copy**: wording now fits different vehicle types and international destinations better.
- **Fully multilingual**: German 🇩🇪, English 🇬🇧, Dutch 🇳🇱, French 🇫🇷, Italian 🇮🇹.
- **100% Free** – Prompt generation possible without any API costs.

---

[![Support CampingRoute](https://img.shields.io/badge/Support%20CampingRoute-40DCA5?style=for-the-badge&logo=buymeacoffee&logoColor=ffffff&labelColor=000000)](https://www.buymeacoffee.com/campingroute)

## 📦 Features

### 🎯 Route Planning
- Single-page planner with focused sections instead of a rigid step wizard.
- Stage optimization with breaks and alternative routes.
- Prompt generation for ChatGPT, Claude, and similar AI tools.

### 🚐 Vehicle Integration
- Size, weight, and axle load calculation.
- Fuel type and technical equipment (solar, battery, toilet system).
- Specific requirements are directly incorporated into the AI prompt.

### 🏕️ Accommodation & Interests
- Pitch search by criteria (campsite, wild camping, farm, etc.).
- Facilities (power, water, dog-friendly, pool).
- Activity filters (hiking, culture, gastronomy, photography).

### 📥 Export & Integration
- GPX export instructions inside the generated prompt.
- Local export and import of complete plans.
- Clipboard-friendly output for use in ChatGPT, Claude, or similar tools.

## 🤝 Contributors

- [chrischtili](https://github.com/chrischtili) - Lead Developer
- [Gemini CLI](https://github.com/google/gemini-cli) - AI Development Assistant
- Codex (OpenAI) - AI Development Assistant

---

© 2026 Camping Route - Created with ❤️ for motorhome enthusiasts
