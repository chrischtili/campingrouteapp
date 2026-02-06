import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "./SectionCard";
import { CheckboxGroup } from "./CheckboxGroup";
import { FormSlider } from "./FormSlider";

interface ActivitiesSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

const activityOptions = [
  { value: 'Wandern', label: 'Wandern' },
  { value: 'Fahrradfahren', label: 'Fahrradfahren' },
  { value: 'Wassersport', label: 'Wassersport (Schwimmen, Segeln, Kanu)' },
  { value: 'Klettern', label: 'Klettern / Bergsteigen' },
  { value: 'Vogelbeobachtung', label: 'Vogelbeobachtung / Naturbeobachtung' },
  { value: 'Fischen', label: 'Fischen' },
  { value: 'Astronomie', label: 'Astronomie / Sternenbeobachtung' },
  { value: 'Museen', label: 'Museen & Galerien' },
  { value: 'Historische Stätten', label: 'Historische Stätten' },
  { value: 'Märkte', label: 'Lokale Märkte & Handwerk' },
  { value: 'Yoga', label: 'Yoga & Meditation' },
  { value: 'Wellnessangebote', label: 'Wellnessangebote & Spa' },
  { value: 'Gastronomie', label: 'Gastronomie & Weinverkostung' },
  { value: 'Hundefreundlich', label: 'Hundefreundliche Aktivitäten' },
  { value: 'Kinderfreundlich', label: 'Kinderfreundliche Aktivitäten' },
  { value: 'Fotografieren', label: 'Fotografieren' },
];

const companionOptions = [
  { value: 'Solo', label: 'Allein (Solo)' },
  { value: 'Partner', label: 'Partner / Ehepartner' },
  { value: 'Freunde', label: 'Freunde' },
  { value: 'Familie', label: 'Familie' },
  { value: 'Kinder', label: 'Kinder' },
  { value: 'Babys', label: 'Babys / Kleinkinder' },
  { value: 'Haustiere', label: 'Haustiere / Hunde' },
  { value: 'Mehrgenerationenreise', label: 'Mehrgenerationenreise' },
  { value: 'Seniorengruppe', label: 'Seniorengruppe' },
];

export function ActivitiesSection({ formData, onChange, onCheckboxChange }: ActivitiesSectionProps) {
  return (
    <SectionCard icon="✨" title="Besondere Interessen & Aktivitäten" subtitle="(Mehrfachauswahl möglich)" iconColor="bg-yellow-100" titleColor="text-yellow-700">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="font-medium">Aktivitäten & Interessen</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
            <CheckboxGroup
              name="activities"
              options={activityOptions.slice(0, 6)}
              selectedValues={formData.activities}
              onChange={onCheckboxChange}
            />
            <CheckboxGroup
              name="activities"
              options={activityOptions.slice(6, 11)}
              selectedValues={formData.activities}
              onChange={onCheckboxChange}
            />
            <CheckboxGroup
              name="activities"
              options={activityOptions.slice(11)}
              selectedValues={formData.activities}
              onChange={onCheckboxChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Weitere Informationen & Wünsche</Label>
          <Textarea
            id="additionalInfo"
            placeholder="Allgemeine Reiseinformationen (z. B. Ernährungsbedürfnisse, Allergien, gesundheitliche Einschränkungen, besondere Ereignisse während der Reise)"
            value={formData.additionalInfo}
            onChange={(e) => onChange({ additionalInfo: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </SectionCard>
  );
}
