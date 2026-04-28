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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(name, option.value, !isChecked)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 border-2",
              isChecked
                ? "bg-primary border-primary text-white shadow-sm"
                : "bg-white/40 border-slate-200 text-slate-600 hover:bg-white/60 dark:bg-white/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
            )}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}
