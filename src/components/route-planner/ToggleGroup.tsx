import { Label } from "@/components/ui/label";

interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleGroupProps {
  name: string;
  options: ToggleOption[];
  selectedValues: string[];
  onChange: (name: string, value: string, checked: boolean) => void;
}

export function ToggleGroup({ name, options, selectedValues, onChange }: ToggleGroupProps) {
  return (
    <div className="grid gap-2">
      {options.map((option) => {
        const isChecked = selectedValues.includes(option.value);
        return (
          <div key={option.value} className="flex items-start space-x-3">
            <button
              type="button"
              onClick={() => onChange(name, option.value, !isChecked)}
              className={`relative inline-flex flex-shrink-0 items-center h-5 rounded-full w-9 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isChecked
                  ? 'bg-[rgb(240,146,17)] focus:ring-[rgb(240,146,17)]'
                  : 'bg-gray-200 dark:bg-gray-700 focus:ring-gray-400 dark:focus:ring-gray-500'
              }`}
              aria-pressed={isChecked}
            >
              <span
                className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform ${
                  isChecked ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
            <Label 
              htmlFor={`${name}-${option.value}`} 
              className="text-sm font-normal cursor-pointer leading-normal"
              onClick={() => onChange(name, option.value, !isChecked)}
            >
              {option.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}