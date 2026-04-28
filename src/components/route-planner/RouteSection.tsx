import { FormData, RouteStage } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { BadgeToggleGroup } from "./BadgeToggleGroup";
import { Switch } from "@/components/ui/switch";
import { FormSlider } from "./FormSlider";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Map as MapIcon, MapPin, Calendar, Info, Sparkles, Plus, Trash2, Home, Route, Clock, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface RouteSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

const createEmptyStage = (destination = ""): RouteStage => ({
  destination,
  booked: false,
  detailsEnabled: false,
  arrivalDate: "",
  arrivalTime: "",
  departureDate: "",
  departureTime: "",
});

const getStageMinimumDate = (stages: RouteStage[], index: number, startDate: string) => {
  if (index === 0) return startDate;
  return stages[index - 1]?.departureDate || stages[index - 1]?.arrivalDate || startDate;
};

const normalizeStageDates = (stages: RouteStage[], startDate: string) => {
  return stages.map((stage, index, currentStages) => {
    if (!stage.detailsEnabled) {
      return stage;
    }

    const minimumDate = getStageMinimumDate(currentStages, index, startDate);
    const nextStage = { ...stage };

    if (minimumDate) {
      if (nextStage.arrivalDate && nextStage.arrivalDate < minimumDate) {
        nextStage.arrivalDate = minimumDate;
      }
    }

    const departureMinimumDate = nextStage.arrivalDate || minimumDate;
    if (departureMinimumDate) {
      if (nextStage.departureDate && nextStage.departureDate < departureMinimumDate) {
        nextStage.departureDate = departureMinimumDate;
      }
    }

    return nextStage;
  });
};

