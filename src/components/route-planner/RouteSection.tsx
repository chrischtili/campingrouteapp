import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup } from "./ToggleGroup";
import { Switch } from "@/components/ui/switch";
import { FormSlider } from "./FormSlider";
import { useTranslation } from "react-i18next";
import { Map, MapPin, Calendar, Compass, Info, ArrowRight, Sparkles, Clock } from "lucide-react";
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

  const handleGpxToggle = (name: string, value: string, checked: boolean) => {
    const current = formData.gpxOutputMode || [];
    const next = checked ? [...current, value] : current.filter((v) => v !== value);
    onChange({ gpxOutputMode: next });
  };
  
  const handlePaceChange = (_name: string, value: string, checked: boolean) => {
    onChange({ travelPace: checked ? value : '' });
  };

  const glassPanelStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "2.5rem",
  };

  const inputClass = "w-full h-14 px-5 rounded-2xl bg-white/5 border-2 border-white/10 backdrop-blur-md shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-base md:text-lg text-white placeholder:text-white/60 placeholder:font-normal text-left";
  const timeInputClass = `${inputClass} pr-12 appearance-none min-h-[56px]`;
  const requiredError = "text-[10px] font-black uppercase tracking-[0.2em] text-red-400";
  const isStartMissing = !formData.startPoint?.trim();
  const isDestinationMissing = !formData.destination?.trim();
  const departureLabel = formData.startPoint?.trim()
    ? `${t("planner.route.departure")} (${formData.startPoint.trim()})`
    : t("planner.route.departure");
  const arrivalLabel = formData.destination?.trim()
    ? `${t("planner.route.arrival")} (${formData.destination.trim()})`
    : t("planner.route.arrival");
  const timeInputStyle = {
    colorScheme: 'dark' as const,
    WebkitTextFillColor: 'rgba(255,255,255,0.95)',
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4 text-left">
        <h3 className="text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tighter uppercase text-left text-white">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Map className="w-6 h-6" />
          </div>
          {t("planner.route.title")}
        </h3>
        <p className="text-white/60 text-lg leading-relaxed italic">
          {t("planner.route.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 p-6 sm:p-10 shadow-2xl" style={glassPanelStyle}>
          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" /> {t("planner.route.type.label")}
            </Label>
            <Select value={formData.routeType} onValueChange={(value) => onChange({ routeType: value })}>
              <SelectTrigger className={inputClass} style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}>
                <SelectValue placeholder={t("planner.route.type.placeholder")} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl bg-[#0a140f] border-white/10 shadow-2xl">
                <SelectItem value="oneWay">{t("planner.route.type.options.oneWay")}</SelectItem>
                <SelectItem value="return">{t("planner.route.type.options.return")}</SelectItem>
                <SelectItem value="roundTrip">{t("planner.route.type.options.roundTrip")}</SelectItem>
                <SelectItem value="multiStage">{t("planner.route.type.options.multiStage")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> {t("planner.route.style.label")}
            </Label>
            <Select value={formData.travelStyle} onValueChange={(value) => onChange({ travelStyle: value })}>
              <SelectTrigger className={inputClass} style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}>
                <SelectValue placeholder={t("planner.route.style.placeholder")} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl bg-[#0a140f] border-white/10 shadow-2xl">
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

          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> {t("planner.route.gpx.label")}
            </Label>
            <p className="text-white/50 text-sm leading-relaxed">
              {t("planner.route.gpx.description")} {t("planner.route.gpx.multiple")}
            </p>
            <ToggleGroup
              name="gpxOutputMode"
              options={[
                { value: "garmin", label: t("planner.route.gpx.options.garmin") },
                { value: "routeTrack", label: t("planner.route.gpx.options.routeTrack") },
              ]}
              selectedValues={formData.gpxOutputMode || []}
              onChange={handleGpxToggle}
              className="grid-cols-1"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="startPoint" className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {t("planner.route.start.label")} 
              <span className="text-primary font-black">*</span>
            </Label>
            <div className="relative">
              <input
                id="startPoint"
                placeholder={t("planner.route.start.placeholder")}
                value={formData.startPoint}
                onChange={(e) => onChange({ startPoint: e.target.value })}
                className={`${inputClass} pl-14 ${isStartMissing ? "border-red-400/40 focus:border-red-400" : ""}`}
                required
              />
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-primary/40" />
            </div>
            {isStartMissing && <div className={requiredError}>{t("planner.route.requiredHint")}</div>}
          </div>

          <div className="space-y-4">
            <Label htmlFor="destination" className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              {t("planner.route.destination.label")}
              <span className="text-primary font-black">*</span>
            </Label>
            <div className="relative">
              <input
                id="destination"
                placeholder={t("planner.route.destination.placeholder")}
                value={formData.destination}
                onChange={(e) => onChange({ destination: e.target.value })}
                className={`${inputClass} pl-14 border-primary/20 ${isDestinationMissing ? "border-red-400/40 focus:border-red-400" : ""}`}
                required
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
            {isDestinationMissing && <div className={requiredError}>{t("planner.route.requiredHint")}</div>}
          </div>
        </div>
      </div>

      <AnimatePresence>
        <motion.div 
          key="stage-fields"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${formData.routeType !== 'multiStage' ? "opacity-30 pointer-events-none" : ""}`}
        >
          <div className="space-y-4">
            <Label htmlFor="stageDestination1" className={`text-xs md:text-sm font-black uppercase tracking-[0.2em] ${formData.routeType !== 'multiStage' ? "text-white/40" : "text-white"}`}>
              {t("planner.route.stage.label", { num: 1 })}
            </Label>
            <div className="relative">
              <input
                id="stageDestination1"
                placeholder={t("planner.route.stage.placeholder")}
                value={formData.stageDestination1}
                onChange={(e) => onChange({ stageDestination1: e.target.value })}
                className={`${inputClass} pl-14`}
                disabled={formData.routeType !== 'multiStage'}
              />
              <Info className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 ${formData.routeType !== 'multiStage' ? "text-white/20" : "text-primary/30"}`} />
            </div>
            <div className="space-y-3">
              <Label htmlFor="stageArrivalTime1" className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${formData.routeType !== 'multiStage' ? "text-white/30" : "text-white/70"}`}>
                {t("planner.route.stage.arrivalTime", { num: 1 })}
              </Label>
              <div className="relative overflow-hidden rounded-2xl">
                <input
                  id="stageArrivalTime1"
                  type="time"
                  value={formData.stageArrivalTime1 || ''}
                  onChange={(e) => onChange({ stageArrivalTime1: e.target.value })}
                  className={`${timeInputClass} ${formData.routeType !== 'multiStage' ? "text-white/40" : ""}`}
                  style={timeInputStyle}
                  disabled={formData.routeType !== 'multiStage'}
                />
                {!formData.stageArrivalTime1 && (
                  <span className={`pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold ${formData.routeType !== 'multiStage' ? "text-white/20" : "text-white/55"}`}>
                    --:--
                  </span>
                )}
                <Clock className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none ${formData.routeType !== 'multiStage' ? "text-white/20" : "text-white/30"}`} />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Label htmlFor="stageDestination2" className={`text-xs md:text-sm font-black uppercase tracking-[0.2em] ${formData.routeType !== 'multiStage' ? "text-white/40" : "text-white"}`}>
              {t("planner.route.stage.label", { num: 2 })}
            </Label>
            <div className="relative">
              <input
                id="stageDestination2"
                placeholder={t("planner.route.stage.placeholder")}
                value={formData.stageDestination2}
                onChange={(e) => onChange({ stageDestination2: e.target.value })}
                className={`${inputClass} pl-14`}
                disabled={formData.routeType !== 'multiStage'}
              />
              <Info className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 ${formData.routeType !== 'multiStage' ? "text-white/20" : "text-primary/30"}`} />
            </div>
            <div className="space-y-3">
              <Label htmlFor="stageArrivalTime2" className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${formData.routeType !== 'multiStage' ? "text-white/30" : "text-white/70"}`}>
                {t("planner.route.stage.arrivalTime", { num: 2 })}
              </Label>
              <div className="relative overflow-hidden rounded-2xl">
                <input
                  id="stageArrivalTime2"
                  type="time"
                  value={formData.stageArrivalTime2 || ''}
                  onChange={(e) => onChange({ stageArrivalTime2: e.target.value })}
                  className={`${timeInputClass} ${formData.routeType !== 'multiStage' ? "text-white/40" : ""}`}
                  style={timeInputStyle}
                  disabled={formData.routeType !== 'multiStage'}
                />
                {!formData.stageArrivalTime2 && (
                  <span className={`pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold ${formData.routeType !== 'multiStage' ? "text-white/20" : "text-white/55"}`}>
                    --:--
                  </span>
                )}
                <Clock className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none ${formData.routeType !== 'multiStage' ? "text-white/20" : "text-white/30"}`} />
              </div>
            </div>
          </div>
        </motion.div>
        {formData.routeType !== 'multiStage' && (
          <motion.div 
            key="stage-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-black uppercase tracking-[0.2em] text-white/40"
          >
            {t("planner.route.stageHint")}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 sm:p-8 md:p-12 shadow-2xl space-y-10" style={glassPanelStyle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary" /> {departureLabel}
            </Label>
            <div className="relative">
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={handleStartDateChange}
                className={`${inputClass} pr-10 appearance-none min-h-[56px]`}
                style={{ colorScheme: 'dark' }}
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/40 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-secondary" /> {arrivalLabel}
            </Label>
            <div className="relative">
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => onChange({ endDate: e.target.value })}
                className={`${inputClass} pr-10 appearance-none min-h-[56px]`}
                style={{ colorScheme: 'dark' }}
                min={formData.startDate || undefined}
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              {t("planner.route.departureTime")}
            </Label>
            <div className="relative overflow-hidden rounded-2xl">
              <input
                type="time"
                value={formData.startTime || ''}
                onChange={(e) => onChange({ startTime: e.target.value })}
                className={timeInputClass}
                style={timeInputStyle}
              />
              {!formData.startTime && (
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold text-white/55">
                  --:--
                </span>
              )}
              <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/40 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              {t("planner.route.arrivalTime")}
            </Label>
            <div className="relative overflow-hidden rounded-2xl">
              <input
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => onChange({ endTime: e.target.value })}
                className={timeInputClass}
                style={timeInputStyle}
              />
              {!formData.endTime && (
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold text-white/55">
                  --:--
                </span>
              )}
              <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 rounded-2xl bg-white/5 border-2 border-white/10 p-5">
          <div className="space-y-1">
            <div className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white">
              {t("planner.route.flexibleDuration.label")}
            </div>
            <div className="text-white/60 text-sm">
              {t("planner.route.flexibleDuration.description")}
            </div>
          </div>
          <Switch
            checked={formData.durationFlexible}
            onCheckedChange={(checked) => onChange({ durationFlexible: checked })}
            aria-label={t("planner.route.flexibleDuration.label")}
            className="border-primary/80 data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(245,155,10,0.35)]"
          />
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

        <div className="pt-6">
          <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" /> {t("planner.route.travelPace.label")}
          </Label>
          <div className="text-white/60 text-xs font-semibold mb-4">
            {t("planner.route.travelPace.note")}
          </div>
          <ToggleGroup
            name="travelPace"
            options={[
              { value: 'short', label: t("planner.route.travelPace.options.short") },
              { value: 'balanced', label: t("planner.route.travelPace.options.balanced") },
              { value: 'long', label: t("planner.route.travelPace.options.long") },
            ]}
            selectedValues={formData.travelPace ? [formData.travelPace] : []}
            onChange={handlePaceChange}
            className="grid-cols-1 md:grid-cols-3"
          />
        </div>
      </div>

      <div className="space-y-4 text-left">
        <Label htmlFor="routeAdditionalInfo" className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 ml-4">
          <Info className="w-4 h-4 text-primary" /> {t("planner.route.additional.label")}
        </Label>
        <textarea
          id="routeAdditionalInfo"
          placeholder={t("planner.route.additional.placeholder")}
          value={formData.routeAdditionalInfo}
          onChange={(e) => onChange({ routeAdditionalInfo: e.target.value })}
          rows={4}
          className={`${inputClass} min-h-[150px] p-6 sm:p-8 resize-none`}
        />
      </div>
    </div>
  );
}
