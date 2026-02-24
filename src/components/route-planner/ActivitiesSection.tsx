import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { ToggleGroup } from "./ToggleGroup";
import { useTranslation } from "react-i18next";
import { Heart, MessageSquare, Mountain, Waves, Compass, Coffee, Sparkles, TreePine, Landmark, Footprints, CloudRain, ShoppingBag, Baby } from "lucide-react";

interface ActivitiesSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

export function ActivitiesSection({ formData, onChange, onCheckboxChange }: ActivitiesSectionProps) {
  const { t } = useTranslation();

  const categories = [
    {
      id: 'active',
      label: t("planner.interests.categories.active"),
      icon: Mountain,
      options: [
        { value: 'hiking', label: t("planner.interests.options.hiking") },
        { value: 'cycling', label: t("planner.interests.options.cycling") },
        { value: 'mtb', label: t("planner.interests.options.mtb") },
        { value: 'watersports', label: t("planner.interests.options.watersports") },
        { value: 'wintersports', label: t("planner.interests.options.wintersports") },
      ]
    },
    {
      id: 'nature',
      label: t("planner.interests.categories.nature"),
      icon: TreePine,
      options: [
        { value: 'wildlife', label: t("planner.interests.options.wildlife") },
        { value: 'photography', label: t("planner.interests.options.photography") },
        { value: 'beach', label: t("planner.interests.options.beach") },
        { value: 'astronomy', label: t("planner.interests.options.astronomy") },
        { value: 'lakes', label: t("planner.interests.options.lakes") },
      ]
    },
    {
      id: 'culture',
      label: t("planner.interests.categories.culture"),
      icon: Landmark,
      options: [
        { value: 'cityStroll', label: t("planner.interests.options.cityStroll") },
        { value: 'history', label: t("planner.interests.options.history") },
        { value: 'museums', label: t("planner.interests.options.museums") },
        { value: 'gastronomy', label: t("planner.interests.options.gastronomy") },
        { value: 'events', label: t("planner.interests.options.events") },
      ]
    },
    {
      id: 'lifestyle',
      label: t("planner.interests.categories.lifestyle"),
      icon: Coffee,
      options: [
        { value: 'wellness', label: t("planner.interests.options.wellness") },
        { value: 'slowTravel', label: t("planner.interests.options.slowTravel") },
        { value: 'shopping', label: t("planner.interests.options.shopping") },
        { value: 'badWeather', label: t("planner.interests.options.badWeather") },
        { value: 'campfire', label: t("planner.interests.options.campfire") },
      ]
    }
  ];
  
  const glassPanelStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "2.5rem",
  };

  const inputClass = "w-full min-h-[150px] p-6 sm:p-8 rounded-3xl bg-white/5 border-2 border-white/10 shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-base md:text-lg text-white placeholder:text-white/60 placeholder:font-normal text-left resize-none";

  return (
    <div className="space-y-12">
      <div className="space-y-4 text-left">
        <h3 className="text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tighter uppercase text-white text-left">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          {t("planner.interests.title")}
        </h3>
        <p className="text-white/60 text-lg leading-relaxed italic">
          {t("planner.interests.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat) => (
          <div key={cat.id} className="p-6 sm:p-10 shadow-xl space-y-8 flex flex-col items-start text-left" style={glassPanelStyle}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20">
                <cat.icon className="w-5 h-5" />
              </div>
              <Label className="text-xs font-black uppercase tracking-[0.2em] text-white">
                {cat.label}
              </Label>
            </div>
            
            <div className="w-full text-left">
              <ToggleGroup
                name="activities"
                options={cat.options}
                selectedValues={formData.activities}
                onChange={onCheckboxChange}
              />
            </div>
          </div>
        ))}

        <div className="md:col-span-2 space-y-4 mt-4 text-left">
          <Label htmlFor="additionalInfo" className="text-xs md:text-sm font-black uppercase tracking-widest text-white flex items-center gap-2 ml-4">
            <MessageSquare className="w-4 h-4 text-primary" /> {t("planner.interests.additional.label")}
          </Label>
          <textarea
            id="additionalInfo"
            placeholder={t("planner.interests.additional.placeholder")}
            value={formData.additionalInfo}
            onChange={(e) => onChange({ additionalInfo: (e.target as HTMLTextAreaElement).value })}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
