import { motion } from "framer-motion";

interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleGroupProps {
  name: string;
  options: ToggleOption[];
  selectedValues: string[];
  onChange: (name: string, value: string, checked: boolean) => void;
  className?: string;
}

function renderLabel(label: string) {
  const breakParts = ["Versorgung", "Entsorgung"];
  const lowerLabel = label.toLowerCase();

  for (const part of breakParts) {
    const lowerPart = part.toLowerCase();
    const index = lowerLabel.indexOf(lowerPart);

    if (index > 0) {
      return (
        <>
          {label.slice(0, index)}
          <wbr />
          {label.slice(index)}
        </>
      );
    }
  }

  return label;
}

export function ToggleGroup({ name, options, selectedValues, onChange, className }: ToggleGroupProps) {
  return (
    <div className={`grid gap-3 w-full ${className ?? "grid-cols-1"}`}>
      {options.map((option) => {
        const isChecked = selectedValues.includes(option.value);
        return (
          <motion.button
            key={option.value}
            type="button"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(name, option.value, !isChecked)}
            className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold tracking-normal transition-all duration-200 border flex items-start sm:items-center justify-between gap-3 min-h-[50px] sm:min-h-[54px] ${
              isChecked
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-white shadow-xs'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            <span className="min-w-0 flex-1 text-left leading-snug py-0.5 tracking-normal break-words">
              {renderLabel(option.label)}
            </span>
            <div className={`mt-1 sm:mt-0 w-3 h-3 sm:w-2.5 sm:h-2.5 md:w-4 md:h-4 shrink-0 rounded-full transition-all duration-300 border ${
              isChecked 
                ? "bg-primary border-primary scale-105"
                : "bg-white/85 border-slate-400/90 dark:bg-transparent dark:border-white/35"
            }`} />
          </motion.button>
        );
      })}
    </div>
  );
}
