import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "./SectionCard";
import { ToggleGroup } from "./ToggleGroup";
import { FormSlider } from "./FormSlider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface ActivitiesSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

export function ActivitiesSection({ formData, onChange, onCheckboxChange }: ActivitiesSectionProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const activityOptions = [
    { value: 'hiking', label: t("planner.interests.options.hiking") },
    { value: 'cycling', label: t("planner.interests.options.cycling") },
    { value: 'water', label: t("planner.interests.options.water") },
    { value: 'climbing', label: t("planner.interests.options.climbing") },
    { value: 'birds', label: t("planner.interests.options.birds") },
    { value: 'fishing', label: t("planner.interests.options.fishing") },
    { value: 'astronomy', label: t("planner.interests.options.astronomy") },
    { value: 'museums', label: t("planner.interests.options.museums") },
    { value: 'history', label: t("planner.interests.options.history") },
    { value: 'markets', label: t("planner.interests.options.markets") },
    { value: 'yoga', label: t("planner.interests.options.yoga") },
    { value: 'wellness', label: t("planner.interests.options.wellness") },
    { value: 'gastronomy', label: t("planner.interests.options.gastronomy") },
    { value: 'dogs', label: t("planner.interests.options.dogs") },
    { value: 'kids', label: t("planner.interests.options.kids") },
    { value: 'photography', label: t("planner.interests.options.photography") },
  ];
  
  return (
    <SectionCard 
      icon="✨" 
      title={t("planner.interests.title")} 
      subtitle={t("planner.interests.subtitle")} 
      iconColor="bg-yellow-100 dark:bg-yellow-900" 
      titleColor="text-yellow-700"
    >
      <div className={`space-y-6 ${isMobile ? "space-y-4" : ""}`}>
        <div className="space-y-3">
          <Label className="font-medium">{t("planner.interests.label")}</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
            <ToggleGroup
              name="activities"
              options={activityOptions.slice(0, 6)}
              selectedValues={formData.activities}
              onChange={onCheckboxChange}
            />
            <ToggleGroup
              name="activities"
              options={activityOptions.slice(6, 11)}
              selectedValues={formData.activities}
              onChange={onCheckboxChange}
            />
            <ToggleGroup
              name="activities"
              options={activityOptions.slice(11)}
              selectedValues={formData.activities}
              onChange={onCheckboxChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalInfo">{t("planner.interests.additional.label")}</Label>
          <Textarea
            id="additionalInfo"
            placeholder={t("planner.interests.additional.placeholder")}
            value={formData.additionalInfo}
            onChange={(e) => onChange({ additionalInfo: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </SectionCard>
  );
}