export function RouteSection({ formData, onChange }: RouteSectionProps) {
  const { t } = useTranslation();
  const locale = (typeof navigator !== "undefined" && navigator.language) || "de-DE";

  const inputClass = "w-full h-11 sm:h-12 px-4 rounded-xl transition-all outline-none font-bold text-sm text-foreground dark:text-white placeholder:font-normal text-left bg-white/40 border border-slate-200 dark:bg-white/5 dark:border-white/10";
  const timeInputClass = `${inputClass} pr-10`;
  const fieldLabelClass = "text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50 flex items-center gap-2 mb-2";
  const requiredError = "text-[10px] font-semibold tracking-[0.04em] text-red-400 mt-1";
  const clearValueClass = "mt-2 inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.04em] text-foreground/55 hover:text-foreground transition-colors dark:text-white/60 dark:hover:text-white";
  const switchClass = "border-primary/85 data-[state=checked]:bg-primary/15 data-[state=unchecked]:bg-white/95 dark:data-[state=unchecked]:bg-white/10 dark:data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(255,128,0,0.22)]";
  const glassPanelStyle = undefined;

  const maxDailyDistance = Number(formData.maxDailyDistance || 0);
  const maxDailyDriveHours = Number(formData.maxDailyDriveHours || 0);
  const showLimitPriority = maxDailyDistance > 0 && maxDailyDriveHours > 0;

  const formatDriveHours = (hours: number) => {
    const totalMinutes = Math.round(hours * 60);
    const displayHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${displayHours}:${String(minutes).padStart(2, "0")}`;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    const nextEndDate = formData.endDate && formData.endDate < newStartDate ? newStartDate : formData.endDate;
    const nextStages = normalizeStageDates(formData.stages, newStartDate);

    onChange({
      startDate: newStartDate,
      endDate: nextEndDate,
      stages: nextStages,
    });
  };

  const handleGpxToggle = (_name: string, value: string, checked: boolean) => {
    const current = formData.gpxOutputMode || [];
    const next = checked ? [...current, value] : current.filter((v) => v !== value);
    onChange({ gpxOutputMode: next });
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
    const normalizedStages = normalizeStageDates(nextStages, formData.startDate);
    const latestStageDate = normalizedStages.reduce<string>((latest, stage) => {
      const candidate = stage.departureDate || stage.arrivalDate || "";
      if (!candidate) return latest;
      return !latest || candidate > latest ? candidate : latest;
    }, "");

    onChange({
      stages: normalizedStages,
      endDate:
        formData.endDate && latestStageDate && latestStageDate > formData.endDate
          ? latestStageDate
          : formData.endDate,
    });
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
    <div className="space-y-8">
      {/* Start & Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
          <Label htmlFor="startPoint" className={fieldLabelClass}>
            <MapPin className="w-4 h-4 text-primary" />
            {t("planner.route.start.label")}
            <span className="text-primary font-black">*</span>
          </Label>
          <div className="relative w-full">
            <input
              id="startPoint"
              placeholder={t("planner.route.start.placeholder")}
              value={formData.startPoint}
              onChange={(e) => onChange({ startPoint: e.target.value })}
              className={cn(inputClass, "pl-10", !formData.startPoint && "border-red-400/40")}
              required
            />
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          </div>
          {!formData.startPoint && <div className={requiredError}>{t("planner.route.requiredHint")}</div>}
        </div>

        <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
          <Label htmlFor="destination" className={fieldLabelClass}>
            <Home className="w-4 h-4 text-primary" />
            {t("planner.route.destination.label")}
            <span className="text-primary font-black">*</span>
          </Label>
          <div className="relative w-full">
            <input
              id="destination"
              placeholder={t("planner.route.destination.placeholder")}
              value={formData.destination}
              onChange={(e) => onChange({ destination: e.target.value })}
              className={cn(inputClass, "pl-10", !formData.destination && "border-red-400/40")}
              required
            />
            <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          </div>
          {!formData.destination && <div className={requiredError}>{t("planner.route.requiredHint")}</div>}
        </div>
      </div>

      {/* Dates & Times */}
      <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.route.departure")} · {t("planner.route.arrival")}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={fieldLabelClass}>{t("planner.route.departure")}</Label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.startDate || ""}
                  onChange={handleStartDateChange}
                  className={cn(inputClass, "pr-10")}
                />
                <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/35 pointer-events-none" />
              </div>
              {formData.startDate && (
                <button type="button" className={clearValueClass} onClick={() => onChange({ startDate: "" })}>
                  <X className="w-3 h-3" /> {t("planner.summary.save.clear")}
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className={fieldLabelClass}>{t("planner.route.arrival")}</Label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) => onChange({ endDate: e.target.value })}
                  className={cn(inputClass, "pr-10")}
                  min={formData.startDate || undefined}
                />
                <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/35 pointer-events-none" />
              </div>
              {formData.endDate && (
                <button type="button" className={clearValueClass} onClick={() => onChange({ endDate: "" })}>
                  <X className="w-3 h-3" /> {t("planner.summary.save.clear")}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 md:pl-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-foreground dark:text-white">{t("planner.route.destinationDetails.label")}</div>
                <div className="text-[11px] text-foreground/60 dark:text-white/50">{t("planner.route.destinationDetails.description")}</div>
              </div>
              <Switch
                checked={formData.destinationDetailsEnabled}
                onCheckedChange={(checked) => onChange({ destinationDetailsEnabled: checked })}
                className={switchClass}
              />
            </div>

            {formData.destinationDetailsEnabled && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <Label className={cn(fieldLabelClass, "mb-0")}>{t("planner.route.departureTime")}</Label>
                <Label className={cn(fieldLabelClass, "mb-0")}>{t("planner.route.arrivalTime")}</Label>
                
                <div className="relative">
                  <input
                    type="time"
                    value={formData.startTime || ""}
                    onChange={(e) => onChange({ startTime: e.target.value })}
                    className={timeInputClass}
                    step={300}
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/35 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <input
                    type="time"
                    value={formData.endTime || ""}
                    onChange={(e) => onChange({ endTime: e.target.value })}
                    className={timeInputClass}
                    step={300}
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/35 pointer-events-none" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-foreground dark:text-white">{t("planner.route.destinationBooked.label")}</div>
                <div className="text-[11px] text-foreground/60 dark:text-white/50">{t("planner.route.destinationBooked.description")}</div>
              </div>
              <Switch
                checked={!!formData.destinationBooked}
                onCheckedChange={(checked) => onChange({ destinationBooked: checked })}
                className={switchClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Limits, Travel Type & GPX */}
      <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.route.maxDistance")} · {t("planner.route.travelPace.label")}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          <div className="space-y-8">
            <FormSlider
              id="maxDailyDistance"
              label={t("planner.route.maxDistance")}
              value={maxDailyDistance}
              min={0}
              max={1000}
              step={50}
              unit="km"
              onChange={(value) => onChange({ maxDailyDistance: value.toString() })}
              compact
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
              compact
            />

            {showLimitPriority && (
              <div className="space-y-3">
                <Label className={fieldLabelClass}>
                  <Info className="w-3.5 h-3.5 text-primary" /> {t("planner.route.limitPriority.label")}
                </Label>
                <BadgeToggleGroup
                  name="dailyLimitPriority"
                  options={[
                    { value: "distance", label: t("planner.route.limitPriority.options.distance") },
                    { value: "time", label: t("planner.route.limitPriority.options.time") },
                  ]}
                  selectedValues={formData.dailyLimitPriority ? [formData.dailyLimitPriority] : []}
                  onChange={(_name, value, checked) => onChange({ dailyLimitPriority: checked ? value : "" })}
                />
              </div>
            )}
          </div>

          <div className="space-y-8 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 lg:pl-8">
            <div className="space-y-4">
              <Label className={fieldLabelClass}>
                <Sparkles className="w-3.5 h-3.5 text-primary" /> {t("planner.route.travelPace.label")}
              </Label>
              <BadgeToggleGroup
                name="travelPace"
                options={[
                  { value: "short", label: t("planner.route.travelPace.options.short") },
                  { value: "balanced", label: t("planner.route.travelPace.options.balanced") },
                  { value: "long", label: t("planner.route.travelPace.options.long") },
                ]}
                selectedValues={formData.travelPace ? [formData.travelPace] : []}
                onChange={(_name, value, checked) => onChange({ travelPace: checked ? value : "" })}
              />
              <p className="text-[10px] text-foreground/50 dark:text-white/40 italic">
                {t("planner.route.travelPace.note")}
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/10">
              <Label className={fieldLabelClass}>
                <Info className="w-3.5 h-3.5 text-primary" /> {t("planner.route.gpx.label")}
              </Label>
              <BadgeToggleGroup
                name="gpxOutputMode"
                options={[
                  { value: "garmin", label: t("planner.route.gpx.options.garmin") },
                  { value: "routeTrack", label: t("planner.route.gpx.options.routeTrack") },
                ]}
                selectedValues={formData.gpxOutputMode || []}
                onChange={handleGpxToggle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-3">
            <Route className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.route.stages.title")}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addStage}
            size="sm"
            className="rounded-full border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-bold h-8 px-3"
          >
            <Plus className="w-3 h-3 mr-1" /> {t("planner.route.stages.addSimple")}
          </Button>
        </div>

        {formData.stages.length === 0 ? (
          <div className="w-full py-8 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-xs text-foreground/40 dark:text-white/30">
            {t("planner.route.stages.empty")}
          </div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-3">
            {formData.stages.map((stage, index) => (
              <AccordionItem 
                key={index} 
                value={`stage-${index}`}
                className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden px-4 py-0 bg-white/30 dark:bg-white/5"
              >
                <div className="flex items-center gap-3">
                   <AccordionTrigger className="flex-1 hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 shrink-0">
                        {index + 1}
                      </div>
                      <span className={cn(
                        "text-sm font-bold truncate max-w-[120px] sm:max-w-[200px]",
                        !stage.destination?.trim() ? "text-red-400" : "text-foreground dark:text-white"
                      )}>
                        {stage.destination?.trim() || t("planner.route.stage.placeholder")}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStage(index);
                    }}
                    className="h-8 w-8 text-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <AccordionContent className="pt-0 pb-5 space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        placeholder={t("planner.route.stage.placeholder")}
                        value={stage.destination}
                        onChange={(e) => updateStage(index, { destination: e.target.value })}
                        className={cn(inputClass, "pl-10", !stage.destination?.trim() && "border-red-400/40")}
                      />
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-foreground dark:text-white">{t("planner.route.stage.detailsLabel", { num: index + 1 })}</div>
                        <div className="text-[9px] text-foreground/50 dark:text-white/40">{t("planner.route.stage.detailsDescription")}</div>
                      </div>
                      <Switch
                        checked={!!stage.detailsEnabled}
                        onCheckedChange={(checked) => updateStage(index, { detailsEnabled: checked })}
                        className={switchClass}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-foreground dark:text-white">{t("planner.route.stage.bookedLabel", { num: index + 1 })}</div>
                        <div className="text-[9px] text-foreground/50 dark:text-white/40">{t("planner.route.stage.bookedDescription")}</div>
                      </div>
                      <Switch
                        checked={!!stage.booked}
                        onCheckedChange={(checked) => updateStage(index, { booked: checked })}
                        className={switchClass}
                      />
                    </div>
                  </div>

                  {stage.detailsEnabled && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2">
                      <Label className={cn(fieldLabelClass, "mb-0")}>{t("planner.route.stage.arrivalDate", { num: index + 1 })}</Label>
                      <Label className={cn(fieldLabelClass, "mb-0")}>{t("planner.route.stage.arrivalTime", { num: index + 1 })}</Label>
                      
                      <div className="relative">
                        <input
                          type="date"
                          value={stage.arrivalDate || ""}
                          onChange={(e) => updateStage(index, { arrivalDate: e.target.value })}
                          className={cn(inputClass, "pr-8")}
                          min={index === 0 ? formData.startDate : (formData.stages[index-1]?.departureDate || formData.stages[index-1]?.arrivalDate || formData.startDate)}
                        />
                      </div>
                      
                      <div className="relative">
                        <input
                          type="time"
                          value={stage.arrivalTime || ""}
                          onChange={(e) => updateStage(index, { arrivalTime: e.target.value })}
                          className={timeInputClass}
                        />
                      </div>

                      <div className="col-span-2 mt-2"></div>

                      <Label className={cn(fieldLabelClass, "mb-0")}>{t("planner.route.stage.departureDate", { num: index + 1 })}</Label>
                      <Label className={cn(fieldLabelClass, "mb-0")}>{t("planner.route.stage.departureTime", { num: index + 1 })}</Label>
                      
                      <div className="relative">
                        <input
                          type="date"
                          value={stage.departureDate || ""}
                          onChange={(e) => updateStage(index, { departureDate: e.target.value })}
                          className={cn(inputClass, "pr-8")}
                          min={stage.arrivalDate || (index === 0 ? formData.startDate : (formData.stages[index-1]?.departureDate || formData.stages[index-1]?.arrivalDate || formData.startDate))}
                        />
                      </div>
                      
                      <div className="relative">
                        <input
                          type="time"
                          value={stage.departureTime || ""}
                          onChange={(e) => updateStage(index, { departureTime: e.target.value })}
                          className={timeInputClass}
                        />
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Target Regions, Scenic Preference & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left" style={glassPanelStyle}>
          <div className="flex items-center gap-3 mb-4">
            <MapIcon className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.route.targetRegions.label")}</span>
          </div>
          <p className="text-[11px] text-foreground/50 dark:text-white/40 mb-3 leading-relaxed">
            {t("planner.route.targetRegions.hint")}
          </p>
          <textarea
            id="targetRegions"
            placeholder={t("planner.route.targetRegions.placeholder")}
            value={formData.targetRegions}
            onChange={(e) => onChange({ targetRegions: e.target.value })}
            className="w-full min-h-[100px] p-4 rounded-2xl transition-all outline-none font-medium text-sm text-foreground dark:text-white placeholder:font-normal text-left resize-none bg-white/40 border border-slate-200 dark:bg-white/5 dark:border-white/10"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex flex-col items-start text-left flex-1" style={glassPanelStyle}>
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-medium tracking-[0.04em] text-foreground/52 dark:text-white/50">{t("planner.route.additional.label")}</span>
            </div>
            <textarea
              id="routeAdditionalInfo"
              placeholder={t("planner.route.additional.placeholder")}
              value={formData.routeAdditionalInfo}
              onChange={(e) => onChange({ routeAdditionalInfo: e.target.value })}
              className="w-full h-full min-h-[100px] p-4 rounded-2xl transition-all outline-none font-medium text-sm text-foreground dark:text-white placeholder:font-normal text-left resize-none bg-white/40 border border-slate-200 dark:bg-white/5 dark:border-white/10"
            />
          </div>

          <div className="planner-panel-surface p-4 sm:p-5 rounded-3xl border flex items-center justify-between gap-4 text-left" style={glassPanelStyle}>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-foreground dark:text-white">{t("planner.route.preferScenicLongerStops.label")}</div>
              <div className="text-[11px] text-foreground/60 dark:text-white/50">{t("planner.route.preferScenicLongerStops.description")}</div>
            </div>
            <Switch
              checked={formData.preferScenicLongerStops}
              onCheckedChange={(checked) => onChange({ preferScenicLongerStops: checked })}
              className={switchClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
