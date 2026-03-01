import { FormData, RouteStage } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup } from "./ToggleGroup";
import { Switch } from "@/components/ui/switch";
import { FormSlider } from "./FormSlider";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Map, MapPin, Calendar, Compass, Info, ArrowRight, Sparkles, Clock, Plus, Trash2, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RouteSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

const createEmptyStage = (): RouteStage => ({
  destination: "",
  arrivalDate: "",
  arrivalTime: "",
});

export function RouteSection({ formData, onChange }: RouteSectionProps) {
  const { t } = useTranslation();
  const isVacationRoute = formData.destinationStayPlanned && (formData.routeType === "return" || formData.routeType === "roundTrip");
  const isStageTrip = formData.routeType === "multiStage";

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
  const timeInputStyle = {
    colorScheme: "dark" as const,
    WebkitTextFillColor: "rgba(255,255,255,0.95)",
  };

  const isStartMissing = !formData.startPoint?.trim();
  const isDestinationMissing = !formData.destination?.trim();
  const isVacationDestinationMissing = isVacationRoute && !formData.vacationDestination?.trim();

  const routeTypeLabel = t(`planner.route.type.options.${formData.routeType || "oneWay"}`);
  const destinationFieldLabel = isVacationRoute ? t("planner.route.returnDestination.label") : t("planner.route.destination.label");
  const destinationFieldPlaceholder = isVacationRoute ? t("planner.route.returnDestination.placeholder") : t("planner.route.destination.placeholder");
  const startDateLabel = isVacationRoute ? t("planner.route.vacationArrival") : (formData.startPoint?.trim() ? `${t("planner.route.departure")} (${formData.startPoint.trim()})` : t("planner.route.departure"));
  const endDateLabel = isVacationRoute ? t("planner.route.vacationDeparture") : (formData.destination?.trim() ? `${t("planner.route.arrival")} (${formData.destination.trim()})` : t("planner.route.arrival"));
  const startTimeLabel = isVacationRoute ? t("planner.route.vacationArrivalTime") : t("planner.route.departureTime");
  const endTimeLabel = isVacationRoute ? t("planner.route.vacationDepartureTime") : t("planner.route.arrivalTime");

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    onChange({
      startDate: newStartDate,
      endDate: !formData.endDate || newStartDate > formData.endDate ? newStartDate : formData.endDate,
    });
  };

  const handleRouteTypeChange = (value: string) => {
    const isReturnType = value === "return" || value === "roundTrip";
    const isMultiStage = value === "multiStage";
    const nextStart = formData.startPoint;
    onChange({
      routeType: value,
      destinationStayPlanned: isReturnType ? formData.destinationStayPlanned : false,
      destination: isReturnType ? (formData.destination || nextStart) : formData.destination,
      returnDestination: isReturnType ? (formData.returnDestination || formData.destination || nextStart) : formData.returnDestination,
      vacationDestination: isReturnType ? formData.vacationDestination : "",
      stages: isMultiStage ? (formData.stages.length > 0 ? formData.stages : [createEmptyStage()]) : [],
    });
  };

  const handleGpxToggle = (_name: string, value: string, checked: boolean) => {
    const current = formData.gpxOutputMode || [];
    const next = checked ? [...current, value] : current.filter((v) => v !== value);
    onChange({ gpxOutputMode: next });
  };

  const handlePaceChange = (_name: string, value: string, checked: boolean) => {
    onChange({ travelPace: checked ? value : "" });
  };

  const updateStage = (index: number, patch: Partial<RouteStage>) => {
    const nextStages = formData.stages.map((stage, currentIndex) =>
      currentIndex === index ? { ...stage, ...patch } : stage
    );
    onChange({ stages: nextStages });
  };

  const addStage = () => {
    onChange({ stages: [...formData.stages, createEmptyStage()] });
  };

  const removeStage = (index: number) => {
    onChange({ stages: formData.stages.filter((_, currentIndex) => currentIndex !== index) });
  };

  const buildStageLabel = (baseKey: string, index: number, destination?: string) => {
    const baseLabel = t(baseKey, { num: index + 1 });
    const trimmed = destination?.trim();
    return trimmed ? `${baseLabel} (${trimmed})` : baseLabel;
  };

  const handleDestinationStayToggle = (checked: boolean) => {
    onChange({
      destinationStayPlanned: checked,
      vacationDestination: checked ? formData.vacationDestination : "",
      destination: checked ? (formData.destination || formData.returnDestination || formData.startPoint) : formData.destination,
      returnDestination: checked ? (formData.returnDestination || formData.destination || formData.startPoint) : formData.returnDestination,
    });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
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
              <Home className="w-4 h-4 text-primary" />
              {destinationFieldLabel}
              <span className="text-primary font-black">*</span>
            </Label>
            <div className="relative">
              <input
                id="destination"
                placeholder={destinationFieldPlaceholder}
                value={formData.destination}
                onChange={(e) => {
                  const value = e.target.value;
                  onChange({
                    destination: value,
                    returnDestination: isVacationRoute ? value : formData.returnDestination,
                  });
                }}
                className={`${inputClass} pl-14 border-primary/20 ${isDestinationMissing ? "border-red-400/40 focus:border-red-400" : ""}`}
                required
              />
              <Home className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-primary/40" />
            </div>
            {isDestinationMissing && <div className={requiredError}>{t("planner.route.requiredHint")}</div>}
          </div>

        </div>

        <div className="space-y-6 p-6 sm:p-10 shadow-2xl" style={glassPanelStyle}>
          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" /> {t("planner.route.type.label")}
            </Label>
            <Select value={formData.routeType} onValueChange={handleRouteTypeChange}>
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
      </div>

      {(formData.routeType === "return" || formData.routeType === "roundTrip") && (
        <div className="space-y-6 rounded-2xl bg-white/5 border-2 border-white/10 p-5">
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white">
                {t("planner.route.destinationStay.label")}
              </div>
              <div className="text-white/60 text-sm">
                {t("planner.route.destinationStay.description")}
              </div>
            </div>
            <Switch
              checked={formData.destinationStayPlanned}
              onCheckedChange={handleDestinationStayToggle}
              aria-label={t("planner.route.destinationStay.label")}
              className="border-primary/80 data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(245,155,10,0.35)]"
            />
          </div>
          {isVacationRoute && (
            <div className="space-y-4">
              <Label htmlFor="vacationDestination" className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                {t("planner.route.vacationDestination.label")}
                <span className="text-primary font-black">*</span>
              </Label>
              <div className="relative">
                <input
                  id="vacationDestination"
                  placeholder={t("planner.route.vacationDestination.placeholder")}
                  value={formData.vacationDestination}
                  onChange={(e) => onChange({ vacationDestination: e.target.value })}
                  className={`${inputClass} pl-14 ${isVacationDestinationMissing ? "border-red-400/40 focus:border-red-400" : ""}`}
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              </div>
              {isVacationDestinationMissing && <div className={requiredError}>{t("planner.route.requiredHint")}</div>}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isStageTrip && (
        <motion.div
          key="stage-fields"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className={`text-xs md:text-sm font-black uppercase tracking-[0.2em] ${!isStageTrip ? "text-white/40" : "text-white"}`}>
                {t("planner.route.stages.title")}
              </div>
              <div className={`text-sm ${!isStageTrip ? "text-white/30" : "text-white/60"}`}>
                {t("planner.route.stages.description")}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addStage}
              disabled={!isStageTrip || formData.stages.length >= 4}
              className="rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("planner.route.stages.add")}
            </Button>
          </div>

          {formData.stages.length === 0 && isStageTrip && (
            <div className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
              {t("planner.route.stages.empty")}
            </div>
          )}

          {formData.stages.map((stage, index) => (
            <div key={index} className="p-6 sm:p-8 rounded-3xl bg-white/5 border-2 border-white/10 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white">
                  {t("planner.route.stage.label", { num: index + 1 })}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeStage(index)}
                  disabled={!isStageTrip}
                  className="rounded-xl text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("planner.route.stages.remove")}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    id={`stageDestination-${index}`}
                    placeholder={t("planner.route.stage.placeholder")}
                    value={stage.destination}
                    onChange={(e) => updateStage(index, { destination: e.target.value })}
                    className={`${inputClass} pl-14`}
                    disabled={!isStageTrip}
                  />
                  <Info className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 ${!isStageTrip ? "text-white/20" : "text-primary/30"}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor={`stageArrivalDate-${index}`} className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/70">
                    {buildStageLabel("planner.route.stage.arrivalDate", index, stage.destination)}
                  </Label>
                  <div className="relative">
                    <input
                      id={`stageArrivalDate-${index}`}
                      type="date"
                      value={stage.arrivalDate || ""}
                      onChange={(e) => updateStage(index, { arrivalDate: e.target.value })}
                      className={`${inputClass} pr-10 appearance-none min-h-[56px]`}
                      style={{ colorScheme: "dark" }}
                      disabled={!isStageTrip}
                    />
                    <Calendar className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none ${!isStageTrip ? "text-white/20" : "text-white/30"}`} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor={`stageArrivalTime-${index}`} className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/70">
                    {buildStageLabel("planner.route.stage.arrivalTime", index, stage.destination)}
                  </Label>
                  <div className="relative overflow-hidden rounded-2xl">
                    <input
                      id={`stageArrivalTime-${index}`}
                      type="time"
                      value={stage.arrivalTime || ""}
                      onChange={(e) => updateStage(index, { arrivalTime: e.target.value })}
                      className={`peer ${timeInputClass} ${!stage.arrivalTime ? "time-empty" : ""}`}
                      style={timeInputStyle}
                    />
                    {!stage.arrivalTime && (
                      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold text-white/55 peer-focus:hidden">
                        --:--
                      </span>
                    )}
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none text-white/30" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 sm:p-8 md:p-12 shadow-2xl space-y-10" style={glassPanelStyle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary" /> {startDateLabel}
            </Label>
            <div className="relative">
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={handleStartDateChange}
                className={`${inputClass} pr-10 appearance-none min-h-[56px]`}
                style={{ colorScheme: "dark" }}
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/40 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-secondary" /> {endDateLabel}
            </Label>
            <div className="relative">
              <input
                type="date"
                value={formData.endDate || ""}
                onChange={(e) => onChange({ endDate: e.target.value })}
                className={`${inputClass} pr-10 appearance-none min-h-[56px]`}
                style={{ colorScheme: "dark" }}
                min={formData.startDate || undefined}
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              {startTimeLabel}
            </Label>
            <div className="relative overflow-hidden rounded-2xl">
              <input
                type="time"
                value={formData.startTime || ""}
                onChange={(e) => onChange({ startTime: e.target.value })}
                className={`peer ${timeInputClass} ${!formData.startTime ? "time-empty" : ""}`}
                style={timeInputStyle}
              />
              {!formData.startTime && (
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold text-white/55 peer-focus:hidden">
                  --:--
                </span>
              )}
              <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/40 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              {endTimeLabel}
            </Label>
            <div className="relative overflow-hidden rounded-2xl">
              <input
                type="time"
                value={formData.endTime || ""}
                onChange={(e) => onChange({ endTime: e.target.value })}
                className={`peer ${timeInputClass} ${!formData.endTime ? "time-empty" : ""}`}
                style={timeInputStyle}
              />
              {!formData.endTime && (
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold text-white/55 peer-focus:hidden">
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
              { value: "short", label: t("planner.route.travelPace.options.short") },
              { value: "balanced", label: t("planner.route.travelPace.options.balanced") },
              { value: "long", label: t("planner.route.travelPace.options.long") },
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
