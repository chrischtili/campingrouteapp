import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { BadgeToggleGroup } from "./BadgeToggleGroup";
import { FormSlider } from "./FormSlider";
import { useTranslation } from "react-i18next";
import { Truck, Ruler, Weight, Zap, Toilet, Flame, MoveVertical, Fuel, Settings, Car, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface VehicleSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export function VehicleSection({ formData, onChange }: VehicleSectionProps) {
  const { t } = useTranslation();
  
  const isLightweightVehicle =
    formData.vehicleType === "carTent" ||
    formData.vehicleType === "carRoofTent" ||
    formData.vehicleType === "bicycleTent" ||
    formData.vehicleType === "motorcycleTent";

  const lightweightVehicleReset: Partial<FormData> = {
    weightClass: "",
    fuelType: "",
    toiletteSystem: "",
    solarPower: "0",
    batteryCapacity: "0",
    autonomyDays: "0",
    heatingSystem: "",
    levelingJacks: "",
  };

  const fieldLabelClass = "text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50 flex items-center gap-2 mb-3";
  const glassPanelStyle = undefined;

  const vehicleTypeOptions = [
    { value: "campervan", label: t("planner.vehicle.type.options.campervan") },
    { value: "semiIntegrated", label: t("planner.vehicle.type.options.semiIntegrated") },
    { value: "integrated", label: t("planner.vehicle.type.options.integrated") },
    { value: "alcove", label: t("planner.vehicle.type.options.alcove") },
    { value: "expedition", label: t("planner.vehicle.type.options.expedition") },
    { value: "caravan", label: t("planner.vehicle.type.options.caravan") },
    { value: "pickupCamper", label: t("planner.vehicle.type.options.pickupCamper") },
    { value: "carTent", label: t("planner.vehicle.type.options.carTent") },
    { value: "carRoofTent", label: t("planner.vehicle.type.options.carRoofTent") },
    { value: "bicycleTent", label: t("planner.vehicle.type.options.bicycleTent") },
    { value: "motorcycleTent", label: t("planner.vehicle.type.options.motorcycleTent") },
  ];

  const weightClassOptions = [
    { value: "lt35", label: t("planner.vehicle.weightClass.options.lt35") },
    { value: "bt35_75", label: t("planner.vehicle.weightClass.options.bt35_75") },
    { value: "gt75", label: t("planner.vehicle.weightClass.options.gt75") },
  ];

  const fuelTypeOptions = [
    { value: "diesel", label: t("planner.vehicle.fuel.options.diesel") },
    { value: "petrol", label: t("planner.vehicle.fuel.options.petrol") },
    { value: "lpg", label: t("planner.vehicle.fuel.options.lpg") },
    { value: "electric", label: t("planner.vehicle.fuel.options.electric") },
    { value: "hybrid", label: t("planner.vehicle.fuel.options.hybrid") },
  ];

  const toiletOptions = [
    { value: "cassette", label: t("planner.vehicle.toilet.options.cassette") },
    { value: "chemical", label: t("planner.vehicle.toilet.options.chemical") },
    { value: "dry", label: t("planner.vehicle.toilet.options.dry") },
    { value: "fixed", label: t("planner.vehicle.toilet.options.fixed") },
    { value: "clesana", label: t("planner.vehicle.toilet.options.clesana") },
    { value: "none", label: t("planner.vehicle.toilet.options.none") },
  ];

  const heatingOptions = [
    { value: "diesel", label: t("planner.vehicle.heating.options.diesel") },
    { value: "gasBottle", label: t("planner.vehicle.heating.options.gasBottle") },
    { value: "gasTank", label: t("planner.vehicle.heating.options.gasTank") },
  ];

  const levelingJacksOptions = [
    { value: "yes", label: t("planner.vehicle.levelingJacks.options.yes") },
    { value: "no", label: t("planner.vehicle.levelingJacks.options.no") },
  ];

  const handleVehicleTypeChange = (_name: string, value: string, checked: boolean) => {
    if (!checked) return; // Single select logic
    const isLight = value === "carTent" || value === "carRoofTent" || value === "bicycleTent" || value === "motorcycleTent";
    onChange({ 
      vehicleType: value,
      ...(isLight ? lightweightVehicleReset : {})
    });
  };

  return (
    <div className="space-y-8">
      {/* Type & Weight Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
          <Label className={fieldLabelClass}>
            <Car className="w-4 h-4 text-primary" /> {t("planner.vehicle.type.label")}
          </Label>
          <BadgeToggleGroup
            name="vehicleType"
            options={vehicleTypeOptions}
            selectedValues={[formData.vehicleType]}
            onChange={handleVehicleTypeChange}
          />
          {isLightweightVehicle && (
            <p className="mt-4 text-[10px] text-foreground/50 italic">
              {t("planner.vehicle.typeNote")}
            </p>
          )}
        </div>

        <div className={cn(
          "planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left",
          isLightweightVehicle && "opacity-40 pointer-events-none"
        )} style={glassPanelStyle}>
          <Label className={fieldLabelClass}>
            <Weight className="w-4 h-4 text-primary" /> {t("planner.vehicle.weightClass.label")}
          </Label>
          <BadgeToggleGroup
            name="weightClass"
            options={weightClassOptions}
            selectedValues={[formData.weightClass]}
            onChange={(_name, value, checked) => checked && onChange({ weightClass: value })}
          />
        </div>
      </div>

      {/* Dimensions & Technical Details Accordion */}
      <Accordion type="multiple" className="w-full space-y-4">
        <AccordionItem value="dimensions" className="border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden px-5 py-0 bg-white/30 dark:bg-white/5">
          <AccordionTrigger className="hover:no-underline py-5">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                <Ruler className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground dark:text-white">{t("planner.vehicle.group.dimensions")}</span>
                <span className="text-[10px] text-foreground/50 dark:text-white/40">
                  {formData.vehicleLength}m × {formData.vehicleWidth}m × {formData.vehicleHeight}m
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormSlider
                id="vehicleLength"
                label={t("planner.vehicle.length")}
                value={formData.vehicleLength === "" ? 5 : parseFloat(formData.vehicleLength)}
                min={2}
                max={15}
                step={0.1}
                unit="m"
                onChange={(v) => onChange({ vehicleLength: v.toString() })}
                disabled={isLightweightVehicle}
                compact
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSlider
                  id="vehicleHeight"
                  label={t("planner.vehicle.height")}
                  value={formData.vehicleHeight === "" ? 2 : parseFloat(formData.vehicleHeight)}
                  min={1}
                  max={4.5}
                  step={0.1}
                  unit="m"
                  onChange={(v) => onChange({ vehicleHeight: v.toString() })}
                  disabled={isLightweightVehicle}
                  compact
                />
                <FormSlider
                  id="vehicleWidth"
                  label={t("planner.vehicle.width")}
                  value={formData.vehicleWidth === "" ? 1.8 : parseFloat(formData.vehicleWidth)}
                  min={1.5}
                  max={3}
                  step={0.1}
                  unit="m"
                  onChange={(v) => onChange({ vehicleWidth: v.toString() })}
                  disabled={isLightweightVehicle}
                  compact
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {!isLightweightVehicle && (
          <>
            <AccordionItem value="power" className="border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden px-5 py-0 bg-white/30 dark:bg-white/5">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground dark:text-white">{t("planner.vehicle.group.power")}</span>
                    <span className="text-[10px] text-foreground/50 dark:text-white/40">
                      {formData.solarPower}W · {formData.batteryCapacity}Ah · {formData.autonomyDays} Tage
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FormSlider id="solarPower" label={t("planner.vehicle.solar")} value={formData.solarPower === "" ? 0 : parseFloat(formData.solarPower)} min={0} max={1000} step={50} unit="W" onChange={(v) => onChange({ solarPower: v.toString() })} compact />
                  <FormSlider id="batteryCapacity" label={t("planner.vehicle.battery")} value={formData.batteryCapacity === "" ? 0 : parseFloat(formData.batteryCapacity)} min={0} max={1000} step={25} unit="Ah" onChange={(v) => onChange({ batteryCapacity: v.toString() })} compact />
                  <FormSlider id="autonomyDays" label={t("planner.vehicle.autonomyDays")} value={formData.autonomyDays === "" ? 0 : parseFloat(formData.autonomyDays)} min={0} max={14} step={1} unit={t("planner.vehicle.autonomyUnit")} onChange={(v) => onChange({ autonomyDays: v.toString() })} compact />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="systems" className="border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden px-5 py-0 bg-white/30 dark:bg-white/5">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground dark:text-white">{t("planner.vehicle.group.systems")}</span>
                    <span className="text-[10px] text-foreground/50 dark:text-white/40">
                      {formData.fuelType ? t(`planner.vehicle.fuel.options.${formData.fuelType}`) : t("planner.vehicle.fuel.label")} · {formData.toiletteSystem ? t(`planner.vehicle.toilet.options.${formData.toiletteSystem}`) : t("planner.vehicle.toilet.label")}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className={fieldLabelClass}>
                      <Fuel className="w-3.5 h-3.5 text-primary" /> {t("planner.vehicle.fuel.label")}
                    </Label>
                    <BadgeToggleGroup
                      name="fuelType"
                      options={fuelTypeOptions}
                      selectedValues={[formData.fuelType]}
                      onChange={(_name, value, checked) => checked && onChange({ fuelType: value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className={fieldLabelClass}>
                      <Toilet className="w-3.5 h-3.5 text-primary" /> {t("planner.vehicle.toilet.label")}
                    </Label>
                    <BadgeToggleGroup
                      name="toiletteSystem"
                      options={toiletOptions}
                      selectedValues={[formData.toiletteSystem]}
                      onChange={(_name, value, checked) => checked && onChange({ toiletteSystem: value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className={fieldLabelClass}>
                      <Flame className="w-3.5 h-3.5 text-primary" /> {t("planner.vehicle.heating.label")}
                    </Label>
                    <BadgeToggleGroup
                      name="heatingSystem"
                      options={heatingOptions}
                      selectedValues={[formData.heatingSystem]}
                      onChange={(_name, value, checked) => checked && onChange({ heatingSystem: value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className={fieldLabelClass}>
                      <MoveVertical className="w-3.5 h-3.5 text-primary" /> {t("planner.vehicle.levelingJacks.label")}
                    </Label>
                    <BadgeToggleGroup
                      name="levelingJacks"
                      options={levelingJacksOptions}
                      selectedValues={[formData.levelingJacks]}
                      onChange={(_name, value, checked) => checked && onChange({ levelingJacks: value })}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </>
        )}
      </Accordion>
    </div>
  );
}
