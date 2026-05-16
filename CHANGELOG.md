# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.7] - 2026-05-15

### Added
- **UI**: Neue „Anker-Logik“ für Reiseziele: Markiere dein Hauptziel als fest gebucht, um die An- und Abreise exakt darum herum zu planen.
- **UI**: Explorer-Modus: Der Platzfinder wurde prominent an die zweite Stelle gerückt, um die Entdeckung von Zielen vor die Detailplanung zu stellen.
- **UI**: Rundreisen-Toggle direkt beim Startpunkt für einen schnelleren Planungs-Flow.
- **UX**: Intelligente Label-Anpassung: Felder zeigen nun den Namen des Ortes an (z.B. „Abreise Weingarten“ statt nur „Abreise“).
- **UX**: Prompt-Regenerierung: Bei Änderungen an der Reise erscheint nun ein direkter Hinweis zum Aktualisieren des Prompts.

### Changed
- **UI**: Optimiertes Layout für Datums- und Zeitfelder (nebeneinander statt untereinander).
- **UI**: Fehlende Uhrzeit-Icons in allen Zeitfeldern nachgetragen.

### Fixed
- **I18n**: Alle neuen Funktionen sind vollständig in alle 5 Sprachen übersetzt.
- **Grammar**: Korrektur von „Zentrale Ankerpunkt“ zu „Zentraler Ankerpunkt“.

## [0.5.6] - 2026-05-15

### Changed
- **Feedback**: Wenn "Nicht hilfreich" ausgewählt wird, ist das Feld "Was sollte ich verbessern?" nun ein Pflichtfeld.

### Fixed
- **Navbar**: Das Mobile-Menü schließt sich nun automatisch nach der Auswahl einer Sprache.

## [0.5.4] - 2026-04-28

### Fixed
- **Mobile Layout**: Bessere Ausrichtung der Ankunfts- und Abfahrtsfelder bei Zwischenzielen.
- **UI**: Kürzere und präzisere Labels im Routenplaner für bessere Übersicht auf mobilen Geräten.
- **Consistency**: Vereinheitlichung der Zeitangaben für alle Etappen.
- **Security**: Behebung einer moderaten Schwachstelle in `postcss` (npm audit fix).

## [0.5.3] - 2026-04-20

### Added
- **Finder-Pages**: Eigenständige Landingpages für Campingplatz-Finder und Stellplatz-Finder.
- **UX**: Direkte Übernahme von Plätzen aus den Solo-Findern in den Prompt-Assistenten.
- **Persistence**: Generator-Entwürfe bleiben beim Tab-Wechsel zwischen Findern und Assistent erhalten.

### Changed
- **Mobile UX**: Vollständiger Verzicht auf Slide-in-Panels zugunsten einer nativen Scroll-Erfahrung.
- **SEO**: Aktualisierung der Metadaten und Sitemaps für 2026.

## [0.5.2] - 2026-03-15

### Added
- **I18n**: Unterstützung für Italienisch und Niederländisch erweitert.
- **SEO**: Hreflang-Tags und lokalisierte Metadaten für alle 5 Sprachen.

### Fixed
- **Security**: Behebung von Schwachstellen in Abhängigkeiten (npm audit fix).
- **Prompt**: Stabilere Links und verbesserte Datumsberechnung in der KI-Ausgabe.

## [0.1.0] - 2024-02-05

### Added
- Initialer Release des Wohnmobil-Routenplaners mit KI-Integration.
- 6 Hauptkategorien für die Reiseplanung.
- Responsive Design für alle Geräte.
