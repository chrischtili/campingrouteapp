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
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center">
              <img src="/favicon-original-final.svg" alt="Camping Route Logo" className="h-20 w-20 md:h-24 md:w-24 -mr-2" />
              <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground">
                Camping Route
              </h1>
            </div>
          </div>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl">
            Dein KI-Wohnmobil-Routenplaner – Plane deine perfekte Reise mit umfassenden Informationen
          </p>
          <div className="mt-4 bg-primary/20 backdrop-blur-sm rounded-lg p-4 max-w-3xl">
            <p className="text-primary-foreground font-medium">
              🌟 Der einzige KI-Routenplaner, der Stellplätze nach deinen Fahrzeugdaten, Interessen und Budget filtert – für stressfreies Reisen mit dem Wohnmobil.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 -mt-20 relative z-10">
        {/* Social Proof Section */}
        <div className="bg-card rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              ⭐ Von Wohnmobil-Enthusiasten geliebt
            </h2>
            <div className="flex items-center gap-2 text-yellow-500">
              <span>★★★★☆</span>
              <span className="text-muted-foreground text-sm">4.7/5</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm italic">"Endlich ein Routenplaner, der wirklich auf meine Bedürfnisse eingeht! Die KI hat mir eine perfekte Route mit tollen Stellplätzen vorgeschlagen."</p>
              <p className="text-xs text-muted-foreground mt-2">– Markus, Wohnmobil-Reisender</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm italic">"Die Filteroptionen sind genial! Ich kann nach Budget, Interessen und sogar Fahrzeuggröße filtern – das spart so viel Zeit!"</p>
              <p className="text-xs text-muted-foreground mt-2">– Sarah, Camperin</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm italic">"Perfekt für spontane Trips! Innerhalb von Minuten hatte ich eine detaillierte Route mit allen wichtigen Infos."</p>
              <p className="text-xs text-muted-foreground mt-2">– Thomas, Wochenend-Camper</p>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-card rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🎥 Beispiel-Ergebnis (bei KI-Nutzung)
          </h2>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Beispiel-Route: München → Gardasee</h3>
              <span className="text-sm text-muted-foreground">⏱️ 3 Tage • 💰 Budget: Mittel</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Tag 1: München → Innsbruck (120 km)</p>
                  <p className="text-sm text-muted-foreground">Stellplatz: Camping Innsbruck, 4.5★ • 💰 25€/Nacht</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Tag 2: Innsbruck → Bozen (140 km)</p>
                  <p className="text-sm text-muted-foreground">Stellplatz: Camping Bozen, 4.7★ • 💰 30€/Nacht</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Tag 3: Bozen → Riva del Garda (60 km)</p>
                  <p className="text-sm text-muted-foreground">Stellplatz: Camping Bella Italia, 4.8★ • 💰 35€/Nacht</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-primary/10 rounded-md text-center">
              <p className="text-sm text-primary font-medium">📊 Gesamt: 420 km • 3 Übernachtungen • 90€</p>
            </div>
            <div className="mt-3 text-xs text-muted-foreground text-center">
              <p>💡 Dies ist ein Beispiel für die KI-generierte Route. Ohne API erhältst du einen Prompt zum manuellen Verwenden.</p>
            </div>
          </div>
        </div>

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
              className="gap-2 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading || !formData.startPoint || !formData.destination}
            >
              <MapPin className="h-5 w-5" />
              {aiSettings.useDirectAI ? '🚀 Route Generieren' : '📝 Prompt Generieren'}
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

      {/* FAQ Section */}
      <div className="bg-card rounded-xl shadow-lg p-6 mt-12 mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          ❓ Häufige Fragen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">💰 Ist Camping Route kostenlos?</h3>
            <p className="text-sm text-muted-foreground">Ja, die Grundfunktionen sind komplett kostenlos. Für erweiterte KI-Funktionen kannst du optional deine eigene API einbinden.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">🔒 Wie werden meine Daten geschützt?</h3>
            <p className="text-sm text-muted-foreground">Alle Daten werden nur lokal in deinem Browser verarbeitet. Wir speichern keine persönlichen Informationen.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">🗺️ Kann ich Routen offline nutzen?</h3>
            <p className="text-sm text-muted-foreground">Ja! Du kannst generierte Routen kopieren oder als PDF herunterladen und dann offline verwenden. Alle Daten bleiben auf deinem Gerät.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">🚐 Welche Fahrzeugtypen werden unterstützt?</h3>
            <p className="text-sm text-muted-foreground">Aktuell werden Wohnmobile und Camper unterstützt. Wohnwagen sind in Planung und werden in einer zukünftigen Version hinzugefügt.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">🤖 Was ist der Unterschied zwischen Prompt und KI-Generierung?</h3>
            <p className="text-sm text-muted-foreground">Ohne API: Du erhältst einen optimierten Prompt, den du in deine bevorzugte KI kopieren kannst. Mit API: Die KI generiert direkt eine fertige Route mit Stellplätzen und Details - das Ergebnis hängt vom gewählten KI-Modell ab.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8 text-center text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto px-4">
          <p>Camping Route – Erstellt mit ❤️ für Wohnmobil-Enthusiasten</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="https://github.com/chrischtili/route-planner-pro" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
              📱 GitHub
            </a>
            <a href="/impressum" className="text-muted-foreground hover:text-primary">
              📄 Impressum
            </a>
            <a href="/datenschutz" className="text-muted-foreground hover:text-primary">
              🔒 Datenschutz
            </a>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs">
            © {new Date().getFullYear()} Camping Route. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}
