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
            className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-[10px] md:text-sm font-black uppercase transition-all duration-300 border-2 flex items-start sm:items-center justify-between gap-3 min-h-[50px] ${
              isChecked
                ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30'
                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white shadow-sm'
            }`}
          >
            <span className="min-w-0 flex-1 text-left leading-snug py-1 tracking-[0.14em] sm:tracking-[0.22em] break-words">
              {renderLabel(option.label)}
            </span>
            <div className={`mt-1 sm:mt-0 w-3 h-3 sm:w-2.5 sm:h-2.5 md:w-4 md:h-4 shrink-0 rounded-full transition-all duration-500 border-2 ${
              isChecked 
                ? "bg-white border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                : "bg-transparent border-white/20"
            }`} />
          </motion.button>
        );
      })}
    </div>
  );
}
