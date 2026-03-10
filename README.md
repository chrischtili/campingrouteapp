# 🚐 Camping Route - KI-Routenplaner für Camping- und Roadtrip-Routen

[![Version](https://img.shields.io/badge/version-v0.5.1-blue.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

**Der KI-Routenplaner für Wohnmobil, Wohnwagen, Zelt und Motorrad – mit passenden Stopps, Etappen und GPX-Export.**

👉 **Live Demo**: [https://campingroute.app](https://campingroute.app)

---

## 🌟 Highlights (v0.5.1)

- **Routen lokal auf dem PC speicherbar**: Planungen lassen sich ohne API-Key als JSON-Datei exportieren und später wieder importieren.
- **5 letzte Planungen zusätzlich im Browser speicherbar**: Formulareingaben lassen sich direkt lokal sichern, laden, überschreiben und löschen.
- **Klarer Prompt-Workflow**: Der Planer konzentriert sich auf saubere Prompts für externe KI-Tools statt auf überladene KI-Einstellungen.
- **Neues Einseiten-Formular**: Der Planer arbeitet ohne starren Schritt-Assistenten und bündelt Details in klaren Sektionen und Popups.
- **Light- und Dark-Design überarbeitet**: Sektionen, Popups, FAQ und Sticky-Aktionen sind visuell aufeinander abgestimmt.
- **Kompakte Übersichten in Buttons & Zusammenfassung**: Eingaben werden direkt auf Triggern und im Summary-Bereich verdichtet angezeigt.
- **Beispielroute gestrafft**: Showcase-Route ist deutlich kompakter und in allen Sprachen auf denselben Stand gebracht.
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

[![Version](https://img.shields.io/badge/version-v0.5.1-blue.svg)](https://github.com/chrischtili/campingrouteapp)

**The intelligent AI route planner for RVs, caravans, tents, and motorcycles – now international!**

---

## 🌟 Highlights (v0.5.1)

- **Save routes locally on your PC**: plans can be exported as JSON files without any API key and imported again later.
- **Store up to 5 recent plans in the browser as well**: save, load, overwrite, and delete route setups locally.
- **Clear prompt-focused flow**: the planner now focuses on clean prompts for external AI tools instead of overloaded AI settings.
- **New single-page planner**: the route flow now uses focused sections and overlays instead of a rigid step wizard.
- **Refined light and dark themes**: sections, popups, FAQ, and sticky actions now feel visually aligned.
- **Compact summaries in buttons and overview cards**: entered data surfaces directly where it is most useful.
- **Radically shortened example route**: the showcase route is now much leaner and aligned across all languages.
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
