import { MapPin, Clock, Euro, Wine, Landmark, ChevronRight, Info, PlusCircle, ChevronDown, ChevronUp, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "../../ui/button";

const stages = [
  {
    from: "Karlsruhe",
    to: "Fulda/Rhön",
    distance: "210 km",
    duration: "2:30–3:00 h",
    highlight: "Rhön & Fulda",
    icon: Landmark,
    details: "Dom zu Fulda & Wasserkuppe mit Panoramablick",
    tips: "Frankfurt Rush-Hour meiden - erst nach 09:30 Uhr starten",
    overnight: "Knaus Campingpark Hünfeld (35–45€, Brötchenservice)",
  },
  {
    from: "Fulda/Rhön",
    to: "Magdeburg/Börde",
    distance: "240 km",
    duration: "3:00–3:30 h",
    highlight: "Wasserstraßenkreuz Magdeburg",
    icon: MapPin,
    details: "UNESCO-Weltkulturerbe: Trogbrücke über die Elbe",
    tips: "A7 → A4 → A14, bei Halle kann es verkehrsreicher werden",
    overnight: "Schachtsee Wolmirsleben (30–40€, See mit Restaurant)",
  },
  {
    from: "Magdeburg/Börde",
    to: "Perleberg",
    distance: "130 km",
    duration: "1:45–2:15 h",
    highlight: "Brandenburgs Natur",
    icon: Wine,
    details: "B189 durch landschaftlich schöne Regionen",
    tips: "Entspanntes 'Cruisen' auf gut ausgebauten Bundesstraßen",
    overnight: "Campingplatz Friedensteich (25–35€, Wald & Badesee)",
  },
  {
    from: "Perleberg",
    to: "Wismar (Ostsee)",
    distance: "95 km",
    duration: "1:15–1:30 h",
    highlight: "Ankunft an der Ostsee",
    icon: MapPin,
    details: "Kurze Etappe - frühzeitiger Check-in möglich",
    tips: "B189 → A14 Richtung Schwerin/Wismar",
    overnight: "Ostsee-Camping Zierow (50–65€, 5-Sterne mit Hundestrand)",
  },
  {
    from: "Wismar",
    to: "Karlsruhe",
    distance: "-",
    duration: "10 Tage",
    highlight: "Rückfahrt & weitere Details",
    icon: Info,
    details: "Die Rückfahrt führt über Lüneburger Heide, Edersee und Bergstraße zurück nach Karlsruhe (Etappen 5–8).",
    tips: "Für die komplette 14-Tage-Route mit allen Etappen, Übernachtungen und Tipps bitte 'Detaillierte Route anzeigen' klicken.",
    overnight: "→ Mehr Infos in detaillierter Route",
  },
];

// Detaillierte Beispielroute
const detailedRoute = `
Wohnmobil-Route - Karlsruhe → Wismar → Karlsruhe
Generiert am: 14.2.2026 17:13:21
KI-Modell: GOOGLE

Hier ist dein detaillierter Routenplan für die Reise von Karlsruhe nach Wismar und zurück, speziell abgestimmt auf dein Fahrzeug, die Mitnahme von Hunden und das Limit von 250 km pro Tag.

1. Etappenplanung
Die Route ist in entspannte Tagesabschnitte unterteilt, die Stress vermeiden und Zeit für Pausen mit dem Hund lassen.

Hinfahrt: Karlsruhe → Perleberg → Wismar

Tag 1 (04.06.2026): Karlsruhe → Region Fulda / Rhön
- Entfernung: ca. 210 km
- Fahrzeit: ca. 2:30–3:00 h
- Route: A5 Richtung Norden bis zum Hattenbacher Dreieck, dann kurz auf die A7.
- Hinweis: Kritischer Punkt ist Frankfurt. Fahre am besten erst nach 09:30 Uhr los, um die Rush-Hour zu meiden.

Tag 2 (05.06.2026): Region Fulda → Region Magdeburg / Börde
- Entfernung: ca. 240 km
- Fahrzeit: ca. 3:00–3:30 h
- Route: A7, A4, A14 (Richtung Halle/Magdeburg).
- Hinweis: Gut ausgebaute Strecken. Bei Halle kann es verkehrsreicher werden.

Tag 3 (06.06.2026): Region Magdeburg → Perleberg (Etappenziel 1)
- Entfernung: ca. 130 km
- Fahrzeit: ca. 1:45–2:15 h
- Route: A14 bis Colbitz, dann B189 Richtung Stendal/Wittenberge.
- Hinweis: Viel Bundesstraße, landschaftlich schön, entspanntes Fahren ("Cruisen").

Tag 4 (07.06.2026): Perleberg → Wismar (Ankunft fester Zeitraum)
- Entfernung: ca. 95 km
- Fahrzeit: ca. 1:15–1:30 h
- Route: B189, A14 Richtung Schwerin/Wismar.
- Hinweis: Kurze Etappe. Du kommst früh in Wismar an, ideal für den Check-in auf dem Campingplatz.

Aufenthalt Wismar: 07.06. – 14.06.2026

Rückfahrt: Wismar → Lüneburger Heide → Karlsruhe

Tag 11 (14.06.2026): Wismar → Lüneburger Heide (Soltau/Bispingen)
- Entfernung: ca. 160 km
- Fahrzeit: ca. 2:00–2:30 h
- Route: A14, A24, B209 (über Lüneburg).
- Hinweis: Wir meiden Hamburg Zentrum. Die Fahrt über Lüneburg ist landschaftlich reizvoll.

Tag 12 (15.06.2026): Lüneburger Heide → Region Edersee / Kassel
- Entfernung: ca. 230 km
- Fahrzeit: ca. 3:00–3:30 h
- Route: A7 Richtung Süden.
- Hinweis: Die Kasseler Berge sind für deinen 3.5t Diesel kein Problem, aber achte auf LKW-Verkehr.

Tag 13 (16.06.2026): Region Edersee → Bergstraße (Lorsch/Bensheim)
- Entfernung: ca. 190 km
- Fahrzeit: ca. 2:30–3:00 h
- Route: A5 Richtung Süden.
- Hinweis: Wir stoppen VOR Karlsruhe, um den letzten Urlaubstag noch zu genießen und am 17.06. nur noch ein kurzes Stück zu haben.

Tag 14 (17.06.2026): Bergstraße → Karlsruhe (Ziel)
- Entfernung: ca. 70 km
- Fahrzeit: ca. 1:00 h
- Route: A5.
- Hinweis: Entspannte Heimreise am Vormittag.

2. Übernachtungen
Die ausgewählten Plätze bieten eine gute Infrastruktur und sind hundefreundlich.

Tag 1: Knaus Campingpark Hünfeld (Rhön)
- Lage: Am Rande der Rhön, ruhig, Wiese.
- Ausstattung: V/E vorhanden, Brötchenservice, Hunde willkommen.
- Preis: ca. 35–45 €

Tag 2: Schachtsee Wolmirsleben (bei Magdeburg)
- Lage: Direkt am See, viel Natur.
- Ausstattung: Strom, Wasser, Restaurant, Bademöglichkeit für Hunde oft an ausgewiesenen Stellen möglich.
- Preis: ca. 30–40 €

Tag 3 (Perleberg): Stellplatz an der Kristalltherme Bad Wilsnack oder Campingplatz Friedensteich
- Empfehlung: Campingplatz "Am Friedensteich" in Wittenberge (ca. 10 Min von Perleberg). Mitten im Wald, Badesee.
- Preis: ca. 25–35 €

Tag 4–11 (Wismar): Ostsee-Campingplatz Ferienpark Zierow
- Lage: Direkt an der Ostsee, ca. 15 Min westlich von Wismar.
- Ausstattung: 5-Sterne-Platz, Hundestrand, Hundedusche, Agility-Platz, Top-Sanitär.
- Preis: ca. 50–65 € (Reservierung empfohlen!)

Tag 11: Campingplatz "Auf dem Simpel" (Soltau)
- Lage: Lüneburger Heide, Waldrand.
- Ausstattung: Sehr hundefreundlich, modern, Restaurant.
- Preis: ca. 40–50 €

Tag 12: Camping- & Ferienpark Teichmann (Edersee)
- Lage: Direkt am Edersee (Halbinsel).
- Ausstattung: Großzügige Plätze, Hundewiese, direkter Seezugang.
- Preis: ca. 35–50 €

Tag 13: Nibelungen-Camping am Schwimmbad (Lorsch)
- Lage: Südhessen, nahe Kloster Lorsch (Weltkulturerbe).
- Ausstattung: Sauber, zweckmäßig, guter Ausgangspunkt für Spaziergänge.
- Preis: ca. 25–35 €

3. Highlights & Aktivitäten
- Region Fulda: Dom zu Fulda, Rhön (Wasserkuppe)
- Magdeburg/Perleberg: Wasserstraßenkreuz Magdeburg, Tierpark Perleberg
- Wismar: Alter Hafen, Insel Poel, Schloss Bothmer
- Rückreise: Lüneburger Heide, Edersee-Staumauer, Kloster Lorsch

4. Praktische Tipps
- Clesana Toilette: Beutel im Restmüll entsorgen
- Hunde: Leinenpflicht an Stränden, Zeckenschutz im Juni
- Navigation: Brückenhöhen beachten (2.90m meist ok)
- Entsorgung: Grauwasser auf allen Plätzen möglich

5. Beste Reisezeit
Juni ist perfekt - lange Tage, stabiles Wetter, nicht zu heiß.

6. Service unterwegs
- Tanken: Apps wie "Clever Tanken" nutzen
- Supermärkte: Lidl/Aldi/Rewe mit WoMo-Parkplätzen
- Werkstätten: Fiat Professional Adressen vorab notieren

7. Budget
- Übernachtungen: ca. 600 €
- Diesel: ca. 300 €
- Gesamt: ca. 900–1000 €

8. Technik
- Solaranlage: 300W + 200Ah Lithium = fast autark im Juni
- Umwelt: Mülltrennung auf Plätzen nutzen

9. Flexibilität
- Alternative Wismar: Campingpark Rerik oder Ostseecamping Am Salzhaff
- Stauumfahrung: B4 über Uelzen statt A7 bei Hamburg
- Wildcamping: In Deutschland verboten, aber Parkplätze für "Wiederherstellung der Fahrtüchtigkeit" ok

Zusammenfassung
Eine entspannte Genießer-Tour durch Deutschland mit maximal 250 km pro Tag. Mix aus Mittelgebirge (Rhön/Harz) und Küste (Wismar/Ostsee). Dein Fahrzeug ist mit Solar und Clesana top autark ausgestattet. Wichtig: Reserviere den Platz in Wismar (Zierow) frühzeitig!`;

export function RouteExampleSection() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section id="example-route" className="py-24 px-4 bg-[rgb(230,225,215)] dark:bg-gray-700">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">
            KI-Beispielroute
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mt-3">
            Karlsruhe → Wismar → Karlsruhe
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            14 Tage • 1.600 km • Genießer-Tour mit Ostsee & Mittelgebirge
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 md:-translate-x-px" />

          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const isRight = i % 2 === 1;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isRight ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className={`relative flex items-start mb-12 last:mb-0 ${
                  isRight ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-[#F59B0A] border-4 border-background -translate-x-1.5 mt-6 z-10" />

                {/* Card */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${isRight ? "md:mr-auto md:ml-8" : "md:ml-auto md:mr-8"}`}>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-2 text-[#F59B0A] dark:text-[#F59B0A] font-semibold text-xs uppercase tracking-wider mb-2">
                      <Icon className="w-4 h-4" />
                      {stage.from === "Wismar" ? "Etappe 5-8" : `Etappe ${i + 1}`}
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-1">
                      {stage.from} <ChevronRight className="inline w-4 h-4 text-muted-foreground" /> {stage.to}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">{stage.highlight}</p>
                    <div className="flex gap-4 text-sm text-foreground/70">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {stage.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {stage.duration}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground italic">
                      {stage.details}
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-[#F59B0A] mt-0.5">●</span>
                        <span className="text-muted-foreground">{stage.tips}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-[#F59B0A] mt-0.5">●</span>
                        <span className="text-muted-foreground">{stage.overnight}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-center gap-8 text-center"
        >
          {[
            { label: "Gesamtstrecke", value: "1.325 km" },
            { label: "Reisedauer", value: "14 Tage" },
            { label: "Budget", value: "900–1000€" },
            { label: "Stil", value: "Genießer-Tour" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {item.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Detailed Route Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8"
        >
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-4 text-[#F59B0A] hover:bg-[#F59B0A]/10 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <Info className="w-4 h-4" />
                {showDetails ? 'Details ausblenden' : 'Detaillierte Route anzeigen'}
              </span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Route Header */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#F59B0A]" />
                      Karlsruhe → Wismar → Karlsruhe
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Generiert am:</span> 14.2.2026 17:13:21 • <span className="font-semibold">KI-Modell:</span> GOOGLE
                    </p>
                  </div>

                  {/* Etappen */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#F59B0A]" />
                      1. Etappenplanung
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Die Route ist in entspannte Tagesabschnitte unterteilt, die Stress vermeiden und Zeit für Pausen mit dem Hund lassen.
                    </p>

                    {/* Hinfahrt */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                      <h5 className="font-semibold text-[#F59B0A] mb-3">Hinfahrt: Karlsruhe → Perleberg → Wismar</h5>
                      <div className="space-y-3 text-sm">
                        {['Karlsruhe → Region Fulda / Rhön (210 km, 2:30–3:00 h)',
                         'Region Fulda → Region Magdeburg / Börde (240 km, 3:00–3:30 h)',
                         'Region Magdeburg → Perleberg (130 km, 1:45–2:15 h)',
                         'Perleberg → Wismar (95 km, 1:15–1:30 h)'].map((stage, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-[#F59B0A] font-medium">Tag {i+1}:</span>
                            <span className="text-muted-foreground">{stage}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rückfahrt */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                      <h5 className="font-semibold text-[#F59B0A] mb-3">Rückfahrt: Wismar → Lüneburger Heide → Karlsruhe</h5>
                      <div className="space-y-3 text-sm">
                        {['Wismar → Lüneburger Heide (160 km, 2:00–2:30 h)',
                         'Lüneburger Heide → Region Edersee (230 km, 3:00–3:30 h)',
                         'Region Edersee → Bergstraße (190 km, 2:30–3:00 h)',
                         'Bergstraße → Karlsruhe (70 km, 1:00 h)'].map((stage, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-[#F59B0A] font-medium">Tag {i+11}:</span>
                            <span className="text-muted-foreground">{stage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Übernachtungen */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Euro className="w-4 h-4 text-[#F59B0A]" />
                      2. Übernachtungen (Hundefreundlich)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {day: 'Tag 1', place: 'Knaus Campingpark Hünfeld', price: '35–45 €', highlight: 'Rhön, Brötchenservice'},
                        {day: 'Tag 2', place: 'Schachtsee Wolmirsleben', price: '30–40 €', highlight: 'See, Restaurant'},
                        {day: 'Tag 3', place: 'Campingplatz Friedensteich', price: '25–35 €', highlight: 'Wald, Badesee'},
                        {day: 'Tag 4–11', place: 'Ostsee-Camping Zierow', price: '50–65 €', highlight: '5-Sterne, Hundestrand'},
                        {day: 'Tag 11', place: 'Auf dem Simpel', price: '40–50 €', highlight: 'Lüneburger Heide'},
                        {day: 'Tag 12', place: 'Ferienpark Teichmann', price: '35–50 €', highlight: 'Edersee, Seezugang'},
                        {day: 'Tag 13', place: 'Nibelungen-Camping', price: '25–35 €', highlight: 'Kloster Lorsch'},
                      ].map((stay, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-[#F59B0A] text-sm">{stay.day}</p>
                              <p className="font-semibold text-foreground mt-1">{stay.place}</p>
                              <p className="text-xs text-muted-foreground mt-1">{stay.highlight}</p>
                            </div>
                            <span className="font-bold text-foreground">{stay.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-[#F59B0A]" />
                      3. Highlights & Aktivitäten
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {region: 'Fulda/Rhön', attractions: ['Dom zu Fulda', 'Wasserkuppe']},
                        {region: 'Magdeburg/Perleberg', attractions: ['Wasserstraßenkreuz', 'Tierpark Perleberg']},
                        {region: 'Wismar', attractions: ['Alter Hafen', 'Insel Poel', 'Schloss Bothmer']},
                        {region: 'Rückreise', attractions: ['Lüneburger Heide', 'Edersee-Staumauer', 'Kloster Lorsch']},
                      ].map((area, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                          <h5 className="font-semibold text-[#F59B0A] mb-2">{area.region}</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {area.attractions.map((attr, j) => (
                              <li key={j} className="flex items-start gap-2">
                                <span className="text-[#F59B0A] text-xs mt-1">•</span>
                                <span>{attr}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Praktische Tipps */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4 text-[#F59B0A]" />
                      4. Praktische Tipps
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      {[
                        'Clesana: Beutel im Restmüll entsorgen',
                        'Hunde: Leinenpflicht an Stränden, Zeckenschutz im Juni',
                        'Navigation: Brückenhöhen beachten (2.90m meist ok)',
                        'Budget: Ca. 900–1000 € für 14 Tage',
                        'Solaranlage: 300W + 200Ah = fast autark im Juni',
                      ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#F59B0A] text-xs mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Zusammenfassung */}
                  <div className="bg-[#F59B0A]/10 border border-[#F59B0A]/20 rounded-xl p-4">
                    <h4 className="font-semibold text-[#F59B0A] flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4" />
                      Zusammenfassung
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Eine entspannte Genießer-Tour durch Deutschland mit maximal 250 km pro Tag. Mix aus Mittelgebirge (Rhön/Harz) und Küste (Wismar/Ostsee). Dein Fahrzeug ist mit Solar und Clesana top autark ausgestattet. <span className="font-semibold">Wichtig:</span> Reserviere den Platz in Wismar (Zierow) frühzeitig!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
