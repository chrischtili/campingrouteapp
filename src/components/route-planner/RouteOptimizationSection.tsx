import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { ToggleGroup } from "./ToggleGroup";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Target, Navigation, Sparkles, ShieldAlert, Landmark, ChevronDown } from "lucide-react";

interface RouteOptimizationSectionProps {
  formData: FormData;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
  onChange: (data: Partial<FormData>) => void;
}

export function RouteOptimizationSection({ formData, onCheckboxChange, onChange }: RouteOptimizationSectionProps) {
  const { t } = useTranslation();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    roadType: false,
    restrictions: false,
    landscape: false,
    experiences: false,
    avoidRegions: false,
  });

  const categories = [
    {
      id: 'roadType',
      label: t("planner.optimization.categories.roadType.label"),
      icon: Navigation,
      accent: "text-primary",
      options: [
        { value: 'motorways', label: t("planner.optimization.categories.roadType.options.motorways") },
        { value: 'country', label: t("planner.optimization.categories.roadType.options.country") },
        { value: 'scenic', label: t("planner.optimization.categories.roadType.options.scenic") },
      ]
    },
    {
      id: 'restrictions',
      label: t("planner.optimization.categories.restrictions.label"),
      icon: ShieldAlert,
      accent: "text-secondary",
      options: [
        { value: 'traffic', label: t("planner.optimization.categories.avoidances.options.traffic") },
        { value: 'construction', label: t("planner.optimization.categories.avoidances.options.construction") },
        { value: 'toll', label: t("planner.optimization.categories.avoidances.options.toll") },
        { value: 'tunnels', label: t("planner.optimization.categories.avoidances.options.tunnels") },
        { value: 'night', label: t("planner.optimization.categories.avoidances.options.night") },
        { value: 'innerCities', label: t("planner.optimization.categories.restrictions.options.innerCities") },
        { value: 'oldTowns', label: t("planner.optimization.categories.restrictions.options.oldTowns") },
        { value: 'hairpins', label: t("planner.optimization.categories.restrictions.options.hairpins") },
        { value: 'narrowRoads', label: t("planner.optimization.categories.restrictions.options.narrowRoads") },
        { value: 'unpavedRoads', label: t("planner.optimization.categories.restrictions.options.unpavedRoads") },
        { value: 'ferries', label: t("planner.optimization.categories.restrictions.options.ferries") },
      ]
    },
    {
      id: 'landscape',
      label: t("planner.optimization.categories.landscape.label"),
      icon: Sparkles,
      accent: "text-primary",
      options: [
        { value: 'mountains', label: t("planner.optimization.categories.landscape.options.mountains") },
        { value: 'coastal', label: t("planner.optimization.categories.landscape.options.coastal") },
        { value: 'lakes', label: t("planner.optimization.categories.landscape.options.lakes") },
        { value: 'forest', label: t("planner.optimization.categories.landscape.options.forest") },
        { value: 'rural', label: t("planner.optimization.categories.landscape.options.rural") },
      ]
    },
    {
      id: 'experiences',
      label: t("planner.optimization.categories.experiences.label"),
      icon: Landmark,
      accent: "text-secondary",
      options: [
        { value: 'cities', label: t("planner.optimization.categories.experiences.options.cities") },
        { value: 'unesco', label: t("planner.optimization.categories.experiences.options.unesco") },
        { value: 'farm', label: t("planner.optimization.categories.experiences.options.farm") },
        { value: 'markets', label: t("planner.optimization.categories.experiences.options.markets") },
      ]
    }
  ];

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const nextValue = !prev[key];
      if (nextValue) {
        requestAnimationFrame(() => {
          const element = sectionRefs.current[key];
          if (!element) return;
          const top = element.getBoundingClientRect().top + window.scrollY - 110;
          window.scrollTo({ top, behavior: "smooth" });
        });
      }
      return {
        roadType: false,
        restrictions: false,
        landscape: false,
        experiences: false,
        avoidRegions: false,
        [key]: nextValue,
      };
    });
  };
  
  return (
    <div className="space-y-12">
      <div className="space-y-4 text-left">
        <h3 className="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight text-white">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg border-2 border-primary/20">
            <Target className="w-6 h-6" />
          </div>
          {t("planner.optimization.title")}
        </h3>
        <p className="text-white/80 text-lg leading-relaxed italic font-medium">
          {t("planner.optimization.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            ref={(node) => {
              sectionRefs.current[cat.id] = node;
            }}
            style={{ overflowAnchor: "none" }}
            className={`rounded-2xl border-2 p-4 sm:p-5 transition-colors ${
              openSections[cat.id] ? "border-primary/30 bg-white/10" : "border-white/10 bg-white/5"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection(cat.id)}
              className="w-full flex items-center justify-between gap-3 text-left rounded-xl px-1 py-1"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${openSections[cat.id] ? "bg-primary/15 border-primary/30 text-primary" : "bg-white/5 border-white/20 text-primary/90"}`}>
                  <cat.icon className="w-4 h-4" />
                </div>
                <span className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white">{cat.label}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSections[cat.id] ? "rotate-180 text-primary" : "text-white/70"}`} />
            </button>
            {openSections[cat.id] && (
              <div className="mt-4">
                <ToggleGroup
                  name="routePreferences"
                  options={cat.options}
                  selectedValues={formData.routePreferences}
                  onChange={onCheckboxChange}
                />
              </div>
            )}
          </div>
        ))}

        <div
          ref={(node) => {
            sectionRefs.current.avoidRegions = node;
          }}
          style={{ overflowAnchor: "none" }}
          className={`rounded-2xl border-2 p-4 sm:p-5 transition-colors ${openSections.avoidRegions ? "border-primary/30 bg-white/10" : "border-white/10 bg-white/5"}`}
        >
          <button
            type="button"
            onClick={() => toggleSection("avoidRegions")}
            className="w-full flex items-center justify-between gap-3 text-left rounded-xl px-1 py-1"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${openSections.avoidRegions ? "bg-primary/15 border-primary/30 text-primary" : "bg-white/5 border-white/20 text-primary/90"}`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white">{t("planner.optimization.avoidRegions.label")}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${openSections.avoidRegions ? "rotate-180 text-primary" : "text-white/70"}`} />
          </button>
          {openSections.avoidRegions && (
            <div className="mt-4">
              <textarea
                id="avoidRegions"
                placeholder={t("planner.optimization.avoidRegions.placeholder")}
                value={formData.avoidRegions}
                onChange={(e) => onChange({ avoidRegions: e.target.value })}
                rows={4}
                className="w-full min-h-[110px] sm:min-h-[120px] p-4 sm:p-8 rounded-3xl bg-white/5 border-2 border-white/10 shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-sm sm:text-base md:text-lg text-white placeholder:text-white/60 placeholder:font-normal text-left resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
