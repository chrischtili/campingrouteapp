import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  name: string;
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (name: string, value: string, checked: boolean) => void;
}

export function CheckboxGroup({ name, options, selectedValues, onChange }: CheckboxGroupProps) {
  return (
    <div className="grid gap-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={`${name}-${option.value}`}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) => onChange(name, option.value, checked as boolean)}
          />
          <Label 
            htmlFor={`${name}-${option.value}`} 
            className="text-sm font-normal cursor-pointer"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}
