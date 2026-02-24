import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSlider } from "./FormSlider";
import { useTranslation } from "react-i18next";
import { Truck, Ruler, Weight, Zap, Droplets, Fuel, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface VehicleSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export function VehicleSection({ formData, onChange }: VehicleSectionProps) {
  const { t } = useTranslation();
  
  const inputClass = "w-full h-14 px-5 rounded-2xl bg-white/5 border-2 border-white/10 backdrop-blur-md shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-base md:text-lg text-white placeholder:text-white/20 placeholder:font-normal text-left";

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
          className="p-6 sm:p-10 shadow-xl space-y-10 flex flex-col items-start text-left" 
          style={glassPanelStyle}
        >
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
              {t("planner.vehicle.group.dimensions")}
            </span>
          </div>
          <div className="space-y-10 w-full">
            <FormSlider id="vehicleLength" label={t("planner.vehicle.length")} value={formData.vehicleLength === "" ? 7 : parseFloat(formData.vehicleLength)} min={5} max={12} step={0.1} unit="m" onChange={(v) => onChange({ vehicleLength: v.toString() })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <FormSlider id="vehicleHeight" label={t("planner.vehicle.height")} value={formData.vehicleHeight === "" ? 2.9 : parseFloat(formData.vehicleHeight)} min={2} max={3.8} step={0.1} unit="m" onChange={(v) => onChange({ vehicleHeight: v.toString() })} />
              <FormSlider id="vehicleWidth" label={t("planner.vehicle.width")} value={formData.vehicleWidth === "" ? 2.3 : parseFloat(formData.vehicleWidth)} min={1.9} max={2.5} step={0.1} unit="m" onChange={(v) => onChange({ vehicleWidth: v.toString() })} />
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
            <Weight className="w-5 h-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
              {t("planner.vehicle.group.weight")}
            </span>
          </div>
          <div className="space-y-10 w-full">
            <FormSlider id="vehicleWeight" label={t("planner.vehicle.weight")} value={formData.vehicleWeight === "" ? 3.5 : parseFloat(formData.vehicleWeight)} min={3.5} max={7.5} step={0.1} unit="t" onChange={(v) => onChange({ vehicleWeight: v.toString() })} />
            <FormSlider id="axleLoad" label={t("planner.vehicle.axleLoad")} value={formData.axleLoad === "" ? 2.5 : parseFloat(formData.axleLoad)} min={1.5} max={4.5} step={0.1} unit="t" onChange={(v) => onChange({ axleLoad: v.toString() })} />
          </div>
        </motion.div>

        {/* Power Group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 sm:p-10 shadow-lg space-y-10 flex flex-col items-start text-left" 
          style={{ ...glassPanelStyle, background: "rgba(245, 155, 10, 0.05)" }}
        >
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
              {t("planner.vehicle.group.power")}
            </span>
          </div>
          <div className="space-y-10 w-full">
            <FormSlider id="solarPower" label={t("planner.vehicle.solar")} value={formData.solarPower === "" ? 300 : parseFloat(formData.solarPower)} min={0} max={1000} step={50} unit="W" onChange={(v) => onChange({ solarPower: v.toString() })} />
            <FormSlider id="batteryCapacity" label={t("planner.vehicle.battery")} value={formData.batteryCapacity === "" ? 200 : parseFloat(formData.batteryCapacity)} min={0} max={1000} step={25} unit="Ah" onChange={(v) => onChange({ batteryCapacity: v.toString() })} />
          </div>
        </motion.div>

        {/* Systems Group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 sm:p-10 shadow-xl space-y-10 flex flex-col items-start text-left" 
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
              <Select value={formData.fuelType} onValueChange={(value) => onChange({ fuelType: value })}>
                <SelectTrigger className={inputClass} style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}>
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
                <Droplets className="w-4 h-4 text-primary" /> {t("planner.vehicle.toilet.label")}
              </Label>
              <Select value={formData.toiletteSystem} onValueChange={(value) => onChange({ toiletteSystem: value })}>
                <SelectTrigger className={inputClass} style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
