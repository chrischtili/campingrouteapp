import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Ist Camping Route kostenlos?",
    a: (
      <div className="space-y-4">
        <p><strong>✅ Ja, komplett kostenlos!</strong></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>📝</span> Ohne API:
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Prompt-Generierung</li>
              <li>Keine Kosten</li>
              <li>Volle Kontrolle</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🤖</span> Mit API:
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Direkte Routengenerierung</li>
              <li>API-Kosten (~5-12 Cent)</li>
              <li>Schnellere Ergebnisse</li>
            </ul>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <p className="flex items-center gap-2 mb-2">
            <span>ℹ️</span>
            <strong>Keine versteckten Kosten</strong>
          </p>
          <p className="text-sm">Keine Abos, keine Gebühren - nur optionale API-Kosten.</p>
        </div>
      </div>
    ),
  },
  {
    q: "Welches KI-Modell sollte ich wählen?",
    a: (
      <div>
        <p className="mb-4"><strong>Empfehlung:</strong> Google Gemini 3 Pro Preview</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <span>🌟</span> Google/Gemini
            </h4>
            <ul className="list-disc list-inside space-y-2 text-xs">
              <li>Beste geografische Daten</li>
              <li>Präzise Stellplatz-Empfehlungen</li>
              <li>Aktuellste Informationen</li>
            </ul>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <span>🤖</span> OpenAI/GPT5.2
            </h4>
            <ul className="list-disc list-inside space-y-2 text-xs">
              <li>Maximale Detailtiefe</li>
              <li>Komplexe Routenplanung</li>
              <li>Höchste Sprachqualität</li>
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
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    q: "Was macht Camping Route einzigartig?",
    a: (
      <div>
        <p className="mb-4"><strong>Der einzige KI-Routenplaner speziell für Wohnmobile!</strong></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🎯</span> Präzise Filter
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Fahrzeugdaten (Größe, Gewicht)</li>
              <li>Budget (günstig bis premium)</li>
              <li>Interessen (Natur, Stadt, Familie)</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🗺️</span> Intelligente Routen
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Stellplätze nach deinen Kriterien</li>
              <li>Lokale Attraktionen</li>
              <li>Optimale Etappenplanung</li>
            </ul>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mt-4">
          <p className="flex items-center gap-2 mb-2">
            <span>💡</span>
            <strong>Transparenter Prozess</strong>
          </p>
          <p className="text-sm">Volle Kontrolle - keine "Black Box" Ergebnisse!</p>
        </div>
      </div>
    ),
  },
  {
    q: "Prompt vs. KI-Generierung - was ist der Unterschied?",
    a: (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg text-center">
            <h4 className="font-semibold mb-3">Ohne API (kostenlos)</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-left">
              <li>Optimierter Prompt</li>
              <li>Für deine KI</li>
              <li>Volle Kontrolle</li>
              <li>Keine Kosten</li>
            </ul>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
            <h4 className="font-semibold mb-3">Mit API (~8-12 Cent)</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-left">
              <li>Direkte Routengenerierung</li>
              <li>Fertige Route</li>
              <li>Schnelleres Ergebnis</li>
              <li>API-Kosten</li>
            </ul>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4">
          <p className="mb-2">
            <strong>Tipp</strong>
          </p>
          <p className="text-sm">Probiere zuerst die kostenlose Version aus!</p>
        </div>
      </div>
    ),
  },
  {
    q: "Wie werden meine Daten geschützt?",
    a: (
      <div>
        <p className="mb-3"><strong>100% lokal - 100% sicher!</strong></p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Keine Cloud-Speicherung</strong></li>
          <li><strong>Keine Tracking-Cookies</strong></li>
          <li><strong>DSGVO-konform</strong></li>
          <li><strong>Offline-fähig</strong></li>
        </ul>
      </div>
    ),
  },
  {
    q: "Kann ich Routen offline nutzen?",
    a: (
      <div>
        <p className="mb-3"><strong>Ja, komplett offline-fähig!</strong></p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Exportieren</strong> als Text/PDF</li>
          <li><strong>Speichern</strong> auf deinem Gerät</li>
          <li><strong>Nutzen</strong> ohne Internet</li>
          <li><strong>Teilen</strong> per E-Mail/Messenger</li>
        </ul>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg mt-3">
          <p className="text-sm">
            <strong>Tipp:</strong> Lade Routen vor der Reise herunter!
          </p>
        </div>
      </div>
    ),
  },
  {
    q: "Welche Fahrzeugtypen werden unterstützt?",
    a: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-teal-50 dark:bg-teal-900 p-6 rounded-xl text-center border border-teal-200 dark:border-teal-800 shadow-sm">
          <h3 className="font-semibold text-foreground mb-3">Wohnmobile</h3>
          <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
            ✅ Voll unterstützt
          </span>
        </div>
        <div className="bg-teal-50 dark:bg-teal-900 p-6 rounded-xl text-center border border-teal-200 dark:border-teal-800 shadow-sm">
          <h3 className="font-semibold text-foreground mb-3">Camper</h3>
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
    ),
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-4 bg-[rgb(250,244,235)] dark:bg-gray-900" id="faq">
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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-3">
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
                  id={i === 1 ? "model-selection-faq" : undefined}
                  className="font-normal text-foreground hover:no-underline py-5 text-lg md:text-xl font-sans px-6 w-full"
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
