import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { SectionCard } from "./SectionCard";
import { ToggleGroup } from "./ToggleGroup";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface RouteOptimizationSectionProps {
  formData: FormData;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

export function RouteOptimizationSection({ formData, onCheckboxChange }: RouteOptimizationSectionProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const roadTypeOptions = [
    { value: 'motorways', label: t("planner.optimization.categories.roadType.options.motorways") },
    { value: 'country', label: t("planner.optimization.categories.roadType.options.country") },
    { value: 'scenic', label: t("planner.optimization.categories.roadType.options.scenic") },
  ];

  const landscapeOptions = [
    { value: 'lakes', label: t("planner.optimization.categories.landscape.options.lakes") },
    { value: 'mountains', label: t("planner.optimization.categories.landscape.options.mountains") },
    { value: 'coastal', label: t("planner.optimization.categories.landscape.options.coastal") },
    { value: 'forest', label: t("planner.optimization.categories.landscape.options.forest") },
  ];

  const trafficOptions = [
    { value: 'traffic', label: t("planner.optimization.categories.traffic.options.traffic") },
    { value: 'tunnels', label: t("planner.optimization.categories.traffic.options.tunnels") },
    { value: 'night', label: t("planner.optimization.categories.traffic.options.night") },
    { value: 'construction', label: t("planner.optimization.categories.traffic.options.construction") },
    { value: 'toll', label: t("planner.optimization.categories.traffic.options.toll") },
  ];

  const cultureOptions = [
    { value: 'cities', label: t("planner.optimization.categories.culture.options.cities") },
    { value: 'rural', label: t("planner.optimization.categories.culture.options.rural") },
    { value: 'historic', label: t("planner.optimization.categories.culture.options.historic") },
  ];
  
  return (
    <SectionCard 
      icon="🎯" 
      title={t("planner.optimization.title")} 
      subtitle={t("planner.optimization.subtitle")} 
      iconColor="bg-orange-100" 
      titleColor="text-orange-700"
    >
      <div className={`grid grid-cols-1 ${isMobile ? "gap-4" : "md:grid-cols-2 lg:grid-cols-4 gap-6"}`}>
        <div className="space-y-3">
          <Label className="font-medium">{t("planner.optimization.categories.roadType.label")}</Label>
          <ToggleGroup
            name="routePreferences"
            options={roadTypeOptions}
            selectedValues={formData.routePreferences}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">{t("planner.optimization.categories.landscape.label")}</Label>
          <ToggleGroup
            name="routePreferences"
            options={landscapeOptions}
            selectedValues={formData.routePreferences}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">{t("planner.optimization.categories.traffic.label")}</Label>
          <ToggleGroup
            name="routePreferences"
            options={trafficOptions}
            selectedValues={formData.routePreferences}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">{t("planner.optimization.categories.culture.label")}</Label>
          <ToggleGroup
            name="routePreferences"
            options={cultureOptions}
            selectedValues={formData.routePreferences}
            onChange={onCheckboxChange}
          />
        </div>
      </div>
    </SectionCard>
  );
}
