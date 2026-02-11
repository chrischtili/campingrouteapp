import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

interface FormSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

export function FormSlider({ id, label, value, min, max, step, unit, onChange }: FormSliderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label id={`${id}-label`} htmlFor={id} className={isMobile ? "text-sm" : ""}>{label}</Label>
        <span className={`text-sm font-medium text-foreground ${isMobile ? "text-base" : ""}`}>
          {value} {unit}
        </span>
      </div>
      <Slider
        id={id}
        aria-labelledby={`${id}-label`}
        aria-label={`${label} Slider`}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className={`w-full ${isMobile ? "h-10" : "h-8"}`}
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
