# 🚐 Camping Route - KI-Routenplaner für Camping- und Roadtrip-Routen

[![Version](https://img.shields.io/badge/version-v0.5.2-blue.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

**Der KI-Routenplaner für Wohnmobil, Wohnwagen, Zelt und Motorrad – mit passenden Stopps, Etappen und GPX-Export.**

👉 **Live Demo**: [https://campingroute.app](https://campingroute.app)

---

## 🌟 Highlights (v0.5.2)

- **5 letzte Planungen lokal speicherbar**: Formulareingaben lassen sich direkt im Browser sichern, laden, überschreiben und löschen.
- **Neues Einseiten-Formular**: Der Planer arbeitet jetzt ohne starren Schritt-Assistenten und bündelt Details in klaren Sektionen und Popups.
- **Light- und Dark-Design**: Beide Themes sind vollständig ausgearbeitet, inklusive Popups, Akkordeons und Formularsektionen.
- **Route-Überblick im Ergebnis**: Ausgabe zeigt kompakt Route, Tageslimits, Budget, Fahrfokus und längere Stopps.
- **Etappen-Ampel ergänzt**: KI-Ergebnisse heben Etappen als `unkritisch`, `mit Vorsicht` oder `eher ungeeignet` hervor.
- **Regionen-Rundtouren verbessert**: Zielgebiete und „längere Stopps an besonders schönen Orten“ sind direkt in der Reiseroute integriert.
- **Filter-Dialoge statt Formularwand**: Route, Fahrzeug, Übernachtung und Optimierung lassen sich kompakt über Popups und Sheets steuern.
- **Vollständig mehrsprachig**: Deutsch 🇩🇪, Englisch 🇬🇧, Niederländisch 🇳🇱, Französisch 🇫🇷, Italienisch 🇮🇹.
- **KI-gestützte Routenplanung** mit GPX-Export für Navigationsgeräte.
- **100% kostenlos** – Prompt-Erstellung ohne API-Kosten möglich.

---

[![Support CampingRoute](https://img.shields.io/badge/Support%20CampingRoute-40DCA5?style=for-the-badge&logo=buymeacoffee&logoColor=ffffff&labelColor=000000)](https://www.buymeacoffee.com/campingroute)

## 📦 Features

### 🎯 Routenplanung
- Einseiten-Planer mit klaren Sektionen statt starrem Wizard.
- Etappenoptimierung mit Pausen und Alternativrouten.
- Echtzeit-KI-Generierung (mit eigenem API-Key) oder Prompt-Erstellung (kostenlos).

### 🚐 Fahrzeugintegration
- Größe, Gewicht, Führerscheinklasse und technische Ausstattung.
- Kraftstoffart und technische Ausstattung (Solar, Batterie, Toilettensystem).
- Spezifische Anforderungen werden direkt in den KI-Prompt übernommen.

### 🏕️ Übernachtungen & Interessen
- Stellplatz-Suche nach Kriterien (Campingplatz, Wildcampen, Bauernhof etc.).
- Ausstattung (Strom, Wasser, Hunde erlaubt, Pool).
- Aktivitäten-Filter (Wandern, Kultur, Gastronomie, Fotografie).

### 📥 Export & Integration
- **GPX-Datei-Download** für Navigationsgeräte.
- Druckfunktion für die fertige Route.
- In Zwischenablage kopieren für die Nutzung in ChatGPT, Gemini oder Mistral.

## 💻 Technische Details

### Unterstützte KI-Modelle
| Anbieter | Modell | Empfehlung |
|----------|--------|------------|
| Google | Gemini 3.1 Pro Preview | Beste Wahl für Europa |
| OpenAI | GPT-5.2 / GPT-5.4 | Logisch stark, jetzt beide mit Websuche |
| Mistral | Mistral Large | Europäisch optimiert |

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
- [ ] Integration mit Navigations-Apps (Komoot, Garmin)
- [ ] Erweiterung auf weitere Sprachen (Spanisch, Polnisch)

## 🤝 Beitragende

- [chrischtili](https://github.com/chrischtili) - Lead Developer
- [Gemini CLI](https://github.com/google/gemini-cli) - KI-Entwicklungsassistent

## 📄 Lizenz

MIT License - [Details](LICENSE)

---

# 🚐 Camping Route - AI Prompt Generator for Motorhomes

[![Version](https://img.shields.io/badge/version-v0.5.2-blue.svg)](https://github.com/chrischtili/campingrouteapp)

**The intelligent AI route planner for RVs, caravans, tents, and motorcycles – now international!**

---

## 🌟 Highlights (v0.5.2)

- **Store up to 5 recent plans locally**: save, load, overwrite and delete route setups directly in the browser.
- **New single-page planner**: the route flow now uses focused sections and overlays instead of a rigid step wizard.
- **Complete light and dark themes**: both themes now cover popups, accordions and planner sections consistently.
- **New route overview in the output**: compact summary for route, daily limits, budget, travel focus and longer scenic stops.
- **Stage traffic-light added**: direct-AI results highlight stages as `uncritical`, `with caution` or `rather unsuitable`.
- **Region-based roundtrips improved**: target regions and “longer stops at especially beautiful places” are now built into the route flow.
- **Filter dialogs instead of a form wall**: route, vehicle, accommodation and optimization settings can now be adjusted in focused popups/sheets.
- **Fully multilingual**: German 🇩🇪, English 🇬🇧, Dutch 🇳🇱, French 🇫🇷, Italian 🇮🇹.
- **AI-powered Route Planning** with GPX export for navigation devices.
- **100% Free** – Prompt generation possible without any API costs.

---

[![Support CampingRoute](https://img.shields.io/badge/Support%20CampingRoute-40DCA5?style=for-the-badge&logo=buymeacoffee&logoColor=ffffff&labelColor=000000)](https://www.buymeacoffee.com/campingroute)

## 📦 Features

### 🎯 Route Planning
- Single-page planner with focused sections instead of a rigid step wizard.
- Stage optimization with breaks and alternative routes.
- Real-time AI generation (with your own API key) or prompt creation (free).

### 🚐 Vehicle Integration
- Size, weight, and axle load calculation.
- Fuel type and technical equipment (solar, battery, toilet system).
- Specific requirements are directly incorporated into the AI prompt.

### 🏕️ Accommodation & Interests
- Pitch search by criteria (campsite, wild camping, farm, etc.).
- Facilities (power, water, dog-friendly, pool).
- Activity filters (hiking, culture, gastronomy, photography).

## 🤝 Contributors

- [chrischtili](https://github.com/chrischtili) - Lead Developer
- [Gemini CLI](https://github.com/google/gemini-cli) - AI Development Assistant
- Codex (OpenAI) - AI Development Assistant

---

© 2026 Camping Route - Created with ❤️ for motorhome enthusiasts
