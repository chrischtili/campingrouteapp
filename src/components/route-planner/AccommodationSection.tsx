import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { ToggleGroup } from "./ToggleGroup";
import { FormSlider } from "./FormSlider";
import { Switch } from "@/components/ui/switch";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Bed, Users, Home, Settings, Wallet, MessageSquare, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface AccommodationSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

type AccommodationPanel = null | "type" | "facilities" | "interests" | "additional";

export function AccommodationSection({ formData, onChange, onCheckboxChange }: AccommodationSectionProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [activePanel, setActivePanel] = useState<AccommodationPanel>(null);

  const categories = [
    {
      id: "type" as const,
      label: t("planner.accommodation.categories.type.label"),
      icon: Home,
      name: "accommodationType",
      options: [
        { value: "camping", label: t("planner.accommodation.categories.type.options.camping") },
        { value: "pitch", label: t("planner.accommodation.categories.type.options.pitch") },
        { value: "farm", label: t("planner.accommodation.categories.type.options.farm") },
        { value: "small", label: t("planner.accommodation.categories.type.options.small") },
        { value: "wild", label: t("planner.accommodation.categories.type.options.wild") },
        { value: "premium", label: t("planner.accommodation.categories.type.options.premium") },
      ],
    },
    {
      id: "facilities" as const,
      label: t("planner.accommodation.categories.facilities.label"),
      icon: Settings,
      name: "facilities",
      options: [
        { value: "power", label: t("planner.accommodation.categories.facilities.options.power") },
        { value: "freshWater", label: t("planner.accommodation.categories.facilities.options.freshWater") },
        { value: "greyWater", label: t("planner.accommodation.categories.facilities.options.greyWater") },
        { value: "blackWater", label: t("planner.accommodation.categories.facilities.options.blackWater") },
        { value: "sanitary", label: t("planner.accommodation.categories.facilities.options.sanitary") },
        { value: "wifi", label: t("planner.accommodation.categories.facilities.options.wifi") },
        { value: "pool", label: t("planner.accommodation.categories.facilities.options.pool") },
        { value: "restaurant", label: t("planner.accommodation.categories.facilities.options.restaurant") },
        { value: "dogs", label: t("planner.accommodation.categories.facilities.options.dogs") },
        { value: "kids", label: t("planner.accommodation.categories.facilities.options.kids") },
        { value: "accessible", label: t("planner.accommodation.categories.facilities.options.accessible") },
        { value: "winter", label: t("planner.accommodation.categories.facilities.options.winter") },
      ],
    },
  ];

  const interestOptions = [
    { value: "nature", label: t("planner.interests.options.nature") },
    { value: "hiking", label: t("planner.interests.options.hiking") },
    { value: "cycling", label: t("planner.interests.options.cycling") },
    { value: "bathing", label: t("planner.interests.options.bathing") },
    { value: "cityCulture", label: t("planner.interests.options.cityCulture") },
    { value: "gastronomy", label: t("planner.interests.options.gastronomy") },
    { value: "relaxation", label: t("planner.interests.options.relaxation") },
  ];

  const glassPanelStyle = undefined;

  const inputClass =
    "popup-input w-full min-h-[110px] sm:min-h-[120px] p-4 sm:p-8 rounded-3xl transition-all outline-none font-bold text-sm sm:text-base md:text-lg text-foreground dark:text-white placeholder:font-normal text-left resize-none";
  const panelTriggerClass =
    "planner-panel-trigger rounded-3xl border px-5 py-4 text-left transition-colors";
  const switchClass =
    "border-primary/85 data-[state=checked]:bg-primary/15 data-[state=unchecked]:bg-white/95 dark:data-[state=unchecked]:bg-white/10 dark:data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(255,128,0,0.22)]";

  const getSelectedLabels = (options: { value: string; label: string }[], selected: string[]) => {
    const labels = options.filter((option) => selected.includes(option.value)).map((option) => option.label);
    return labels.length > 0 ? labels.slice(0, 3).join(", ") : t("planner.summary.notSpecified");
  };

  const renderPanelShell = (title: string, description: string, content: ReactNode) => {
    if (isMobile) {
      return (
        <Sheet open={!!activePanel} onOpenChange={(open) => !open && setActivePanel(null)}>
          <SheetContent side="bottom" className="theme-popup-shell theme-popup-accommodation max-h-[88vh] overflow-y-auto border-2 px-0 pb-6 pt-0 shadow-[0_-32px_120px_rgba(0,0,0,0.72)] ring-2 ring-primary/35 backdrop-blur-xl">
            <SheetHeader className="theme-popup-divider border-b px-6 py-5 text-left">
              <SheetTitle className="text-left text-xl font-bold text-foreground dark:text-white">{title}</SheetTitle>
              <SheetDescription className="text-left text-sm text-foreground/60 dark:text-white/58">{description}</SheetDescription>
            </SheetHeader>
            <div className="px-6 pt-6">{content}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Dialog open={!!activePanel} onOpenChange={(open) => !open && setActivePanel(null)}>
        <DialogContent className="theme-popup-shell theme-popup-accommodation max-h-[90vh] max-w-4xl overflow-y-auto border-2 p-0 shadow-[0_36px_140px_rgba(0,0,0,0.74)] ring-2 ring-primary/35 backdrop-blur-xl">
          <DialogHeader className="theme-popup-divider border-b px-6 py-5 text-left">
            <DialogTitle className="text-left text-xl font-bold text-foreground dark:text-white">{title}</DialogTitle>
            <DialogDescription className="text-left text-sm text-foreground/60 dark:text-white/58">{description}</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 pt-6">{content}</div>
        </DialogContent>
      </Dialog>
    );
  };

  const selectedAccommodationSummary = getSelectedLabels(categories[0].options, formData.accommodationType);
  const selectedFacilitiesSummary = getSelectedLabels(categories[1].options, formData.facilities);
  const selectedInterestsSummary = getSelectedLabels(interestOptions, formData.activities);

  const accommodationTypeContent = (
    <ToggleGroup
      name="accommodationType"
      options={categories[0].options}
      selectedValues={formData.accommodationType}
      onChange={onCheckboxChange}
    />
  );

  const facilitiesContent = (
    <ToggleGroup
      name="facilities"
      options={categories[1].options}
      selectedValues={formData.facilities}
      onChange={onCheckboxChange}
    />
  );

  const interestsContent = (
    <ToggleGroup
      name="activities"
      options={interestOptions}
      selectedValues={formData.activities}
      onChange={onCheckboxChange}
    />
  );

  const additionalContent = (
    <textarea
      id="additionalInfo"
      placeholder={t("planner.interests.additional.placeholder")}
      value={formData.additionalInfo}
      onChange={(e) => onChange({ additionalInfo: (e.target as HTMLTextAreaElement).value })}
      className={inputClass}
    />
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-left">
        <h3 className="text-2xl md:text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground dark:text-white">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Bed className="w-6 h-6" />
          </div>
          {t("planner.accommodation.title")}
        </h3>
        <p className="text-foreground/62 dark:text-white/58 text-base md:text-lg leading-relaxed">{t("planner.accommodation.subtitle")}</p>
        <div className="inline-flex items-center gap-2 text-xs text-foreground/55 dark:text-white/48">
          <span>{t("planner.accommodation.sourceLabel")}:</span>
          <a href="https://opencampingmap.org" target="_blank" rel="noreferrer" className="underline decoration-primary/60 underline-offset-2 hover:text-foreground dark:text-white">
            {t("planner.accommodation.sourceValue")}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start text-left">
        <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.accommodation.group.travelers")}</span>
          </div>
          <FormSlider
            id="numberOfTravelers"
            label={t("planner.accommodation.travelers.label")}
            value={formData.numberOfTravelers ? parseInt(formData.numberOfTravelers) : 1}
            min={1}
            max={8}
            step={1}
            unit={t("planner.accommodation.travelers.unit")}
            onChange={(v) => onChange({ numberOfTravelers: v.toString() })}
          />
        </div>

        <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
          <div className="flex items-center gap-3 mb-8">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.accommodation.group.budget")}</span>
          </div>
          <FormSlider
            id="avgCampsitePriceMax"
            label={t("planner.accommodation.budget.label")}
            value={formData.avgCampsitePriceMax ? parseInt(formData.avgCampsitePriceMax) : 0}
            min={0}
            max={300}
            step={5}
            unit="€"
            onChange={(v) => onChange({ avgCampsitePriceMax: v.toString() })}
          />
          <div className="w-full mt-6 pt-6 border-t border-slate-900/10 dark:border-white/10 min-h-[106px]">
            <div className="flex h-full items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-slate-900/[0.05] dark:bg-black/10 border border-slate-900/10 dark:border-white/8 p-4 sm:p-5">
              <div className="space-y-1">
                <div className="text-xs md:text-sm font-medium tracking-[0.01em] text-foreground dark:text-white">{t("planner.accommodation.quietPlaces.label")}</div>
                <div className="text-foreground/62 dark:text-white/60 text-sm">{t("planner.accommodation.quietPlaces.description")}</div>
              </div>
              <Switch
                checked={formData.quietPlaces}
                onCheckedChange={(checked) => onChange({ quietPlaces: checked })}
                aria-label={t("planner.accommodation.quietPlaces.label")}
                className={switchClass}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button type="button" className={panelTriggerClass} style={glassPanelStyle} onClick={() => setActivePanel("type")}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl border border-slate-900/10 bg-white/55 p-2 text-primary dark:border-white/10 dark:bg-white/8">
              <Home className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground dark:text-white">{t("planner.accommodation.categories.type.label")}</div>
              <div className="mt-1 text-sm text-foreground/58 dark:text-white/55">{selectedAccommodationSummary}</div>
            </div>
          </div>
        </button>

        <button type="button" className={panelTriggerClass} style={glassPanelStyle} onClick={() => setActivePanel("facilities")}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl border border-slate-900/10 bg-white/55 p-2 text-primary dark:border-white/10 dark:bg-white/8">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground dark:text-white">{t("planner.accommodation.categories.facilities.label")}</div>
              <div className="mt-1 text-sm text-foreground/58 dark:text-white/55">{selectedFacilitiesSummary}</div>
            </div>
          </div>
        </button>

        <button type="button" className={panelTriggerClass} style={glassPanelStyle} onClick={() => setActivePanel("interests")}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl border border-slate-900/10 bg-white/55 p-2 text-primary dark:border-white/10 dark:bg-white/8">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground dark:text-white">{t("planner.interests.title")}</div>
              <div className="mt-1 text-sm text-foreground/58 dark:text-white/55">{selectedInterestsSummary}</div>
            </div>
          </div>
        </button>

        <button type="button" className={panelTriggerClass} style={glassPanelStyle} onClick={() => setActivePanel("additional")}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl border border-slate-900/10 bg-white/55 p-2 text-primary dark:border-white/10 dark:bg-white/8">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground dark:text-white">{t("planner.interests.additional.label")}</div>
              <div className="mt-1 text-sm text-foreground/58 dark:text-white/55">{formData.additionalInfo?.trim() || t("planner.interests.additional.placeholder")}</div>
            </div>
          </div>
        </button>
      </div>

      {activePanel === "type" &&
        renderPanelShell(
          t("planner.accommodation.categories.type.label"),
          t("planner.accommodation.subtitle"),
          accommodationTypeContent,
        )}
      {activePanel === "facilities" &&
        renderPanelShell(
          t("planner.accommodation.categories.facilities.label"),
          t("planner.accommodation.quietPlaces.description"),
          facilitiesContent,
        )}
      {activePanel === "interests" &&
        renderPanelShell(
          t("planner.interests.title"),
          t("planner.interests.subtitle"),
          interestsContent,
        )}
      {activePanel === "additional" &&
        renderPanelShell(
          t("planner.interests.additional.label"),
          t("planner.interests.additional.placeholder"),
          additionalContent,
        )}
    </div>
  );
}
