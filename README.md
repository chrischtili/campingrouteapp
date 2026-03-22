# Camping Route

[![Version](https://img.shields.io/badge/version-v0.5.3-blue.svg)](https://github.com/chrischtili/campingrouteapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://campingroute.app)

Camping Route ist ein mehrsprachiger KI-Prompt-Generator fuer Camping- und Roadtrip-Routen mit Wohnmobil, Wohnwagen, Zelt oder Motorrad. Statt selbst die Route zu berechnen, hilft die App dabei, strukturierte Prompts fuer ChatGPT, Claude und andere KI-Tools zu erstellen, inklusive Etappen, Stellplatz- und Campingplatzsuche sowie GPX-Ausgabe.

Live: [https://campingroute.app](https://campingroute.app)

## Highlights (v0.5.3)

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
cp .env.example .env
# GEOAPIFY_API_KEY in .env setzen
npm run server
```

Optional fuer die Kartenansicht in der Browser-App:

```bash
# Empfohlen fuer Produktion, damit die Trefferkarte nicht auf den OSM-Tile-Fallback angewiesen ist
VITE_GEOAPIFY_MAPS_API_KEY=dein_geoapify_key
```

Build:

```bash
npm run build
```

## Umgebungsvariablen

- `GEOAPIFY_API_KEY`: Empfohlen. Wird serverseitig fuer Ortsvorschlaege und Geocoding verwendet.
- `PLACE_DATABASE_PATH`: Optional. Pfad zu einer lokalen `places.sqlite`, die bei der Suche bevorzugt vor dem JSON-Index und Overpass verwendet wird.
- `VITE_GEOAPIFY_MAPS_API_KEY`: Optional, aber fuer Produktion empfohlen. Wird clientseitig fuer Geoapify-Kartenkacheln verwendet.
- `PLACE_INDEX_PATH`: Optional. Pfad zu einer lokalen `place-index.json` mit vorindizierten Camping- und Stellplatzdaten.
- `VITE_MAP_TILE_URL_TEMPLATE`: Optionales Override fuer einen anderen Tile-Provider.
- `VITE_MAP_TILE_ATTRIBUTION`: Optionales HTML-Attribution-Override passend zum Tile-Provider.

Ohne `GEOAPIFY_API_KEY` faellt die Ortssuche serverseitig weiterhin auf Nominatim zurueck. Ohne `VITE_GEOAPIFY_MAPS_API_KEY` nutzt die Kartenansicht im Browser standardmaessig `tile.openstreetmap.org`, was fuer Entwicklung okay ist, aber fuer produktiven Betrieb nur als kleiner Fallback gedacht sein sollte.

## Eigener Place-Index

Der Server kann einen lokalen, vorindizierten Camping-/Stellplatz-Bestand bevorzugt durchsuchen und nur noch bei fehlenden Treffern auf Overpass zurueckfallen.

Empfohlene Phase-A-Variante:

- `places.sqlite` als primaere lokale Suchdatenbank
- `place-index.json` weiterhin als einfacher Fallback und Austauschformat
- `Overpass` nur noch fuer Ergaenzung oder Notfall

Standardpfad:

```bash
./place-index.json
```

Oder explizit per Environment:

```bash
PLACE_INDEX_PATH=/home/kopi/route-planner-pro/place-index.json
```

Unterstuetzte Eingabeformate fuer den Importer:

- Overpass JSON (`elements`)
- GeoJSON `FeatureCollection`
- bereits normalisierte Entry-Arrays

Beispiel:

```bash
npm run build:place-index -- data/raw-campsites.json place-index.json
```

Aus einem vorhandenen JSON-/GeoJSON-Bestand laesst sich auch direkt eine SQLite-Datenbank bauen:

```bash
npm run build:place-db -- place-index.json places.sqlite
```

Wenn `PLACE_DATABASE_PATH` auf eine vorhandene SQLite-Datei zeigt, nutzt der Server diese Datenbank bevorzugt fuer die lokale Schnellsuche.

## OSM-Extracts statt Overpass

Fuer groessere Regionen ist ein lokaler Import aus `.osm.pbf`-Extrakten (zum Beispiel von Geofabrik) fairer und stabiler als ein grosser Overpass-Refresh.

Voraussetzungen:

- `osmium` bzw. `osmium-tool` installiert
- eine oder mehrere `.osm.pbf`-Dateien lokal verfuegbar

Beispiel:

```bash
npm run import:places -- \
  /home/kopi/osm-data/germany-latest.osm.pbf \
  --index-out=place-index.json \
  --db-out=places.sqlite
```

Der Importer filtert aktuell:

- `tourism=camp_site`
- `tourism=caravan_site`

und schreibt daraus optional:

- `place-index.json`
- `places.sqlite`

Empfohlener Ablauf fuer den Server:

1. OSM-Extrakt(e) laden
2. `npm run import:places -- ... --db-out=places.sqlite`
3. `sudo systemctl restart campingroute-counter`

Oder direkt aus definierten Bounding Boxes neu ziehen:

```bash
npm run refresh:place-index -- --bbox=53.94,10.99,54.04,11.23 place-index.json
```

Oder ueber eine Regionsdatei:

```bash
npm run refresh:place-index -- --bbox-file=examples/place-index-regions.example.json place-index.json
```

Fuer einen ersten europaweiten Kernbestand liegt ausserdem eine groessere Beispielkonfiguration bereit:

```bash
npm run refresh:place-index -- --bbox-file=examples/place-index-regions-europe-core.json place-index.json
```

Praktischer fuer lokale Builds ist Europa in Etappen:

```bash
npm run refresh:place-index -- \
  --bbox-file=examples/place-index-regions-europe-phase-1.json \
  --bbox-file=examples/place-index-regions-europe-phase-2.json \
  --bbox-file=examples/place-index-regions-europe-phase-3.json \
  place-index.json
```

Beim Serverstart wird die Datei automatisch geladen. Wenn kein lokaler Index vorhanden ist, bleibt der Overpass-Fallback aktiv.

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

Camping Route is a multilingual AI prompt generator for camping and road-trip planning. It helps users create structured prompts for tools like ChatGPT or Claude, including route stages, campsite and motorhome stopover search, and GPX export instructions. Version `0.5.3` adds an integrated finder map, Geoapify-powered place suggestions, a local fast-search place index, and prepared region files for a broader Europe rollout.
