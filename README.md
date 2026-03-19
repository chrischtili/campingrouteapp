# Camping Route

[![Version](https://img.shields.io/badge/version-v0.5.16-blue.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

Camping Route ist ein mehrsprachiger KI-Prompt-Generator fuer Camping- und Roadtrip-Routen mit Wohnmobil, Wohnwagen, Zelt oder Motorrad. Statt selbst die Route zu berechnen, hilft die App dabei, strukturierte Prompts fuer ChatGPT, Claude und andere KI-Tools zu erstellen, inklusive Etappen, Stellplatz- und Campingplatzsuche sowie GPX-Ausgabe.

Live: [https://campingroute.app](https://campingroute.app)

## Highlights (v0.5.16)

- Eigenstaendiger Platzfinder als linkes Slide-in-Panel neben dem normalen Prompt-Planer
- Ortsvorschlaege beim Tippen fuer stabilere Platzsuche nach konkreten Staedten und Orten
- Robustere Ortserkennung und tolerantere Platzsuche im Backend
- Separate Statistik fuer Solo-Nutzung des Platzfinders
- Ruhigere Toggle-Karten fuer Campingplatz- und Stellplatzfilter
- Vollstaendig mehrsprachig: Deutsch, Englisch, Niederlaendisch, Franzoesisch, Italienisch

## Kernfunktionen

### KI-Prompt-Planer
- Strukturierter Routenplaner fuer Start, Ziel, Etappen, Fahrzeugdaten und Reisevorlieben
- Prompt-Ausgabe fuer externe KI-Tools statt direkter Routengenerierung in der App
- Unterstuetzung fuer Route generieren, Prompt generieren und GPX-bezogene Ausgabeanweisungen

### Platzfinder
- Suche nach Campingplaetzen und Stellplaetzen fuer konkrete Orte
- Eigenstaendig als Panel nutzbar oder direkt im Planer zur Uebernahme in die Route
- Ortsvorschlaege beim Tippen fuer praezisere Suche
- OSM-/OpenStreetMap-basierte Platzdaten mit Detailansicht und externen Links

### Planungen & Export
- Lokales Speichern von bis zu 5 Planungen im Browser
- Import und Export kompletter Planungen als JSON
- Copy-/Print-Flow fuer den fertigen KI-Prompt

### Statistik & Feedback
- Admin-Statistik fuer Besuche, Prompt-Nutzung, Direkt-KI, Platzfinder und Solo-Platzfinder
- Feedback-Erfassung fuer Prompt- und Direkt-KI-Use-Cases
- Release-Hinweise pro Version via What's-new-Popup

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- i18next
- Node.js Server (`server/index.cjs`) fuer Counter, Feedback und Place-Finder-API

## Lokale Entwicklung

```bash
git clone https://github.com/chrischtili/campingrouteapp.git
cd campingrouteapp
npm install
npm run dev
```

Optional den lokalen Server separat starten:

```bash
npm run server
```

Build:

```bash
npm run build
```

## Release-Workflow

- Versionsnummer in `package.json`
- Build schreibt `dist/version.json` ueber `scripts/write-version.mjs`
- Navbar, Footer und What's-new-Popup lesen diese Version fuer den sichtbaren Release-Stand
- GitHub Releases koennen auf Basis der jeweiligen Versionstags erstellt werden

## Projektstatus

Camping Route ist bewusst als praktischer Prompt-Generator aufgebaut: Die App liefert die strukturierte Vorlage fuer deine Lieblings-KI und ergaenzt sie um hilfreiche Werkzeuge wie Platzfinder, GPX-Hinweise und lokale Planungsverwaltung.

## Lizenz

MIT - siehe [LICENSE](LICENSE)

## English Summary

Camping Route is a multilingual AI prompt generator for camping and road-trip planning. It helps users create structured prompts for tools like ChatGPT or Claude, including route stages, campsite and motorhome stopover search, and GPX export instructions. Version `0.5.16` adds a standalone place finder panel, type-ahead place suggestions, better backend resilience for city matching, separate solo place-finder stats, and calmer toggle-based place filters.
