import { FormData } from "@/types/routePlanner";
import { BadgeToggleGroup } from "./BadgeToggleGroup";
import { useTranslation } from "react-i18next";
import { Navigation, Sparkles, ShieldAlert, Landmark } from "lucide-react";

interface RouteOptimizationSectionProps {
  formData: FormData;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
  onChange: (data: Partial<FormData>) => void;
}

export function RouteOptimizationSection({ formData, onCheckboxChange, onChange }: RouteOptimizationSectionProps) {
  const { t } = useTranslation();

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
        { value: "environmentalZones", label: t("planner.optimization.categories.restrictions.options.environmentalZones") },
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
        { value: "castles", label: t("planner.optimization.categories.experiences.options.castles") },
        { value: "nationalParks", label: t("planner.optimization.categories.experiences.options.nationalParks") },
        { value: "viewpoints", label: t("planner.optimization.categories.experiences.options.viewpoints") },
        { value: "farm", label: t("planner.optimization.categories.experiences.options.farm") },
        { value: "markets", label: t("planner.optimization.categories.experiences.options.markets") },
        { value: "vineyards", label: t("planner.optimization.categories.experiences.options.vineyards") },
        { value: "wellness", label: t("planner.optimization.categories.experiences.options.wellness") },
        { value: "oldTowns", label: t("planner.optimization.categories.experiences.options.oldTowns") },
        { value: "beaches", label: t("planner.optimization.categories.experiences.options.beaches") },
      ],
    },
  ];

  const glassPanelStyle = undefined;
  const textareaClass =
    "w-full min-h-[100px] p-4 rounded-2xl transition-all outline-none font-medium text-sm text-foreground dark:text-white placeholder:font-normal text-left resize-none bg-white/40 border border-slate-200 dark:bg-white/5 dark:border-white/10";

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
            <div className="flex items-center gap-3 mb-4">
              <cat.icon className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{cat.label}</span>
            </div>
            <BadgeToggleGroup
              name="routePreferences"
              options={cat.options}
              selectedValues={formData.routePreferences}
              onChange={onCheckboxChange}
            />
          </div>
        ))}

        <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.optimization.avoidRegions.label")}</span>
          </div>
          <textarea
            id="avoidRegions"
            placeholder={t("planner.optimization.avoidRegions.placeholder")}
            value={formData.avoidRegions}
            onChange={(e) => onChange({ avoidRegions: e.target.value })}
            className={textareaClass}
          />
        </div>
      </div>
    </div>
  );
}
