import { FormData, RouteStage } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { ToggleGroup } from "./ToggleGroup";
import { Switch } from "@/components/ui/switch";
import { FormSlider } from "./FormSlider";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Map, MapPin, Calendar, Info, Sparkles, Plus, Trash2, Home, Route, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RouteSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

const createEmptyStage = (): RouteStage => ({
  destination: "",
  booked: false,
  detailsEnabled: false,
  arrivalDate: "",
  arrivalTime: "",
  departureDate: "",
  departureTime: "",
});

export function RouteSection({ formData, onChange }: RouteSectionProps) {
  const { t } = useTranslation();

  const glassPanelStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "2.5rem",
  };

  const inputClass = "w-full h-12 sm:h-14 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-white/5 border-2 border-white/10 backdrop-blur-md shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-sm sm:text-base md:text-lg text-white placeholder:text-white/60 placeholder:font-normal text-left";
  const timeInputClass = `${inputClass} pr-12 min-h-[56px]`;
  const fieldLabelClass = "text-xs md:text-sm font-semibold tracking-[0.04em] text-white flex items-center gap-2";
  const fieldLabelIconSlotClass = "inline-flex w-4 h-4 items-center justify-center shrink-0";
  const requiredError = "text-[10px] font-semibold tracking-[0.08em] text-red-400";
  const clearValueClass = "mt-2 inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.08em] text-white/60 hover:text-white transition-colors";
  const timeInputStyle = {
    colorScheme: "dark" as const,
    WebkitTextFillColor: "rgba(255,255,255,0.95)",
  };

  const maxDailyDistance = Number(formData.maxDailyDistance || 0);
  const maxDailyDriveHours = Number(formData.maxDailyDriveHours || 0);
  const showLimitPriority = maxDailyDistance > 0 && maxDailyDriveHours > 0;
  const isStartMissing = !formData.startPoint?.trim();
  const isDestinationMissing = !formData.destination?.trim();
  const hasStages = formData.stages.length > 0;

  const formatDriveHours = (hours: number) => {
    const totalMinutes = Math.round(hours * 60);
    const displayHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${displayHours}:${String(minutes).padStart(2, "0")}`;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    onChange({
      startDate: newStartDate,
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
    const nextStages = formData.stages.map((stage, currentIndex) => {
      if (currentIndex !== index) return stage;
      const nextStage = { ...stage, ...patch };
      if (patch.detailsEnabled === false) {
        nextStage.arrivalDate = "";
        nextStage.arrivalTime = "";
        nextStage.departureDate = "";
        nextStage.departureTime = "";
      }
      return nextStage;
    });
    onChange({ stages: nextStages });
  };

  const addStage = () => {
    onChange({ stages: [...formData.stages, createEmptyStage()] });
  };

  const removeStage = (index: number) => {
    onChange({ stages: formData.stages.filter((_, currentIndex) => currentIndex !== index) });
  };

  const buildStopLabel = (baseKey: string, index: number, destination?: string) => {
    const baseLabel = t(baseKey, { num: index + 1 });
    const trimmed = destination?.trim();
    return trimmed ? `${baseLabel} (${trimmed})` : baseLabel;
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4 text-left">
        <h3 className="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight text-left text-white">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Map className="w-6 h-6" />
          </div>
          {t("planner.route.title")}
        </h3>
        <p className="text-white/60 text-lg leading-relaxed italic">
          {t("planner.route.description")}
        </p>
      </div>

      <div className="p-6 sm:p-8 md:p-10 shadow-2xl space-y-6" style={glassPanelStyle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label htmlFor="startPoint" className={fieldLabelClass}>
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
                className={`${inputClass} pl-12 sm:pl-14 ${isStartMissing ? "border-red-400/40 focus:border-red-400" : ""}`}
                required
              />
              <MapPin className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary/40" />
            </div>
            {isStartMissing && <div className={requiredError}>{t("planner.route.requiredHint")}</div>}
          </div>

          <div className="space-y-4">
            <Label htmlFor="destination" className={fieldLabelClass}>
              <Home className="w-4 h-4 text-primary" />
              {t("planner.route.destination.label")}
              <span className="text-primary font-black">*</span>
            </Label>
            <div className="relative">
              <input
                id="destination"
                placeholder={t("planner.route.destination.placeholder")}
                value={formData.destination}
                onChange={(e) => onChange({ destination: e.target.value })}
                className={`${inputClass} pl-12 sm:pl-14 border-primary/20 ${isDestinationMissing ? "border-red-400/40 focus:border-red-400" : ""}`}
                required
              />
              <Home className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary/40" />
            </div>
            {isDestinationMissing && <div className={requiredError}>{t("planner.route.requiredHint")}</div>}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Label htmlFor="targetRegions" className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white flex items-center gap-2">
            <Map className="w-4 h-4 text-primary" /> {t("planner.route.targetRegions.label")}
          </Label>
          <p className="text-white/50 text-sm leading-relaxed">
            {t("planner.route.targetRegions.hint")}
          </p>
          <textarea
            id="targetRegions"
            placeholder={t("planner.route.targetRegions.placeholder")}
            value={formData.targetRegions}
            onChange={(e) => onChange({ targetRegions: e.target.value })}
            rows={3}
            className={`${inputClass} min-h-[110px] sm:min-h-[130px] p-4 sm:p-8 resize-none`}
          />
        </div>

        <div className="flex items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-white/5 border-2 border-white/10 p-4 sm:p-5">
          <div className="space-y-1">
            <div className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white">
              {t("planner.route.preferScenicLongerStops.label")}
            </div>
            <div className="text-white/60 text-sm">
              {t("planner.route.preferScenicLongerStops.description")}
            </div>
          </div>
          <Switch
            checked={formData.preferScenicLongerStops}
            onCheckedChange={(checked) => onChange({ preferScenicLongerStops: checked })}
            aria-label={t("planner.route.preferScenicLongerStops.label")}
            className="border-primary/80 data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(255,128,0,0.35)]"
          />
        </div>
      </div>

      <div className="p-6 sm:p-8 md:p-12 shadow-2xl space-y-10" style={glassPanelStyle}>
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className={fieldLabelClass}>
                  <span className={fieldLabelIconSlotClass}>
                    <Calendar className="w-4 h-4 text-primary" />
                  </span>
                  {t("planner.route.departure")} {formData.startPoint?.trim() ? `(${formData.startPoint.trim()})` : ""}
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
                {formData.startDate && (
                  <button type="button" className={clearValueClass} onClick={() => onChange({ startDate: "" })}>
                    <X className="w-3 h-3" />
                    {t("planner.summary.save.clear")}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <Label className={fieldLabelClass}>
                  <span className={fieldLabelIconSlotClass}>
                    <Calendar className="w-4 h-4 text-primary" />
                  </span>
                  {t("planner.route.arrival")} {formData.destination?.trim() ? `(${formData.destination.trim()})` : ""}
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
                {formData.endDate && (
                  <button type="button" className={clearValueClass} onClick={() => onChange({ endDate: "" })}>
                    <X className="w-3 h-3" />
                    {t("planner.summary.save.clear")}
                  </button>
                )}
              </div>
            </div>

          </div>

          <div className="space-y-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-white/5 border-2 border-white/10 p-4 sm:p-5">
              <div className="space-y-1">
                <div className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white">
                  {t("planner.route.destinationDetails.label")}
                </div>
                <div className="text-white/60 text-sm">
                  {t("planner.route.destinationDetails.description")}
                </div>
              </div>
              <Switch
                checked={formData.destinationDetailsEnabled}
                onCheckedChange={(checked) => onChange({
                  destinationDetailsEnabled: checked,
                  startTime: checked ? formData.startTime : "",
                  endTime: checked ? formData.endTime : "",
                })}
                aria-label={t("planner.route.destinationDetails.label")}
                className="border-primary/80 data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(255,128,0,0.35)]"
              />
            </div>

            {formData.destinationDetailsEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className={fieldLabelClass}>
                    <span className={fieldLabelIconSlotClass} aria-hidden="true" />
                    {t("planner.route.departureTime")} {formData.startPoint?.trim() ? `(${formData.startPoint.trim()})` : ""}
                  </Label>
                  <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                    <input
                      id="startTime"
                      type="time"
                      value={formData.startTime || ""}
                      onChange={(e) => onChange({ startTime: e.target.value })}
                      className={`peer ${timeInputClass} ${!formData.startTime ? "time-empty" : ""}`}
                      style={timeInputStyle}
                      step={300}
                    />
                    {!formData.startTime && <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold text-white/55 peer-focus:hidden">--:--</span>}
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/40 pointer-events-none" />
                  </div>
                  {formData.startTime && (
                    <button type="button" className={clearValueClass} onClick={() => onChange({ startTime: "" })}>
                      <X className="w-3 h-3" />
                      {t("planner.summary.save.clear")}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className={fieldLabelClass}>
                    <span className={fieldLabelIconSlotClass} aria-hidden="true" />
                    {t("planner.route.arrivalTime")} {formData.destination?.trim() ? `(${formData.destination.trim()})` : ""}
                  </Label>
                  <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                    <input
                      id="endTime"
                      type="time"
                      value={formData.endTime || ""}
                      onChange={(e) => onChange({ endTime: e.target.value })}
                      className={`peer ${timeInputClass} ${!formData.endTime ? "time-empty" : ""}`}
                      style={timeInputStyle}
                      step={300}
                    />
                    {!formData.endTime && <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold text-white/55 peer-focus:hidden">--:--</span>}
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/40 pointer-events-none" />
                  </div>
                  {formData.endTime && (
                    <button type="button" className={clearValueClass} onClick={() => onChange({ endTime: "" })}>
                      <X className="w-3 h-3" />
                      {t("planner.summary.save.clear")}
                    </button>
                  )}
                </div>

              </div>
            )}

            <div className="flex items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-white/5 border-2 border-white/10 p-4 sm:p-5">
              <div className="space-y-1">
                <div className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white">
                  {t("planner.route.destinationBooked.label")} {formData.destination?.trim() ? `(${formData.destination.trim()})` : ""}
                </div>
                <div className="text-white/60 text-sm">
                  {t("planner.route.destinationBooked.description")}
                </div>
              </div>
              <Switch
                checked={!!formData.destinationBooked}
                onCheckedChange={(checked) => onChange({ destinationBooked: checked })}
                aria-label={t("planner.route.destinationBooked.label")}
                className="border-primary/80 data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(255,128,0,0.35)]"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {formData.stages.map((stage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="p-6 sm:p-8 rounded-3xl bg-white/5 border-2 border-white/10 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white">
                  {t("planner.route.stage.label", { num: index + 1 })}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeStage(index)}
                  className="self-start sm:self-auto rounded-xl text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("planner.route.stages.remove")}
                </Button>
              </div>

              <div className="space-y-4">
                {!stage.destination?.trim() && <div className={requiredError}>{t("planner.route.requiredHint")}</div>}
                <div className="relative">
                  <input
                    id={`stageDestination-${index}`}
                    placeholder={t("planner.route.stage.placeholder")}
                    value={stage.destination}
                    onChange={(e) => updateStage(index, { destination: e.target.value })}
                    className={`${inputClass} pl-12 sm:pl-14 ${!stage.destination?.trim() ? "border-red-400/40 focus:border-red-400" : ""}`}
                  />
                  <Route className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary/30" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-white/5 border-2 border-white/10 p-4 sm:p-5">
                <div className="space-y-1">
                  <div className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white">
                    {buildStopLabel("planner.route.stage.detailsLabel", index, stage.destination)}
                  </div>
                  <div className="text-white/60 text-sm">
                    {t("planner.route.stage.detailsDescription")}
                  </div>
                </div>
                <Switch
                  checked={!!stage.detailsEnabled}
                  onCheckedChange={(checked) => updateStage(index, { detailsEnabled: checked })}
                  aria-label={buildStopLabel("planner.route.stage.detailsLabel", index, stage.destination)}
                  className="border-primary/80 data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(255,128,0,0.35)]"
                />
              </div>

              <div className="flex items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-white/5 border-2 border-white/10 p-4 sm:p-5">
                <div className="space-y-1">
                  <div className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white">
                    {buildStopLabel("planner.route.stage.bookedLabel", index, stage.destination)}
                  </div>
                  <div className="text-white/60 text-sm">
                    {t("planner.route.stage.bookedDescription")}
                  </div>
                </div>
                <Switch
                  checked={!!stage.booked}
                  onCheckedChange={(checked) => updateStage(index, { booked: checked })}
                  aria-label={buildStopLabel("planner.route.stage.bookedLabel", index, stage.destination)}
                  className="border-primary/80 data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(255,128,0,0.35)]"
                />
              </div>

              {stage.detailsEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor={`stageArrivalDate-${index}`} className="text-[10px] md:text-xs font-semibold tracking-[0.08em] text-white/70">
                      {buildStopLabel("planner.route.stage.arrivalDate", index, stage.destination)}
                    </Label>
                    <div className="relative">
                      <input
                        id={`stageArrivalDate-${index}`}
                        type="date"
                        value={stage.arrivalDate || ""}
                        onChange={(e) => updateStage(index, { arrivalDate: e.target.value })}
                        className={`${inputClass} pr-10 appearance-none min-h-[56px]`}
                        style={{ colorScheme: "dark" }}
                        min={
                          index === 0
                            ? (formData.startDate || undefined)
                            : (formData.stages[index - 1]?.departureDate || formData.stages[index - 1]?.arrivalDate || formData.startDate || undefined)
                        }
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none text-white/30" />
                    </div>
                    {stage.arrivalDate && (
                      <button type="button" className={clearValueClass} onClick={() => updateStage(index, { arrivalDate: "" })}>
                        <X className="w-3 h-3" />
                        {t("planner.summary.save.clear")}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor={`stageArrivalTime-${index}`} className="text-[10px] md:text-xs font-semibold tracking-[0.08em] text-white/70">
                      {buildStopLabel("planner.route.stage.arrivalTime", index, stage.destination)}
                    </Label>
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                      <input
                        id={`stageArrivalTime-${index}`}
                        type="time"
                        value={stage.arrivalTime || ""}
                        onChange={(e) => updateStage(index, { arrivalTime: e.target.value })}
                        className={`peer ${timeInputClass} ${!stage.arrivalTime ? "time-empty" : ""}`}
                        style={timeInputStyle}
                        step={300}
                      />
                      {!stage.arrivalTime && <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold text-white/55 peer-focus:hidden">--:--</span>}
                      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none text-white/30" />
                    </div>
                    {stage.arrivalTime && (
                      <button type="button" className={clearValueClass} onClick={() => updateStage(index, { arrivalTime: "" })}>
                        <X className="w-3 h-3" />
                        {t("planner.summary.save.clear")}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor={`stageDepartureDate-${index}`} className="text-[10px] md:text-xs font-semibold tracking-[0.08em] text-white/70">
                      {buildStopLabel("planner.route.stage.departureDate", index, stage.destination)}
                    </Label>
                    <div className="relative">
                      <input
                        id={`stageDepartureDate-${index}`}
                        type="date"
                        value={stage.departureDate || ""}
                        onChange={(e) => updateStage(index, { departureDate: e.target.value })}
                        className={`${inputClass} pr-10 appearance-none min-h-[56px]`}
                        style={{ colorScheme: "dark" }}
                        min={
                          stage.arrivalDate ||
                          (index === 0
                            ? (formData.startDate || undefined)
                            : (formData.stages[index - 1]?.departureDate || formData.stages[index - 1]?.arrivalDate || formData.startDate || undefined))
                        }
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none text-white/30" />
                    </div>
                    {stage.departureDate && (
                      <button type="button" className={clearValueClass} onClick={() => updateStage(index, { departureDate: "" })}>
                        <X className="w-3 h-3" />
                        {t("planner.summary.save.clear")}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor={`stageDepartureTime-${index}`} className="text-[10px] md:text-xs font-semibold tracking-[0.08em] text-white/70">
                      {buildStopLabel("planner.route.stage.departureTime", index, stage.destination)}
                    </Label>
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                      <input
                        id={`stageDepartureTime-${index}`}
                        type="time"
                        value={stage.departureTime || ""}
                        onChange={(e) => updateStage(index, { departureTime: e.target.value })}
                        className={`peer ${timeInputClass} ${!stage.departureTime ? "time-empty" : ""}`}
                        style={timeInputStyle}
                        step={300}
                      />
                      {!stage.departureTime && <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold text-white/55 peer-focus:hidden">--:--</span>}
                      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none text-white/30" />
                    </div>
                    {stage.departureTime && (
                      <button type="button" className={clearValueClass} onClick={() => updateStage(index, { departureTime: "" })}>
                        <X className="w-3 h-3" />
                        {t("planner.summary.save.clear")}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={addStage}
            className="w-full sm:w-auto justify-center rounded-xl sm:rounded-2xl border-2 border-primary/60 bg-white/5 hover:bg-primary/10 hover:border-primary text-white font-black text-sm sm:text-base shadow-[0_0_0_1px_rgba(255,128,0,0.22)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("planner.route.stages.addSimple")}
          </Button>
        </div>
      </div>

      <div className="p-5 sm:p-6 md:p-8 shadow-2xl space-y-6" style={glassPanelStyle}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <FormSlider
            id="maxDailyDistance"
            label={t("planner.route.maxDistance")}
            value={maxDailyDistance}
            min={0}
            max={1000}
            step={50}
            unit="km"
            onChange={(value) => onChange({ maxDailyDistance: value.toString() })}
          />

          <FormSlider
            id="maxDailyDriveHours"
            label={t("planner.route.maxDriveTime")}
            value={maxDailyDriveHours}
            min={0}
            max={8}
            step={0.5}
            unit="h"
            formatValue={formatDriveHours}
            formatBound={formatDriveHours}
            onChange={(value) => onChange({ maxDailyDriveHours: value.toString() })}
          />
        </div>

        {showLimitPriority && (
          <div className="space-y-3">
            <Label className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              {t("planner.route.limitPriority.label")}
            </Label>
            <div className="text-white/60 text-sm">
              {t("planner.route.limitPriority.description")}
            </div>
            <ToggleGroup
              name="dailyLimitPriority"
              options={[
                { value: "distance", label: t("planner.route.limitPriority.options.distance") },
                { value: "time", label: t("planner.route.limitPriority.options.time") },
              ]}
              selectedValues={formData.dailyLimitPriority ? [formData.dailyLimitPriority] : []}
              onChange={(_name, value, checked) => onChange({ dailyLimitPriority: checked ? value : "" })}
              className="grid-cols-1 md:grid-cols-2"
            />
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> {t("planner.route.travelPace.label")}
          </Label>
          <div className="text-white/60 text-xs font-semibold">
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

        <div className="space-y-3">
          <Label className={fieldLabelClass}>
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
            className="grid-cols-1 md:grid-cols-2"
          />
        </div>
      </div>

      <div className="space-y-4 text-left">
        <Label htmlFor="routeAdditionalInfo" className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white flex items-center gap-2 ml-4">
          <Info className="w-4 h-4 text-primary" /> {t("planner.route.additional.label")}
        </Label>
        <textarea
          id="routeAdditionalInfo"
          placeholder={t("planner.route.additional.placeholder")}
          value={formData.routeAdditionalInfo}
          onChange={(e) => onChange({ routeAdditionalInfo: e.target.value })}
          rows={4}
          className={`${inputClass} min-h-[130px] sm:min-h-[150px] p-4 sm:p-8 resize-none`}
        />
      </div>
    </div>
  );
}
