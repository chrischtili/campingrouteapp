import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, ChevronDown } from "lucide-react";

interface TimeWheelPickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  minuteStep?: number;
}

const pad = (value: number) => String(value).padStart(2, "0");

const parseTime = (value: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) return null;
  return { hour: match[1], minute: match[2] };
};

export function TimeWheelPicker({
  id,
  value,
  onChange,
  className = "",
  minuteStep = 5,
}: TimeWheelPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const parsed = parseTime(value);
  const [selectedHour, setSelectedHour] = useState(parsed?.hour ?? "00");
  const [selectedMinute, setSelectedMinute] = useState(parsed?.minute ?? "00");

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => pad(i)), []);
  const minutes = useMemo(
    () => Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => pad(i * minuteStep)),
    [minuteStep]
  );

  useEffect(() => {
    const time = parseTime(value);
    if (time) {
      setSelectedHour(time.hour);
      setSelectedMinute(time.minute);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const commit = (hour: string, minute: string) => {
    onChange(`${hour}:${minute}`);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full h-12 sm:h-14 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-white/5 border-2 border-white/10 backdrop-blur-md shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-sm sm:text-base md:text-lg text-white text-left pr-20 min-h-[56px] ${className}`}
      >
        {value || "--:--"}
        <Clock className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/40 pointer-events-none" />
        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-full rounded-2xl border-2 border-white/10 bg-[#12231f] shadow-2xl p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.08em] text-white/60 mb-2">HH</div>
              <div className="h-40 overflow-y-auto snap-y snap-mandatory rounded-xl border border-white/10 bg-white/5 p-1">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => {
                      setSelectedHour(hour);
                      commit(hour, selectedMinute);
                    }}
                    className={`w-full h-9 snap-center rounded-lg text-sm font-semibold transition-colors ${
                      hour === selectedHour
                        ? "bg-primary text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold tracking-[0.08em] text-white/60 mb-2">MM</div>
              <div className="h-40 overflow-y-auto snap-y snap-mandatory rounded-xl border border-white/10 bg-white/5 p-1">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => {
                      setSelectedMinute(minute);
                      commit(selectedHour, minute);
                    }}
                    className={`w-full h-9 snap-center rounded-lg text-sm font-semibold transition-colors ${
                      minute === selectedMinute
                        ? "bg-primary text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
