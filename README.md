# Camping Route

[![Version](https://img.shields.io/badge/version-v0.5.2-blue.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

Camping Route ist ein mehrsprachiger KI-Prompt-Generator fuer Camping- und Roadtrip-Routen mit Wohnmobil, Wohnwagen, Zelt oder Motorrad. Statt selbst die Route zu berechnen, hilft die App dabei, strukturierte Prompts fuer ChatGPT, Claude und andere KI-Tools zu erstellen, inklusive Etappen, Stellplatz- und Campingplatzsuche sowie GPX-Ausgabe.

Live: [https://campingroute.app](https://campingroute.app)

## Highlights (v0.5.2)

- Eigenstaendige Landingpages fuer `Prompt-Generator`, `Campingplatz-Finder` und `Stellplatz-Finder`
- Deutlich staerkere Mobile-Nutzung ohne die frueheren Slide-in-Panels
- Platzuebernahme aus den Solo-Findern direkt als Ziel oder Zwischenziel in den Prompt-Generator
- Generator-Entwurf bleibt beim Wechsel zwischen Prompt-Generator und Findern im selben Tab erhalten
- Release-Hinweise, Navbar und Footer zeigen konsistent denselben sichtbaren Versionsstand
- Vollstaendig mehrsprachig: Deutsch, Englisch, Niederlaendisch, Franzoesisch, Italienisch

## Kernfunktionen

### KI-Prompt-Planer
- Strukturierter Routenplaner fuer Start, Ziel, Etappen, Fahrzeugdaten und Reisevorlieben
- Prompt-Ausgabe fuer externe KI-Tools statt direkter Routengenerierung in der App
- Unterstuetzung fuer Route generieren, Prompt generieren und GPX-bezogene Ausgabeanweisungen

### Platzfinder
- Suche nach Campingplaetzen und Stellplaetzen fuer konkrete Orte
- Eigenstaendig als eigene Seite nutzbar oder direkt im Planer zur Uebernahme in die Route
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

Camping Route is a multilingual AI prompt generator for camping and road-trip planning. It helps users create structured prompts for tools like ChatGPT or Claude, including route stages, campsite and motorhome stopover search, and GPX export instructions. Version `0.5.2` adds dedicated landing pages for the prompt generator plus campsite and stopover finders, smoother mobile flows without the old slide-in panels, handoff from solo finder results into the prompt generator, and a consistent visible release state across navbar, footer, and the what's-new popup.
