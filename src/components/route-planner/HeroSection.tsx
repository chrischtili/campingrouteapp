import { BusFront, Caravan, CheckCircle2, ChevronRight, MapPin, Search, Sparkles, MessageSquare, Compass, Heart, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchPlaceSuggestions } from "@/lib/placeFinder";
import type { PlaceSuggestion } from "@/types/placeFinder";
import { McpServerModal } from "@/components/mcp/McpServerModal";

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
  const [showMcpModal, setShowMcpModal] = useState(false);

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
    <section className="relative overflow-hidden bg-background" id="home">

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-6 pb-6 pt-28 md:pb-8 md:pt-32">
        <div className="flex flex-col items-center text-center space-y-8 mb-4">
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

            {/* 2 Feature Cards: Entdecken & MCP Server */}
            <div className="pt-2 w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              
              {/* Card 1: Entdecken Hub */}
              <Link
                to="/entdecken"
                className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-emerald-100/40 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-emerald-900/30 border border-emerald-300/80 dark:border-emerald-700/60 shadow-sm hover:shadow-xl hover:border-emerald-500 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 text-left cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#166534] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                      <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
                      <span>{t("hero.cards.discover.badge", "Neu")}</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      Early Beta
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 pt-0.5">
                    <span>{t("hero.cards.discover.title", "CampingRoute Entdecken")}</span>
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                    {t("hero.cards.discover.text", "20.000+ Campingplätze, 19.000 Touren mit GPS-Tracks, Hofläden, Events & KI-Suche.")}
                  </p>
                </div>

                <div className="pt-3.5 flex items-center justify-between border-t border-emerald-200/60 dark:border-emerald-800/40 mt-3">
                  <span className="text-xs font-bold text-[#166534] dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {t("hero.cards.discover.cta", "Jetzt Entdecken erkunden")}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:translate-x-1 group-hover:bg-emerald-700 transition-all shadow-xs">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>

              {/* Card 2: MCP Server */}
              <button
                type="button"
                onClick={() => setShowMcpModal(true)}
                className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50/90 via-sky-50/60 to-indigo-50/40 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-indigo-950/30 border border-slate-300/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:border-emerald-500 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 text-left cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-wider shadow-xs">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      <Cpu className="h-3 w-3 text-emerald-400 dark:text-emerald-600" />
                      <span>{t("hero.cards.mcp.badge", "MCP Server")}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      Claude & Cursor
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 pt-0.5">
                    <span>{t("hero.cards.mcp.title", "KI Model Context Protocol")}</span>
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                    {t("hero.cards.mcp.text", "Verbinde deinen KI-Assistenten (Claude, Cursor, ChatGPT) direkt mit unseren Camping- & Routendaten.")}
                  </p>
                </div>

                <div className="pt-3.5 flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800/80 mt-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {t("hero.cards.mcp.cta", "MCP-Setup & Anleitung")}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center group-hover:translate-x-1 group-hover:bg-emerald-600 transition-all shadow-xs">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </button>

            </div>
          </div>
        </div>
      </div>

      <McpServerModal open={showMcpModal} onClose={() => setShowMcpModal(false)} />
    </section>
  );
}
