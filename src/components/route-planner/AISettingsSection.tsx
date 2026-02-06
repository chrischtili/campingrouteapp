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
    { value: 'gpt-5.2',    label: 'GPT-5.2 (Input/Output: $1.75/$14 pro 1M Tokens)' },
    { value: 'gpt-5',      label: 'GPT-5 (Input/Output: $1.25/$10 pro 1M Tokens)' },
    { value: 'gpt-5-mini', label: 'GPT-5 Mini (Input/Output: $0.25/$2 pro 1M Tokens)' },
    { value: 'gpt-5-nano', label: 'GPT-5 Nano (Input/Output: $0.05/$0.40 pro 1M Tokens)' },
  ],
  anthropic: [
    { value: 'claude-opus-4-5',   label: 'Claude Opus 4.5 (Input/Output: $5/$25 pro 1M Tokens)' },
    { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5 (Input/Output: $3/$15 pro 1M Tokens)' },
    { value: 'claude-haiku-3',    label: 'Claude Haiku 3 (Input/Output: $0.25/$1.25 pro 1M Tokens)' },
  ],
  mistral: [
    { value: 'mistral-large-latest',  label: 'Mistral Large (Input/Output: $2/$6 pro 1M Tokens)' },
    { value: 'mistral-small-latest',  label: 'Mistral Small (Input/Output: $0.20/$0.60 pro 1M Tokens)' },
    { value: 'pixtral-12b-latest',    label: 'Pixtral 12B (Input/Output: $0.15/$0.15 pro 1M Tokens)' },
  ],
  google: [
    { value: 'gemini-3-pro-preview',     label: 'Gemini 3 Pro Preview (Input/Output: $2/$12 pro 1M Tokens; <=200k Prompt)' },
    { value: 'gemini-2.5-pro',           label: 'Gemini 2.5 Pro (Input/Output: $1.25/$10 pro 1M Tokens; <=200k Prompt)' },
    { value: 'gemini-2.5-flash',         label: 'Gemini 2.5 Flash (Input/Output: $0.30/$2.50 pro 1M Tokens)' },
    { value: 'gemini-2.5-flash-lite',    label: 'Gemini 2.5 Flash-Lite (Input/Output: $0.10/$0.40 pro 1M Tokens)' },
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
    <SectionCard icon="🤖" title="KI-Einstellungen" iconColor="bg-purple-100" titleColor="text-purple-700">
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
                  <SelectValue placeholder="-- Bitte wählen --" />
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
