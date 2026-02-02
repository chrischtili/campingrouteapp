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
}

export function FormSlider({ id, label, value, min, max, step, unit, onChange }: FormSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm font-medium text-primary">
          {value} {unit}
        </span>
      </div>
      <Slider
        id={id}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
}
