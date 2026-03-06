import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface FormSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  formatBound?: (value: number) => string;
  compact?: boolean;
}

export function FormSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled = false,
  formatValue,
  formatBound: customFormatBound,
  compact = false,
}: FormSliderProps) {
  const defaultFormatBound = (bound: number) => {
    const hasFraction = Math.abs(bound % 1) > Number.EPSILON;
    return hasFraction ? bound.toFixed(1) : String(bound);
  };
  const displayValue = formatValue ? formatValue(value) : defaultFormatBound(value);
  const displayMin = customFormatBound ? customFormatBound(min) : defaultFormatBound(min);
  const displayMax = customFormatBound ? customFormatBound(max) : defaultFormatBound(max);

  return (
    <div className={`w-full ${compact ? "space-y-4" : "space-y-6"} ${disabled ? "opacity-40" : ""}`}>
      <div className="space-y-2">
        <Label id={`${id}-label`} htmlFor={id} className={`font-semibold tracking-[0.05em] text-muted-foreground block ${compact ? "text-[10px]" : "text-[10px] sm:text-[11px]"}`}>
          {label}
        </Label>
        <div className="flex items-baseline gap-2">
          <span className={`${compact ? "text-3xl" : "text-4xl"} font-black text-foreground tabular-nums leading-none`}>
            {displayValue}
          </span>
          <span className={`${compact ? "text-xs" : "text-sm"} font-bold text-primary tracking-widest`}>
            {unit}
          </span>
        </div>
      </div>
      
      <div className="relative pt-2">
        <Slider
          id={id}
          aria-labelledby={`${id}-label`}
          aria-label={`${label} Slider`}
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([v]) => onChange(v)}
          className={`w-full ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          disabled={disabled}
        />
        
        <div className={`mt-4 flex items-center justify-between font-bold text-white/55 tabular-nums ${compact ? "text-xs" : "text-xs sm:text-sm"}`}>
          <span className="whitespace-nowrap">{displayMin} {unit}</span>
          <span className="whitespace-nowrap">{displayMax} {unit}</span>
        </div>
      </div>
    </div>
  );
}
