import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { ToggleGroup } from "./ToggleGroup";
import { FormSlider } from "./FormSlider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { Bed, Users, Home, Settings, Wallet, MessageSquare, Sparkles, Heart } from "lucide-react";
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
        { value: 'freshWater', label: t("planner.accommodation.categories.facilities.options.freshWater") },
        { value: 'greyWater', label: t("planner.accommodation.categories.facilities.options.greyWater") },
        { value: 'blackWater', label: t("planner.accommodation.categories.facilities.options.blackWater") },
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

  const inputClass = "w-full min-h-[110px] sm:min-h-[120px] p-4 sm:p-8 rounded-3xl bg-white/5 border-2 border-white/10 shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-sm sm:text-base md:text-lg text-white placeholder:text-white/60 placeholder:font-normal text-left resize-none";
  const interestOptions = [
    { value: 'nature', label: t("planner.interests.options.nature") },
    { value: 'hiking', label: t("planner.interests.options.hiking") },
    { value: 'cycling', label: t("planner.interests.options.cycling") },
    { value: 'bathing', label: t("planner.interests.options.bathing") },
    { value: 'cityCulture', label: t("planner.interests.options.cityCulture") },
    { value: 'gastronomy', label: t("planner.interests.options.gastronomy") },
    { value: 'relaxation', label: t("planner.interests.options.relaxation") },
    { value: 'familyFriendly', label: t("planner.interests.options.familyFriendly") },
    { value: 'dogFriendly', label: t("planner.interests.options.dogFriendly") },
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-4 text-left">
        <h3 className="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight text-white">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Bed className="w-6 h-6" />
          </div>
          {t("planner.accommodation.title")}
        </h3>
        <p className="text-white/60 text-lg leading-relaxed italic">
          {t("planner.accommodation.subtitle")}
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-primary">
          <span>{t("planner.accommodation.sourceLabel")}</span>
          <a
            href="https://opencampingmap.org"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-primary/60 underline-offset-2 hover:text-white"
          >
            {t("planner.accommodation.sourceValue")}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <div className="p-5 sm:p-6 rounded-3xl sm:rounded-[3rem] bg-secondary/10 border border-white/10 shadow-lg flex flex-col items-start text-left">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-semibold tracking-[0.12em] text-white/45">
              {t("planner.accommodation.group.travelers")}
            </span>
          </div>
          <FormSlider id="numberOfTravelers" label={t("planner.accommodation.travelers.label")} value={formData.numberOfTravelers ? parseInt(formData.numberOfTravelers) : 1} min={1} max={8} step={1} unit={t("planner.accommodation.travelers.unit")} onChange={(v) => onChange({ numberOfTravelers: v.toString() })} />
        </div>

        <div className="p-5 sm:p-6 rounded-3xl sm:rounded-[3rem] bg-primary/10 border border-white/10 shadow-lg flex flex-col items-start text-left">
          <div className="flex items-center gap-3 mb-8">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-semibold tracking-[0.12em] text-white/45">
              {t("planner.accommodation.group.budget")}
            </span>
          </div>
          <FormSlider id="avgCampsitePriceMax" label={t("planner.accommodation.budget.label")} value={formData.avgCampsitePriceMax ? parseInt(formData.avgCampsitePriceMax) : 0} min={0} max={300} step={5} unit="€" onChange={(v) => onChange({ avgCampsitePriceMax: v.toString() })} />
          <div className="w-full mt-6 space-y-3">
            <Label className="text-xs font-semibold tracking-[0.04em] text-white">
              {t("planner.accommodation.budgetLevel.label")}
            </Label>
            <p className="text-sm text-white/60 leading-relaxed">
              {t("prompt.labels.budgetNote")}
            </p>
            <Select value={formData.budgetLevel} onValueChange={(value) => onChange({ budgetLevel: value })}>
              <SelectTrigger className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl bg-white/5 border-2 border-white/10 backdrop-blur-md shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-sm text-white">
                <SelectValue placeholder={t("planner.accommodation.budgetLevel.placeholder")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl sm:rounded-2xl bg-[#0a140f] border-white/10 shadow-2xl">
                <SelectItem value="low">{t("planner.accommodation.budgetLevel.options.low")}</SelectItem>
                <SelectItem value="medium">{t("planner.accommodation.budgetLevel.options.medium")}</SelectItem>
                <SelectItem value="high">{t("planner.accommodation.budgetLevel.options.high")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch text-left">
        {categories.filter((cat) => cat.id === "companions" || cat.id === "type").map((cat) => (
          <motion.div 
            key={cat.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-10 shadow-xl space-y-8 flex flex-col items-start text-left"
            style={glassPanelStyle}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20">
                <cat.icon className="w-5 h-5" />
              </div>
              <Label className="text-xs font-semibold tracking-[0.04em] text-white">
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


      <div className="flex items-center justify-between gap-6 rounded-xl sm:rounded-2xl bg-white/5 border-2 border-white/10 p-4 sm:p-5">
        <div className="space-y-1">
          <div className="text-xs md:text-sm font-semibold tracking-[0.04em] text-white">
            {t("planner.accommodation.quietPlaces.label")}
          </div>
          <div className="text-white/60 text-sm">
            {t("planner.accommodation.quietPlaces.description")}
          </div>
        </div>
        <Switch
          checked={formData.quietPlaces}
          onCheckedChange={(checked) => onChange({ quietPlaces: checked })}
          aria-label={t("planner.accommodation.quietPlaces.label")}
          className="border-primary/80 data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(255,128,0,0.35)]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch text-left">
        {categories.filter((cat) => cat.id === "facilities").map((cat) => (
          <motion.div 
            key={cat.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-10 shadow-xl space-y-8 flex flex-col items-start text-left"
            style={glassPanelStyle}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20">
                <cat.icon className="w-5 h-5" />
              </div>
              <Label className="text-xs font-semibold tracking-[0.04em] text-white">
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

        <div className="p-6 sm:p-10 shadow-xl space-y-8 flex flex-col items-start text-left" style={glassPanelStyle}>
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20">
              <Heart className="w-5 h-5" />
            </div>
            <Label className="text-xs font-semibold tracking-[0.04em] text-white">
              {t("planner.interests.title")}
            </Label>
          </div>

          <div className="w-full text-left">
            <ToggleGroup
              name="activities"
              options={interestOptions}
              selectedValues={formData.activities}
              onChange={onCheckboxChange}
            />
          </div>
        </div>
      </div>

      <div className="w-full space-y-4 text-left">
        <Label htmlFor="additionalInfo" className="text-xs md:text-sm font-semibold tracking-[0.06em] text-white flex items-center gap-2 ml-4">
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
  );
}
