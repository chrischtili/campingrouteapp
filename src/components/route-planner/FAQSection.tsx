import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Was ist Camping Route?",
    a: (
      <div>
        <p className="mb-4"><strong>Der KI-Prompt-Generator für maßgeschneiderte Wohnmobil-Routen!</strong></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🎯</span> Präzise Prompt-Erstellung
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Berücksichtigt Fahrzeugdaten (Größe, Gewicht)</li>
              <li>Filtert nach deinen Interessen und Budget</li>
              <li>Generiert optimierte Prompts für deine KI</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🤖</span> KI-gestützte Routenplanung
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Erstellt Prompts für deine bevorzugte KI</li>
              <li>Inkludiert alle relevanten Parameter</li>
              <li>Optimiert für beste Ergebnisse</li>
            </ul>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mt-4">
          <p className="flex items-center gap-2 mb-2">
            <span>💡</span>
            <strong>Zwei Modi für maximale Flexibilität</strong>
          </p>
          <p className="text-sm">Prompt-Generierung für volle Kontrolle oder direkte KI-Generierung (mit deinem API-Schlüssel) für sofortige Ergebnisse!</p>
        </div>
      </div>
    ),
  },
  {
    q: "Prompt Generieren vs. KI-Generierung - was ist der Unterschied?",
    a: (
      <div>
        <p className="mb-4"><strong>Zwei Wege zu deinem KI-Prompt:</strong></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>📝</span> Prompt Generieren (kostenlos)
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Erzeugt einen optimierten Prompt</strong> basierend auf deinen Eingaben</li>
              <li>Du erhältst den Prompt und kannst ihn in deine bevorzugte KI (ChatGPT, Gemini, etc.) einfügen</li>
              <li>Volle Kontrolle über den Prozess</li>
              <li>Keine zusätzlichen Kosten</li>
              <li>Perfekt für Nutzer mit eigenem KI-Zugang</li>
            </ul>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>⚡</span> KI-Generierung (ca. 5-10 Cent)
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Deine KI generiert direkt eine Route</strong> basierend auf unserem Prompt</li>
              <li>Schnellere Ergebnisse ohne manuellen Prompt-Einzug</li>
              <li>Inklusive <strong>GPX-Datei zum Download</strong> für dein Navigationsgerät</li>
              <li>Kleine API-Kosten (ca. 5-10 Cent pro Generierung)</li>
              <li>Ideal für Nutzer, die sofort ein Ergebnis wollen</li>
            </ul>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mt-4">
          <p className="mb-2">
            <strong>📥 GPX-Export (nur bei KI-Generierung)</strong>
          </p>
          <p className="text-sm">
            Bei Nutzung der KI-Generierung mit deinem API-Schlüssel wird automatisch eine GPX-Datei mit allen Wegpunkten, Stellplätzen und Attraktionen generiert, die du direkt in dein Navigationsgerät importieren kannst.
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mt-4">
          <p className="flex items-center gap-2 mb-2">
            <span>💡</span>
            <strong>Wichtig</strong>
          </p>
          <p className="text-sm">
            In beiden Fällen sind wir kein Routenplaner, sondern ein Prompt-Generator. Die eigentliche Routenplanung erfolgt immer durch deine KI - wir liefern nur den optimierten Prompt.
          </p>
        </div>
      </div>
    ),
  },
  {
    q: "Welche Fahrzeugtypen werden unterstützt?",
    a: (
      <div>
        <p className="mb-4"><strong>Aktuell unterstützen wir:</strong></p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-teal-50 dark:bg-teal-900 p-6 rounded-xl text-center border border-teal-200 dark:border-teal-800 shadow-sm">
            <h3 className="font-semibold text-foreground mb-3">Wohnmobile</h3>
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
              ✅ Voll unterstützt
            </span>
          </div>
          <div className="bg-teal-50 dark:bg-teal-900 p-6 rounded-xl text-center border border-teal-200 dark:border-teal-800 shadow-sm">
            <h3 className="font-semibold text-foreground mb-3">Camper/Vans</h3>
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
              ✅ Voll unterstützt
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-700 shadow-sm opacity-80">
            <h3 className="font-semibold text-foreground mb-3">Wohnwagen</h3>
            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              🕒 In Planung
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-700 shadow-sm opacity-80">
            <h3 className="font-semibold text-foreground mb-3">Motorräder</h3>
            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              🕒 Geplant
            </span>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mt-4">
          <p className="flex items-center gap-2 mb-2">
            <span>💡</span>
            <strong>Tipp</strong>
          </p>
          <p className="text-sm">Gib im Routenplaner deine Fahrzeugdaten ein (Länge, Höhe, Gewicht), damit wir die perfekten Stellplätze für dich finden!</p>
        </div>
      </div>
    ),
  },
  {
    q: "Wie funktioniert die Prompt-Erstellung?",
    a: (
      <div>
        <p className="mb-4"><strong>Einfache Schritte zu deinem perfekten KI-Prompt:</strong></p>
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>1️⃣</span> Eingaben machen
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Start- und Zielort festlegen</li>
              <li>Fahrzeugdaten eingeben (optional)</li>
              <li>Interessen und Budget auswählen</li>
              <li>Reisedauer und Etappen anpassen</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>2️⃣</span> Modus wählen
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Prompt Generieren:</strong> Erhältst einen optimierten Prompt, den du in deine KI einfügen kannst</li>
              <li><strong>KI-Generierung:</strong> Deine KI generiert direkt eine Route (mit deinem API-Schlüssel)</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>3️⃣</span> Ergebnis erhalten
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Optimierter Prompt mit allen deinen Parametern</li>
              <li>Fertig zum Einfügen in ChatGPT, Gemini, etc.</li>
              <li>Optional: Direkte KI-Antwort mit GPX-Datei (bei KI-Generierung)</li>
              <li>Volle Kontrolle über den Prozess</li>
            </ul>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mt-4">
          <p className="flex items-center gap-2 mb-2">
            <span>💡</span>
            <strong>Wichtig zu wissen</strong>
          </p>
          <p className="text-sm">Wir sind kein Routenplaner, sondern ein Prompt-Generator. Die eigentliche Routenplanung erfolgt durch deine KI (ChatGPT, Gemini, etc.) basierend auf unserem optimierten Prompt.</p>
        </div>
      </div>
    ),
  },
  {
    q: "Ist Camping Route kostenlos?",
    a: (
      <div className="space-y-4">
        <p><strong>✅ Ja, die Grundfunktionen sind komplett kostenlos!</strong></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🆓</span> Kostenlos
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Prompt-Generierung ohne Einschränkungen</li>
              <li>Volle Funktionalität des Routenplaners</li>
              <li>Keine versteckten Kosten oder Abos</li>
              <li>Unbegrenzte Nutzung</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>💰</span> Optional (ca. 5-10 Cent)
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>KI-Generierung für direkte Routenerstellung</li>
              <li>GPX-Datei zum Download</li>
              <li>Schnellere Ergebnisse</li>
              <li>Nur bei Nutzung der API-Funktion</li>
            </ul>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
          <p className="flex items-center gap-2 mb-2">
            <span>ℹ️</span>
            <strong>Transparente Kosten</strong>
          </p>
          <p className="text-sm">Keine Abonnements, keine versteckten Gebühren - du zahlst nur, wenn du die optionale KI-Generierung nutzt (ca. 5-10 Cent pro Route).</p>
        </div>
      </div>
    ),
  },
  {
    q: "Wie werden meine Daten geschützt?",
    a: (
      <div>
        <p className="mb-4"><strong>🔒 100% Datenschutz - 100% lokal!</strong></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>📱</span> Alles auf deinem Gerät
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Keine Cloud-Speicherung</strong></li>
              <li><strong>Keine Serverübertragung</strong></li>
              <li><strong>Keine Tracking-Cookies</strong></li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🛡️</span> Maximale Sicherheit
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>DSGVO-konform</strong></li>
              <li><strong>Offline-fähig</strong></li>
              <li><strong>Keine Drittanbieter</strong></li>
            </ul>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mt-4">
          <p className="flex items-center gap-2 mb-2">
            <span>ℹ️</span>
            <strong>Transparenz</strong>
          </p>
          <p className="text-sm">Alle deine Daten bleiben ausschließlich auf deinem Gerät. Wir speichern nichts, analysieren nichts und geben nichts weiter. Deine Privatsphäre steht an erster Stelle!</p>
        </div>
      </div>
    ),
  },
  {
    q: "Kann ich Routen offline nutzen?",
    a: (
      <div>
        <p className="mb-4"><strong>✅ Ja, komplett offline-fähig!</strong></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>📥</span> Exportieren
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Als Text/PDF speichern</li>
              <li>GPX-Datei herunterladen (bei KI-Generierung)</li>
              <li>Auf deinem Gerät abspeichern</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🌍</span> Überall nutzen
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Ohne Internetzugang verwenden</li>
              <li>Per E-Mail/Messenger teilen</li>
              <li>In Navigationsgeräte importieren</li>
            </ul>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mt-4">
          <p className="flex items-center gap-2 mb-2">
            <span>💡</span>
            <strong>Reisetipp</strong>
          </p>
          <p className="text-sm">Lade deine Routen vor der Reise herunter und habe sie auch ohne Mobilfunkempfang immer griffbereit!</p>
        </div>
      </div>
    ),
  },
  {
    q: "Welches KI-Modell sollte ich wählen?",
    a: (
      <div>
        <p className="mb-4"><strong>Die Wahl hängt von deinen Prioritäten ab:</strong></p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <span>🌟</span> Google Gemini
            </h4>
            <ul className="list-disc list-inside space-y-2 text-xs">
              <li><strong>Beste Wahl für Europa</strong></li>
              <li>Exzellente geografische Daten</li>
              <li>Präzise Stellplatz-Empfehlungen</li>
              <li>Aktuellste Informationen</li>
            </ul>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <span>🤖</span> OpenAI GPT
            </h4>
            <ul className="list-disc list-inside space-y-2 text-xs">
              <li>Maximale Detailtiefe</li>
              <li>Komplexe Routenplanung</li>
              <li>Höchste Sprachqualität</li>
              <li>Ideal für anspruchsvolle Nutzer</li>
            </ul>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <span>⚡</span> Mistral AI
            </h4>
            <ul className="list-disc list-inside space-y-2 text-xs">
              <li>Europäisch optimiert</li>
              <li>Kosteneffizient</li>
              <li>Schnelle Antworten</li>
              <li>Gute Balance aus Qualität und Preis</li>
            </ul>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mt-4">
          <p className="flex items-center gap-2 mb-2">
            <span>💡</span>
            <strong>Empfehlung</strong>
          </p>
          <p className="text-sm">Für die meisten Nutzer ist <strong>Google Gemini</strong> die beste Wahl dank exzellenter geografischer Daten und präziser Stellplatz-Empfehlungen für Europa.</p>
        </div>
      </div>
    ),
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-4 bg-[rgb(230,225,215)] dark:bg-gray-700">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mt-3">
            Häufige Fragen
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
              >
                <AccordionTrigger
                  id={i === 2 ? "model-selection-faq" : undefined}
                  className="font-normal text-foreground hover:no-underline py-3 text-xs md:text-sm font-sans px-6 w-full text-left"
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-foreground dark:text-white pt-4 pb-6 leading-relaxed font-sans px-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
