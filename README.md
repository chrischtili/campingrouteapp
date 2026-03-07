# 🚐 Camping Route - KI-Routenplaner für Camping, Wohnmobil, Wohnwagen, Zelt & Motorrad

[![Version](https://img.shields.io/badge/version-v0.4.8-blue.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

**Der intelligente KI-Routenplaner für Camping, Wohnmobil, Wohnwagen, Zelt & Motorrad – jetzt international!**

👉 **Live Demo**: [https://campingroute.app](https://campingroute.app)

---

## 🌟 Highlights (v0.4.8)

- **5 letzte Planungen lokal speicherbar**: Formulareingaben lassen sich direkt im Browser sichern, laden, überschreiben und löschen.
- **Route-Überblick im Ergebnis**: Ausgabe zeigt kompakt Route, Tageslimits, Budget, Fahrfokus und längere Stopps.
- **Etappen-Ampel ergänzt**: KI-Ergebnisse heben Etappen als `unkritisch`, `mit Vorsicht` oder `eher ungeeignet` hervor.
- **Regionen-Rundtouren verbessert**: Zielgebiete und „längere Stopps an besonders schönen Orten“ sind direkt in der Reiseroute integriert.
- **Akkordeons verhalten sich konsistenter**: geöffnete Bereiche scrollen einheitlich statt unruhig zu springen.
- **Vollständig mehrsprachig**: Deutsch 🇩🇪, Englisch 🇬🇧, Niederländisch 🇳🇱, Französisch 🇫🇷, Italienisch 🇮🇹.
- **KI-gestützte Routenplanung** mit GPX-Export für Navigationsgeräte.
- **100% kostenlos** – Prompt-Erstellung ohne API-Kosten möglich.

---

[![Support CampingRoute](https://img.shields.io/badge/Support%20CampingRoute-40DCA5?style=for-the-badge&logo=buymeacoffee&logoColor=ffffff&labelColor=000000)](https://www.buymeacoffee.com/campingroute)

## 📦 Features

### 🎯 Routenplanung
- 7-Schritte-Assistent für perfekte Planung.
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

[![Version](https://img.shields.io/badge/version-v0.4.8-blue.svg)](https://github.com/chrischtili/campingrouteapp)

**The intelligent AI route planner for RVs, caravans, tents, and motorcycles – now international!**

---

## 🌟 Highlights (v0.4.8)

- **Store up to 5 recent plans locally**: save, load, overwrite and delete route setups directly in the browser.
- **New route overview in the output**: compact summary for route, daily limits, budget, travel focus and longer scenic stops.
- **Stage traffic-light added**: direct-AI results highlight stages as `uncritical`, `with caution` or `rather unsuitable`.
- **Region-based roundtrips improved**: target regions and “longer stops at especially beautiful places” are now built into the route flow.
- **Accordion behavior is more consistent**: opened sections scroll into view cleanly instead of jumping around.
- **Fully multilingual**: German 🇩🇪, English 🇬🇧, Dutch 🇳🇱, French 🇫🇷, Italian 🇮🇹.
- **AI-powered Route Planning** with GPX export for navigation devices.
- **100% Free** – Prompt generation possible without any API costs.

---

[![Support CampingRoute](https://img.shields.io/badge/Support%20CampingRoute-40DCA5?style=for-the-badge&logo=buymeacoffee&logoColor=ffffff&labelColor=000000)](https://www.buymeacoffee.com/campingroute)

## 📦 Features

### 🎯 Route Planning
- 7-step assistant for perfect planning.
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
