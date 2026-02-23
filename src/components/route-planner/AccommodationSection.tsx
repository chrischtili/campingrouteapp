import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { ToggleGroup } from "./ToggleGroup";
import { FormSlider } from "./FormSlider";
import { useTranslation } from "react-i18next";
import { Bed, Users, Home, Settings, Wallet, MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AccommodationSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

export function AccommodationSection({ formData, onChange, onCheckboxChange }: AccommodationSectionProps) {
  const { t } = useTranslation();

  const categories = [
    {
      id: 'companions',
      label: t("planner.accommodation.categories.companions.label"),
      icon: Users,
      name: 'travelCompanions',
      options: [
        { value: 'solo', label: t("planner.accommodation.categories.companions.options.solo") },
        { value: 'partner', label: t("planner.accommodation.categories.companions.options.partner") },
        { value: 'family', label: t("planner.accommodation.categories.companions.options.family") },
        { value: 'friends', label: t("planner.accommodation.categories.companions.options.friends") },
        { value: 'pets', label: t("planner.accommodation.categories.companions.options.pets") },
        { value: 'seniors', label: t("planner.accommodation.categories.companions.options.seniors") },
      ]
    },
    {
      id: 'type',
      label: t("planner.accommodation.categories.type.label"),
      icon: Home,
      name: 'accommodationType',
      options: [
        { value: 'camping', label: t("planner.accommodation.categories.type.options.camping") },
        { value: 'pitch', label: t("planner.accommodation.categories.type.options.pitch") },
        { value: 'farm', label: t("planner.accommodation.categories.type.options.farm") },
        { value: 'small', label: t("planner.accommodation.categories.type.options.small") },
        { value: 'wild', label: t("planner.accommodation.categories.type.options.wild") },
        { value: 'premium', label: t("planner.accommodation.categories.type.options.premium") },
      ]
    },
    {
      id: 'facilities',
      label: t("planner.accommodation.categories.facilities.label"),
      icon: Settings,
      name: 'facilities',
      options: [
        { value: 'power', label: t("planner.accommodation.categories.facilities.options.power") },
        { value: 'water', label: t("planner.accommodation.categories.facilities.options.water") },
        { value: 'sanitary', label: t("planner.accommodation.categories.facilities.options.sanitary") },
        { value: 'wifi', label: t("planner.accommodation.categories.facilities.options.wifi") },
        { value: 'pool', label: t("planner.accommodation.categories.facilities.options.pool") },
        { value: 'restaurant', label: t("planner.accommodation.categories.facilities.options.restaurant") },
        { value: 'dogs', label: t("planner.accommodation.categories.facilities.options.dogs") },
        { value: 'kids', label: t("planner.accommodation.categories.facilities.options.kids") },
        { value: 'accessible', label: t("planner.accommodation.categories.facilities.options.accessible") },
        { value: 'winter', label: t("planner.accommodation.categories.facilities.options.winter") },
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

  const inputClass = "w-full min-h-[120px] p-8 rounded-[2rem] bg-white/5 border-2 border-white/10 shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-white placeholder:text-white/60 placeholder:font-normal text-left resize-none";

  return (
    <div className="space-y-12">
      <div className="space-y-4 text-left">
        <h3 className="text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tighter uppercase text-white">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Bed className="w-6 h-6" />
          </div>
          {t("planner.accommodation.title")}
        </h3>
        <p className="text-white/60 text-lg leading-relaxed italic">
          {t("planner.accommodation.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <div className="p-10 rounded-[3rem] bg-secondary/10 border border-white/10 shadow-lg flex flex-col items-start text-left">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {t("planner.accommodation.group.travelers")}
            </span>
          </div>
          <FormSlider id="numberOfTravelers" label={t("planner.accommodation.travelers.label")} value={formData.numberOfTravelers ? parseInt(formData.numberOfTravelers) : 1} min={1} max={8} step={1} unit={t("planner.accommodation.travelers.unit")} onChange={(v) => onChange({ numberOfTravelers: v.toString() })} />
        </div>

        <div className="p-10 rounded-[3rem] bg-primary/10 border border-white/10 shadow-lg flex flex-col items-start text-left">
          <div className="flex items-center gap-3 mb-8">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {t("planner.accommodation.group.budget")}
            </span>
          </div>
          <FormSlider id="avgCampsitePriceMax" label={t("planner.accommodation.budget.label")} value={formData.avgCampsitePriceMax ? parseInt(formData.avgCampsitePriceMax) : 0} min={0} max={150} step={5} unit="€" onChange={(v) => onChange({ avgCampsitePriceMax: v.toString() })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch text-left">
        {categories.map((cat) => (
          <motion.div 
            key={cat.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-10 shadow-xl space-y-8 flex flex-col items-start text-left ${cat.id === 'facilities' ? 'md:col-span-2' : ''}`} 
            style={glassPanelStyle}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10">
                <cat.icon className="w-5 h-5" />
              </div>
              <Label className="text-xs font-black uppercase tracking-[0.2em] text-white">
                {cat.label}
              </Label>
            </div>
            
            <div className="w-full text-left">
              <ToggleGroup
                name={cat.name}
                options={cat.options}
                selectedValues={formData[cat.name as keyof FormData] as string[]}
                onChange={onCheckboxChange}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3 text-left">
        <Label htmlFor="accommodation" className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 ml-4">
          <MessageSquare className="w-3 h-3 text-primary" /> {t("planner.accommodation.additional.label")}
        </Label>
        <textarea
          id="accommodation"
          placeholder={t("planner.accommodation.additional.placeholder")}
          value={formData.accommodation}
          onChange={(e) => onChange({ accommodation: (e.target as HTMLTextAreaElement).value })}
          className={inputClass}
        />
      </div>
    </div>
  );
}
