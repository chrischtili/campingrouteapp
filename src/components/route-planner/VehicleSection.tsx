import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionCard } from "./SectionCard";
import { FormSlider } from "./FormSlider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface VehicleSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export function VehicleSection({ formData, onChange }: VehicleSectionProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  return (
    <SectionCard icon="🚐" title={t("planner.vehicle.title")} iconColor="bg-green-100 dark:bg-green-900" titleColor="text-green-700">
      <div className={`grid grid-cols-1 ${isMobile ? "gap-4" : "md:grid-cols-2 lg:grid-cols-3 gap-6"}`}>
        <FormSlider
          id="vehicleLength"
          label={t("planner.vehicle.length")}
          value={parseFloat(formData.vehicleLength) || 7}
          min={5}
          max={12}
          step={0.1}
          unit="m"
          onChange={(v) => onChange({ vehicleLength: v.toString() })}
        />

        <FormSlider
          id="vehicleHeight"
          label={t("planner.vehicle.height")}
          value={parseFloat(formData.vehicleHeight) || 2.9}
          min={2}
          max={3.8}
          step={0.1}
          unit="m"
          onChange={(v) => onChange({ vehicleHeight: v.toString() })}
        />

        <FormSlider
          id="vehicleWidth"
          label={t("planner.vehicle.width")}
          value={parseFloat(formData.vehicleWidth) || 2.3}
          min={1.9}
          max={2.5}
          step={0.1}
          unit="m"
          onChange={(v) => onChange({ vehicleWidth: v.toString() })}
        />

        <FormSlider
          id="vehicleWeight"
          label={t("planner.vehicle.weight")}
          value={parseFloat(formData.vehicleWeight) || 3.5}
          min={3.5}
          max={7.5}
          step={0.1}
          unit="t"
          onChange={(v) => onChange({ vehicleWeight: v.toString() })}
        />

        <FormSlider
          id="axleLoad"
          label={t("planner.vehicle.axleLoad")}
          value={parseFloat(formData.axleLoad) || 2.5}
          min={1.5}
          max={4.5}
          step={0.1}
          unit="t"
          onChange={(v) => onChange({ axleLoad: v.toString() })}
        />

        <div className="space-y-2">
          <Label htmlFor="fuelType">{t("planner.vehicle.fuel.label")}</Label>
          <Select value={formData.fuelType} onValueChange={(value) => onChange({ fuelType: value })}>
            <SelectTrigger aria-label={t("planner.vehicle.fuel.label")}>
              <SelectValue placeholder={t("planner.vehicle.fuel.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diesel">{t("planner.vehicle.fuel.options.diesel")}</SelectItem>
              <SelectItem value="petrol">{t("planner.vehicle.fuel.options.petrol")}</SelectItem>
              <SelectItem value="lpg">{t("planner.vehicle.fuel.options.lpg")}</SelectItem>
              <SelectItem value="electric">{t("planner.vehicle.fuel.options.electric")}</SelectItem>
              <SelectItem value="hybrid">{t("planner.vehicle.fuel.options.hybrid")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <FormSlider
          id="solarPower"
          label={t("planner.vehicle.solar")}
          value={parseFloat(formData.solarPower) || 300}
          min={50}
          max={1000}
          step={50}
          unit="W"
          onChange={(v) => onChange({ solarPower: v.toString() })}
        />

        <FormSlider
          id="batteryCapacity"
          label={t("planner.vehicle.battery")}
          value={parseFloat(formData.batteryCapacity) || 200}
          min={50}
          max={1000}
          step={25}
          unit="Ah"
          onChange={(v) => onChange({ batteryCapacity: v.toString() })}
        />

        <div className="space-y-2">
          <Label htmlFor="toiletteSystem">{t("planner.vehicle.toilet.label")}</Label>
          <Select value={formData.toiletteSystem} onValueChange={(value) => onChange({ toiletteSystem: value })}>
            <SelectTrigger aria-label={t("planner.vehicle.toilet.label")}>
              <SelectValue placeholder={t("planner.vehicle.toilet.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cassette">{t("planner.vehicle.toilet.options.cassette")}</SelectItem>
              <SelectItem value="chemical">{t("planner.vehicle.toilet.options.chemical")}</SelectItem>
              <SelectItem value="dry">{t("planner.vehicle.toilet.options.dry")}</SelectItem>
              <SelectItem value="fixed">{t("planner.vehicle.toilet.options.fixed")}</SelectItem>
              <SelectItem value="clesana">{t("planner.vehicle.toilet.options.clesana")}</SelectItem>
              <SelectItem value="none">{t("planner.vehicle.toilet.options.none")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SectionCard>
  );
}
