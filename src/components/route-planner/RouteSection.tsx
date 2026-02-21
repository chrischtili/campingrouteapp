import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionCard } from "./SectionCard";
import { FormSlider } from "./FormSlider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

export function RouteSection({ formData, onChange }: RouteSectionProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  // Handle date selection logic
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    onChange({ startDate: newStartDate });
    
    // If end date is empty or before start date, set it to start date
    if (!formData.endDate || new Date(formData.endDate) < new Date(newStartDate)) {
      onChange({ endDate: newStartDate });
    }
  };

  return (
    <SectionCard icon="🗺️" title={t("planner.route.title")} iconColor="bg-blue-100 dark:bg-blue-900" titleColor="text-blue-700">
      {/* Routentyp und Reisestil - ganz oben */}
      <div className={`grid grid-cols-1 ${isMobile ? "gap-3" : "md:grid-cols-2 gap-4"} mb-6`}>
        <div className="space-y-2">
          <Label htmlFor="routeType">{t("planner.route.type.label")}</Label>
          <Select value={formData.routeType} onValueChange={(value) => onChange({ routeType: value })}>
            <SelectTrigger aria-label={t("planner.route.type.label")}>
              <SelectValue placeholder={t("planner.route.type.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oneWay">{t("planner.route.type.options.oneWay")}</SelectItem>
              <SelectItem value="return">{t("planner.route.type.options.return")}</SelectItem>
              <SelectItem value="roundTrip">{t("planner.route.type.options.roundTrip")}</SelectItem>
              <SelectItem value="multiStage">{t("planner.route.type.options.multiStage")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="travelStyle">{t("planner.route.style.label")}</Label>
          <Select value={formData.travelStyle} onValueChange={(value) => onChange({ travelStyle: value })}>
            <SelectTrigger aria-label={t("planner.route.style.label")}>
              <SelectValue placeholder={t("planner.route.style.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adventure">{t("planner.route.style.options.adventure")}</SelectItem>
              <SelectItem value="relaxation">{t("planner.route.style.options.relaxation")}</SelectItem>
              <SelectItem value="culture">{t("planner.route.style.options.culture")}</SelectItem>
              <SelectItem value="nature">{t("planner.route.style.options.nature")}</SelectItem>
              <SelectItem value="family">{t("planner.route.style.options.family")}</SelectItem>
              <SelectItem value="gourmet">{t("planner.route.style.options.gourmet")}</SelectItem>
              <SelectItem value="slowTravel">{t("planner.route.style.options.slowTravel")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hauptformular */}
      <div className={`grid grid-cols-1 ${isMobile ? "gap-3" : "md:grid-cols-2 gap-4"}`}>
        <div className="space-y-2">
          <Label htmlFor="startPoint">
            {t("planner.route.start.label")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="startPoint"
            placeholder={t("planner.route.start.placeholder")}
            value={formData.startPoint}
            onChange={(e) => onChange({ startPoint: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">
            {t("planner.route.destination.label")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="destination"
            placeholder={t("planner.route.destination.placeholder")}
            value={formData.destination}
            onChange={(e) => onChange({ destination: e.target.value })}
            required
          />
        </div>

        {/* Etappenziel-Felder - nur bei "Mehrere Ziele / Etappenreise" */}
        {formData.routeType === 'multiStage' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="stageDestination1">{t("planner.route.stage.label", { num: 1 })}</Label>
              <Input
                id="stageDestination1"
                placeholder={t("planner.route.stage.placeholder")}
                value={formData.stageDestination1}
                onChange={(e) => onChange({ stageDestination1: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stageDestination2">{t("planner.route.stage.label", { num: 2 })}</Label>
              <Input
                id="stageDestination2"
                placeholder={t("planner.route.stage.placeholder")}
                value={formData.stageDestination2}
                onChange={(e) => onChange({ stageDestination2: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="startDate">{t("planner.route.departure")}</Label>
          <div className="relative z-50 mb-8">
            <input
              id="startDate"
              type="date"
              value={formData.startDate || ''}
              onChange={handleStartDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-10 px-3 py-2 border rounded-md border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">{t("planner.route.arrival")}</Label>
          <div className="relative z-50">
            <input
              id="endDate"
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => onChange({ endDate: e.target.value })}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              className="w-full h-10 px-3 py-2 border rounded-md border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <FormSlider
            id="maxDailyDistance"
            label={t("planner.route.maxDistance")}
            value={parseInt(formData.maxDailyDistance) || 250}
            min={100}
            max={1000}
            step={50}
            unit="km"
            onChange={(value) => onChange({ maxDailyDistance: value.toString() })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="routeAdditionalInfo">{t("planner.route.additional.label")}</Label>
          <Textarea
            id="routeAdditionalInfo"
            placeholder={t("planner.route.additional.placeholder")}
            value={formData.routeAdditionalInfo}
            onChange={(e) => onChange({ routeAdditionalInfo: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </SectionCard>
  );
}

interface RouteSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}