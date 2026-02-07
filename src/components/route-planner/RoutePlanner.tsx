import { useState, useRef } from "react";
import { Route, RotateCcw, MapPin, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormData, AISettings, initialFormData, initialAISettings } from "@/types/routePlanner";
import { generatePrompt, callAIAPI } from "@/lib/promptGenerator";
import { AISettingsSection } from "./AISettingsSection";

// Importiere die providerModels aus der AISettingsSection oder definiere sie hier
const providerModels = {
  google: ['gemini-3-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
  openai: ['gpt-5.2', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano'],
  mistral: ['mistral-large-latest', 'mistral-small-latest'],
};
import { RouteSection } from "./RouteSection";
import { RouteOptimizationSection } from "./RouteOptimizationSection";
import { VehicleSection } from "./VehicleSection";
import { AccommodationSection } from "./AccommodationSection";
import { ActivitiesSection } from "./ActivitiesSection";
import { OutputSection } from "./OutputSection";
import heroCamper from "@/assets/hero-camper.jpg";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export function RoutePlanner() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [aiSettings, setAISettings] = useState<AISettings>(initialAISettings);
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [aiError, setAIError] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('');
  const outputSectionRef = useRef<HTMLDivElement>(null);
  const aiSettingsSectionRef = useRef<HTMLDivElement>(null);

  const handleFormChange = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleAISettingsChange = (settings: Partial<AISettings>) => {
    setAISettings(prev => ({ ...prev, ...settings }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = (prev[name as keyof FormData] as string[]) || [];
      if (checked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter(v => v !== value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAIError('');
    setOutput('');

    try {
      if (aiSettings.useDirectAI) {
        setLoadingMessage('🤖 Deine Wohnmobil-Route wird von der KI generiert...');
        
        if (!aiSettings.apiKey?.trim() || !/^[A-Za-z0-9-_]{20,}$/.test(aiSettings.apiKey)) {
          setAIError('Bitte gib einen gültigen API-Schlüssel ein (mindestens 20 Zeichen, nur Buchstaben, Zahlen, Bindestriche und Unterstriche).');
          setIsLoading(false);
          // Scroll to AI settings section
          setTimeout(() => {
            aiSettingsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
          }, 300);
          return;
        }

        // Route generieren (direktes Ergebnis ohne Nachbearbeitung)
        const aiResponse = await callAIAPI(formData, aiSettings);
        setOutput(aiResponse);
        setAiModel(aiSettings.aiProvider.toUpperCase());
        // Scroll to output after state update
        setTimeout(() => {
          outputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }, 300);
      } else {
        setLoadingMessage('📝 Dein Prompt wird generiert...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const generatedOutput = generatePrompt(formData);
        setOutput(generatedOutput);
        setAiModel('');
        // Scroll to output after state update
        setTimeout(() => {
          outputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }, 300);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error:', error);
      }
      if (error instanceof Error) {
        // Use the user-friendly error message directly
        setAIError(error.message);
      } else {
        setAIError('Fehler beim Aufruf der KI. Bitte überprüfe deinen API-Schlüssel und deine Internetverbindung.');
      }
      // Scroll to AI settings section when there's an error
      setTimeout(() => {
        aiSettingsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }, 300);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setOutput('');
    setAIError('');
  };

  const isModelSelected = () => {
    if (!aiSettings.useDirectAI) return true; // Wenn KI nicht direkt genutzt wird, ist kein Modell erforderlich
    
    const currentProvider = aiSettings.aiProvider;
    const modelKey = `${currentProvider}Model` as 'openaiModel' | 'mistralModel' | 'googleModel';
    return !!aiSettings[modelKey]; // Gibt true zurück, wenn ein Modell ausgewählt ist
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] min-h-[300px] md:min-h-[400px] overflow-hidden">
        <img 
          src={heroCamper} 
          alt="Wohnmobil auf Reisen" 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex flex-col items-center mb-3 md:mb-4">
            <div className="flex items-center">
              <img src="/favicon-original-final.svg" alt="Camping Route Logo" className="h-16 w-16 md:h-20 md:w-20 -mr-2" loading="lazy" />
              <h1 className="text-2xl md:text-5xl font-bold text-primary-foreground">
                Camping Route
              </h1>
            </div>
          </div>
          <p className="text-base md:text-xl text-primary-foreground/90 max-w-xl md:max-w-2xl">
            Dein KI-Wohnmobil-Routenplaner – Plane deine perfekte Reise mit umfassenden Informationen
          </p>
          <div className="mt-3 md:mt-4 bg-primary/20 backdrop-blur-sm rounded-lg p-3 md:p-4 max-w-xl md:max-w-3xl">
            <p className="text-sm md:text-base text-primary-foreground font-medium">
              🌟 Der einzige KI-Routenplaner, der Stellplätze nach deinen Fahrzeugdaten, Interessen und Budget filtert – für stressfreies Reisen mit dem Wohnmobil.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 -mt-20 relative z-10">
        {/* Social Proof Section */}
        <div className="bg-card rounded-xl shadow-lg p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                ⭐
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-yellow-700">Von Wohnmobil-Enthusiasten geliebt</h2>
            </div>
            <div className="flex items-center gap-2 text-yellow-500 justify-center md:justify-start">
              <span>★★★★☆</span>
              <span className="text-muted-foreground text-xs md:text-sm">4.7/5</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 px-2 md:px-4">
            <div className="bg-muted/50 p-3 md:p-4 rounded-lg break-words">
              <p className="text-xs md:text-sm italic">"Endlich ein Routenplaner, der wirklich auf meine Bedürfnisse eingeht! Die KI hat mir eine perfekte Route mit tollen Stellplätzen vorgeschlagen."</p>
              <p className="text-xs text-muted-foreground mt-2">– Markus, Wohnmobil-Reisender</p>
            </div>
            <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
              <p className="text-xs md:text-sm italic">"Die Filteroptionen sind genial! Ich kann nach Budget, Interessen und sogar Fahrzeuggröße filtern – das spart so viel Zeit!"</p>
              <p className="text-xs text-muted-foreground mt-2">– Sarah, Camperin</p>
            </div>
            <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
              <p className="text-xs md:text-sm italic">"Perfekt für spontane Trips! Innerhalb von Minuten hatte ich eine detaillierte Route mit allen wichtigen Infos."</p>
              <p className="text-xs text-muted-foreground mt-2">– Thomas, Wochenend-Camper</p>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-card rounded-xl shadow-lg p-4 md:p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              🎥
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-blue-700">Beispiel-Ergebnis (bei KI-Nutzung)</h2>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm md:font-medium">Beispiel-Route: München → Gardasee</h3>
              <span className="text-xs md:text-sm text-muted-foreground">⏱️ 3 Tage • 💰 Budget: Mittel</span>
            </div>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-background rounded-md">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold">1</div>
                <div>
                  <p className="text-sm md:font-medium">Tag 1: München → Innsbruck (120 km)</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Stellplatz: Camping Innsbruck, 4.5★ • 💰 25€/Nacht</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-background rounded-md">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold">2</div>
                <div>
                  <p className="text-sm md:font-medium">Tag 2: Innsbruck → Bozen (140 km)</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Stellplatz: Camping Bozen, 4.7★ • 💰 30€/Nacht</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-background rounded-md">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold">3</div>
                <div>
                  <p className="text-sm md:font-medium">Tag 3: Bozen → Riva del Garda (60 km)</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Stellplatz: Camping Bella Italia, 4.8★ • 💰 35€/Nacht</p>
                </div>
              </div>
            </div>
            <div className="mt-3 md:mt-4 p-2 md:p-3 bg-primary/10 rounded-md text-center">
              <p className="text-xs md:text-sm text-primary font-medium">📊 Gesamt: 420 km • 3 Übernachtungen • 90€</p>
            </div>
            <div className="mt-2 md:mt-3 text-xs text-muted-foreground text-center">
              <p>💡 Dies ist ein Beispiel für die KI-generierte Route. Ohne API erhältst du einen Prompt zum manuellen Verwenden.</p>
            </div>
          </div>
        </div>
{/* Info Box */}
<div className="bg-card rounded-xl shadow-lg p-6 mb-8">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
      📖
    </div>
    <h2 className="text-xl md:text-2xl font-bold text-blue-800">So geht's</h2>
  </div>
  <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-2 relative overflow-x-auto min-h-[300px]">
    {/* Schritt 1 */}
    <div className="flex flex-col items-center text-center p-3 md:p-4 bg-blue-50 rounded-xl shadow-sm w-full max-w-[180px] relative z-10">
      <div className="flex items-center justify-center w-8 h-8 mb-2 bg-blue-500 text-white rounded-full font-bold text-sm md:text-base">
        1
      </div>
      <div className="flex items-center justify-center w-12 h-12 mb-2 md:mb-3 bg-blue-100 rounded-full">
        <span className="text-xl md:text-2xl">🗺️</span>
      </div>
      <strong className="text-base md:text-lg mb-1">Route planen</strong>
      <span className="text-xs md:text-sm text-blue-600">Gib Start, Ziel und Reisedaten ein</span>
    </div>

    {/* Pfeil 1 */}
    <div className="hidden md:block text-2xl text-blue-300">→</div>

    {/* Schritt 2 */}
    <div className="flex flex-col items-center text-center p-3 md:p-4 bg-green-50 rounded-xl shadow-sm w-full max-w-[180px] relative z-10">
      <div className="flex items-center justify-center w-8 h-8 mb-2 bg-green-500 text-white rounded-full font-bold text-sm md:text-base">
        2
      </div>
      <div className="flex items-center justify-center w-12 h-12 mb-2 md:mb-3 bg-green-100 rounded-full">
        <span className="text-xl md:text-2xl">⚙️</span>
      </div>
      <strong className="text-base md:text-lg mb-1">Optionen wählen</strong>
      <span className="text-xs md:text-sm text-green-600">Fahrzeug, Interessen, Budget</span>
    </div>

    {/* Pfeil 2 */}
    <div className="hidden md:block text-2xl text-green-300">→</div>

    {/* Schritt 3 */}
    <div className="flex flex-col items-center text-center p-3 md:p-4 bg-purple-50 rounded-xl shadow-sm w-full max-w-[180px] relative z-10">
      <div className="flex items-center justify-center w-8 h-8 mb-2 bg-purple-500 text-white rounded-full font-bold text-sm md:text-base">
        3
      </div>
      <div className="flex items-center justify-center w-12 h-12 mb-2 md:mb-3 bg-purple-100 rounded-full">
        <span className="text-xl md:text-2xl">✨</span>
      </div>
      <strong className="text-base md:text-lg mb-1">Generieren</strong>
      <span className="text-xs md:text-sm text-purple-600">Route mit einem Klick erstellen</span>
    </div>

    {/* Pfeil 3 */}
    <div className="hidden md:block text-2xl text-purple-300">→</div>

    {/* Schritt 4 */}
    <div className="flex flex-col items-center text-center p-3 md:p-4 bg-orange-50 rounded-xl shadow-sm w-full max-w-[180px] relative z-10">
      <div className="flex items-center justify-center w-8 h-8 mb-2 bg-orange-500 text-white rounded-full font-bold text-sm md:text-base">
        4
      </div>
      <div className="flex items-center justify-center w-12 h-12 mb-2 md:mb-3 bg-orange-100 rounded-full">
        <span className="text-xl md:text-2xl">📋</span>
      </div>
      <strong className="text-base md:text-lg mb-1">Ergebnis</strong>
      <span className="text-xs md:text-sm text-orange-600">Detaillierte Routenplanung</span>
    </div>

    {/* Pfeil 4 */}
    <div className="hidden md:block text-2xl text-orange-300">→</div>

    {/* Schritt 5 */}
    <div className="flex flex-col items-center text-center p-3 md:p-4 bg-red-50 rounded-xl shadow-sm w-full max-w-[180px] relative z-10">
      <div className="flex items-center justify-center w-8 h-8 mb-2 bg-red-500 text-white rounded-full font-bold text-sm md:text-base">
        5
      </div>
      <div className="flex items-center justify-center w-12 h-12 mb-2 md:mb-3 bg-red-100 rounded-full">
        <span className="text-xl md:text-2xl">💾</span>
      </div>
      <strong className="text-base md:text-lg mb-1">Exportieren</strong>
      <span className="text-xs md:text-sm text-red-600">Drucken oder speichern</span>
    </div>
  </div>
</div>





        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div ref={aiSettingsSectionRef}>
            <AISettingsSection 
              aiSettings={aiSettings}
              onAISettingsChange={handleAISettingsChange}
              aiError={aiError}
            />
          </div>
          
          <RouteSection 
            formData={formData}
            onChange={handleFormChange}
          />

          <RouteOptimizationSection 
            formData={formData}
            onCheckboxChange={handleCheckboxChange}
          />

          <VehicleSection 
            formData={formData}
            onChange={handleFormChange}
          />

          <AccommodationSection 
            formData={formData}
            onChange={handleFormChange}
            onCheckboxChange={handleCheckboxChange}
          />

          <ActivitiesSection 
            formData={formData}
            onChange={handleFormChange}
            onCheckboxChange={handleCheckboxChange}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-4">
            <Button 
              type="submit" 
              size="lg" 
              className="gap-2 px-6 md:px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium w-full sm:w-auto"
              disabled={isLoading || !formData.startPoint || !formData.destination || (aiSettings.useDirectAI && !isModelSelected())}
            >
              <MapPin className="h-5 w-5" />
              {aiSettings.useDirectAI ? '🚀 Route Generieren' : '📝 Prompt Generieren'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={handleReset}
              className="gap-2 w-full sm:w-auto"
            >
              <RotateCcw className="h-5 w-5" />
              Formular Zurücksetzen
            </Button>
          </div>
        </form>

        {/* Output */}
        <div ref={outputSectionRef}>
          <OutputSection
            output={output}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            aiModel={aiModel}
            aiProvider={aiSettings.aiProvider}
            aiError={aiError}
            useDirectAI={aiSettings.useDirectAI}
          />
        </div>

        {/* FAQ Section */}
        <div id="faq" className="bg-card rounded-xl shadow-lg p-4 md:p-6 mt-12 mb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              ❓
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-purple-700">Häufige Fragen</h2>
          </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <span>✨</span>
                <span>Welches KI-Modell sollte ich wählen?</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p><strong>Wir haben die Auswahl auf die Top-Modelle beschränkt:</strong> Jeder Anbieter verwendet automatisch sein bestes Modell für optimale Ergebnisse.</p>
              <p className="mt-2">Die verfügbaren Optionen:</p>
              <ul className="list-disc list-inside mt-1 space-y-2">
                <li>
                  <strong>Google (Gemini 3 Pro Preview):</strong> Unser empfohlenes Top-Modell mit herausragendem Verständnis für geografische Daten, lokale Attraktionen und präzise Stellplatzempfehlungen. Ideal für nationale und internationale Routen - von kurzen Wochenendtrips bis zu komplexen Langstreckenreisen.
                </li>
                <li>
                  <strong>OpenAI (ChatGPT-5.2):</strong> Das leistungsstärkste Modell von OpenAI mit hervorragender Routenplanung und detaillierten Stellplatzempfehlungen. Ideal für komplexe Anforderungen und lange Reisen.
                </li>
                <li>
                  <strong>Mistral AI (Large):</strong> Ein leistungsstarkes Open-Source-Modell mit exzellenter Balance zwischen Qualität und Kosten. Perfekt für europäische Routen.
                </li>
              </ul>
              <p className="mt-3"><strong>Empfehlung:</strong> Basierend auf unseren Erfahrungen empfehlen wir <strong>Google Gemini 3 Pro Preview</strong> als beste Wahl für die meisten Anwendungsfälle.</p>
              <p className="mt-2">Gemini glänzt nicht nur bei internationalen Routen, sondern liefert auch für nationale Routen in Deutschland und Europa herausragende Ergebnisse mit:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Besonders präzisen Stellplatzempfehlungen</li>
                <li>Hervorragendem Verständnis für lokale Gegebenheiten</li>
                <li>Ausgezeichneter Balance zwischen Detailtiefe und Übersichtlichkeit</li>
                <li>Zuverlässiger Performance bei komplexen Routenplanungen</li>
              </ul>
              <p className="mt-2">Die anderen Modelle sind ebenfalls exzellent:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>OpenAI (ChatGPT-5.2):</strong> Für maximale Detailtiefe und komplexe Anforderungen</li>
                <li><strong>Mistral AI (Large):</strong> Für kosteneffiziente Qualität und europäische Routen</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <span>🤖</span>
                <span>Was ist das Besonderen an der KI-Reiseplanung von Camping Route?</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              Bei Camping Route setzen wir auf einen einzigartigen, transparenten Ansatz:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li><strong>Deine Daten, dein Prompt:</strong> Du gibst Start, Ziel und deine Präferenzen ein</li>
                <li><strong>KI-generierter Prompt:</strong> Wir erstellen einen optimierten Prompt, der genau deine Bedürfnisse beschreibt</li>
                <li><strong>Volle Kontrolle:</strong> Du siehst den Prompt und kannst ihn in deiner bevorzugten KI verwenden</li>
                <li><strong>Oder direkte Generierung:</strong> Mit API erhältst du sofort eine fertige Route</li>
                <li><strong>Automatische Ergebnis-Optimierung:</strong> Bei direkter KI-Nutzung wird dein Ergebnis automatisch aufbereitet und verbessert (Rechtschreibung, Formatierung, Lesbarkeit)</li>
              </ol>
              <p className="mt-2">Anders als allgemeine Reiseplaner generieren wir keine 'Black Box'-Ergebnisse - du behältst immer die Kontrolle über den Prozess!</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <span>⭐</span>
                <span>Was macht Camping Route einzigartig?</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              Camping Route ist der einzige KI-Routenplaner, der speziell für Wohnmobile und Camper entwickelt wurde. Während allgemeine Reiseplaner nur grobe Routen vorschlagen, finden wir Stellplätze, die perfekt zu deinem Fahrzeug, Budget und deinen Interessen passen. Unsere KI berücksichtigt Fahrzeugdaten, Stellplatz-Qualität, lokale Attraktionen und sogar deine Reiseziele - für eine wirklich maßgeschneiderte Reiseerfahrung.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <span>🤖</span>
                <span>Was ist der Unterschied zwischen Prompt und KI-Generierung?</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              Ohne API: Du erhältst einen optimierten Prompt, den du in deine bevorzugte KI kopieren kannst. Mit API: Die KI generiert direkt eine fertige Route mit Stellplätzen und Details - das Ergebnis hängt vom gewählten KI-Modell ab.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <span>✨</span>
                <span>Wird mein KI-Ergebnis automatisch verbessert?</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p><strong>Ja!</strong> Bei direkter KI-Nutzung (mit API-Schlüssel) wird dein Ergebnis automatisch durch unsere <strong>zweistufige KI-Optimierung</strong> aufbereitet:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li><strong>Erste Stufe:</strong> Die KI generiert die grundlegende Route (Kosten: ~5-7 Cent)</li>
                <li><strong>Zweite Stufe:</strong> Eine spezielle Optimierungs-KI verbessert Formatierung, Lesbarkeit und Struktur (Kosten: ~3-5 Cent)</li>
              </ol>
              <p className="mt-2"><strong>Gesamtkosten:</strong> Nur ~8-12 Cent pro Generierung für deutlich bessere Ergebnisse!</p>
              <p className="mt-2"><strong>Vorteile der Optimierung:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Korrekte Rechtschreibung und Grammatik</li>
                <li>Bessere Struktur mit klaren Überschriften</li>
                <li>Gezielte Verwendung von Emojis für bessere Lesbarkeit</li>
                <li>Hervorhebung wichtiger Informationen</li>
                <li>Persönlichere und nutzerfreundlichere Formulierungen</li>
              </ul>
              <p className="mt-2"><strong>Hinweis:</strong> Die Optimierung erfolgt automatisch und ist in den Gesamtkosten enthalten. Du kannst das verbesserte Ergebnis direkt verwenden oder bei Bedarf den ursprünglichen Prompt generieren lassen.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-6">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <span>💰</span>
                <span>Was kostet eine KI-Abfrage?</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              Die Kosten für eine KI-Abfrage hängen vom gewählten KI-Modell und Anbieter ab. Typischerweise liegen die Kosten bei aktuellen Modellen wie GPT-5.2 bei ca. 5-7 Cent pro Anfrage, abhängig von der Länge des Prompts und der generierten Antwort.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-7">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <span>🔒</span>
                <span>Wie werden meine Daten geschützt?</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              Alle Daten werden nur lokal in deinem Browser verarbeitet. Wir speichern keine persönlichen Informationen.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-7">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <span>🗺️</span>
                <span>Kann ich Routen offline nutzen?</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              Ja! Du kannst generierte Routen kopieren oder als PDF herunterladen und dann offline verwenden. Alle Daten bleiben auf deinem Gerät.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-8">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <span>🚐</span>
                <span>Welche Fahrzeugtypen werden unterstützt?</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              Aktuell werden Wohnmobile und Camper unterstützt. Wohnwagen sind in Planung und werden in einer zukünftigen Version hinzugefügt.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-9">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <span>💰</span>
                <span>Ist Camping Route kostenlos?</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              Ja, die Grundfunktionen sind komplett kostenlos. Für erweiterte KI-Funktionen kannst du optional deine eigene API einbinden.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Scroll to Top Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10 bg-background/80 backdrop-blur-sm border-border hover:bg-background"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Nach oben scrollen"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto px-4">
          <p className="text-xs md:text-sm">Camping Route – Erstellt mit ❤️ für Wohnmobil-Enthusiasten</p>
          <div className="grid grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-0">
            <a href="https://github.com/chrischtili/route-planner-pro" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 md:gap-2 text-muted-foreground hover:text-primary">
              <img src="/GitHub_Invertocat_Black_Clearspace.png" alt="GitHub" className="h-5 md:h-6" loading="lazy" />
              <span className="text-xs md:text-sm">GitHub</span>
            </a>
            <a href="/impressum" className="flex flex-col items-center gap-1 md:gap-2 text-muted-foreground hover:text-primary">
              📄
              <span className="text-xs md:text-sm">Impressum</span>
            </a>
            <a href="/datenschutz" className="flex flex-col items-center gap-1 md:gap-2 text-muted-foreground hover:text-primary">
              🔒
              <span className="text-xs md:text-sm">Datenschutz</span>
            </a>
          </div>
        </div>
        <div className="mt-4 md:mt-6 pt-4 border-t border-border">
          <p className="text-xs">
            © {new Date().getFullYear()} Camping Route. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}
