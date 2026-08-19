import { BusFront, Caravan, CheckCircle2, ChevronRight, MapPin, Search, Sparkles, MessageSquare, Compass, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchPlaceSuggestions } from "@/lib/placeFinder";
import type { PlaceSuggestion } from "@/types/placeFinder";

interface HeroSectionProps {
  onStartPlanning?: (destination?: string) => void;
}

export function HeroSection({ onStartPlanning }: HeroSectionProps) {
  const { t } = useTranslation();
  const [destinationQuery, setDestinationQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<PlaceSuggestion | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const trimmedQuery = destinationQuery.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSuggesting(false);
      return;
    }

    if (selectedSuggestion && trimmedQuery === selectedSuggestion.label) {
      setShowSuggestions(false);
      setIsSuggesting(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const nextSuggestions = await searchPlaceSuggestions({ query: trimmedQuery, limit: 5 });
        setSuggestions(nextSuggestions);
        setShowSuggestions(nextSuggestions.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSuggesting(false);
      }
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [destinationQuery, selectedSuggestion]);

  const handleStart = () => {
    const trimmed = destinationQuery.trim();
    const effectiveDestination = selectedSuggestion?.label || trimmed;
    onStartPlanning?.(effectiveDestination || undefined);
  };

  const handleSelectSuggestion = (suggestion: PlaceSuggestion) => {
    setSelectedSuggestion(suggestion);
    setDestinationQuery(suggestion.label);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const stats = [
    { value: t("hero.stats.rating.value"), label: t("hero.stats.rating.label") },
    { value: t("hero.stats.routes.value"), label: t("hero.stats.routes.label") },
    { value: t("hero.stats.price.value"), label: t("hero.stats.price.label") },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-background" id="home">

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-10 pt-28 md:pb-14 md:pt-32">
        <div className="flex flex-col items-center text-center space-y-8 mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-white/68 px-4 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            <span className="text-primary font-black text-[10px] tracking-[0.3em]">
              {t("hero.badge")}
            </span>
          </div>

          <div className="space-y-5">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl dark:text-white">
              <span className="flex flex-col gap-1 leading-tight sm:gap-1.5">
                <span className="block">{t("hero.headline.line1")}</span>
                <span className="block">{t("hero.headline.line2")}</span>
                <span className="block text-primary">{t("hero.headline.line3")}</span>
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg leading-8 text-foreground/76 dark:text-white/74 sm:text-xl">
              {t("hero.description")}
            </p>
            <p className="max-w-2xl mx-auto text-sm leading-7 text-foreground/62 dark:text-white/60 sm:text-base">
              {t("hero.directEntry.proof")}
            </p>
          </div>
        </div>

        <div className="mt-12">
          <div className="relative col-span-1 lg:col-span-2">
            <div 
              className="relative overflow-hidden rounded-3xl p-8 sm:p-10 shadow-xl text-white"
              style={{ background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' }}
            >
              {/* Decorative background circle */}
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-52 w-52 rounded-full bg-white/[0.03]" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative z-10">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#facc15]/15 text-[#facc15]">
                    <MessageSquare className="h-6.5 w-6.5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#facc15]">
                      SCHRITT 01
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                      Wohnmobil & Route wählen
                    </h3>
                    <p className="text-xs sm:text-sm text-[#a7f3d0] leading-relaxed">
                      Gib Startort, Ziel und Fahrzeugmaße ein – egal ob Wohnmobil, Wohnwagen, Zelt oder Motorrad.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#facc15]/15 text-[#facc15]">
                    <Compass className="h-6.5 w-6.5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#facc15]">
                      SCHRITT 02
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                      Smarte KI-Prompts generieren
                    </h3>
                    <p className="text-xs sm:text-sm text-[#a7f3d0] leading-relaxed">
                      Unser Assistent formuliert automatisch einen maßgeschneiderten Prompt mit Etappen, Maßen & Kriterien.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#facc15]/15 text-[#facc15]">
                    <Heart className="h-6.5 w-6.5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#facc15]">
                      SCHRITT 03
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                      Stellplätze & GPX exportieren
                    </h3>
                    <p className="text-xs sm:text-sm text-[#a7f3d0] leading-relaxed">
                      Füge den Prompt in ChatGPT oder Gemini ein, erhalte perfekte Tourenvorschläge und exportiere deine GPX-Daten.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-foreground/30 dark:text-white/30">
        <ChevronRight className="w-6 h-6 rotate-90" />
      </div>
    </section>
  );
}
