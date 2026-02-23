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
}

export function ToggleGroup({ name, options, selectedValues, onChange }: ToggleGroupProps) {
  return (
    <div className="grid grid-cols-1 gap-3 w-full">
      {options.map((option) => {
        const isChecked = selectedValues.includes(option.value);
        return (
          <motion.button
            key={option.value}
            type="button"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(name, option.value, !isChecked)}
            className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-[10px] md:text-sm font-black tracking-widest uppercase transition-all duration-300 border-2 flex items-center justify-between min-h-[50px] ${
              isChecked
                ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30'
                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white shadow-sm'
            }`}
          >
            <span className="text-left leading-tight py-1">{option.label}</span>
            <div className={`w-3 h-3 sm:w-2.5 sm:h-2.5 md:w-4 md:h-4 shrink-0 rounded-full transition-all duration-500 border-2 ml-4 ${
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