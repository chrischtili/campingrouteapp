import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { ToggleGroup } from "./ToggleGroup";
import { BadgeToggleGroup } from "./BadgeToggleGroup";
import { FormSlider } from "./FormSlider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Bed, Users, Home, Settings, Wallet, MessageSquare, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cloneFormDataSnapshot } from "@/lib/formDataSnapshot";

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
  const snapshotRef = useRef<FormData | null>(null);

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
        { value: "restaurantNearby", label: t("planner.accommodation.categories.facilities.options.restaurantNearby") },
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
    "w-full min-h-[100px] p-4 rounded-2xl transition-all outline-none font-medium text-sm text-foreground dark:text-white placeholder:font-normal text-left resize-none bg-white/40 border border-slate-200 dark:bg-white/5 dark:border-white/10";
  const panelTriggerClass =
    "planner-panel-trigger rounded-3xl border px-5 py-4 text-left transition-colors";
  const popupActionsClass = "flex flex-col-reverse gap-3 border-t border-slate-900/10 px-6 pt-5 dark:border-white/10 sm:flex-row sm:justify-end";

  const openPanel = (panel: AccommodationPanel) => {
    if (!panel) return;
    snapshotRef.current = cloneFormDataSnapshot(formData);
    setActivePanel(panel);
  };

  const closePanel = () => {
    snapshotRef.current = null;
    setActivePanel(null);
  };

  const cancelPanel = () => {
    if (snapshotRef.current) {
      onChange(snapshotRef.current);
    }
    closePanel();
  };

  const renderPopupActions = () => (
    <div className={popupActionsClass}>
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl border-slate-900/12 bg-white/70 px-5 font-semibold text-foreground hover:bg-white dark:border-white/12 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
        onClick={cancelPanel}
      >
        {t("buttons.cancel")}
      </Button>
      <Button type="button" className="h-11 rounded-xl px-5 font-semibold" onClick={closePanel}>
        {t("buttons.ok")}
      </Button>
    </div>
  );

  const renderPanelShell = (title: string, description: string, content: ReactNode) => {
    if (isMobile) {
      return (
        <Sheet open={!!activePanel} onOpenChange={(open) => !open && cancelPanel()}>
          <SheetContent hideCloseButton side="bottom" className="theme-popup-shell theme-popup-accommodation max-h-[88vh] overflow-y-auto border-2 px-0 pb-6 pt-0 shadow-[0_-32px_120px_rgba(0,0,0,0.72)] ring-2 ring-primary/35 backdrop-blur-xl">
            <SheetHeader className="theme-popup-divider border-b px-6 py-5 text-left">
              <SheetTitle className="text-left text-xl font-bold text-foreground dark:text-white">{title}</SheetTitle>
              <SheetDescription className="text-left text-sm text-foreground/60 dark:text-white/58">{description}</SheetDescription>
            </SheetHeader>
            <div className="px-6 pt-6">{content}</div>
            {renderPopupActions()}
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Dialog open={!!activePanel} onOpenChange={(open) => !open && cancelPanel()}>
        <DialogContent hideCloseButton className="theme-popup-shell theme-popup-accommodation max-h-[90vh] max-w-4xl overflow-y-auto border-2 p-0 shadow-[0_36px_140px_rgba(0,0,0,0.74)] ring-2 ring-primary/35 backdrop-blur-xl">
          <DialogHeader className="theme-popup-divider border-b px-6 py-5 text-left">
            <DialogTitle className="text-left text-xl font-bold text-foreground dark:text-white">{title}</DialogTitle>
            <DialogDescription className="text-left text-sm text-foreground/60 dark:text-white/58">{description}</DialogDescription>
          </DialogHeader>
          <div className="px-6 pt-6">{content}</div>
          <div className="pb-6">
            {renderPopupActions()}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-8">
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.accommodation.categories.type.label")}</span>
          </div>
          <div className="flex flex-wrap gap-2 w-full">
            <BadgeToggleGroup
              name="accommodationType"
              options={categories[0].options}
              selectedValues={formData.accommodationType}
              onChange={onCheckboxChange}
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange({ quietPlaces: !formData.quietPlaces })}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 border-2 ${
                formData.quietPlaces
                  ? "bg-primary border-primary text-white shadow-sm"
                  : "bg-white/40 border-slate-200 text-slate-600 hover:bg-white/60 dark:bg-white/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
              }`}
            >
              {t("planner.accommodation.quietPlaces.label")}
            </motion.button>
          </div>
        </div>

        <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.accommodation.categories.facilities.label")}</span>
          </div>
          <BadgeToggleGroup
            name="facilities"
            options={categories[1].options}
            selectedValues={formData.facilities}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.interests.title")}</span>
          </div>
          <BadgeToggleGroup
            name="activities"
            options={interestOptions}
            selectedValues={formData.activities}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.interests.additional.label")}</span>
          </div>
          <textarea
            id="additionalInfo"
            placeholder={t("planner.interests.additional.placeholder")}
            value={formData.additionalInfo}
            onChange={(e) => onChange({ additionalInfo: (e.target as HTMLTextAreaElement).value })}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
