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

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export function RoutePlanner() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [aiSettings, setAISettings] = useState<AISettings>(initialAISettings);
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [aiError, setAIError] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const outputSectionRef = useRef<HTMLDivElement>(null);
  const aiSettingsSectionRef = useRef<HTMLDivElement>(null);

  // Schritt-Namen für den Assistenten
  const steps = [
    'KI-Einstellungen',
    'Reiseroute',
    'Routenoptimierung',
    'Fahrzeug Filter',
    'Übernachtung',
    'Besondere Interessen',
    'Zusammenfassung'
  ];

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

  // Navigation zwischen Schritten
  const nextStep = () => {
    if (currentStep < steps.length) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Markiere aktuellen Schritt als abgeschlossen
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      // Kein Scrollen mehr - Nutzer behält Kontrolle über Scroll-Position
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Kein Scrollen mehr
    }
  };

  const goToStep = (step: number) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
      // Kein Scrollen mehr
    }
  };

  // Überprüfe ob alle Pflichtfelder für den aktuellen Schritt ausgefüllt sind
  const isStepValid = () => {
    switch (currentStep) {
      case 1: // KI-Einstellungen
        return aiSettings.useDirectAI ? isModelSelected() : true;
      case 2: // Reiseroute
        return !!formData.startPoint && !!formData.destination;
      case 3: // Routenoptimierung
        return true; // Optional
      case 4: // Fahrzeugspezifische Filter
        return true; // Optional - kein Pflichtfeld
      case 5: // Übernachtung
        return true; // Optional
      case 6: // Aktivitäten
        return true; // Optional
      default:
        return true;
    }
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
          // Scroll to AI settings section and switch to step 1
          setTimeout(() => {
            goToStep(1);
            setTimeout(() => {
              aiSettingsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
            }, 100);
          }, 300);
          return;
        }
        
        // Wenn wir hier ankommen, hat der Benutzer einen gültigen API-Key eingegeben
        // Markiere alle Schritte als abgeschlossen, einschließlich des Zusammenfassung-Tabs
        const allSteps = steps; // Alle Schritte einschließlich des letzten
        const newCompletedSteps = [...completedSteps];
        
        allSteps.forEach((_, index) => {
          const stepNumber = index + 1;
          if (!newCompletedSteps.includes(stepNumber)) {
            newCompletedSteps.push(stepNumber);
          }
        });
        
        setCompletedSteps(newCompletedSteps);
        
        // Springe direkt zum Zusammenfassung-Tab
        setCurrentStep(steps.length); // Springe zum letzten Schritt (Zusammenfassung)

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
      // Scroll to AI settings section and switch to step 1 when there's an error
      setTimeout(() => {
        goToStep(1);
        setTimeout(() => {
          aiSettingsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }, 100);
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
    <main className="min-h-screen bg-background" id="main-content">
      {/* Clean Hero Section - Simple & Professional */}
      <div className="relative h-[40vh] md:h-[50vh] min-h-[300px] overflow-hidden">
        {/* Simple gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
        
          alt="Wohnmobil auf malerischer Reise durch Deutschland - Camping Route KI-Routenplaner für Wohnmobile" 
>>>>>>> a0b3e96b0730808a0f028ef8fc0806864e6752dd
          className="w-full h-full object-cover"
          width="1920"
          height="1080"
          loading="eager"
        />
=======
        {/* Hero image - simple and clean */}
        <img 
          src="/campingroute.jpg" 
          alt="Wohnmobil auf malerischer Reise durch Deutschland - Camping Route KI-Routenplaner für Wohnmobile" 
          className="w-full h-full object-cover"
          width="1920"
          height="1080"
          loading="eager"
        />
=======
          alt="Wohnmobil auf malerischer Reise durch Deutschland - Camping Route KI-Routenplaner für Wohnmobile" 
>>>>>>> a0b3e96b0730808a0f028ef8fc0806864e6752dd
          className="w-full h-full object-cover"
          width="1920"
          height="1080"
          loading="eager"
        />
        
        {/* Clean hero content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-4">
              <img src="/favicon-original-final.svg" alt="Camping Route Logo" 
                   className="h-12 w-12 md:h-14 md:w-14" 
                   width="56" height="56" />
              <h1 className="text-2xl md:text-4xl font-bold text-white">
                Camping Route
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-md">
              Intelligenter KI-Routenplaner für Wohnmobile
            </p>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 md:p-5 
                          shadow-lg max-w-md md:max-w-2xl">
              <p className="text-sm md:text-base text-gray-800 font-medium">
                Plane deine perfekte Reise mit Stellplätzen nach deinen Kriterien
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 -mt-20 relative z-10">
        {/* Simple Social Proof Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600">⭐</span>
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-yellow-700">
                Von Wohnmobil-Enthusiasten geliebt
              </h2>
            </div>
            <div className="flex items-center gap-2 text-yellow-500">
              <span className="text-lg font-bold">★★★★☆</span>
              <span className="text-muted-foreground text-sm">4.7/5</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm italic text-gray-700">
                "Endlich ein Routenplaner, der wirklich auf meine Bedürfnisse eingeht! Die KI hat mir eine perfekte Route mit tollen Stellplätzen vorgeschlagen."
              </p>
              <p className="text-xs text-gray-500 mt-2">– Markus, Wohnmobil-Reisender</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm italic text-gray-700">
                "Die Filteroptionen sind genial! Ich kann nach Budget, Interessen und sogar Fahrzeuggröße filtern – das spart so viel Zeit!"
              </p>
              <p className="text-xs text-gray-500 mt-2">– Sarah, Camperin</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm italic text-gray-700">
                "Perfekt für spontane Trips! Innerhalb von Minuten hatte ich eine detaillierte Route mit allen wichtigen Infos."
              </p>
              <p className="text-xs text-gray-500 mt-2">– Thomas, Wochenend-Camper</p>
            </div>
          </div>
        </div>

        {/* Simple Demo Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">🎯</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-blue-700">
              Beispiel-Route: München → Gardasee
            </h2>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-white rounded-md">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center 
                              text-white text-sm font-bold flex-shrink-0 mt-1">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-800">Tag 1: München → Innsbruck (120 km)</p>
                  <p className="text-sm text-gray-600">Camping Innsbruck • ★ 4.5/5 • 25€/Nacht</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white rounded-md">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center 
                              text-white text-sm font-bold flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-800">Tag 2: Innsbruck → Bozen (140 km)</p>
                  <p className="text-sm text-gray-600">Camping Bozen • ★ 4.7/5 • 30€/Nacht</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white rounded-md">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center 
                              text-white text-sm font-bold flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-800">Tag 3: Bozen → Riva del Garda (60 km)</p>
                  <p className="text-sm text-gray-600">Camping Bella Italia • ★ 4.8/5 • 35€/Nacht</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md text-center">
              <p className="text-sm font-medium text-blue-800">
                📊 Gesamt: 420 km • 3 Übernachtungen • 90€
              </p>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 text-center">
              <p>💡 Dies ist ein Beispiel für die KI-generierte Route. Ohne API erhältst du einen Prompt.</p>
            </div>
          </div>
        </div>
        {/* Step-by-Step Assistant */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Routenplaner-Assistent
              </h2>
              <span className="text-sm text-gray-600">
                Schritt {currentStep} von {steps.length}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
            
            {/* Step Navigation */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 text-xs">
              {steps.map((step, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToStep(index + 1)}
                  className={`px-2 py-1 rounded text-center transition-colors ${
                    currentStep === index + 1 
                      ? 'bg-primary text-white font-medium'
                      : completedSteps.includes(index + 1)
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!completedSteps.includes(index + 1) && currentStep !== index + 1}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>
          
          {/* Current Step Content */}
          <div className="space-y-6">
            {/* Step 1: KI-Einstellungen */}
            {currentStep === 1 && (
              <div id="step-1" ref={aiSettingsSectionRef}>
                <AISettingsSection 
                  aiSettings={aiSettings}
                  onAISettingsChange={handleAISettingsChange}
                  aiError={aiError}
                />
              </div>
            )}
            
            {/* Step 2: Reiseroute */}
            {currentStep === 2 && (
              <div id="step-2">
                <RouteSection 
                  formData={formData}
                  onChange={handleFormChange}
                />
              </div>
            )}
            
            {/* Step 3: Routenoptimierung */}
            {currentStep === 3 && (
              <div id="step-3">
                <RouteOptimizationSection 
                  formData={formData}
                  onCheckboxChange={handleCheckboxChange}
                />
              </div>
            )}
            
            {/* Step 4: Fahrzeug */}
            {currentStep === 4 && (
              <div id="step-4">
                <VehicleSection 
                  formData={formData}
                  onChange={handleFormChange}
                />
              </div>
            )}
            
            {/* Step 5: Übernachtung */}
            {currentStep === 5 && (
              <div id="step-5">
                <AccommodationSection 
                  formData={formData}
                  onChange={handleFormChange}
                  onCheckboxChange={handleCheckboxChange}
                />
              </div>
            )}
            
            {/* Step 6: Aktivitäten */}
            {currentStep === 6 && (
              <div id="step-6">
                <ActivitiesSection 
                  formData={formData}
                  onChange={handleFormChange}
                  onCheckboxChange={handleCheckboxChange}
                />
              </div>
            )}
            
            {/* Step 7: Zusammenfassung & Generierung */}
            {currentStep === 7 && (
              <div id="step-7">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Zusammenfassung Ihrer Route
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Startpunkt:</span>
                      <span className="font-medium">{formData.startPoint || 'Nicht angegeben'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ziel:</span>
                      <span className="font-medium">{formData.destination || 'Nicht angegeben'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">KI-Methode:</span>
                      <span className="font-medium">{aiSettings.useDirectAI ? 'Direkte KI-Generierung' : 'Prompt-Generierung'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowUp className="h-4 w-4 transform -rotate-90" />
              Zurück
            </Button>
            
            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                Weiter
                <ArrowUp className="h-4 w-4 transform rotate-90" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                size="lg"
                className="gap-2 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading || !formData.startPoint || !formData.destination || (aiSettings.useDirectAI && !isModelSelected())}
              >
                <MapPin className="h-5 w-5" />
                {aiSettings.useDirectAI ? 'Route Generieren' : 'Prompt Generieren'}
              </Button>
            )}
          </div>
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

        {/* Compact FAQ Section */}
        <div id="faq" className="bg-white rounded-xl shadow-lg p-6 mt-12 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600">❓</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-purple-700">
              Häufige Fragen
            </h2>
          </div>
        
        <Accordion type="single" collapsible className="w-full space-y-2">
          {/* Kosten & API */}
          <AccordionItem value="costs">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-lg transition-all">
              <div className="flex items-center gap-3 w-full text-left">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">💰</span>
                </div>
                <span className="font-medium">Ist Camping Route kostenlos?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-3">
                <p><strong>✅ Ja, komplett kostenlos!</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span>📝</span> Ohne API:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Prompt-Generierung</li>
                      <li>Keine Kosten</li>
                      <li>Volle Kontrolle über den Prozess</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span>🤖</span> Mit API:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Direkte Routengenerierung</li>
                      <li>API-Kosten trägst du selbst (~5-12 Cent pro Anfrage)</li>
                      <li>Schnellere Ergebnisse</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="flex items-center gap-2 mb-1">
                    <span>ℹ️</span>
                    <strong>Keine versteckten Kosten:</strong>
                  </p>
                  <p>Keine Abonnements, keine versteckten Gebühren. Du zahlst nur für deine eigene API-Nutzung, wenn du dich dafür entscheidest.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* KI-Modelle */}
          <AccordionItem value="models">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-lg transition-all">
              <div className="flex items-center gap-3 w-full text-left">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">✨</span>
                </div>
                <span className="font-medium">Welches KI-Modell sollte ich wählen?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <p className="mb-3"><strong>Empfehlung:</strong> Google Gemini 3 Pro Preview für beste Ergebnisse</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-1 text-sm">
                    <span>🌟</span> Google Gemini
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Beste geografische Daten</li>
                    <li>Präzise Stellplatzempfehlungen</li>
                    <li>Kosteneffizient</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-1 text-sm">
                    <span>🤖</span> OpenAI GPT-5.2
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Maximale Detailtiefe</li>
                    <li>Komplexe Anforderungen</li>
                    <li>Höchste Qualität</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-1 text-sm">
                    <span>⚡</span> Mistral AI
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Kosteneffizient</li>
                    <li>Europäische Routen</li>
                    <li>Gute Qualität</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Einzigartigkeit */}
          <AccordionItem value="unique">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-lg transition-all">
              <div className="flex items-center gap-3 w-full text-left">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600">⭐</span>
                </div>
                <span className="font-medium">Was macht Camping Route einzigartig?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <p className="mb-3"><strong>Der einzige KI-Routenplaner speziell für Wohnmobile!</strong></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <span>🎯</span> Präzise Filter:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Fahrzeugdaten (Größe, Gewicht)</li>
                    <li>Budget (günstig bis premium)</li>
                    <li>Interessen (Natur, Stadt, Familie)</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <span>🗺️</span> Intelligente Routen:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Stellplätze nach deinen Kriterien</li>
                    <li>Lokale Attraktionen</li>
                    <li>Optimale Etappenplanung</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg mt-3 text-sm">
                <p className="flex items-center gap-2 mb-1">
                  <span>💡</span>
                  <strong>Transparenter Prozess:</strong>
                </p>
                <p>Du behältst immer die Kontrolle - keine "Black Box" Ergebnisse wie bei anderen Planern!</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Prompt vs KI */}
          <AccordionItem value="prompt-vs-ai">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-lg transition-all">
              <div className="flex items-center gap-3 w-full text-left">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600">🤖</span>
                </div>
                <span className="font-medium">Prompt vs. KI-Generierung - was ist der Unterschied?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 text-xl">📝</span>
                  </div>
                  <h4 className="font-semibold mb-2">Ohne API (kostenlos)</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-left">
                    <li>Optimierter Prompt</li>
                    <li>Für deine bevorzugte KI</li>
                    <li>Volle Kontrolle</li>
                    <li>Keine Kosten</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 text-xl">⚡</span>
                  </div>
                  <h4 className="font-semibold mb-2">Mit API (Kosten ~8-12 Cent)</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-left">
                    <li>Direkte Routengenerierung</li>
                    <li>Fertige Route mit Details</li>
                    <li>Schnelleres Ergebnis</li>
                    <li>API-Kosten trägst du</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg mt-4 text-sm">
                <p className="flex items-center gap-2 mb-1">
                  <span>ℹ️</span>
                  <strong>Tipp:</strong>
                </p>
                <p>Probiere zuerst die kostenlose Prompt-Generierung aus, bevor du eine API einbindest!</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Datenschutz */}
          <AccordionItem value="privacy">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-lg transition-all">
              <div className="flex items-center gap-3 w-full text-left">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600">🔒</span>
                </div>
                <span className="font-medium">Wie werden meine Daten geschützt?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-2xl">🔒</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="mb-3"><strong>100% lokal - 100% sicher!</strong></p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Keine Cloud-Speicherung:</strong> Alle Daten bleiben in deinem Browser</li>
                    <li><strong>Keine Tracking-Cookies:</strong> Wir sammeln keine Nutzerdaten</li>
                    <li><strong>DSGVO-konform:</strong> Keine Datenweitergabe an Dritte</li>
                    <li><strong>Offline-fähig:</strong> Einmal generierte Routen kannst du offline nutzen</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Offline Nutzung */}
          <AccordionItem value="offline">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-lg transition-all">
              <div className="flex items-center gap-3 w-full text-left">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600">🗺️</span>
                </div>
                <span className="font-medium">Kann ich Routen offline nutzen?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 text-2xl">📱</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="mb-3"><strong>Ja, komplett offline-fähig!</strong></p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Exportieren:</strong> Als Text kopieren oder PDF herunterladen</li>
                    <li><strong>Speichern:</strong> Alle Daten bleiben auf deinem Gerät</li>
                    <li><strong>Nutzen:</strong> Ohne Internetverbindung verwenden</li>
                    <li><strong>Teilen:</strong> Per E-Mail oder Messenger versenden</li>
                  </ul>
                  <div className="bg-yellow-50 p-3 rounded-lg mt-3 text-sm">
                    <p className="flex items-center gap-2">
                      <span>💡</span>
                      <strong>Tipp:</strong> Lade deine Route vor der Reise herunter, um unterwegs ohne Internet darauf zugreifen zu können!
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Fahrzeugtypen */}
          <AccordionItem value="vehicles">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-lg transition-all">
              <div className="flex items-center gap-3 w-full text-left">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600">🚐</span>
                </div>
                <span className="font-medium">Welche Fahrzeugtypen werden unterstützt?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-teal-50 p-3 rounded-lg text-center">
                  <div className="w-12 h-12 bg-teal-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-teal-600 text-xl">🚐</span>
                  </div>
                  <p className="text-sm font-medium">Wohnmobile</p>
                  <p className="text-xs text-gray-600">Voll unterstützt</p>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg text-center">
                  <div className="w-12 h-12 bg-teal-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-teal-600 text-xl">🏕️</span>
                  </div>
                  <p className="text-sm font-medium">Camper</p>
                  <p className="text-xs text-gray-600">Voll unterstützt</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center opacity-70">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-gray-400 text-xl">🚛</span>
                  </div>
                  <p className="text-sm font-medium">Wohnwagen</p>
                  <p className="text-xs text-gray-500">In Planung</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center opacity-70">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-gray-400 text-xl">🏍️</span>
                  </div>
                  <p className="text-sm font-medium">Motorräder</p>
                  <p className="text-xs text-gray-500">Geplant</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Modern Scroll to Top Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 bg-background/90 backdrop-blur-lg border-primary/20 
                    hover:bg-primary/10 hover:border-primary/30 shadow-lg hover:shadow-xl 
                    transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Nach oben scrollen"
        >
          <div className="relative">
            <ArrowUp className="h-5 w-5 text-primary animate-bounce" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent 
                          rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Button>
      </div>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 text-center md:text-left">
              © {new Date().getFullYear()} Camping Route – KI-Routenplaner für Wohnmobile
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <a href="/impressum" className="hover:text-primary transition-colors">
                Impressum
              </a>
              <a href="/datenschutz" className="hover:text-primary transition-colors">
                Datenschutz
              </a>
              <a href="https://github.com/chrischtili/route-planner-pro" target="_blank" 
                 rel="noopener noreferrer" className="hover:text-primary transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </main>
  );
}
