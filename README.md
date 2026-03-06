# 🚐 Camping Route - KI-Prompt-Generator für Wohnmobile

[![Version](https://img.shields.io/badge/version-v0.4.7-blue.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

**Der intelligente KI-Prompt-Generator speziell für Wohnmobile & Camper – jetzt international!**

👉 **Live Demo**: [https://campingroute.app](https://campingroute.app)

---

## 🌟 Highlights (v0.4.7)

- **OpenCampingMap-only klar sichtbar**: Im Schritt „Übernachtung & Interessen“ ist die Datenquelle jetzt direkt gekennzeichnet.
- **OpenCampingMap-Links robuster**: KI-Antworten werden normalisiert, damit problematische `#position`-Varianten als nutzbare OCM-Links ausgegeben werden.
- **GPX-Doppelausgabe stabiler**: Trennung zwischen zwei GPX-Blöcken wird zuverlässig nachkorrigiert.
- **Gemini-Websuche entfernt**: weniger Streuung, konsistentere Ergebnisse im KI-Direkt-Modus.
- **Prompt-Regeln für Übernachtungen vereinfacht**: Fokus auf funktionierende OCM-Links plus offizielle Platz-Links (wenn vorhanden).
- **Impressum/Datenschutz-Titel korrigiert**: keine erzwungene Großschreibung mehr.
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
| OpenAI | GPT-5.2 | Höchste Sprachqualität |
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

[![Version](https://img.shields.io/badge/version-v0.4.7-blue.svg)](https://github.com/chrischtili/campingrouteapp)

**The intelligent AI prompt generator specifically for motorhomes & campers – now international!**

---

## 🌟 Highlights (v0.4.7)

- **OpenCampingMap-only now visible in UI**: the data source is explicitly labeled in the accommodation step.
- **More robust OpenCampingMap links**: AI output is normalized so problematic `#position` variants become usable OCM links.
- **More stable dual GPX output**: spacing between two GPX blocks is automatically corrected.
- **Gemini web search removed**: less variability and more consistent direct-AI results.
- **Simplified overnight prompt rules**: prioritize working OCM links and official campsite links (when available).
- **Imprint/Privacy titles fixed**: no forced uppercase on page titles.
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
