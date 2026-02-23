import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { FormSlider } from "./FormSlider";
import { useTranslation } from "react-i18next";
import { Map, MapPin, Calendar, Compass, Info, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RouteSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export function RouteSection({ formData, onChange }: RouteSectionProps) {
  const { t } = useTranslation();
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    onChange({ 
      startDate: newStartDate,
      endDate: newStartDate 
    });
  };

  const glassPanelStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "2.5rem",
  };

  const inputClass = "w-full h-14 px-5 rounded-2xl bg-white/5 border-2 border-white/10 backdrop-blur-md shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-white placeholder:text-white/60 placeholder:font-normal text-left";

  return (
    <div className="space-y-12">
      <div className="space-y-4 text-left">
        <h3 className="text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tighter uppercase text-left text-white">
          <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
            <Map className="w-6 h-6" />
          </div>
          {t("planner.route.title")}
        </h3>
        <p className="text-white/60 text-lg leading-relaxed italic">
          {t("planner.route.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 p-10 shadow-2xl" style={glassPanelStyle}>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
              <Compass className="w-3 h-3" /> {t("planner.route.type.label")}
            </Label>
            <select 
              value={formData.routeType} 
              onChange={(e) => onChange({ routeType: e.target.value })}
              className={inputClass}
            >
              <option value="" disabled className="bg-[#0a140f] text-white/40">{t("planner.route.type.placeholder")}</option>
              <option value="oneWay" className="bg-[#0a140f] text-white">{t("planner.route.type.options.oneWay")}</option>
              <option value="return" className="bg-[#0a140f] text-white">{t("planner.route.type.options.return")}</option>
              <option value="roundTrip" className="bg-[#0a140f] text-white">{t("planner.route.type.options.roundTrip")}</option>
              <option value="multiStage" className="bg-[#0a140f] text-white">{t("planner.route.type.options.multiStage")}</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" /> {t("planner.route.style.label")}
            </Label>
            <select 
              value={formData.travelStyle} 
              onChange={(e) => onChange({ travelStyle: e.target.value })}
              className={inputClass}
            >
              <option value="" disabled className="bg-[#0a140f] text-white/40">{t("planner.route.style.placeholder")}</option>
              <option value="adventure" className="bg-[#0a140f] text-white">{t("planner.route.style.options.adventure")}</option>
              <option value="relaxation" className="bg-[#0a140f] text-white">{t("planner.route.style.options.relaxation")}</option>
              <option value="culture" className="bg-[#0a140f] text-white">{t("planner.route.style.options.culture")}</option>
              <option value="nature" className="bg-[#0a140f] text-white">{t("planner.route.style.options.nature")}</option>
              <option value="family" className="bg-[#0a140f] text-white">{t("planner.route.style.options.family")}</option>
              <option value="gourmet" className="bg-[#0a140f] text-white">{t("planner.route.style.options.gourmet")}</option>
              <option value="slowTravel" className="bg-[#0a140f] text-white">{t("planner.route.style.options.slowTravel")}</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="startPoint" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-1">
              {t("planner.route.start.label")} 
              <span className="text-primary font-black">*</span>
            </Label>
            <div className="relative">
              <input
                id="startPoint"
                placeholder={t("planner.route.start.placeholder")}
                value={formData.startPoint}
                onChange={(e) => onChange({ startPoint: e.target.value })}
                className={`${inputClass} pl-14`}
                required
              />
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="destination" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-1">
              {t("planner.route.destination.label")}
              <span className="text-primary font-black">*</span>
            </Label>
            <div className="relative">
              <input
                id="destination"
                placeholder={t("planner.route.destination.placeholder")}
                value={formData.destination}
                onChange={(e) => onChange({ destination: e.target.value })}
                className={`${inputClass} pl-14 border-primary/20`}
                required
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {formData.routeType === 'multiStage' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-3">
              <Label htmlFor="stageDestination1" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                {t("planner.route.stage.label", { num: 1 })}
              </Label>
              <div className="relative">
                <input
                  id="stageDestination1"
                  placeholder={t("planner.route.stage.placeholder")}
                  value={formData.stageDestination1}
                  onChange={(e) => onChange({ stageDestination1: e.target.value })}
                  className={`${inputClass} pl-14`}
                />
                <Info className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="stageDestination2" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                {t("planner.route.stage.label", { num: 2 })}
              </Label>
              <div className="relative">
                <input
                  id="stageDestination2"
                  placeholder={t("planner.route.stage.placeholder")}
                  value={formData.stageDestination2}
                  onChange={(e) => onChange({ stageDestination2: e.target.value })}
                  className={`${inputClass} pl-14`}
                />
                <Info className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-8 md:p-12 shadow-2xl space-y-10" style={glassPanelStyle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-secondary" /> {t("planner.route.departure")}
            </Label>
            <div className="relative">
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={handleStartDateChange}
                className={`${inputClass} pr-12`}
              />
              <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
              <ArrowRight className="w-3 h-3 text-secondary" /> {t("planner.route.arrival")}
            </Label>
            <div className="relative">
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => onChange({ endDate: e.target.value })}
                className={`${inputClass} pr-12`}
              />
              <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5">
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
      </div>

      <div className="space-y-3 text-left">
        <Label htmlFor="routeAdditionalInfo" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 ml-4">
          <Info className="w-3 h-3 text-primary" /> {t("planner.route.additional.label")}
        </Label>
        <textarea
          id="routeAdditionalInfo"
          placeholder={t("planner.route.additional.placeholder")}
          value={formData.routeAdditionalInfo}
          onChange={(e) => onChange({ routeAdditionalInfo: e.target.value })}
          rows={4}
          className={`${inputClass} min-h-[150px] p-8 resize-none`}
        />
      </div>
    </div>
  );
}
