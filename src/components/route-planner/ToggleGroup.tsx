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
            className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[10px] md:text-sm font-medium tracking-normal transition-all duration-300 border-2 flex items-start sm:items-center justify-between gap-3 min-h-[50px] sm:min-h-[54px] ${
              isChecked
                ? 'bg-white/65 border-primary text-foreground shadow-[0_10px_24px_rgba(80,70,42,0.12)] dark:bg-[rgba(255,255,255,0.02)] dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.16)]'
                : 'bg-white/70 border-slate-400/70 text-foreground hover:bg-white/85 hover:border-slate-500/80 dark:bg-[rgba(255,255,255,0.02)] dark:border-white/30 dark:text-white/88 dark:hover:bg-[rgba(255,255,255,0.04)] dark:hover:border-white/55 dark:hover:text-white'
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
