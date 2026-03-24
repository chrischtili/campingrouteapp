import { BusFront, Caravan, CheckCircle2, ChevronRight, MapPin, Search, Sparkles } from "lucide-react";
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
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#fbf7f0_0%,#eef4fb_45%,#f7f1e7_100%)] dark:bg-[linear-gradient(180deg,#111714_0%,#18211d_45%,#121814_100%)]" />
        <div className="absolute left-[-8%] top-[9%] h-72 w-72 rounded-full bg-primary/14 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute right-[-10%] top-[18%] h-80 w-80 rounded-full bg-sky-200/45 blur-3xl dark:bg-sky-900/20 sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,248,239,0.85))] dark:bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(9,13,11,0.78))]" />
        <div className="absolute left-[8%] top-[22%] hidden h-24 w-24 rounded-[2rem] border border-primary/18 bg-white/35 rotate-12 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:block dark:border-white/10 dark:bg-white/[0.04]" />
        <div className="absolute right-[12%] top-[62%] hidden h-20 w-20 rounded-full border border-primary/18 bg-white/30 shadow-[0_20px_52px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:block dark:border-white/10 dark:bg-white/[0.04]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-10 pt-28 md:pb-14 md:pt-32">
        <div className="grid flex-1 items-center gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-white/68 px-4 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              <span className="text-primary font-black text-[10px] tracking-[0.3em]">
                {t("hero.badge")}
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-[2.7rem] font-black tracking-[-0.045em] text-foreground sm:text-6xl sm:tracking-[-0.04em] lg:text-7xl xl:text-[5.5rem] dark:text-white">
                <span className="flex flex-col gap-1 leading-[0.9] sm:gap-2 sm:leading-[0.92]">
                  <span className="block">{t("hero.headline.line1")}</span>
                  <span className="block">{t("hero.headline.line2")}</span>
                  <span className="block text-primary">{t("hero.headline.line3")}</span>
                </span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-foreground/76 dark:text-white/74 sm:text-xl">
                {t("hero.description")}
              </p>
              <p className="max-w-2xl text-sm leading-7 text-foreground/62 dark:text-white/60 sm:text-base">
                {t("hero.directEntry.proof")}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/78 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.28em]">
                <Sparkles className="h-3.5 w-3.5" />
                {t("hero.directEntry.badge")}
              </div>
              <div className="mb-5 text-2xl font-black tracking-tight text-foreground dark:text-white">
                {t("hero.directEntry.title")}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary dark:text-primary/90" />
                  <Input
                    type="text"
                    value={destinationQuery}
                    onChange={(event) => {
                      setDestinationQuery(event.target.value);
                      setSelectedSuggestion(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (!selectedSuggestion && suggestions.length > 0) {
                          handleSelectSuggestion(suggestions[0]);
                          return;
                        }
                        handleStart();
                      }
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      window.setTimeout(() => setShowSuggestions(false), 140);
                    }}
                    placeholder={t("hero.directEntry.placeholder")}
                    aria-label={t("hero.directEntry.label")}
                    className="h-12 sm:h-14 rounded-2xl border-primary/12 bg-white/90 pl-14 sm:pl-14 text-sm sm:text-base text-foreground shadow-[0_12px_28px_rgba(15,23,42,0.08)] placeholder:text-foreground/45 dark:border-white/10 dark:bg-white/[0.08]"
                  />
                  {showSuggestions && (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1b231f]/95">
                      {isSuggesting ? (
                        <div className="px-4 py-3 text-sm text-foreground/60 dark:text-white/60">
                          {t("hero.directEntry.loading")}
                        </div>
                      ) : (
                        suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="flex w-full items-start justify-between gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-primary/6 dark:border-white/10 dark:hover:bg-white/[0.05]"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-foreground dark:text-white">
                                {suggestion.name}
                              </div>
                              <div className="truncate text-xs text-foreground/58 dark:text-white/56">
                                {suggestion.label}
                              </div>
                            </div>
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={handleStart}
                  className="group h-12 rounded-2xl border-2 border-primary/45 px-6 text-sm font-black text-white shadow-xl shadow-primary/30 transition-all hover:scale-[1.01] sm:h-14 sm:px-8 sm:text-base"
                  style={{
                    background: "rgba(255, 128, 0, 0.92)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
                    {t("hero.directEntry.cta")}
                  </span>
                </Button>
              </div>
              <div className="mt-3 text-xs text-foreground/58 dark:text-white/56 sm:text-sm">
                {t("hero.directEntry.hint")}
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {[
                  t("hero.chips.chatgpt"),
                  t("hero.chips.gemini"),
                  t("hero.chips.mistral"),
                  t("hero.chips.stopovers"),
                  t("hero.chips.campsites"),
                  t("hero.chips.gpx"),
                ].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/72 px-4 py-2 text-xs font-semibold text-foreground/76 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-white/78"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/70 bg-white/62 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                {t("hero.finders.badge")}
              </div>
              <div className="mt-2 text-xl font-black tracking-tight text-foreground dark:text-white">
                {t("hero.finders.title")}
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/66 dark:text-white/62">
                {t("hero.finders.description")}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-2xl border border-primary/20 bg-white/92 px-5 font-semibold text-foreground shadow-[0_10px_26px_rgba(15,23,42,0.08)] hover:border-primary/45 hover:bg-white dark:border-white/12 dark:bg-white/95 dark:text-slate-950 dark:hover:border-primary/40 dark:hover:bg-white"
                >
                  <Link
                    to="/stellplatz-finder"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-foreground dark:text-slate-950"
                  >
                    <BusFront className="h-4 w-4 shrink-0 text-primary" />
                    {t("hero.finders.stopoverCta")}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-2xl border border-primary/20 bg-white/92 px-5 font-semibold text-foreground shadow-[0_10px_26px_rgba(15,23,42,0.08)] hover:border-primary/45 hover:bg-white dark:border-white/12 dark:bg-white/95 dark:text-slate-950 dark:hover:border-primary/40 dark:hover:bg-white"
                >
                  <Link
                    to="/campingplatz-finder"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-foreground dark:text-slate-950"
                  >
                    <Caravan className="h-4 w-4 shrink-0 text-primary" />
                    {t("hero.finders.campingCta")}
                  </Link>
                </Button>
              </div>
            </div>

          </div>

          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2.5rem] bg-primary/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(245,242,235,0.94))] p-5 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                      {t("hero.visual.badge")}
                    </div>
                    <div className="mt-2 text-3xl font-black tracking-tight text-foreground dark:text-white">
                      {t("hero.visual.title")}
                    </div>
                  </div>
                  <div className="hidden rounded-2xl border border-primary/18 bg-primary/10 px-4 py-3 text-right lg:block">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("hero.visual.outputLabel")}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground dark:text-white">{t("hero.visual.outputValue")}</div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-border/70 bg-white/76 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{t("hero.visual.step1Label")}</div>
                    <div className="mt-3 text-2xl font-black tracking-tight text-foreground dark:text-white">{t("hero.visual.step1Value")}</div>
                    <div className="mt-2 text-sm leading-6 text-foreground/62 dark:text-white/60">
                      {t("hero.visual.step1Description")}
                    </div>
                  </div>
                  <div className="rounded-[1.6rem] border border-border/70 bg-white/76 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{t("hero.visual.step2Label")}</div>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-foreground/70 dark:text-white/66">
                      <div>{t("hero.visual.step2Bullet1")}</div>
                      <div>{t("hero.visual.step2Bullet2")}</div>
                      <div>{t("hero.visual.step2Bullet3")}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-primary/14 bg-[linear-gradient(180deg,rgba(238,242,249,0.9),rgba(231,236,245,0.9))] p-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(60,71,93,0.56),rgba(44,53,70,0.62))]">
                  <div className="flex flex-wrap gap-3">
                    {stats.map((stat) => (
                      <div key={stat.label} className="min-w-[7.5rem] flex-1 rounded-2xl border border-white/65 bg-white/72 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="text-2xl font-black tracking-tight text-foreground dark:text-white">{stat.value}</div>
                        <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-foreground/52 dark:text-white/45">
                          {stat.label}
                        </div>
                      </div>
                    ))}
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
