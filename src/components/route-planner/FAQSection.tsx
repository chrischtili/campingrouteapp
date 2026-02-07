import { Info, HelpCircle, Lightbulb, Bot, Map, Star, FileText, Tent, CheckCircle, Calendar, Euro } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { KIExampleRoute } from "./KIExampleRoute";

export function FAQSection() {
  const faqItems = [
    {
      question: "Wie funktioniert die KI-Routenplanung?",
      answer: (
        <div className="space-y-4">
          <p>
            Unsere KI-Routenplanung nutzt fortschrittliche Algorithmen, um maßgeschneiderte Wohnmobil-Routen zu erstellen. Die KI berücksichtigt deine Fahrzeugdaten, Reiseziele, Interessen und Budget, um die perfekte Route für dich zu planen.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Analyse deiner Eingaben (Fahrzeuggröße, Reisezeit, Budget, Interessen)</li>
            <li>Berücksichtigung von Verkehrsdaten, Wetterbedingungen und lokalen Events</li>
            <li>Vorschläge für Stellplätze, Aktivitäten und Sehenswürdigkeiten</li>
            <li>Optimierung der Route für entspannte Fahrten mit schweren Wohnmobilen</li>
          </ul>
          <p>
            Das Ergebnis ist eine detaillierte Tagesplanung mit allen wichtigen Informationen für deine Reise.
          </p>
        </div>
      )
    },
    {
      question: "Was macht diese KI besonders?",
      answer: (
        <div className="space-y-4">
          <p>
            Unsere KI geht weit über einfache Routenplanung hinaus:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Fahrzeugspezifische Optimierung:</strong> Berücksichtigt Gewicht, Höhe und Länge deines Wohnmobils</li>
            <li><strong>Feiertags- und Verkehrsdaten:</strong> Warnt vor Staus und empfiehlt alternative Routen</li>
            <li><strong>Autarkie-Unterstützung:</strong> Finds auch Stellplätze ohne Vollausstattung für autarke Fahrzeuge</li>
            <li><strong>Hundefreundliche Optionen:</strong> Zeigt Stellplätze und Aktivitäten, die für Hunde geeignet sind</li>
            <li><strong>Budget-Optimierung:</strong> Vorschläge für kostengünstige Alternativen</li>
            <li><strong>Kulturelle Tipps:</strong> Lokale Bräuche und wichtige Informationen für die Region</li>
          </ul>
          <p>
            Die KI generiert nicht nur eine Route, sondern ein komplett durchdachtes Reiseerlebnis.
          </p>
        </div>
      )
    },
    {
      question: "Kann ich die KI-Ausgabe anpassen?",
      answer: (
        <div className="space-y-4">
          <p>
            Ja, die KI-Ausgabe ist vollständig anpassbar. Du kannst:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Die Route in dein Navigationssystem importieren</li>
            <li>Einzelne Etappen ändern oder überspringen</li>
            <li>Alternative Stellplätze auswählen</li>
            <li>Aktivitäten nach deinen Vorlieben anpassen</li>
            <li>Die komplette Route als PDF speichern und ausdrucken</li>
          </ul>
          <p>
            Die KI gibt dir eine solide Grundlage, die du nach Belieben individualisieren kannst.
          </p>
        </div>
      )
    },
    {
      question: "Wie detailliert sind die KI-Routen?",
      answer: (
        <div className="space-y-4">
          <p>
            Unsere KI generiert extrem detaillierte Routen mit allen wichtigen Informationen:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Map className="h-4 w-4 text-primary" /> Routeninformationen
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Tagesweise Planung mit Distanzen</li>
                <li>Fahrzeiten mit Puffer für Pausen</li>
                <li>Alternative Routen bei Staugefahr</li>
                <li>Verkehrshinweise und Baustellen</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Tent className="h-4 w-4 text-primary" /> Übernachtungen
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Mehrere Stellplatz-Optionen pro Tag</li>
                <li>Bewertungen und Preise</li>
                <li>Ausstattungsdetails</li>
                <li>Hundefreundliche Optionen</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Star className="h-4 w-4 text-primary" /> Aktivitäten
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Sehenswürdigkeiten entlang der Route</li>
                <li>Wander- und Radtouren</li>
                <li>Kulturelle Highlights</li>
                <li>Lokale Events und Märkte</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <FileText className="h-4 w-4 text-primary" /> Praktische Tipps
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Tankstellen mit Lkw-Zugang</li>
                <li>Einkaufsmöglichkeiten</li>
                <li>Entsorgungsstationen</li>
                <li>Notfallkontakte</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      question: "Für welche Fahrzeugtypen ist die KI geeignet?",
      answer: (
        <div className="space-y-4">
          <p>
            Unsere KI ist speziell für Wohnmobile und Camper optimiert und berücksichtigt:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Kleine Camper (bis 3,5t):</strong> Standard-Routen mit normalen Stellplätzen</li>
            <li><strong>Mittlere Wohnmobile (3,5t-5t):</strong> Routen mit Gewichtseinschränkungen</li>
            <li><strong>Schwere Wohnmobile (5t+):</strong> Spezielle Routen mit Lkw-Beschränkungen</li>
            <li><strong>Hohe Fahrzeuge (3m+):</strong> Brückenhöhen-Check und alternative Routen</li>
            <li><strong>Lange Fahrzeuge (7m+):</strong> Stellplätze mit ausreichend Platz</li>
            <li><strong>Autarke Fahrzeuge:</strong> Stellplätze ohne Vollausstattung</li>
          </ul>
          <p>
            Gib einfach deine Fahrzeugdaten ein, und die KI passt die Route entsprechend an.
          </p>
        </div>
      )
    }
  ];

  return (
    <Card className="mt-8">
      <CardHeader className="bg-primary/5 border-b border-border">
        <CardTitle className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-primary" />
          Häufige Fragen zur KI-Routenplanung
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* FAQ Akkordeon */}
          <div>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      {item.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 text-muted-foreground">
                      {item.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Info-Box mit Beispielroute */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Was kann die KI?
              </h3>
              <p className="text-muted-foreground mb-4">
                Hier siehst du ein konkretes Beispiel, was unsere KI für dich planen kann:
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Detaillierte Tagesplanung mit Routen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Stellplatz-Empfehlungen mit Bewertungen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Aktivitäten und Sehenswürdigkeiten</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Budget-Übersicht und Spartipps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Praktische Reise- und Fahrtipps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Fahrzeugspezifische Hinweise</span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <KIExampleRoute />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                KI-Funktionen im Überblick
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Intelligente Routenoptimierung</span>
                </li>
                <li className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-green-600" />
                  <span>Echtzeit-Verkehrsdaten</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>Feiertags- und Event-Berücksichtigung</span>
                </li>
                <li className="flex items-center gap-2">
                  <Tent className="h-4 w-4 text-orange-600" />
                  <span>Stellplatz-Datenbank mit Bewertungen</span>
                </li>
                <li className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-green-700" />
                  <span>Budget-Optimierung</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}