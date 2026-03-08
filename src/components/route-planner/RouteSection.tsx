import { FormData, RouteStage } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { ToggleGroup } from "./ToggleGroup";
import { Switch } from "@/components/ui/switch";
import { FormSlider } from "./FormSlider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { Map, MapPin, Calendar, Info, Sparkles, Plus, Trash2, Home, Route, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, type ReactNode } from "react";

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
      if (!nextStage.arrivalDate || nextStage.arrivalDate < minimumDate) {
        nextStage.arrivalDate = minimumDate;
      }
    }

    const departureMinimumDate = nextStage.arrivalDate || minimumDate;
    if (departureMinimumDate) {
      if (!nextStage.departureDate || nextStage.departureDate < departureMinimumDate) {
        nextStage.departureDate = departureMinimumDate;
      }
    }

    return nextStage;
  });
};

export function RouteSection({ formData, onChange }: RouteSectionProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [activePanel, setActivePanel] = useState<null | "times" | "stages" | "limits" | "notes">(null);

  const glassPanelStyle = undefined;

  const inputClass = "popup-input w-full h-12 sm:h-14 px-4 sm:px-5 rounded-xl sm:rounded-2xl transition-all outline-none font-bold text-sm sm:text-base md:text-lg text-foreground dark:text-white placeholder:font-normal text-left";
  const timeInputClass = `${inputClass} pr-12 min-h-[56px]`;
  const fieldLabelClass = "text-xs md:text-sm font-semibold tracking-[0.02em] text-foreground dark:text-white flex items-center gap-2";
  const fieldLabelIconSlotClass = "inline-flex w-4 h-4 items-center justify-center shrink-0";
  const requiredError = "text-[10px] font-semibold tracking-[0.04em] text-red-400";
  const clearValueClass = "mt-2 inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.04em] text-foreground/55 hover:text-foreground transition-colors dark:text-white/60 dark:hover:text-white";
  const emptyFieldPlaceholderClass = "pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-bold text-foreground/42 dark:text-white/55 peer-focus:hidden";
  const switchClass = "border-primary/85 data-[state=checked]:bg-primary/15 data-[state=unchecked]:bg-white/95 dark:data-[state=unchecked]:bg-white/10 dark:data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(255,128,0,0.22)]";
  const optionalPlaceholder = t("planner.route.optionalPlaceholder");

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
    const nextEndDate = !formData.endDate || formData.endDate < newStartDate ? newStartDate : formData.endDate;
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
    onChange({ stages: normalizeStageDates(nextStages, formData.startDate) });
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

  const panelTriggerClass = "planner-panel-trigger rounded-2xl border-2 px-5 py-4 text-left transition-colors";
  const panelFrameClass = "space-y-6";
  const panelBoxClass = "planner-panel-surface rounded-3xl border";

  const renderPanelShell = (title: string, description: string, content: ReactNode) => {
    if (isMobile) {
      return (
        <Sheet open={!!activePanel} onOpenChange={(open) => !open && setActivePanel(null)}>
          <SheetContent side="bottom" className="theme-popup-shell theme-popup-route max-h-[88vh] overflow-y-auto border-2 px-0 pb-6 pt-0 shadow-[0_-32px_120px_rgba(0,0,0,0.72)] ring-2 ring-primary/35 backdrop-blur-xl">
            <SheetHeader className="theme-popup-divider border-b px-6 py-5 text-left">
              <SheetTitle className="text-left text-xl font-bold text-foreground dark:text-white">{title}</SheetTitle>
              <SheetDescription className="text-left text-sm text-foreground/60 dark:text-white/58">{description}</SheetDescription>
            </SheetHeader>
            <div className="px-6 pt-6">{content}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Dialog open={!!activePanel} onOpenChange={(open) => !open && setActivePanel(null)}>
        <DialogContent className="theme-popup-shell theme-popup-route max-h-[90vh] max-w-5xl overflow-y-auto border-2 p-0 shadow-[0_36px_140px_rgba(0,0,0,0.74)] ring-2 ring-primary/35 backdrop-blur-xl">
          <DialogHeader className="theme-popup-divider border-b px-6 py-5 text-left">
            <DialogTitle className="text-left text-xl font-bold text-foreground dark:text-white">{title}</DialogTitle>
            <DialogDescription className="text-left text-sm text-foreground/60 dark:text-white/58">{description}</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 pt-6">{content}</div>
        </DialogContent>
      </Dialog>
    );
  };

  const timesContent = (
    <div className={panelFrameClass}>
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
                 
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-foreground/35 dark:text-white/40 pointer-events-none" />
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
                 
                  min={formData.startDate || undefined}
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-foreground/35 dark:text-white/40 pointer-events-none" />
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
          <div className="flex items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-white/55 dark:bg-white/8 border-2 border-slate-900/12 dark:border-white/10 p-4 sm:p-5">
            <div className="space-y-1">
              <div className="text-xs md:text-sm font-semibold tracking-[0.02em] text-foreground dark:text-white">
                {t("planner.route.destinationDetails.label")}
              </div>
              <div className="text-foreground/62 dark:text-white/60 text-sm">
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
              className={switchClass}
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
                   
                    step={300}
                  />
                  {!formData.startTime && <span className={emptyFieldPlaceholderClass}>{optionalPlaceholder}</span>}
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-foreground/35 dark:text-white/40 pointer-events-none" />
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
                   
                    step={300}
                  />
                  {!formData.endTime && <span className={emptyFieldPlaceholderClass}>{optionalPlaceholder}</span>}
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-foreground/35 dark:text-white/40 pointer-events-none" />
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

          <div className="flex items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-white/55 dark:bg-white/8 border-2 border-slate-900/12 dark:border-white/10 p-4 sm:p-5">
            <div className="space-y-1">
              <div className="text-xs md:text-sm font-semibold tracking-[0.02em] text-foreground dark:text-white">
                {t("planner.route.destinationBooked.label")} {formData.destination?.trim() ? `(${formData.destination.trim()})` : ""}
              </div>
              <div className="text-foreground/62 dark:text-white/60 text-sm">
                {t("planner.route.destinationBooked.description")}
              </div>
            </div>
            <Switch
              checked={!!formData.destinationBooked}
              onCheckedChange={(checked) => onChange({ destinationBooked: checked })}
              aria-label={t("planner.route.destinationBooked.label")}
              className={switchClass}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const stagesContent = (
    <div className={panelFrameClass}>
      <div className="space-y-6">
        <AnimatePresence>
          {formData.stages.map((stage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="p-6 sm:p-8 rounded-3xl bg-white/9 border border-white/8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="text-xs md:text-sm font-semibold tracking-[0.02em] text-foreground dark:text-white">
                  {t("planner.route.stage.label", { num: index + 1 })}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeStage(index)}
                  className="self-start sm:self-auto rounded-xl text-foreground/70 dark:text-white/70 hover:text-foreground dark:text-white hover:bg-white/10"
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

              <div className="flex items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-white/55 dark:bg-white/8 border-2 border-slate-900/12 dark:border-white/10 p-4 sm:p-5">
                <div className="space-y-1">
                  <div className="text-xs md:text-sm font-semibold tracking-[0.02em] text-foreground dark:text-white">
                    {buildStopLabel("planner.route.stage.detailsLabel", index, stage.destination)}
                  </div>
                  <div className="text-foreground/62 dark:text-white/60 text-sm">
                    {t("planner.route.stage.detailsDescription")}
                  </div>
                </div>
                <Switch
                  checked={!!stage.detailsEnabled}
                  onCheckedChange={(checked) => updateStage(index, { detailsEnabled: checked })}
                  aria-label={buildStopLabel("planner.route.stage.detailsLabel", index, stage.destination)}
                  className={switchClass}
                />
              </div>

              <div className="flex items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-white/55 dark:bg-white/8 border-2 border-slate-900/12 dark:border-white/10 p-4 sm:p-5">
                <div className="space-y-1">
                  <div className="text-xs md:text-sm font-semibold tracking-[0.02em] text-foreground dark:text-white">
                    {buildStopLabel("planner.route.stage.bookedLabel", index, stage.destination)}
                  </div>
                  <div className="text-foreground/62 dark:text-white/60 text-sm">
                    {t("planner.route.stage.bookedDescription")}
                  </div>
                </div>
                <Switch
                  checked={!!stage.booked}
                  onCheckedChange={(checked) => updateStage(index, { booked: checked })}
                  aria-label={buildStopLabel("planner.route.stage.bookedLabel", index, stage.destination)}
                  className={switchClass}
                />
              </div>

              {stage.detailsEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor={`stageArrivalDate-${index}`} className="text-[10px] md:text-xs font-semibold tracking-[0.04em] text-foreground/70 dark:text-white/70">
                      {buildStopLabel("planner.route.stage.arrivalDate", index, stage.destination)}
                    </Label>
                    <div className="relative">
                      <input
                        id={`stageArrivalDate-${index}`}
                        type="date"
                        value={stage.arrivalDate || ""}
                        onChange={(e) => updateStage(index, { arrivalDate: e.target.value })}
                        className={`${inputClass} pr-10 appearance-none min-h-[56px]`}
                       
                        min={
                          index === 0
                            ? (formData.startDate || undefined)
                            : (formData.stages[index - 1]?.departureDate || formData.stages[index - 1]?.arrivalDate || formData.startDate || undefined)
                        }
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none text-foreground/30 dark:text-white/30" />
                    </div>
                    {stage.arrivalDate && (
                      <button type="button" className={clearValueClass} onClick={() => updateStage(index, { arrivalDate: "" })}>
                        <X className="w-3 h-3" />
                        {t("planner.summary.save.clear")}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor={`stageArrivalTime-${index}`} className="text-[10px] md:text-xs font-semibold tracking-[0.04em] text-foreground/70 dark:text-white/70">
                      {buildStopLabel("planner.route.stage.arrivalTime", index, stage.destination)}
                    </Label>
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                      <input
                        id={`stageArrivalTime-${index}`}
                        type="time"
                        value={stage.arrivalTime || ""}
                        onChange={(e) => updateStage(index, { arrivalTime: e.target.value })}
                        className={`peer ${timeInputClass} ${!stage.arrivalTime ? "time-empty" : ""}`}
                       
                        step={300}
                      />
                      {!stage.arrivalTime && <span className={emptyFieldPlaceholderClass}>{optionalPlaceholder}</span>}
                      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none text-foreground/30 dark:text-white/30" />
                    </div>
                    {stage.arrivalTime && (
                      <button type="button" className={clearValueClass} onClick={() => updateStage(index, { arrivalTime: "" })}>
                        <X className="w-3 h-3" />
                        {t("planner.summary.save.clear")}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor={`stageDepartureDate-${index}`} className="text-[10px] md:text-xs font-semibold tracking-[0.04em] text-foreground/70 dark:text-white/70">
                      {buildStopLabel("planner.route.stage.departureDate", index, stage.destination)}
                    </Label>
                    <div className="relative">
                      <input
                        id={`stageDepartureDate-${index}`}
                        type="date"
                        value={stage.departureDate || ""}
                        onChange={(e) => updateStage(index, { departureDate: e.target.value })}
                        className={`${inputClass} pr-10 appearance-none min-h-[56px]`}
                       
                        min={
                          stage.arrivalDate ||
                          (index === 0
                            ? (formData.startDate || undefined)
                            : (formData.stages[index - 1]?.departureDate || formData.stages[index - 1]?.arrivalDate || formData.startDate || undefined))
                        }
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none text-foreground/30 dark:text-white/30" />
                    </div>
                    {stage.departureDate && (
                      <button type="button" className={clearValueClass} onClick={() => updateStage(index, { departureDate: "" })}>
                        <X className="w-3 h-3" />
                        {t("planner.summary.save.clear")}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor={`stageDepartureTime-${index}`} className="text-[10px] md:text-xs font-semibold tracking-[0.04em] text-foreground/70 dark:text-white/70">
                      {buildStopLabel("planner.route.stage.departureTime", index, stage.destination)}
                    </Label>
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                      <input
                        id={`stageDepartureTime-${index}`}
                        type="time"
                        value={stage.departureTime || ""}
                        onChange={(e) => updateStage(index, { departureTime: e.target.value })}
                        className={`peer ${timeInputClass} ${!stage.departureTime ? "time-empty" : ""}`}
                       
                        step={300}
                      />
                      {!stage.departureTime && <span className={emptyFieldPlaceholderClass}>{optionalPlaceholder}</span>}
                      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 pointer-events-none text-foreground/30 dark:text-white/30" />
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
            className="w-full sm:w-auto justify-center rounded-xl sm:rounded-2xl border-2 border-primary/60 bg-white/8 hover:bg-primary/10 hover:border-primary text-foreground dark:text-white font-black text-sm sm:text-base shadow-[0_0_0_1px_rgba(255,128,0,0.22)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("planner.route.stages.addSimple")}
          </Button>
        </div>
      </div>
    </div>
  );

  const limitsContent = (
    <div className={panelFrameClass}>
      <div className="space-y-6">
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
            <Label className="text-xs md:text-sm font-semibold tracking-[0.02em] text-foreground dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              {t("planner.route.limitPriority.label")}
            </Label>
            <div className="text-foreground/62 dark:text-white/60 text-sm">
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
          <Label className="text-xs md:text-sm font-semibold tracking-[0.02em] text-foreground dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> {t("planner.route.travelPace.label")}
          </Label>
          <div className="text-foreground/62 dark:text-white/60 text-xs font-semibold">
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
    </div>
  );

  const notesContent = (
    <div className={panelFrameClass}>
      <div className="space-y-4 text-left">
        <Label htmlFor="routeAdditionalInfo" className="text-xs md:text-sm font-semibold tracking-[0.02em] text-foreground dark:text-white flex items-center gap-2">
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

  return (
    <div className="space-y-12">
      <div className="space-y-4 text-left">
        <h3 className="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight text-left text-foreground dark:text-white">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Map className="w-6 h-6" />
          </div>
          {t("planner.route.title")}
        </h3>
        <p className="text-foreground/62 dark:text-white/60 text-lg leading-relaxed italic">
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

        <div className="rounded-2xl border border-slate-900/10 dark:border-white/8 bg-slate-900/[0.05] dark:bg-black/10 px-4 py-4 sm:px-5 sm:py-5">
          <div className="text-[10px] font-semibold tracking-[0.08em] text-primary mb-2">
            {t("planner.route.roundTripHint.badge")}
          </div>
          <div className="text-sm text-foreground/85 dark:text-white/85 leading-relaxed">
            {t("planner.route.roundTripHint.text")}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Label htmlFor="targetRegions" className="text-xs md:text-sm font-semibold tracking-[0.02em] text-foreground dark:text-white flex items-center gap-2">
            <Map className="w-4 h-4 text-primary" /> {t("planner.route.targetRegions.label")}
          </Label>
          <p className="text-foreground/52 dark:text-white/50 text-sm leading-relaxed">
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

        <div className="flex items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-slate-900/[0.05] dark:bg-black/10 border border-slate-900/10 dark:border-white/8 p-4 sm:p-5">
          <div className="space-y-1">
            <div className="text-xs md:text-sm font-semibold tracking-[0.02em] text-foreground dark:text-white">
              {t("planner.route.preferScenicLongerStops.label")}
            </div>
            <div className="text-foreground/62 dark:text-white/60 text-sm">
              {t("planner.route.preferScenicLongerStops.description")}
            </div>
          </div>
          <Switch
            checked={formData.preferScenicLongerStops}
            onCheckedChange={(checked) => onChange({ preferScenicLongerStops: checked })}
            aria-label={t("planner.route.preferScenicLongerStops.label")}
            className={switchClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button type="button" className={panelTriggerClass} onClick={() => setActivePanel("times")}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl border border-slate-900/10 bg-white/55 p-2 text-primary dark:border-white/10 dark:bg-white/8">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground dark:text-white">{t("planner.route.departure")} · {t("planner.route.arrival")}</div>
                <div className="mt-1 text-sm text-foreground/58 dark:text-white/55">{t("planner.route.departureTime")} · {t("planner.route.arrivalTime")}</div>
              </div>
            </div>
          </button>

          <button type="button" className={panelTriggerClass} onClick={() => setActivePanel("stages")}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl border border-slate-900/10 bg-white/55 p-2 text-primary dark:border-white/10 dark:bg-white/8">
                <Route className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground dark:text-white">{t("planner.route.stages.title")}</div>
                <div className="mt-1 text-sm text-foreground/58 dark:text-white/55">{hasStages ? `${formData.stages.length} ${t("planner.route.stages.title")}` : t("planner.route.stages.empty")}</div>
              </div>
            </div>
          </button>

          <button type="button" className={panelTriggerClass} onClick={() => setActivePanel("limits")}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl border border-slate-900/10 bg-white/55 p-2 text-primary dark:border-white/10 dark:bg-white/8">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground dark:text-white">{t("planner.route.maxDistance")} · {t("planner.route.maxDriveTime")}</div>
                <div className="mt-1 text-sm text-foreground/58 dark:text-white/55">{t("planner.route.travelPace.label")}</div>
              </div>
            </div>
          </button>

          <button type="button" className={panelTriggerClass} onClick={() => setActivePanel("notes")}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl border border-slate-900/10 bg-white/55 p-2 text-primary dark:border-white/10 dark:bg-white/8">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground dark:text-white">{t("planner.route.additional.label")}</div>
                <div className="mt-1 text-sm text-foreground/58 dark:text-white/55">{t("planner.route.additional.placeholder")}</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/8 bg-white/[0.05] px-6 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)] sm:px-8">
        <div className="space-y-3 text-left">
          <Label className={fieldLabelClass}>
            <Info className="w-4 h-4 text-primary" /> {t("planner.route.gpx.label")}
          </Label>
          <p className="text-foreground/52 dark:text-white/50 text-sm leading-relaxed">
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

      {activePanel === "times" && renderPanelShell(
        `${t("planner.route.departure")} · ${t("planner.route.arrival")}`,
        `${t("planner.route.departureTime")} · ${t("planner.route.arrivalTime")}`,
        timesContent,
      )}
      {activePanel === "stages" && renderPanelShell(
        t("planner.route.stages.title"),
        hasStages ? `${formData.stages.length} ${t("planner.route.stages.title")}` : t("planner.route.stages.empty"),
        stagesContent,
      )}
      {activePanel === "limits" && renderPanelShell(
        `${t("planner.route.maxDistance")} · ${t("planner.route.maxDriveTime")}`,
        t("planner.route.travelPace.label"),
        limitsContent,
      )}
      {activePanel === "notes" && renderPanelShell(
        t("planner.route.additional.label"),
        t("planner.route.additional.placeholder"),
        notesContent,
      )}
    </div>
  );
}
