# 🚐 Camping Route - KI-Prompt-Generator für Wohnmobile

[![Version](https://img.shields.io/badge/version-v0.4.4-blue.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

**Der intelligente KI-Prompt-Generator speziell für Wohnmobile & Camper – jetzt international!**

👉 **Live Demo**: [https://campingroute.app](https://campingroute.app)

---

## 🌟 Highlights (v0.4.4)

- **Ausgabefenster deutlich verbessert**: strukturierteres Rendering, bessere Typografie, formatiere/rohe Ansicht und sauberere Druckausgabe.
- **Neue Urlaubsziel-Logik für Hin- und Rückreise**: Startpunkt, Rückkehrziel und festes Urlaubsziel lassen sich getrennt planen, damit die KI Anreise, Aufenthalt und Rückfahrt realistischer berechnet.
- **Etappenreise ausgebaut**: dynamische Etappenziele mit eigenem Datum und Uhrzeit statt starrer Zwischenstopps.
- **Routenoptimierung klarer strukturiert** mit wohnmobilrelevanten Ausschlüssen wie Innenstädte, Altstädte, schmale Straßen, unbefestigte Straßen, Fähren und Serpentinen.
- **Gemini-Fehler verständlicher**: bei Überlastung von Gemini wird jetzt eine klare Meldung statt eines generischen KI-Fehlers angezeigt.
- **Formular- und Mobile-UX weiter verbessert**: sauberere Toggle-Umbrüche, besserer ExampleRoute-Hintergrund und konsistentere Zusammenfassungs-/Support-Bereiche.
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

[![Version](https://img.shields.io/badge/version-v0.4.4-blue.svg)](https://github.com/chrischtili/campingrouteapp)

**The intelligent AI prompt generator specifically for motorhomes & campers – now international!**

---

## 🌟 Highlights (v0.4.4)

- **Major output-window upgrade**: cleaner rendering, better typography, formatted/raw view switching, and improved print output.
- **New vacation-destination logic for outbound and return trips**: start point, return destination, and fixed vacation destination can now be planned separately so the AI can calculate departure, stay, and return more realistically.
- **Stage travel expanded**: dynamic stage destinations with their own date and time instead of two rigid stop fields.
- **Refined route optimization** with clearer categories and new motorhome-relevant avoidances like city centers, old towns, narrow roads, unpaved roads, ferries, and hairpin roads.
- **Clearer Gemini errors**: Gemini overload situations now show a specific message instead of a generic AI error.
- **Further form and mobile UX improvements**: cleaner toggle wrapping, better ExampleRoute background styling, and more consistent summary/support areas.
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
