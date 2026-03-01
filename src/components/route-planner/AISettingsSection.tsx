import { useRef, useState } from "react";
import { Bot, FileText, AlertCircle, Lock, ExternalLink, Info, Sparkles, Wand2, Shield, ChevronDown } from "lucide-react";
import { AISettings } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface AISettingsSectionProps {
  aiSettings: AISettings;
  onAISettingsChange: (settings: Partial<AISettings>) => void;
  aiError: string;
}

const providerHelp = {
  openai: { url: 'https://platform.openai.com/api-keys', name: 'OpenAI' },
  google: { url: 'https://makersuite.google.com/', name: 'Google AI Studio' },
  mistral: { url: 'https://console.mistral.ai/', name: 'Mistral AI' },
};

export function AISettingsSection({ aiSettings, onAISettingsChange, aiError }: AISettingsSectionProps) {
  const { t } = useTranslation();
  const currentProvider = aiSettings.aiProvider as keyof typeof providerHelp;
  const [showModeCardsMobile, setShowModeCardsMobile] = useState(false);
  const modeHeaderRef = useRef<HTMLDivElement>(null);
  
  const inputClass = "w-full h-14 px-5 rounded-2xl bg-white/10 border-2 border-white/20 backdrop-blur-md shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-base md:text-lg text-white placeholder:text-white/30 placeholder:font-normal text-left";
  const selectedModeTitle = aiSettings.useDirectAI ? t("planner.ai.mode.direct.title") : t("planner.ai.mode.prompt.title");

  const scrollModeHeaderBelowNavbar = () => {
    if (!modeHeaderRef.current) return;
    const navbarOffset = 110;
    const top = modeHeaderRef.current.getBoundingClientRect().top + window.pageYOffset - navbarOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const openMobileModePicker = () => {
    setShowModeCardsMobile((prev) => !prev);
    setTimeout(() => {
      scrollModeHeaderBelowNavbar();
    }, 80);
  };

  const selectMode = (useDirectAI: boolean) => {
    onAISettingsChange({ useDirectAI });

    if (useDirectAI) {
      setTimeout(() => {
        scrollModeHeaderBelowNavbar();
      }, 80);
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h3 className="text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tighter uppercase text-white">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Wand2 className="w-6 h-6" />
          </div>
          {t("planner.ai.title")}
        </h3>
        <p className="text-white/60 text-lg leading-relaxed italic">
          {t("planner.ai.description")}
        </p>
      </div>

      {/* Mode Selection Grid */}
      <div ref={modeHeaderRef} className="space-y-3 text-left">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-white">
            {t("planner.ai.mode.label")}
          </div>
        </div>
        <button
          type="button"
          onClick={openMobileModePicker}
          className="md:hidden w-full rounded-2xl border-2 border-primary/25 bg-primary/10 px-5 py-4 text-left shadow-lg shadow-primary/10 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.18em] text-white">
                {t("planner.ai.mode.button")}
              </div>
              <div className="mt-2 text-xs font-semibold text-white/70">
                {t("planner.ai.mode.current", { mode: selectedModeTitle })}
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-primary transition-transform ${showModeCardsMobile ? "rotate-180" : ""}`} />
          </div>
        </button>
      </div>
      <div className={`${showModeCardsMobile ? "grid" : "hidden"} md:grid grid-cols-1 md:grid-cols-2 gap-6`}>
        {[
          { 
            id: 'prompt', 
            active: !aiSettings.useDirectAI, 
            icon: FileText, 
            title: t("planner.ai.mode.prompt.title"), 
            desc: t("planner.ai.mode.prompt.desc"),
          },
          { 
            id: 'direct', 
            active: aiSettings.useDirectAI, 
            icon: Bot, 
            title: t("planner.ai.mode.direct.title"), 
            desc: t("planner.ai.mode.direct.desc"),
          }
        ].map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => selectMode(mode.id === 'direct')}
            className={`group relative p-4 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border-2 text-left transition-all duration-500 ${
              mode.active 
                ? 'border-primary bg-primary/10 shadow-xl shadow-primary/10' 
                : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 shadow-lg'
            }`}
          >
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 sm:mb-8 transition-all duration-500 ${mode.active ? "bg-primary text-white scale-110 rotate-3 shadow-lg shadow-primary/30" : "bg-white/5 text-white/40 group-hover:text-white"}`}>
              <mode.icon className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <h4 className={`text-xl sm:text-2xl font-black mb-2 sm:mb-3 transition-colors uppercase tracking-tight ${mode.active ? "text-white" : "text-white/40 group-hover:text-white"}`}>
              {mode.title}
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed transition-colors ${mode.active ? "text-white/80" : "text-white/30 group-hover:text-white/50"}`}>
              {mode.desc}
            </p>
            
            {mode.active && (
              <>
                <motion.div 
                  layoutId="active-check"
                  className="absolute top-8 right-8 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <div className="mt-6 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                  {t("planner.ai.mode.selected")}
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      {/* AI Provider Settings Panel */}
      <AnimatePresence>
        {aiSettings.useDirectAI && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8 p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] bg-white/5 backdrop-blur-3xl border-2 border-white/10 shadow-2xl"
          >
            {aiError && (
              <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/10 p-6">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-bold text-lg text-white">{aiError}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4 text-left">
                <Label htmlFor="aiProvider" className="text-base md:text-lg font-bold text-white mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  {t("planner.ai.provider.label")}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent('open-faq', { detail: 'aiModel' }));
                    }}
                    className="text-primary hover:text-primary/80 underline decoration-primary/40 hover:decoration-primary underline-offset-4 transition-all inline-flex items-center gap-1.5 cursor-pointer font-bold text-sm md:text-base"
                  >
                    <Info className="w-5 h-5 md:w-4 md:h-4" /> {t("planner.ai.provider.help")}
                  </button>
                </Label>
                <Select 
                  value={aiSettings.aiProvider} 
                  onValueChange={(value) => {
                    onAISettingsChange({ 
                      aiProvider: value, 
                      openaiModel: value === 'openai' ? 'gpt-5.2' : aiSettings.openaiModel,
                      googleModel: value === 'google' ? 'gemini-3.1-pro-preview' : aiSettings.googleModel,
                      mistralModel: value === 'mistral' ? 'mistral-large-latest' : aiSettings.mistralModel
                    });
                  }}
                >
                  <SelectTrigger className={inputClass} style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-[#0a140f] border-white/10 shadow-2xl">
                    <SelectItem value="google">Google Gemini 3.1</SelectItem>
                    <SelectItem value="openai">OpenAI ChatGPT 5.2</SelectItem>
                    <SelectItem value="mistral">Mistral Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 text-left">
                <Label htmlFor="apiKey" className="flex items-center gap-2 text-base md:text-lg font-bold text-white mb-3">
                  <Lock className="w-5 h-5 md:w-4 md:h-4 text-primary" />
                  {t("planner.ai.apiKey.hint")}
                </Label>
                <div className="relative">
                  <input
                    id="apiKey"
                    type="password"
                    placeholder={t("planner.ai.apiKey.placeholder")}
                    value={aiSettings.apiKey}
                    onChange={(e) => onAISettingsChange({ apiKey: e.target.value })}
                    className={`${inputClass} pl-14`}
                    style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}
                  />
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a 
                href={providerHelp[currentProvider]?.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-base md:text-sm font-bold text-white group"
              >
                <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform text-primary" />
                {t("planner.ai.apiKey.create", { name: providerHelp[currentProvider]?.name })}
              </a>
              
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg">
                <Shield className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-white/90 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: t("planner.ai.apiKey.security") }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
