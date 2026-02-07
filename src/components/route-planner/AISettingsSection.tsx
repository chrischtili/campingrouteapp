import { Bot, FileText, AlertCircle, Lock, ExternalLink, Info } from "lucide-react";
import { AISettings } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SectionCard } from "./SectionCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface AISettingsSectionProps {
  aiSettings: AISettings;
  onAISettingsChange: (settings: Partial<AISettings>) => void;
  aiError: string;
}

const providerModels = {
  google: [
    { value: 'gemini-3-pro-preview', label: 'Google (Gemini 3 Pro Preview)' },
  ],
  openai: [
    { value: 'gpt-5.2', label: 'OpenAI (ChatGPT-5.2)' },
  ],
  mistral: [
    { value: 'mistral-large-latest', label: 'Mistral AI (Large)' },
  ],
};

const providerHelp = {
  openai: { url: 'https://platform.openai.com/api-keys', name: 'OpenAI' },
  google: { url: 'https://makersuite.google.com/', name: 'Google AI Studio' },
  mistral: { url: 'https://console.mistral.ai/', name: 'Mistral AI' },
};

export function AISettingsSection({ aiSettings, onAISettingsChange, aiError }: AISettingsSectionProps) {
  const isMobile = useIsMobile();
  const currentProvider = aiSettings.aiProvider as keyof typeof providerModels;
  const currentModelKey = `${currentProvider}Model` as keyof AISettings;
  
  return (
    <SectionCard icon="🤖" title="KI-Einstellungen" iconColor="bg-purple-100" titleColor="text-purple-700">
      <div className="space-y-6">
        {/* Mode Selection */}
        <div className={`grid grid-cols-1 ${isMobile ? "gap-3" : "md:grid-cols-2 gap-4"}`}>
          <button
            type="button"
            onClick={() => onAISettingsChange({ useDirectAI: false })}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              !aiSettings.useDirectAI 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-semibold">Prompt generieren</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Erstellt einen fertigen Prompt, den du in deine KI einfügen kannst
            </p>
          </button>
          
          <button
            type="button"
            onClick={() => onAISettingsChange({ useDirectAI: true })}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              aiSettings.useDirectAI 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-semibold">KI direkt nutzen</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ruft die KI direkt auf und zeigt dir das Ergebnis an
            </p>
          </button>
        </div>

        {/* AI Provider Settings */}
        {aiSettings.useDirectAI && (
          <div className="space-y-4 pt-4 border-t border-border">
            {aiError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            )}
            
            <div className={`grid grid-cols-1 ${isMobile ? "gap-3" : "md:grid-cols-2 gap-4"}`}>
              <div className="space-y-2">
                <Label htmlFor="aiProvider">
                  KI-Anbieter & Modell
                  <span className="text-muted-foreground text-xs ml-2">
                    <a href="#faq" className="hover:underline">
                      <Info className="inline h-3 w-3 mb-1" /> Welches Modell wählen?
                    </a>
                  </span>
                </Label>
                <Select 
                  value={aiSettings.aiProvider} 
                  onValueChange={(value) => {
                    // Automatically set the corresponding model when provider changes
                    const modelMap = {
                      openai: 'gpt-5.2',
                      google: 'gemini-3-pro-preview',
                      mistral: 'mistral-large-latest'
                    };
                    onAISettingsChange({ 
                      aiProvider: value, 
                      openaiModel: value === 'openai' ? 'gpt-5.2' : aiSettings.openaiModel,
                      googleModel: value === 'google' ? 'gemini-3-pro-preview' : aiSettings.googleModel,
                      mistralModel: value === 'mistral' ? 'mistral-large-latest' : aiSettings.mistralModel
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google (Gemini 3 Pro Preview)</SelectItem>
                    <SelectItem value="openai">OpenAI (ChatGPT-5.2)</SelectItem>
                    <SelectItem value="mistral">Mistral AI (Large)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  API-Schlüssel
                  <span className="text-muted-foreground text-xs ml-2">(wird nicht gespeichert)</span>
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Dein API-Schlüssel"
                  value={aiSettings.apiKey}
                  onChange={(e) => onAISettingsChange({ apiKey: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg text-sm">
              <ExternalLink className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <a 
                  href={providerHelp[currentProvider]?.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  API-Schlüssel bei {providerHelp[currentProvider]?.name} erstellen →
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg text-sm">
              <Lock className="h-4 w-4 text-primary" />
              <p className="text-muted-foreground">
                Deine API-Schlüssel werden <strong className="text-foreground">niemals gespeichert</strong> und 
                verlassen <strong className="text-foreground">niemals deinen Browser</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
