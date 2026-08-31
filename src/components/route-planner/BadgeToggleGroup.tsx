import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToggleOption {
  value: string;
  label: string;
}

interface BadgeToggleGroupProps {
  name: string;
  options: ToggleOption[];
  selectedValues: string[];
  onChange: (name: string, value: string, checked: boolean) => void;
  className?: string;
}

export function BadgeToggleGroup({ 
  name, 
  options, 
  selectedValues, 
  onChange, 
  className 
}: BadgeToggleGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 w-full", className)}>
      {options.map((option) => {
        const isChecked = selectedValues.includes(option.value);
        return (
          <motion.button
            key={option.value}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(name, option.value, !isChecked)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 border",
              isChecked
                ? "bg-emerald-600 border-emerald-600 !text-white shadow-xs"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700"
            )}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}
