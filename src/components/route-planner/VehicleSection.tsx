import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSlider } from "./FormSlider";
import { useTranslation } from "react-i18next";
import { Truck, Ruler, Weight, Zap, Toilet, Flame, MoveVertical, Fuel, Settings, Car, Tag } from "lucide-react";
import { motion } from "framer-motion";

interface VehicleSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export function VehicleSection({ formData, onChange }: VehicleSectionProps) {
  const { t } = useTranslation();
  const isMotorcycleTent = formData.vehicleType === "motorcycleTent";
  
  const inputClass = "w-full h-14 px-5 rounded-2xl bg-white/5 border-2 border-white/10 backdrop-blur-md shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-base md:text-lg text-white placeholder:text-white/20 placeholder:font-normal text-left";
  const disabledInputClass = "opacity-50 cursor-not-allowed";

  const glassPanelStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "2.5rem",
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4 text-left">
        <h3 className="text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tighter uppercase text-white">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Truck className="w-6 h-6" />
          </div>
          {t("planner.vehicle.title")}
        </h3>
        <p className="text-white/60 text-lg leading-relaxed italic">
          {t("planner.vehicle.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Dimensions Group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 sm:p-10 shadow-xl space-y-10 flex flex-col items-start text-left ${isMotorcycleTent ? "opacity-40 pointer-events-none" : ""}`}
          style={glassPanelStyle}
        >
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
              {t("planner.vehicle.group.dimensions")}
            </span>
          </div>
          <div className="space-y-10 w-full">
            <FormSlider id="vehicleLength" label={t("planner.vehicle.length")} value={formData.vehicleLength === "" ? 7 : parseFloat(formData.vehicleLength)} min={5} max={12} step={0.1} unit="m" onChange={(v) => onChange({ vehicleLength: v.toString() })} disabled={isMotorcycleTent} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <FormSlider id="vehicleHeight" label={t("planner.vehicle.height")} value={formData.vehicleHeight === "" ? 2.9 : parseFloat(formData.vehicleHeight)} min={2} max={3.8} step={0.1} unit="m" onChange={(v) => onChange({ vehicleHeight: v.toString() })} disabled={isMotorcycleTent} />
              <FormSlider id="vehicleWidth" label={t("planner.vehicle.width")} value={formData.vehicleWidth === "" ? 2.3 : parseFloat(formData.vehicleWidth)} min={1.9} max={2.5} step={0.1} unit="m" onChange={(v) => onChange({ vehicleWidth: v.toString() })} disabled={isMotorcycleTent} />
            </div>
          </div>
        </motion.div>

        {/* Weight Group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 sm:p-10 shadow-lg space-y-10 flex flex-col items-start text-left" 
          style={{ ...glassPanelStyle, background: "rgba(145, 25, 20, 0.05)" }}
        >
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
              {t("planner.vehicle.group.weight")}
            </span>
          </div>
          <div className="space-y-8 w-full">
            <div className="space-y-4">
              <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <Weight className="w-4 h-4 text-primary" /> {t("planner.vehicle.weightClass.label")}
              </Label>
              <Select value={formData.weightClass} onValueChange={(value) => onChange({ weightClass: value })}>
                <SelectTrigger
                  className={inputClass}
                  style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <SelectValue placeholder={t("planner.vehicle.weightClass.placeholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-[#0a140f] border-white/10 shadow-2xl">
                  <SelectItem value="lt35">{t("planner.vehicle.weightClass.options.lt35")}</SelectItem>
                  <SelectItem value="bt35_75">{t("planner.vehicle.weightClass.options.bt35_75")}</SelectItem>
                  <SelectItem value="gt75">{t("planner.vehicle.weightClass.options.gt75")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" /> {t("planner.vehicle.type.label")}
              </Label>
              <Select value={formData.vehicleType} onValueChange={(value) => onChange({ vehicleType: value })}>
                <SelectTrigger
                  className={inputClass}
                  style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <SelectValue placeholder={t("planner.vehicle.type.placeholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-[#0a140f] border-white/10 shadow-2xl">
                  <SelectItem value="campervan">{t("planner.vehicle.type.options.campervan")}</SelectItem>
                  <SelectItem value="semiIntegrated">{t("planner.vehicle.type.options.semiIntegrated")}</SelectItem>
                  <SelectItem value="integrated">{t("planner.vehicle.type.options.integrated")}</SelectItem>
                  <SelectItem value="alcove">{t("planner.vehicle.type.options.alcove")}</SelectItem>
                  <SelectItem value="expedition">{t("planner.vehicle.type.options.expedition")}</SelectItem>
                  <SelectItem value="caravan">{t("planner.vehicle.type.options.caravan")}</SelectItem>
                  <SelectItem value="pickupCamper">{t("planner.vehicle.type.options.pickupCamper")}</SelectItem>
                  <SelectItem value="tent">{t("planner.vehicle.type.options.tent")}</SelectItem>
                  <SelectItem value="motorcycleTent">{t("planner.vehicle.type.options.motorcycleTent")}</SelectItem>
                </SelectContent>
              </Select>
              {isMotorcycleTent && (
                <p className="text-xs text-white/60">
                  {t("planner.vehicle.typeNote")}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Power Group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 sm:p-10 shadow-lg space-y-10 flex flex-col items-start text-left ${isMotorcycleTent ? "opacity-40 pointer-events-none" : ""}`}
          style={{ ...glassPanelStyle, background: "rgba(245, 155, 10, 0.05)" }}
        >
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
              {t("planner.vehicle.group.power")}
            </span>
          </div>
          <div className="space-y-10 w-full">
            <FormSlider id="solarPower" label={t("planner.vehicle.solar")} value={formData.solarPower === "" ? 0 : parseFloat(formData.solarPower)} min={0} max={1000} step={50} unit="W" onChange={(v) => onChange({ solarPower: v.toString() })} disabled={isMotorcycleTent} />
            <FormSlider id="batteryCapacity" label={t("planner.vehicle.battery")} value={formData.batteryCapacity === "" ? 0 : parseFloat(formData.batteryCapacity)} min={0} max={1000} step={25} unit="Ah" onChange={(v) => onChange({ batteryCapacity: v.toString() })} disabled={isMotorcycleTent} />
            <FormSlider id="autonomyDays" label={t("planner.vehicle.autonomyDays")} value={formData.autonomyDays === "" ? 0 : parseFloat(formData.autonomyDays)} min={0} max={10} step={1} unit={t("planner.vehicle.autonomyUnit")} onChange={(v) => onChange({ autonomyDays: v.toString() })} disabled={isMotorcycleTent} />
          </div>
        </motion.div>

        {/* Systems Group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 sm:p-10 shadow-xl space-y-10 flex flex-col items-start text-left ${isMotorcycleTent ? "opacity-40 pointer-events-none" : ""}`}
          style={glassPanelStyle}
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
              {t("planner.vehicle.group.systems")}
            </span>
          </div>
          <div className="space-y-8 w-full">
            <div className="space-y-4">
              <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-primary" /> {t("planner.vehicle.fuel.label")}
              </Label>
              <Select value={formData.fuelType} onValueChange={(value) => onChange({ fuelType: value })} disabled={isMotorcycleTent}>
                <SelectTrigger className={`${inputClass} ${isMotorcycleTent ? disabledInputClass : ""}`} style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}>
                  <SelectValue placeholder={t("planner.vehicle.fuel.placeholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-[#0a140f] border-white/10 shadow-2xl">
                  <SelectItem value="diesel">{t("planner.vehicle.fuel.options.diesel")}</SelectItem>
                  <SelectItem value="petrol">{t("planner.vehicle.fuel.options.petrol")}</SelectItem>
                  <SelectItem value="lpg">{t("planner.vehicle.fuel.options.lpg")}</SelectItem>
                  <SelectItem value="electric">{t("planner.vehicle.fuel.options.electric")}</SelectItem>
                  <SelectItem value="hybrid">{t("planner.vehicle.fuel.options.hybrid")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <Toilet className="w-4 h-4 text-primary" /> {t("planner.vehicle.toilet.label")}
              </Label>
              <Select value={formData.toiletteSystem} onValueChange={(value) => onChange({ toiletteSystem: value })} disabled={isMotorcycleTent}>
                <SelectTrigger className={`${inputClass} ${isMotorcycleTent ? disabledInputClass : ""}`} style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}>
                  <SelectValue placeholder={t("planner.vehicle.toilet.placeholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-[#0a140f] border-white/10 shadow-2xl">
                  <SelectItem value="cassette">{t("planner.vehicle.toilet.options.cassette")}</SelectItem>
                  <SelectItem value="chemical">{t("planner.vehicle.toilet.options.chemical")}</SelectItem>
                  <SelectItem value="dry">{t("planner.vehicle.toilet.options.dry")}</SelectItem>
                  <SelectItem value="fixed">{t("planner.vehicle.toilet.options.fixed")}</SelectItem>
                  <SelectItem value="clesana">{t("planner.vehicle.toilet.options.clesana")}</SelectItem>
                  <SelectItem value="none">{t("planner.vehicle.toilet.options.none")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" /> {t("planner.vehicle.heating.label")}
              </Label>
              <Select value={formData.heatingSystem} onValueChange={(value) => onChange({ heatingSystem: value })} disabled={isMotorcycleTent}>
                <SelectTrigger className={`${inputClass} ${isMotorcycleTent ? disabledInputClass : ""}`} style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}>
                  <SelectValue placeholder={t("planner.vehicle.heating.placeholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-[#0a140f] border-white/10 shadow-2xl">
                  <SelectItem value="diesel">{t("planner.vehicle.heating.options.diesel")}</SelectItem>
                  <SelectItem value="gasBottle">{t("planner.vehicle.heating.options.gasBottle")}</SelectItem>
                  <SelectItem value="gasTank">{t("planner.vehicle.heating.options.gasTank")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <MoveVertical className="w-4 h-4 text-primary" /> {t("planner.vehicle.levelingJacks.label")}
              </Label>
              <Select value={formData.levelingJacks} onValueChange={(value) => onChange({ levelingJacks: value })} disabled={isMotorcycleTent}>
                <SelectTrigger className={`${inputClass} ${isMotorcycleTent ? disabledInputClass : ""}`} style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}>
                  <SelectValue placeholder={t("planner.vehicle.levelingJacks.placeholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-[#0a140f] border-white/10 shadow-2xl">
                  <SelectItem value="yes">{t("planner.vehicle.levelingJacks.options.yes")}</SelectItem>
                  <SelectItem value="no">{t("planner.vehicle.levelingJacks.options.no")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
