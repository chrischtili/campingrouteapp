import { useRef, useState } from "react";
import { Bot, AlertCircle, Lock, ExternalLink, Info, Wand2, Shield, ChevronDown } from "lucide-react";
import { AISettings } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_OPENAI_MODEL, DIRECT_AI_FEATURE_ENABLED, TOKEN_MODE_PREVIEW_ENABLED } from "@/config/ai";

interface AISettingsSectionProps {
  aiSettings: AISettings;
  onAISettingsChange: (settings: Partial<AISettings>) => void;
  aiError: string;
}

const providerHelp = { url: 'https://platform.openai.com/api-keys', name: 'OpenAI' };

export function AISettingsSection({ aiSettings, onAISettingsChange, aiError }: AISettingsSectionProps) {
  const { t } = useTranslation();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const providerSectionRef = useRef<HTMLDivElement>(null);
  
  const inputClass = "w-full h-12 sm:h-14 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-white/10 border-2 border-white/20 backdrop-blur-md shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-sm sm:text-base md:text-lg text-white placeholder:text-white/30 placeholder:font-normal text-left";

  const scrollProviderSectionBelowNavbar = () => {
    if (!providerSectionRef.current) return;
    const navbarOffset = 110;
    const top = providerSectionRef.current.getBoundingClientRect().top + window.pageYOffset - navbarOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const selectMode = (useDirectAI: boolean) => {
    if (useDirectAI && !DIRECT_AI_FEATURE_ENABLED) return;
    onAISettingsChange({ useDirectAI, aiProvider: "openai" });

    if (useDirectAI) {
      setTimeout(() => {
        if (window.innerWidth < 768) {
          scrollProviderSectionBelowNavbar();
        }
      }, 180);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h3 className="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight text-white">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Wand2 className="w-6 h-6" />
          </div>
          {t("planner.ai.title")}
        </h3>
        <p className="text-white/60 text-lg leading-relaxed italic">
          {t("planner.ai.description")}
        </p>
      </div>

      {TOKEN_MODE_PREVIEW_ENABLED && (
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setShowAdvancedOptions((prev) => !prev)}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div>
              <div className="text-sm font-semibold tracking-[0.06em] text-white">{t("planner.ai.advanced.title")}</div>
              <div className="mt-1 text-sm text-white/60">{t("planner.ai.advanced.desc")}</div>
            </div>
            <ChevronDown className={`h-5 w-5 text-primary transition-transform ${showAdvancedOptions ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence initial={false}>
            {showAdvancedOptions && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="pt-2"
              >
                <div className="rounded-3xl border border-primary/20 bg-primary/[0.06] p-5 sm:p-6 text-left shadow-[0_14px_36px_rgba(0,0,0,0.08)]">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <Bot className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-lg font-black tracking-tight text-white">{t("planner.ai.advanced.tokenTitle")}</div>
                        <div className="mt-1 text-sm text-white/65">{t("planner.ai.advanced.tokenDesc")}</div>
                      </div>
                    </div>
                    <div className="rounded-full border border-primary/30 bg-primary/12 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-primary">
                      {t("planner.ai.advanced.comingSoon")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm text-white/78 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-[11px] font-semibold tracking-[0.1em] text-white/50">{t("planner.ai.advanced.tokenModelLabel")}</div>
                      <div className="mt-1 font-semibold text-white">{t("planner.ai.advanced.tokenModelValue")}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-[11px] font-semibold tracking-[0.1em] text-white/50">{t("planner.ai.advanced.tokenBillingLabel")}</div>
                      <div className="mt-1 font-semibold text-white">{t("planner.ai.advanced.tokenBillingValue")}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-[11px] font-semibold tracking-[0.1em] text-white/50">{t("planner.ai.advanced.tokenStatusLabel")}</div>
                      <div className="mt-1 font-semibold text-white">{t("planner.ai.advanced.tokenStatusValue")}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* AI Provider Settings Panel */}
      <AnimatePresence>
        {DIRECT_AI_FEATURE_ENABLED && aiSettings.useDirectAI && (
          <motion.div 
            ref={providerSectionRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-white/[0.06] backdrop-blur-3xl border border-white/8 shadow-[0_18px_50px_rgba(0,0,0,0.12)] scroll-mt-28"
          >
            {aiError && (
              <Alert variant="destructive" className="rounded-xl sm:rounded-2xl border-destructive/20 bg-destructive/10 p-4 sm:p-6">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-bold text-lg text-white">{aiError}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4 text-left">
                <Label htmlFor="aiProvider" className="min-h-[3.5rem] sm:min-h-[3.75rem] text-sm sm:text-base md:text-lg font-bold text-white mb-3 flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-4">
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
                <div className="rounded-xl sm:rounded-2xl border-2 border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-white/85">
                  OpenAI
                </div>

                <div className="space-y-3 pt-2">
                  <Label htmlFor="openaiModel" className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-white/75">
                    {t("planner.ai.provider.openaiModelLabel")}
                  </Label>
                  <Select
                    value={aiSettings.openaiModel || DEFAULT_OPENAI_MODEL}
                    onValueChange={(value) => onAISettingsChange({ aiProvider: "openai", openaiModel: value })}
                  >
                    <SelectTrigger id="openaiModel" className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-5.4">ChatGPT 5.4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <Label htmlFor="apiKey" className="min-h-[3.5rem] sm:min-h-[3.75rem] flex items-start gap-2 text-xs sm:text-sm md:text-base font-bold text-white/95 mb-3 leading-tight">
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
                    className={`${inputClass} pl-12 sm:pl-14`}
                  />
                  <Lock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/20 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a 
                href={providerHelp.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-base md:text-sm font-bold text-white group"
              >
                <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform text-primary" />
                {t("planner.ai.apiKey.create", { name: providerHelp.name })}
              </a>
              
              <div className="flex items-start gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 shadow-lg">
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
