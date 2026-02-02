import { Bot, FileText, AlertCircle, Lock, ExternalLink } from "lucide-react";
import { AISettings } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SectionCard } from "./SectionCard";

interface AISettingsSectionProps {
  aiSettings: AISettings;
  onAISettingsChange: (settings: Partial<AISettings>) => void;
  aiError: string;
}

const providerModels = {
  openai: [
    { value: 'gpt-4o-2024-05-13', label: 'GPT-4o ($5/$15 pro 1M Tokens)' },
    { value: 'gpt-4o-mini-2024-07-18', label: 'GPT-4o Mini ($0.30/$1.50 pro 1M Tokens)' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet ($3/$15 pro 1M Tokens)' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus ($15/$75 pro 1M Tokens)' },
  ],
  mistral: [
    { value: 'mistral-large-latest', label: 'Mistral Large' },
    { value: 'mistral-medium-latest', label: 'Mistral Medium' },
  ],
  google: [
    { value: 'gemini-1.5-flash-001', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro-001', label: 'Gemini 1.5 Pro' },
  ],
};

const providerHelp = {
  openai: { url: 'https://platform.openai.com/api-keys', name: 'OpenAI' },
  anthropic: { url: 'https://console.anthropic.com/', name: 'Anthropic' },
  mistral: { url: 'https://console.mistral.ai/', name: 'Mistral AI' },
  google: { url: 'https://makersuite.google.com/', name: 'Google AI Studio' },
};

export function AISettingsSection({ aiSettings, onAISettingsChange, aiError }: AISettingsSectionProps) {
  const currentProvider = aiSettings.aiProvider as keyof typeof providerModels;
  const currentModelKey = `${currentProvider}Model` as keyof AISettings;
  
  return (
    <SectionCard icon="🤖" title="KI-Einstellungen">
      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aiProvider">KI-Anbieter</Label>
                <Select 
                  value={aiSettings.aiProvider} 
                  onValueChange={(value) => onAISettingsChange({ aiProvider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="mistral">Mistral AI</SelectItem>
                    <SelectItem value="google">Google Gemini</SelectItem>
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

            <div className="space-y-2">
              <Label>Modell</Label>
              <Select 
                value={aiSettings[currentModelKey] as string}
                onValueChange={(value) => onAISettingsChange({ [currentModelKey]: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providerModels[currentProvider]?.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
