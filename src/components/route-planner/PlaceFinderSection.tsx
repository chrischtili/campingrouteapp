import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { BusFront, Caravan, ExternalLink, MapPin, Phone, Plus, Search, ShowerHead, Toilet, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { searchPlaceSuggestions, searchPlaces } from "@/lib/placeFinder";
import { initialFormData } from "@/types/routePlanner";
import type { FormData, RouteStage } from "@/types/routePlanner";
import type { PlaceCategory, PlaceSearchResult, PlaceSuggestion } from "@/types/placeFinder";

interface PlaceFinderSectionProps {
  formData?: FormData;
  onChange?: (data: Partial<FormData>) => void;
  standalone?: boolean;
}

const createEmptyStage = (destination = ""): RouteStage => ({
  destination,
  booked: false,
  detailsEnabled: false,
  arrivalDate: "",
  arrivalTime: "",
  departureDate: "",
  departureTime: "",
});

const categoryIconMap = {
  camp_site: Caravan,
  caravan_site: BusFront,
} satisfies Record<PlaceCategory, typeof Caravan>;

export function PlaceFinderSection({ formData = initialFormData, onChange, standalone = false }: PlaceFinderSectionProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState(formData.targetRegions || formData.destination || "");
  const [selectedCategories, setSelectedCategories] = useState<PlaceCategory[]>(["camp_site", "caravan_site"]);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<PlaceSuggestion | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const searchDisabled = query.trim().length < 2 || selectedCategories.length === 0 || isLoading;
  const panelClass = standalone
    ? "rounded-[1.75rem] border border-border/70 bg-background/85 p-4 sm:p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04]"
    : "rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 sm:p-6 shadow-[0_18px_50px_rgba(0,0,0,0.12)]";
  const inputClass = standalone
    ? "w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 dark:border-white/12 dark:bg-white/8 dark:text-white dark:placeholder:text-white/38"
    : "w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-medium text-white placeholder:text-white/38 outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15";
  const helperClass = standalone ? "text-sm text-foreground/60 dark:text-white/60 leading-relaxed" : "text-sm text-white/60 leading-relaxed";
  const labelClass = standalone ? "text-sm font-semibold text-foreground dark:text-white" : "text-sm font-semibold text-white";
  const switchClass =
    "border-primary/85 data-[state=checked]:bg-primary/15 data-[state=unchecked]:bg-white/95 dark:data-[state=unchecked]:bg-white/10 dark:data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(255,128,0,0.22)]";

  const stageActions = useMemo(() => {
    if (standalone || !onChange) {
      return [];
    }

    const existingStages = formData.stages.map((stage, index) => ({
      id: `replace-${index}`,
      label: t("planner.placeFinder.actions.replaceStage", { num: index + 1 }),
      onSelect: (place: PlaceSearchResult) => {
        const nextStages = formData.stages.map((stage, stageIndex) =>
          stageIndex === index ? { ...stage, destination: place.name } : stage,
        );
        onChange({ stages: nextStages });
      },
    }));

    return [
      {
        id: "destination",
        label: t("planner.placeFinder.actions.setDestination"),
        onSelect: (place: PlaceSearchResult) => onChange({ destination: place.name }),
      },
      {
        id: "append-stage",
        label: t("planner.placeFinder.actions.addStage", { num: formData.stages.length + 1 }),
        onSelect: (place: PlaceSearchResult) =>
          onChange({ stages: [...formData.stages, createEmptyStage(place.name)] }),
      },
      ...existingStages,
    ];
  }, [formData.stages, onChange, standalone, t]);

  const trackPlaceFinderUsage = async (mode: "place_search" | "place_search_solo" | "place_select") => {
    if (import.meta.env.DEV) {
      return;
    }

    try {
      await fetch("/api/count-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode }),
      });
    } catch {
      // Usage tracking must not block the place finder flow.
    }
  };

  const toggleCategory = (category: PlaceCategory) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((entry) => entry !== category) : [...current, category],
    );
  };

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSuggesting(false);
      return;
    }

    if (selectedSuggestion && query.trim() === selectedSuggestion.label) {
      setShowSuggestions(false);
      setIsSuggesting(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const nextSuggestions = await searchPlaceSuggestions({ query });
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
  }, [query, selectedSuggestion]);

  const handleSearch = async () => {
    if (searchDisabled) return;
    setIsLoading(true);
    setError("");
    setHasSearched(true);
    void trackPlaceFinderUsage(standalone ? "place_search_solo" : "place_search");

    try {
      const nextResults = await searchPlaces({
        query,
        categories: selectedCategories,
        suggestion: selectedSuggestion || undefined,
      });
      setResults(nextResults);
    } catch (searchError) {
      setResults([]);
      setError(
        searchError instanceof Error && searchError.message
          ? t(`planner.placeFinder.errors.${searchError.message}`, {
              defaultValue: t("planner.placeFinder.errors.searchFailed"),
            })
          : t("planner.placeFinder.errors.searchFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: PlaceSuggestion) => {
    setSelectedSuggestion(suggestion);
    setQuery(suggestion.label);
    setSuggestions([]);
    setShowSuggestions(false);
    setError("");
  };

  const handleClearQuery = () => {
    setQuery("");
    setSelectedSuggestion(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setResults([]);
    setSelectedPlace(null);
    setError("");
    setHasSearched(false);
  };

  const renderDetails = (place: PlaceSearchResult) => {
    const CategoryIcon = categoryIconMap[place.category];

    return (
      <div className="max-w-full overflow-x-hidden space-y-5 sm:space-y-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-primary/12 p-2 text-primary">
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black leading-tight text-foreground dark:text-white sm:text-xl">{place.name}</div>
              <div className="mt-1 text-sm text-muted-foreground dark:text-white/60">
                {place.category === "camp_site"
                  ? t("planner.placeFinder.categories.camp_site")
                  : t("planner.placeFinder.categories.caravan_site")}
              </div>
            </div>
          </div>

          <div className="grid max-w-full grid-cols-1 gap-3 text-sm text-foreground/78 dark:text-white/72 sm:grid-cols-2">
            <div className="flex min-w-0 gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                {place.address || `${place.locality}${place.country ? `, ${place.country}` : ""}`}
              </span>
            </div>
            {place.phone && (
              <div className="flex min-w-0 gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">{place.phone}</span>
              </div>
            )}
          </div>

          {place.description && (
            <p className="max-w-full break-words text-sm leading-relaxed text-foreground/78 [overflow-wrap:anywhere] dark:text-white/72">
              {place.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {place.hasToilets && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/70 px-3 py-1 text-xs font-semibold text-foreground/80 dark:border-white/10 dark:bg-white/6 dark:text-white/78">
                <Toilet className="h-3.5 w-3.5 text-primary" />
                {t("planner.placeFinder.tags.toilets")}
              </span>
            )}
            {place.hasShowers && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/70 px-3 py-1 text-xs font-semibold text-foreground/80 dark:border-white/10 dark:bg-white/6 dark:text-white/78">
                <ShowerHead className="h-3.5 w-3.5 text-primary" />
                {t("planner.placeFinder.tags.showers")}
              </span>
            )}
            {place.hasPowerSupply && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/70 px-3 py-1 text-xs font-semibold text-foreground/80 dark:border-white/10 dark:bg-white/6 dark:text-white/78">
                <Zap className="h-3.5 w-3.5 text-primary" />
                {t("planner.placeFinder.tags.power")}
              </span>
            )}
          </div>

          <div className="grid max-w-full grid-cols-1 gap-3 rounded-[1.25rem] border border-border/70 bg-muted/45 p-4 text-sm text-foreground/72 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-white/68 sm:grid-cols-2">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground dark:text-white/38">{t("planner.placeFinder.labels.locality")}</div>
              <div className="mt-1 break-words font-medium text-foreground [overflow-wrap:anywhere] dark:text-white/78">{place.locality || t("planner.placeFinder.notAvailable")}</div>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground dark:text-white/38">{t("planner.placeFinder.labels.fee")}</div>
              <div className="mt-1 break-words font-medium text-foreground [overflow-wrap:anywhere] dark:text-white/78">{place.fee || t("planner.placeFinder.notAvailable")}</div>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground dark:text-white/38">{t("planner.placeFinder.labels.openingHours")}</div>
              <div className="mt-1 break-words font-medium text-foreground [overflow-wrap:anywhere] dark:text-white/78">{place.openingHours || t("planner.placeFinder.notAvailable")}</div>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground dark:text-white/38">{t("planner.placeFinder.labels.website")}</div>
              <div className="mt-1 break-words font-medium text-foreground dark:text-white/78 [overflow-wrap:anywhere]">{place.website || t("planner.placeFinder.notAvailable")}</div>
            </div>
          </div>

          {!standalone && stageActions.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-foreground dark:text-white">{t("planner.placeFinder.actions.title")}</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {stageActions.map((action) => (
                  <Button
                    key={action.id}
                    type="button"
                    variant="outline"
                    className="justify-start rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left font-semibold text-foreground hover:bg-primary/10 dark:bg-primary/10 dark:text-white dark:hover:bg-primary/16"
                    onClick={() => {
                      void trackPlaceFinderUsage("place_select");
                      action.onSelect(place);
                      setSelectedPlace(null);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid max-w-full grid-cols-1 gap-3 sm:flex sm:flex-wrap">
            {place.sourceUrl && (
              <a
                href={place.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full max-w-full items-center gap-2 break-words text-sm font-semibold text-primary [overflow-wrap:anywhere] hover:text-primary/80 sm:w-auto"
              >
                <ExternalLink className="h-4 w-4" />
                {t("planner.placeFinder.actions.openSource")}
              </a>
            )}
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full max-w-full items-center gap-2 break-words text-sm font-semibold text-primary [overflow-wrap:anywhere] hover:text-primary/80 sm:w-auto"
              >
                <ExternalLink className="h-4 w-4" />
                {t("planner.placeFinder.actions.openWebsite")}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 text-left sm:space-y-5">
      <div className={panelClass}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-3">
            <label className={labelClass}>{t("planner.placeFinder.searchLabel")}</label>
            <div className="relative">
              <input
                value={query}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setQuery(nextValue);
                  if (selectedSuggestion && nextValue.trim() !== selectedSuggestion.label) {
                    setSelectedSuggestion(null);
                  }
                }}
                onFocus={() => {
                  if (!selectedSuggestion && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  window.setTimeout(() => setShowSuggestions(false), 120);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSearch();
                  }
                }}
                placeholder={t("planner.placeFinder.searchPlaceholder")}
                className={`${inputClass} pl-12 ${query ? "pr-12" : ""}`}
              />
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70" />
              {query && (
                <button
                  type="button"
                  onClick={handleClearQuery}
                  className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-foreground/45 transition hover:bg-muted/80 hover:text-foreground dark:text-white/42 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={t("planner.placeFinder.clearSearch")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-border/80 bg-background/98 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/96">
                  {isSuggesting && (
                    <div className="px-4 py-3 text-sm text-foreground/60 dark:text-white/60">
                      {t("planner.placeFinder.suggestions.loading")}
                    </div>
                  )}
                  {!isSuggesting &&
                    suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        className="flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left transition last:border-b-0 hover:bg-muted/70 dark:border-white/6 dark:hover:bg-white/6"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleSelectSuggestion(suggestion);
                        }}
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground dark:text-white">
                            {suggestion.name}
                          </span>
                          <span className="block truncate text-xs text-foreground/60 dark:text-white/58">
                            {suggestion.label}
                          </span>
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
            <p className={helperClass}>{t("planner.placeFinder.searchHelp")}</p>
            <p className={standalone ? "text-xs text-foreground/48 dark:text-white/44" : "text-xs text-white/44"}>
              {t("planner.placeFinder.osmAttributionPrefix")}{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary/90 hover:text-primary"
              >
                OpenStreetMap
              </a>
              {" "}© {t("planner.placeFinder.osmAttributionSuffix")}
            </p>
            {selectedSuggestion && (
              <p className="text-xs font-medium text-primary/90">
                {t("planner.placeFinder.suggestions.selected", { place: selectedSuggestion.name })}
              </p>
            )}
          </div>

          <Button
            type="button"
            className="planner-primary-button h-12 rounded-2xl px-6 font-semibold"
            onClick={handleSearch}
            disabled={searchDisabled}
          >
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? t("planner.placeFinder.loading") : t("planner.placeFinder.searchButton")}
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["camp_site", "caravan_site"] as PlaceCategory[]).map((category) => {
            const active = selectedCategories.includes(category);
            const Icon = categoryIconMap[category];
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`flex w-full items-center justify-between gap-4 rounded-[1.35rem] border px-4 py-3 text-left transition ${
                  standalone
                    ? active
                      ? "border-primary/35 bg-primary/[0.08] shadow-[0_14px_28px_rgba(255,138,0,0.12)] dark:bg-primary/[0.10]"
                      : "border-border/80 bg-background/92 hover:bg-muted/60 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
                    : active
                      ? "border-primary/35 bg-primary/[0.12] shadow-[0_14px_28px_rgba(255,138,0,0.14)]"
                      : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                }`}
              >
                <span className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 rounded-xl bg-primary/12 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-sm font-semibold ${standalone ? "text-foreground dark:text-white" : "text-white"}`}>
                      {t(`planner.placeFinder.categories.${category}`)}
                    </span>
                    <span className={`mt-1 block text-xs leading-relaxed ${standalone ? "text-foreground/60 dark:text-white/58" : "text-white/58"}`}>
                      {t(`planner.placeFinder.categoryDescriptions.${category}`)}
                    </span>
                  </span>
                </span>
                <Switch
                  checked={active}
                  onCheckedChange={() => toggleCategory(category)}
                  className={switchClass}
                  aria-label={t(`planner.placeFinder.categories.${category}`)}
                  onClick={(event) => event.stopPropagation()}
                />
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      )}

      {hasSearched && !isLoading && results.length === 0 && !error && (
        <div className={`rounded-2xl px-5 py-4 text-sm ${standalone ? "border border-border/70 bg-muted/40 text-foreground/62 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/62" : "border border-white/10 bg-white/[0.03] text-white/62"}`}>
          {t("planner.placeFinder.empty")}
        </div>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div className={`text-sm font-semibold ${standalone ? "text-foreground/70 dark:text-white/70" : "text-white/70"}`}>
              {t("planner.placeFinder.results", { count: results.length })}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {results.map((place) => {
                const Icon = categoryIconMap[place.category];

                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => setSelectedPlace(place)}
                    className={`group overflow-hidden rounded-[1.5rem] text-left transition ${
                      standalone
                        ? "border border-border/70 bg-background/90 hover:border-primary/30 hover:bg-muted/50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
                        : "border border-white/10 bg-white/[0.04] hover:border-primary/30 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className={`truncate text-base font-black ${standalone ? "text-foreground dark:text-white" : "text-white"}`}>{place.name}</div>
                            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary/85">
                              {t(`planner.placeFinder.categories.${place.category}`)}
                            </div>
                          </div>
                          <ExternalLink className={`h-4 w-4 shrink-0 transition group-hover:text-primary ${standalone ? "text-foreground/25 dark:text-white/25" : "text-white/25"}`} />
                        </div>

                        <div className={`text-sm line-clamp-2 ${standalone ? "text-foreground/62 dark:text-white/62" : "text-white/62"}`}>
                          {place.address || `${place.locality}${place.country ? `, ${place.country}` : ""}`}
                        </div>

                        <div className={`flex flex-wrap gap-2 text-[11px] ${standalone ? "text-foreground/55 dark:text-white/55" : "text-white/55"}`}>
                          {place.hasToilets && <span>{t("planner.placeFinder.tags.toilets")}</span>}
                          {place.hasShowers && <span>{t("planner.placeFinder.tags.showers")}</span>}
                          {place.hasPowerSupply && <span>{t("planner.placeFinder.tags.power")}</span>}
                        </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMobile ? (
        <Sheet open={!!selectedPlace} onOpenChange={(open) => !open && setSelectedPlace(null)}>
          <SheetContent side="bottom" hideCloseButton className="inset-x-0 max-h-[88dvh] w-auto max-w-none overflow-x-hidden overflow-y-auto rounded-t-[1.75rem] border-x-0 border-b-0 border-t border-border/70 px-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-0 shadow-[0_-18px_50px_rgba(15,23,42,0.14)] dark:border-white/10">
            {selectedPlace && (
              <>
                <SheetHeader className="sticky top-0 z-10 w-full max-w-full overflow-x-hidden border-b bg-background/95 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] py-4 text-left backdrop-blur-xl dark:bg-slate-900/92">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <SheetTitle className="text-left text-lg font-bold leading-tight text-foreground dark:text-white sm:text-xl">
                        {selectedPlace.name}
                      </SheetTitle>
                      <SheetDescription className="mt-1 text-left text-sm text-foreground/60 dark:text-white/58">
                        {t("planner.placeFinder.detailDescription")}
                      </SheetDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPlace(null)}
                      className="h-10 w-10 shrink-0 rounded-full border border-border/70 bg-white/75 text-foreground hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
                      aria-label={t("buttons.close")}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </SheetHeader>
                <div className="w-full max-w-full overflow-x-hidden pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-5 sm:px-6 sm:pt-6">
                  {renderDetails(selectedPlace)}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={!!selectedPlace} onOpenChange={(open) => !open && setSelectedPlace(null)}>
          <DialogContent hideCloseButton className="max-h-[90vh] max-w-4xl overflow-y-auto border-2 p-0">
            {selectedPlace && (
              <>
                <DialogHeader className="border-b px-6 py-5 text-left">
                  <DialogTitle className="text-left text-xl font-bold text-foreground dark:text-white">
                    {selectedPlace.name}
                  </DialogTitle>
                  <DialogDescription className="text-left text-sm text-foreground/60 dark:text-white/58">
                    {t("planner.placeFinder.detailDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="px-6 py-6">{renderDetails(selectedPlace)}</div>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
