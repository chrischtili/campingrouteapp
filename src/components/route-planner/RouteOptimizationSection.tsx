import { FormData } from "@/types/routePlanner";
import { ToggleGroup } from "./ToggleGroup";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Target, Navigation, Sparkles, ShieldAlert, Landmark } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface RouteOptimizationSectionProps {
  formData: FormData;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
  onChange: (data: Partial<FormData>) => void;
}

type OptimizationPanel = null | "roadType" | "restrictions" | "landscape" | "experiences" | "avoidRegions";

export function RouteOptimizationSection({ formData, onCheckboxChange, onChange }: RouteOptimizationSectionProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [activePanel, setActivePanel] = useState<OptimizationPanel>(null);

  const categories = [
    {
      id: "roadType" as const,
      label: t("planner.optimization.categories.roadType.label"),
      icon: Navigation,
      options: [
        { value: "motorways", label: t("planner.optimization.categories.roadType.options.motorways") },
        { value: "country", label: t("planner.optimization.categories.roadType.options.country") },
        { value: "scenic", label: t("planner.optimization.categories.roadType.options.scenic") },
      ],
    },
    {
      id: "restrictions" as const,
      label: t("planner.optimization.categories.restrictions.label"),
      icon: ShieldAlert,
      options: [
        { value: "traffic", label: t("planner.optimization.categories.avoidances.options.traffic") },
        { value: "construction", label: t("planner.optimization.categories.avoidances.options.construction") },
        { value: "night", label: t("planner.optimization.categories.avoidances.options.night") },
        { value: "innerCities", label: t("planner.optimization.categories.restrictions.options.innerCities") },
        { value: "narrowRoads", label: t("planner.optimization.categories.restrictions.options.narrowRoads") },
        { value: "unpavedRoads", label: t("planner.optimization.categories.restrictions.options.unpavedRoads") },
      ],
    },
    {
      id: "landscape" as const,
      label: t("planner.optimization.categories.landscape.label"),
      icon: Sparkles,
      options: [
        { value: "mountains", label: t("planner.optimization.categories.landscape.options.mountains") },
        { value: "coastal", label: t("planner.optimization.categories.landscape.options.coastal") },
        { value: "lakes", label: t("planner.optimization.categories.landscape.options.lakes") },
        { value: "forest", label: t("planner.optimization.categories.landscape.options.forest") },
        { value: "rural", label: t("planner.optimization.categories.landscape.options.rural") },
      ],
    },
    {
      id: "experiences" as const,
      label: t("planner.optimization.categories.experiences.label"),
      icon: Landmark,
      options: [
        { value: "unesco", label: t("planner.optimization.categories.experiences.options.unesco") },
        { value: "farm", label: t("planner.optimization.categories.experiences.options.farm") },
        { value: "markets", label: t("planner.optimization.categories.experiences.options.markets") },
      ],
    },
  ];

  const panelTriggerClass =
    "planner-panel-trigger rounded-2xl border-2 px-5 py-4 text-left transition-colors";
  const textareaClass =
    "popup-input w-full min-h-[110px] sm:min-h-[120px] p-4 sm:p-8 rounded-3xl transition-all outline-none font-bold text-sm sm:text-base md:text-lg text-foreground dark:text-white placeholder:font-normal text-left resize-none";

  const renderPanelShell = (title: string, description: string, content: ReactNode) => {
    if (isMobile) {
      return (
        <Sheet open={!!activePanel} onOpenChange={(open) => !open && setActivePanel(null)}>
          <SheetContent side="bottom" className="theme-popup-shell theme-popup-optimization max-h-[88vh] overflow-y-auto border-2 px-0 pb-6 pt-0 shadow-[0_-32px_120px_rgba(0,0,0,0.72)] ring-2 ring-primary/35 backdrop-blur-xl">
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
        <DialogContent className="theme-popup-shell theme-popup-optimization max-h-[90vh] max-w-4xl overflow-y-auto border-2 p-0 shadow-[0_36px_140px_rgba(0,0,0,0.74)] ring-2 ring-primary/35 backdrop-blur-xl">
          <DialogHeader className="theme-popup-divider border-b px-6 py-5 text-left">
            <DialogTitle className="text-left text-xl font-bold text-foreground dark:text-white">{title}</DialogTitle>
            <DialogDescription className="text-left text-sm text-foreground/60 dark:text-white/58">{description}</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 pt-6">{content}</div>
        </DialogContent>
      </Dialog>
    );
  };

  const getSelectedLabels = (options: { value: string; label: string }[]) => {
    const labels = options.filter((option) => formData.routePreferences.includes(option.value)).map((option) => option.label);
    return labels.length > 0 ? labels.slice(0, 3).join(", ") : t("planner.summary.notSpecified");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-left">
        <h3 className="text-2xl md:text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground dark:text-white">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg border-2 border-primary/20">
            <Target className="w-6 h-6" />
          </div>
          {t("planner.optimization.title")}
        </h3>
        <p className="text-foreground/62 dark:text-white/58 text-base md:text-lg leading-relaxed">{t("planner.optimization.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <button key={cat.id} type="button" className={panelTriggerClass} onClick={() => setActivePanel(cat.id)}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl border border-slate-900/10 bg-white/55 p-2 text-primary dark:border-white/10 dark:bg-white/8">
                <cat.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground dark:text-white">{cat.label}</div>
                <div className="mt-1 text-sm text-foreground/58 dark:text-white/55">{getSelectedLabels(cat.options)}</div>
              </div>
            </div>
          </button>
        ))}

        <button type="button" className={panelTriggerClass} onClick={() => setActivePanel("avoidRegions")}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl border border-slate-900/10 bg-white/55 p-2 text-primary dark:border-white/10 dark:bg-white/8">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground dark:text-white">{t("planner.optimization.avoidRegions.label")}</div>
              <div className="mt-1 text-sm text-foreground/58 dark:text-white/55">{formData.avoidRegions?.trim() || t("planner.optimization.avoidRegions.placeholder")}</div>
            </div>
          </div>
        </button>
      </div>

      {categories.map((cat) =>
        activePanel === cat.id
          ? (
            <div key={cat.id}>
              {renderPanelShell(
              cat.label,
              t("planner.optimization.subtitle"),
              <ToggleGroup
                name="routePreferences"
                options={cat.options}
                selectedValues={formData.routePreferences}
                onChange={onCheckboxChange}
              />,
            )}
            </div>
          )
          : null,
      )}

      {activePanel === "avoidRegions" && (
        <div key="avoidRegions">
          {renderPanelShell(
          t("planner.optimization.avoidRegions.label"),
          t("planner.optimization.avoidRegions.placeholder"),
          <textarea
            id="avoidRegions"
            placeholder={t("planner.optimization.avoidRegions.placeholder")}
            value={formData.avoidRegions}
            onChange={(e) => onChange({ avoidRegions: e.target.value })}
            rows={4}
            className={textareaClass}
          />,
        )}
        </div>
      )}
    </div>
  );
}
