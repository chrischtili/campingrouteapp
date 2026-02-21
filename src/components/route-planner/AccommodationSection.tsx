import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionCard } from "./SectionCard";
import { ToggleGroup } from "./ToggleGroup";
import { FormSlider } from "./FormSlider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface AccommodationSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

export function AccommodationSection({ formData, onChange, onCheckboxChange }: AccommodationSectionProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const accommodationTypeOptions = [
    { value: 'camping', label: t("planner.accommodation.categories.type.options.camping") },
    { value: 'pitch', label: t("planner.accommodation.categories.type.options.pitch") },
    { value: 'farm', label: t("planner.accommodation.categories.type.options.farm") },
    { value: 'winery', label: t("planner.accommodation.categories.type.options.winery") },
    { value: 'wild', label: t("planner.accommodation.categories.type.options.wild") },
    { value: 'park4night', label: t("planner.accommodation.categories.type.options.park4night") },
  ];

  const facilitiesOptions = [
    { value: 'power', label: t("planner.accommodation.categories.facilities.options.power") },
    { value: 'water', label: t("planner.accommodation.categories.facilities.options.water") },
    { value: 'disposal', label: t("planner.accommodation.categories.facilities.options.disposal") },
    { value: 'wifi', label: t("planner.accommodation.categories.facilities.options.wifi") },
    { value: 'sanitary', label: t("planner.accommodation.categories.facilities.options.sanitary") },
    { value: 'laundry', label: t("planner.accommodation.categories.facilities.options.laundry") },
    { value: 'dogs', label: t("planner.accommodation.categories.facilities.options.dogs") },
    { value: 'pool', label: t("planner.accommodation.categories.facilities.options.pool") },
  ];

  const companionOptions = [
    { value: 'partner', label: t("planner.accommodation.categories.companions.options.partner") },
    { value: 'friends', label: t("planner.accommodation.categories.companions.options.friends") },
    { value: 'family', label: t("planner.accommodation.categories.companions.options.family") },
    { value: 'children', label: t("planner.accommodation.categories.companions.options.children") },
    { value: 'babies', label: t("planner.accommodation.categories.companions.options.babies") },
    { value: 'pets', label: t("planner.accommodation.categories.companions.options.pets") },
    { value: 'multiGen', label: t("planner.accommodation.categories.companions.options.multiGen") },
    { value: 'seniors', label: t("planner.accommodation.categories.companions.options.seniors") },
  ];
  
  return (
    <SectionCard 
      icon="🏕️" 
      title={t("planner.accommodation.title")} 
      subtitle={t("planner.accommodation.subtitle")} 
      iconColor="bg-pink-100 dark:bg-pink-900" 
      titleColor="text-pink-700"
    >
      <div className={`grid grid-cols-1 ${isMobile ? "gap-4" : "md:grid-cols-2 lg:grid-cols-3 gap-6"}`}>
        {/* Row 1 */}
        <div className="space-y-3">
          <Label className="font-medium">{t("planner.accommodation.categories.companions.label")}</Label>
          <ToggleGroup
            name="travelCompanions"
            options={companionOptions}
            selectedValues={formData.travelCompanions}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">{t("planner.accommodation.categories.type.label")}</Label>
          <ToggleGroup
            name="accommodationType"
            options={accommodationTypeOptions}
            selectedValues={formData.accommodationType}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">{t("planner.accommodation.categories.facilities.label")}</Label>
          <ToggleGroup
            name="facilities"
            options={facilitiesOptions}
            selectedValues={formData.facilities}
            onChange={onCheckboxChange}
          />
        </div>

        {/* Row 2 */}
        <div className="space-y-3">
          <Label className="font-medium">{t("planner.accommodation.travelers.label")}</Label>
          <FormSlider
            id="numberOfTravelers"
            label=""
            value={formData.numberOfTravelers ? parseInt(formData.numberOfTravelers) : 1}
            min={1}
            max={8}
            step={1}
            unit={t("planner.accommodation.travelers.unit")}
            onChange={(v) => onChange({ numberOfTravelers: v.toString() })}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">{t("planner.accommodation.budget.label")}</Label>
          <FormSlider
            id="avgCampsitePriceMax"
            label=""
            value={formData.avgCampsitePriceMax ? parseInt(formData.avgCampsitePriceMax) : 0}
            min={0}
            max={150}
            step={5}
            unit="€"
            onChange={(v) => onChange({ avgCampsitePriceMax: v.toString() })}
          />
        </div>

        <div className="space-y-3">
          {/* Empty column */}
        </div>

        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          <Label htmlFor="accommodation">{t("planner.accommodation.additional.label")}</Label>
          <Textarea
            id="accommodation"
            placeholder={t("planner.accommodation.additional.placeholder")}
            value={formData.accommodation}
            onChange={(e) => onChange({ accommodation: e.target.value })}
            rows={2}
          />
        </div>
      </div>
    </SectionCard>
  );
}
