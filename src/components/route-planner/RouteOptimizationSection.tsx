import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { ToggleGroup } from "./ToggleGroup";
import { useTranslation } from "react-i18next";
import { Target, Navigation, Sparkles, ShieldAlert, Landmark } from "lucide-react";
import { motion } from "framer-motion";

interface RouteOptimizationSectionProps {
  formData: FormData;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
  onChange: (data: Partial<FormData>) => void;
}

export function RouteOptimizationSection({ formData, onCheckboxChange, onChange }: RouteOptimizationSectionProps) {
  const { t } = useTranslation();

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
      id: 'avoidances',
      label: t("planner.optimization.categories.avoidances.label"),
      icon: ShieldAlert,
      accent: "text-secondary",
      options: [
        { value: 'toll', label: t("planner.optimization.categories.avoidances.options.toll") },
        { value: 'traffic', label: t("planner.optimization.categories.avoidances.options.traffic") },
        { value: 'construction', label: t("planner.optimization.categories.avoidances.options.construction") },
        { value: 'tunnels', label: t("planner.optimization.categories.avoidances.options.tunnels") },
        { value: 'night', label: t("planner.optimization.categories.avoidances.options.night") },
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
      ]
    },
    {
      id: 'experiences',
      label: t("planner.optimization.categories.experiences.label"),
      icon: Landmark,
      accent: "text-secondary",
      options: [
        { value: 'cities', label: t("planner.optimization.categories.experiences.options.cities") },
        { value: 'rural', label: t("planner.optimization.categories.experiences.options.rural") },
        { value: 'unesco', label: t("planner.optimization.categories.experiences.options.unesco") },
        { value: 'farm', label: t("planner.optimization.categories.experiences.options.farm") },
        { value: 'markets', label: t("planner.optimization.categories.experiences.options.markets") },
      ]
    }
  ];

  const glassPanelStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "2px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "2.5rem",
  };
  
  return (
    <div className="space-y-12">
      <div className="space-y-4 text-left">
        <h3 className="text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tighter uppercase text-white">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg border-2 border-primary/20">
            <Target className="w-6 h-6" />
          </div>
          {t("planner.optimization.title")}
        </h3>
        <p className="text-white/80 text-lg leading-relaxed italic font-medium">
          {t("planner.optimization.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat, i) => (
          <motion.div 
            key={cat.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 sm:p-10 shadow-2xl flex flex-col items-start text-left"
            style={glassPanelStyle}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary border-2 border-white/20 shadow-md">
                <cat.icon className="w-6 h-6" />
              </div>
              <Label className="text-sm font-black uppercase tracking-[0.2em] text-white">
                {cat.label}
              </Label>
            </div>
            
            <div className="w-full text-left">
              <ToggleGroup
                name="routePreferences"
                options={cat.options}
                selectedValues={formData.routePreferences}
                onChange={onCheckboxChange}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4 text-left">
        <Label className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" /> {t("planner.optimization.tollCountries.label")}
        </Label>
        <ToggleGroup
          name="avoidTollCountries"
          options={[
            { value: 'at', label: t("planner.optimization.tollCountries.options.at") },
            { value: 'ch', label: t("planner.optimization.tollCountries.options.ch") },
            { value: 'fr', label: t("planner.optimization.tollCountries.options.fr") },
            { value: 'it', label: t("planner.optimization.tollCountries.options.it") },
            { value: 'es', label: t("planner.optimization.tollCountries.options.es") },
            { value: 'si', label: t("planner.optimization.tollCountries.options.si") },
          ]}
          selectedValues={formData.avoidTollCountries}
          onChange={onCheckboxChange}
          className="grid-cols-1 md:grid-cols-2"
        />
      </div>

      <div className="space-y-4 text-left">
        <Label htmlFor="avoidRegions" className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" /> {t("planner.optimization.avoidRegions.label")}
        </Label>
        <textarea
          id="avoidRegions"
          placeholder={t("planner.optimization.avoidRegions.placeholder")}
          value={formData.avoidRegions}
          onChange={(e) => onChange({ avoidRegions: e.target.value })}
          className="w-full min-h-[120px] p-6 sm:p-8 rounded-3xl bg-white/5 border-2 border-white/10 shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-base md:text-lg text-white placeholder:text-white/60 placeholder:font-normal text-left resize-none"
        />
      </div>
    </div>
  );
}
