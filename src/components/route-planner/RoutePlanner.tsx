import { useState, useRef } from "react";
import { Route, RotateCcw, MapPin, ArrowUp, Bot, Settings2, Truck, Bed, Heart, FileText, ChevronLeft, ChevronRight, Sparkles, Copy } from "lucide-react";
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
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { RouteExampleSection } from "./RouteExampleSection";
import { FAQSection } from "./FAQSection";
import { AnchorNavigation } from "./AnchorNavigation";
import { Navbar } from "./Navbar";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Footer } from "./Footer";
import { motion } from "framer-motion";

// Schritt-Definitionen mit Icons für das neue Design
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
  const formRef = useRef<HTMLDivElement>(null);

  // Schritt-Namen für den Assistenten mit Icons für das neue Design
  const steps = [
    { icon: Bot, label: "KI-Einstellungen", description: "Wähle dein bevorzugtes KI-Modell und den Modus." },
    { icon: Route, label: "Reiseroute", description: "Gib Start, Ziel und Zwischenstopps an." },
    { icon: Settings2, label: "Routenoptimierung", description: "Passe Geschwindigkeit, Pausen und Umwege an." },
    { icon: Truck, label: "Fahrzeug", description: "Größe, Gewicht und spezielle Anforderungen." },
    { icon: Bed, label: "Übernachtung", description: "Stellplatz-Typ, Budget und Ausstattung." },
    { icon: Heart, label: "Interessen", description: "Natur, Kultur, Kulinarik und mehr." },
    { icon: FileText, label: "Zusammenfassung", description: "Prüfe deine Angaben und generiere die Route." },
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
      
      // Auf mobilen Geräten zum Formular-Anfang scrollen
      if (window.innerWidth <= 768 && formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  // Überprüfe ob alle Pflichtfelder für den aktuellen Schritt ausgefüllt sind
  const isStepValid = () => {
    switch (currentStep) {
      case 1: // KI-Einstellungen
        if (!aiSettings.useDirectAI) {
          return true; // Kein API-Schlüssel nötig, wenn KI nicht direkt genutzt wird
        }
        // Wenn KI direkt genutzt wird, brauchen wir:
        // 1. Einen API-Schlüssel
        // 2. Ein ausgewähltes Modell
        const hasValidApiKey = !!aiSettings.apiKey?.trim() && /^[A-Za-z0-9-_]{20,}$/.test(aiSettings.apiKey);
        const hasSelectedModel = isModelSelected();
        return hasValidApiKey && hasSelectedModel;
      case 2: // Reiseroute
        return !!formData.startPoint && !!formData.destination;
      case 3: // Routenoptimierung
        return true; // Optional
      case 4: // Fahrzeug
        return true; // Optional
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
          return;
        }
        
        // Markiere alle Schritte als abgeschlossen
        const allSteps = steps.map((_, index) => index + 1);
        const newCompletedSteps = [...completedSteps];
        
        allSteps.forEach(stepNumber => {
          if (!newCompletedSteps.includes(stepNumber)) {
            newCompletedSteps.push(stepNumber);
          }
        });
        
        setCompletedSteps(newCompletedSteps);
        
        const aiResponse = await callAIAPI(formData, aiSettings);
        setOutput(aiResponse);
        setAiModel(aiSettings.aiProvider.toUpperCase());
        
        // Nach erfolgreicher Generierung: Schritt als abgeschlossen markieren
        // und keinen Schritt mehr als aktiv setzen
        setCurrentStep(steps.length + 1); // Setze auf einen Schritt nach dem letzten
      } else {
        setLoadingMessage('📝 Dein Prompt wird generiert...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const generatedOutput = generatePrompt(formData);
        setOutput(generatedOutput);
        setAiModel('');
        
        // Markiere den Zusammenfassungsschritt als abgeschlossen
        if (!completedSteps.includes(steps.length)) {
          setCompletedSteps([...completedSteps, steps.length]);
        }
        
        // Nach erfolgreicher Generierung: keinen Schritt mehr als aktiv setzen
        setCurrentStep(steps.length + 1); // Setze auf einen Schritt nach dem letzten
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error:', error);
      }
      if (error instanceof Error) {
        setAIError(error.message);
      } else {
        setAIError('Fehler beim Aufruf der KI. Bitte überprüfe deinen API-Schlüssel und deine Internetverbindung.');
      }
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
    if (!aiSettings.useDirectAI) return true;
    
    const currentProvider = aiSettings.aiProvider;
    const modelKey = `${currentProvider}Model` as 'openaiModel' | 'mistralModel' | 'googleModel';
    return !!aiSettings[modelKey];
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'rgb(250, 244, 235)' }} id="main-content">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Route Example Section */}
      <RouteExampleSection />

      {/* Main Content - Step-by-Step Assistant */}
      <section id="planner" className="py-24 px-4 bg-[rgb(252,250,248)] dark:bg-gray-800" id="planner">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-[#F59B0A] dark:text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">
              Routenplaner
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-3">
              In 7 Schritten zur perfekten Route
            </h2>
          </motion.div>

          {/* Progress bar - Neues Design */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i + 1 === currentStep;
                const isDone = completedSteps.includes(i + 1);
                return (
                  <button
                    key={i}
                    onClick={() => goToStep(i + 1)}
                    disabled={!completedSteps.includes(i + 1) && currentStep !== i + 1}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                      isActive
                        ? "text-[#F59B0A] dark:text-[#F59B0A] scale-110"
                        : isDone
                        ? "text-primary"
                        : "text-muted-foreground/40 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-[#F59B0A] to-[#E67E22] text-white dark:text-foreground shadow-lg"
                          : isDone
                          ? "bg-[rgb(50,110,89)] text-white dark:text-foreground"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium hidden md:block">
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Progress line */}
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F59B0A] to-[#E67E22] dark:from-[#F59B0A] dark:to-[#E67E22] rounded-full transition-all duration-300"
                style={{ width: `${((currentStep) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="p-8 min-h-[240px]" ref={formRef}>
            {/* Current Step Content */}
            <div className="space-y-6">
              {/* Step 1: KI-Einstellungen */}
              {currentStep === 1 && (
                <div id="step-1" className="bg-gray-50 dark:bg-gray-900">
                  <AISettingsSection 
                    aiSettings={aiSettings}
                    onAISettingsChange={handleAISettingsChange}
                    aiError={aiError}
                  />
                </div>
              )}
              
              {/* Step 2: Reiseroute */}
              {currentStep === 2 && (
                <div id="step-2" className="bg-white dark:bg-gray-800">
                  <RouteSection 
                    formData={formData}
                    onChange={handleFormChange}
                  />
                </div>
              )}
              
              {/* Step 3: Routenoptimierung */}
              {currentStep === 3 && (
                <div id="step-3" className="bg-gray-50 dark:bg-gray-900">
                  <RouteOptimizationSection 
                    formData={formData}
                    onCheckboxChange={handleCheckboxChange}
                  />
                </div>
              )}
              
              {/* Step 4: Fahrzeug */}
              {currentStep === 4 && (
                <div id="step-4" className="bg-white dark:bg-gray-800">
                  <VehicleSection 
                    formData={formData}
                    onChange={handleFormChange}
                  />
                </div>
              )}
              
              {/* Step 5: Übernachtung */}
              {currentStep === 5 && (
                <div id="step-5" className="bg-gray-50 dark:bg-gray-900">
                  <AccommodationSection 
                    formData={formData}
                    onChange={handleFormChange}
                    onCheckboxChange={handleCheckboxChange}
                  />
                </div>
              )}
              
              {/* Step 6: Aktivitäten */}
              {currentStep === 6 && (
                <div id="step-6" className="bg-white dark:bg-gray-800">
                  <ActivitiesSection 
                    formData={formData}
                    onChange={handleFormChange}
                    onCheckboxChange={handleCheckboxChange}
                  />
                </div>
              )}
              
              {/* Step 7: Zusammenfassung & Generierung */}
              {currentStep === 7 && (
                <div id="step-7" className="bg-gray-50 dark:bg-gray-900">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-primary">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-10 h-10 rounded-full flex items-center justify-center text-white dark:text-foreground bg-primary">
                            📋
                          </span>
                          Zusammenfassung Ihrer Route
                        </span>
                      </h3>
                      <div className="h-px bg-gray-200 dark:bg-gray-700 mt-2 -mx-4" />
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-foreground">Startpunkt:</span>
                        <span className="font-medium text-foreground">{formData.startPoint || 'Nicht angegeben'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground">Ziel:</span>
                        <span className="font-medium text-foreground">{formData.destination || 'Nicht angegeben'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground">KI-Methode:</span>
                        <span className="font-medium text-foreground">{aiSettings.useDirectAI ? 'Direkte KI-Generierung' : 'Prompt-Generierung'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Navigation Buttons - Nur anzeigen, wenn wir uns in einem der Schritte befinden */}
            {currentStep <= steps.length && (
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="gap-2 w-full md:w-auto rounded-full text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Zurück
                  </Button>
                )}
                
                <div className={`w-full flex ${currentStep > 1 ? 'md:w-auto justify-end' : 'justify-end'}`}>
                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="gap-2 bg-[#F59B0A] hover:bg-[#E67E22] text-white dark:text-foreground w-full md:w-auto rounded-full"
                    >
                      Weiter
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      size="lg"
                      className="gap-2 px-4 md:px-6 bg-[#F59B0A] hover:bg-[#E67E22] text-white dark:text-foreground w-full md:w-auto rounded-full"
                      disabled={isLoading || !formData.startPoint || !formData.destination || (aiSettings.useDirectAI && !isModelSelected())}
                    >
                      <MapPin className="h-5 w-5" />
                      {aiSettings.useDirectAI ? 'Route Generieren' : 'Prompt Generieren'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Output */}
          <div className="mt-8 max-w-4xl mx-auto">
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
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
