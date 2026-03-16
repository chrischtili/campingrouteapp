import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSlider } from "./FormSlider";
import { useTranslation } from "react-i18next";
import { Truck, Ruler, Weight, Zap, Toilet, Flame, MoveVertical, Fuel, Settings, Car, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cloneFormDataSnapshot } from "@/lib/formDataSnapshot";

interface VehicleSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export function VehicleSection({ formData, onChange }: VehicleSectionProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const isLightweightVehicle =
    formData.vehicleType === "carTent" ||
    formData.vehicleType === "carRoofTent" ||
    formData.vehicleType === "bicycleTent" ||
    formData.vehicleType === "motorcycleTent";
  const [detailsOpen, setDetailsOpen] = useState(false);
  const snapshotRef = useRef<FormData | null>(null);
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
  
  const inputClass = "popup-input w-full h-11 sm:h-12 px-4 sm:px-5 rounded-xl sm:rounded-2xl transition-all outline-none font-bold text-sm sm:text-base text-foreground dark:text-white placeholder:font-normal text-left";
  const disabledInputClass = "opacity-50 cursor-not-allowed";

  const glassPanelStyle = undefined;

  const detailTriggerClass = "planner-panel-trigger rounded-2xl border-2 px-5 py-4 text-left transition-colors";
  const detailSummaryParts = [
    !isLightweightVehicle && Number(formData.solarPower || 0) > 0 ? `${formData.solarPower}W` : "",
    !isLightweightVehicle && Number(formData.batteryCapacity || 0) > 0 ? `${formData.batteryCapacity}Ah` : "",
    !isLightweightVehicle && Number(formData.autonomyDays || 0) > 0 ? `${formData.autonomyDays} ${t("planner.vehicle.autonomyUnit")}` : "",
    !isLightweightVehicle && formData.fuelType ? t(`planner.vehicle.fuel.options.${formData.fuelType}`) : "",
    !isLightweightVehicle && formData.toiletteSystem ? t(`planner.vehicle.toilet.options.${formData.toiletteSystem}`) : "",
    !isLightweightVehicle && formData.heatingSystem ? t(`planner.vehicle.heating.options.${formData.heatingSystem}`) : "",
    !isLightweightVehicle && formData.levelingJacks ? t(`planner.vehicle.levelingJacks.options.${formData.levelingJacks}`) : "",
  ].filter(Boolean);
  const detailSummary = detailSummaryParts.join(" · ") || t("planner.vehicle.details.description");
  const popupActionsClass = "flex flex-col-reverse gap-3 border-t border-slate-900/10 px-6 pt-5 dark:border-white/10 sm:flex-row sm:justify-end";

  const openDetails = () => {
    if (isLightweightVehicle) {
      return;
    }
    snapshotRef.current = cloneFormDataSnapshot(formData);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    snapshotRef.current = null;
    setDetailsOpen(false);
  };

  const cancelDetails = () => {
    if (snapshotRef.current) {
      onChange(snapshotRef.current);
    }
    closeDetails();
  };

  const renderPopupActions = () => (
    <div className={popupActionsClass}>
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl border-slate-900/12 bg-white/70 px-5 font-semibold text-foreground hover:bg-white dark:border-white/12 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
        onClick={cancelDetails}
      >
        {t("buttons.cancel")}
      </Button>
      <Button type="button" className="h-11 rounded-xl px-5 font-semibold" onClick={closeDetails}>
        {t("buttons.ok")}
      </Button>
    </div>
  );

  const renderPanelShell = (title: string, description: string, content: ReactNode) => {
    if (isMobile) {
      return (
        <Sheet open={detailsOpen} onOpenChange={(open) => !open && cancelDetails()}>
          <SheetContent hideCloseButton side="bottom" className="theme-popup-shell theme-popup-vehicle max-h-[88vh] overflow-y-auto border-2 px-0 pb-6 pt-0 shadow-[0_-32px_120px_rgba(0,0,0,0.72)] ring-2 ring-primary/35 backdrop-blur-xl">
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
      <Dialog open={detailsOpen} onOpenChange={(open) => !open && cancelDetails()}>
        <DialogContent hideCloseButton className="theme-popup-shell theme-popup-vehicle max-h-[90vh] max-w-4xl overflow-y-auto border-2 p-0 shadow-[0_36px_140px_rgba(0,0,0,0.74)] ring-2 ring-primary/35 backdrop-blur-xl">
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

  const detailsContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`planner-panel-surface p-4 sm:p-5 border shadow-lg space-y-5 flex flex-col items-start text-left ${isLightweightVehicle ? "opacity-40 pointer-events-none" : ""}`}
        style={glassPanelStyle}
      >
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium tracking-[0.03em] text-foreground/72 dark:text-white/72">
            {t("planner.vehicle.group.power")}
          </span>
        </div>
        <div className="space-y-5 w-full">
          <FormSlider id="solarPower" label={t("planner.vehicle.solar")} value={formData.solarPower === "" ? 0 : parseFloat(formData.solarPower)} min={0} max={1000} step={50} unit="W" onChange={(v) => onChange({ solarPower: v.toString() })} disabled={isLightweightVehicle} compact />
          <FormSlider id="batteryCapacity" label={t("planner.vehicle.battery")} value={formData.batteryCapacity === "" ? 0 : parseFloat(formData.batteryCapacity)} min={0} max={1000} step={25} unit="Ah" onChange={(v) => onChange({ batteryCapacity: v.toString() })} disabled={isLightweightVehicle} compact />
          <FormSlider id="autonomyDays" label={t("planner.vehicle.autonomyDays")} value={formData.autonomyDays === "" ? 0 : parseFloat(formData.autonomyDays)} min={0} max={10} step={1} unit={t("planner.vehicle.autonomyUnit")} onChange={(v) => onChange({ autonomyDays: v.toString() })} disabled={isLightweightVehicle} compact />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`planner-panel-surface p-4 sm:p-5 border shadow-lg space-y-5 flex flex-col items-start text-left ${isLightweightVehicle ? "opacity-40 pointer-events-none" : ""}`}
        style={glassPanelStyle}
      >
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium tracking-[0.03em] text-foreground/72 dark:text-white/72">
            {t("planner.vehicle.group.systems")}
          </span>
        </div>
        <div className="space-y-5 w-full">
          <div className="space-y-3">
            <Label className="text-xs md:text-sm font-medium tracking-[0.02em] text-foreground dark:text-white flex items-center gap-2">
              <Fuel className="w-4 h-4 text-primary" /> {t("planner.vehicle.fuel.label")}
            </Label>
            <Select value={formData.fuelType} onValueChange={(value) => onChange({ fuelType: value })} disabled={isLightweightVehicle}>
              <SelectTrigger className={`${inputClass} ${isLightweightVehicle ? disabledInputClass : ""}`}>
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

          <div className="space-y-3">
            <Label className="text-xs md:text-sm font-medium tracking-[0.02em] text-foreground dark:text-white flex items-center gap-2">
              <Toilet className="w-4 h-4 text-primary" /> {t("planner.vehicle.toilet.label")}
            </Label>
            <Select value={formData.toiletteSystem} onValueChange={(value) => onChange({ toiletteSystem: value })} disabled={isLightweightVehicle}>
              <SelectTrigger className={`${inputClass} ${isLightweightVehicle ? disabledInputClass : ""}`}>
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

          <div className="space-y-3">
            <Label className="text-xs md:text-sm font-medium tracking-[0.02em] text-foreground dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" /> {t("planner.vehicle.heating.label")}
            </Label>
            <Select value={formData.heatingSystem} onValueChange={(value) => onChange({ heatingSystem: value })} disabled={isLightweightVehicle}>
              <SelectTrigger className={`${inputClass} ${isLightweightVehicle ? disabledInputClass : ""}`}>
                <SelectValue placeholder={t("planner.vehicle.heating.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diesel">{t("planner.vehicle.heating.options.diesel")}</SelectItem>
                <SelectItem value="gasBottle">{t("planner.vehicle.heating.options.gasBottle")}</SelectItem>
                <SelectItem value="gasTank">{t("planner.vehicle.heating.options.gasTank")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-xs md:text-sm font-medium tracking-[0.02em] text-foreground dark:text-white flex items-center gap-2">
              <MoveVertical className="w-4 h-4 text-primary" /> {t("planner.vehicle.levelingJacks.label")}
            </Label>
            <Select value={formData.levelingJacks} onValueChange={(value) => onChange({ levelingJacks: value })} disabled={isLightweightVehicle}>
              <SelectTrigger className={`${inputClass} ${isLightweightVehicle ? disabledInputClass : ""}`}>
                <SelectValue placeholder={t("planner.vehicle.levelingJacks.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{t("planner.vehicle.levelingJacks.options.yes")}</SelectItem>
                <SelectItem value="no">{t("planner.vehicle.levelingJacks.options.no")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Dimensions Group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`planner-panel-surface p-4 sm:p-5 border shadow-lg space-y-5 flex flex-col items-start text-left ${isLightweightVehicle ? "opacity-40 pointer-events-none" : ""}`}
          style={glassPanelStyle}
        >
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium tracking-[0.03em] text-foreground/72 dark:text-white/72">
              {t("planner.vehicle.group.dimensions")}
            </span>
          </div>
          <div className="space-y-5 w-full">
            <FormSlider id="vehicleLength" label={t("planner.vehicle.length")} value={formData.vehicleLength === "" ? 5 : parseFloat(formData.vehicleLength)} min={5} max={12} step={0.1} unit="m" onChange={(v) => onChange({ vehicleLength: v.toString() })} disabled={isLightweightVehicle} compact />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormSlider id="vehicleHeight" label={t("planner.vehicle.height")} value={formData.vehicleHeight === "" ? 2 : parseFloat(formData.vehicleHeight)} min={2} max={3.8} step={0.1} unit="m" onChange={(v) => onChange({ vehicleHeight: v.toString() })} disabled={isLightweightVehicle} compact />
              <FormSlider id="vehicleWidth" label={t("planner.vehicle.width")} value={formData.vehicleWidth === "" ? 1.9 : parseFloat(formData.vehicleWidth)} min={1.9} max={2.5} step={0.1} unit="m" onChange={(v) => onChange({ vehicleWidth: v.toString() })} disabled={isLightweightVehicle} compact />
            </div>
          </div>
        </motion.div>

        {/* Weight Group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="planner-panel-surface p-4 sm:p-5 border shadow-lg space-y-5 flex flex-col items-start text-left" 
          style={glassPanelStyle}
        >
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium tracking-[0.03em] text-foreground/72 dark:text-white/72">
              {t("planner.vehicle.group.weight")}
            </span>
          </div>
          <div className="space-y-5 w-full">
            <div className="space-y-3">
              <Label className="text-xs md:text-sm font-medium tracking-[0.02em] text-foreground dark:text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" /> {t("planner.vehicle.type.label")}
              </Label>
              <Select
                value={formData.vehicleType}
                onValueChange={(value) =>
                  onChange(
                    value === "carTent" ||
                    value === "carRoofTent" ||
                    value === "bicycleTent" ||
                    value === "motorcycleTent"
                      ? { vehicleType: value, ...lightweightVehicleReset }
                      : { vehicleType: value }
                  )
                }
              >
                <SelectTrigger
                  className={inputClass}
                >
                  <SelectValue placeholder={t("planner.vehicle.type.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campervan">{t("planner.vehicle.type.options.campervan")}</SelectItem>
                  <SelectItem value="semiIntegrated">{t("planner.vehicle.type.options.semiIntegrated")}</SelectItem>
                  <SelectItem value="integrated">{t("planner.vehicle.type.options.integrated")}</SelectItem>
                  <SelectItem value="alcove">{t("planner.vehicle.type.options.alcove")}</SelectItem>
                  <SelectItem value="expedition">{t("planner.vehicle.type.options.expedition")}</SelectItem>
                  <SelectItem value="caravan">{t("planner.vehicle.type.options.caravan")}</SelectItem>
                  <SelectItem value="pickupCamper">{t("planner.vehicle.type.options.pickupCamper")}</SelectItem>
                  <SelectItem value="carTent">{t("planner.vehicle.type.options.carTent")}</SelectItem>
                  <SelectItem value="carRoofTent">{t("planner.vehicle.type.options.carRoofTent")}</SelectItem>
                  <SelectItem value="bicycleTent">{t("planner.vehicle.type.options.bicycleTent")}</SelectItem>
                  <SelectItem value="motorcycleTent">{t("planner.vehicle.type.options.motorcycleTent")}</SelectItem>
                </SelectContent>
              </Select>
              {isLightweightVehicle && (
                <p className="text-xs text-foreground/62 dark:text-white/60">
                  {t("planner.vehicle.typeNote")}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label className="text-xs md:text-sm font-medium tracking-[0.02em] text-foreground dark:text-white flex items-center gap-2">
                <Weight className="w-4 h-4 text-primary" /> {t("planner.vehicle.weightClass.label")}
              </Label>
              <Select value={formData.weightClass} onValueChange={(value) => onChange({ weightClass: value })} disabled={isLightweightVehicle}>
                <SelectTrigger
                  className={`${inputClass} ${isLightweightVehicle ? disabledInputClass : ""}`}
                >
                  <SelectValue placeholder={t("planner.vehicle.weightClass.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lt35">{t("planner.vehicle.weightClass.options.lt35")}</SelectItem>
                  <SelectItem value="bt35_75">{t("planner.vehicle.weightClass.options.bt35_75")}</SelectItem>
                  <SelectItem value="gt75">{t("planner.vehicle.weightClass.options.gt75")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

      </div>

      <button
        type="button"
        className={`${detailTriggerClass} ${isLightweightVehicle ? "cursor-not-allowed opacity-55" : ""}`}
        onClick={openDetails}
        disabled={isLightweightVehicle}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl border border-slate-900/10 bg-white/55 p-2 text-primary dark:border-white/10 dark:bg-white/8">
            <Settings className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground dark:text-white">{t("planner.vehicle.details.label")}</div>
            <div className="mt-1 text-sm text-foreground/58 dark:text-white/55 line-clamp-2 break-words">{detailSummary}</div>
          </div>
        </div>
      </button>

      {renderPanelShell(t("planner.vehicle.details.label"), t("planner.vehicle.details.description"), detailsContent)}
    </div>
  );
}
