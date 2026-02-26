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
}

export function FormSlider({ id, label, value, min, max, step, unit, onChange, disabled = false }: FormSliderProps) {
  return (
    <div className={`space-y-6 ${disabled ? "opacity-40" : ""}`}>
      <div className="space-y-2">
        <Label id={`${id}-label`} htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">
          {label}
        </Label>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-foreground tabular-nums leading-none">
            {value}
          </span>
          <span className="text-sm font-bold text-primary tracking-widest">
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
        
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground/30 tracking-[0.2em] mt-4">
          <span>{min} {unit}</span>
          <span>{max} {unit}</span>
        </div>
      </div>
    </div>
  );
}
