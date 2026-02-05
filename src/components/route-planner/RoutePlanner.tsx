import { useState } from "react";
import { Route, RotateCcw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormData, AISettings, initialFormData, initialAISettings } from "@/types/routePlanner";
import { generatePrompt, callAIAPI } from "@/lib/promptGenerator";
import { AISettingsSection } from "./AISettingsSection";
import { RouteSection } from "./RouteSection";
import { RouteOptimizationSection } from "./RouteOptimizationSection";
import { VehicleSection } from "./VehicleSection";
import { AccommodationSection } from "./AccommodationSection";
import { ActivitiesSection } from "./ActivitiesSection";
import { OutputSection } from "./OutputSection";
import heroCamper from "@/assets/hero-camper.jpg";

export function RoutePlanner() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [aiSettings, setAISettings] = useState<AISettings>(initialAISettings);
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [aiError, setAIError] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('');

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
        
        if (!aiSettings.apiKey?.trim()) {
          setAIError('Bitte gib deinen API-Schlüssel ein, um die KI direkt zu nutzen.');
          setIsLoading(false);
          return;
        }

        const aiResponse = await callAIAPI(formData, aiSettings);
        setOutput(aiResponse);
        setAiModel(aiSettings.aiProvider.toUpperCase());
      } else {
        setLoadingMessage('📝 Dein Prompt wird generiert...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const generatedOutput = generatePrompt(formData);
        setOutput(generatedOutput);
        setAiModel('');
      }
    } catch (error) {
      console.error('Error:', error);
      setAIError('Fehler beim Aufruf der KI. Bitte überprüfe deinen API-Schlüssel und deine Internetverbindung.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setOutput('');
    setAIError('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img 
          src={heroCamper} 
          alt="Wohnmobil auf Reisen" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex items-center gap-3 mb-4">
            <img src="/favicon-original-final.svg" alt="Camping Route Logo" className="h-20 w-20 md:h-24 md:w-24" />
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground">
              Camping Route
            </h1>
          </div>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl">
            Dein KI-Wohnmobil-Routenplaner – Plane deine perfekte Reise mit umfassenden Informationen
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 -mt-20 relative z-10">
        {/* Info Box */}
        <div className="bg-card rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📖 So funktioniert's
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <li className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl mb-2">🗺️</span>
              <strong>Route planen</strong>
              <span className="text-muted-foreground">Gib Start, Ziel und Reisedaten ein</span>
            </li>
            <li className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl mb-2">⚙️</span>
              <strong>Optionen wählen</strong>
              <span className="text-muted-foreground">Fahrzeug, Interessen, Budget</span>
            </li>
            <li className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl mb-2">✨</span>
              <strong>Generieren</strong>
              <span className="text-muted-foreground">Route mit einem Klick erstellen</span>
            </li>
            <li className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl mb-2">📋</span>
              <strong>Ergebnis</strong>
              <span className="text-muted-foreground">Detaillierte Routenplanung</span>
            </li>
            <li className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl mb-2">💾</span>
              <strong>Exportieren</strong>
              <span className="text-muted-foreground">Drucken oder speichern</span>
            </li>
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AISettingsSection 
            aiSettings={aiSettings}
            onAISettingsChange={handleAISettingsChange}
            aiError={aiError}
          />
          
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              type="submit" 
              size="lg" 
              className="gap-2 px-8"
              disabled={isLoading || !formData.startPoint || !formData.destination}
            >
              <MapPin className="h-5 w-5" />
              {aiSettings.useDirectAI ? 'Route Generieren' : 'Prompt Generieren'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Formular Zurücksetzen
            </Button>
          </div>
        </form>

        {/* Output */}
        <OutputSection
          output={output}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          aiModel={aiModel}
          aiError={aiError}
          useDirectAI={aiSettings.useDirectAI}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8 text-center text-sm text-muted-foreground">
        <p>Camping Route – Erstellt mit ❤️ für Wohnmobil-Enthusiasten</p>
      </footer>
    </div>
  );
}
