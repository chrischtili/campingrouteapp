import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionCard } from "./SectionCard";
import { CheckboxGroup } from "./CheckboxGroup";
import { FormSlider } from "./FormSlider";

interface AccommodationSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

const accommodationTypeOptions = [
  { value: 'Campingplatz', label: 'Campingplatz' },
  { value: 'Wohnmobilstellplatz', label: 'Wohnmobilstellplatz' },
  { value: 'Bauernhof', label: 'Bauernhof-Camping' },
  { value: 'Weingut', label: 'Weingut/Winzer' },
  { value: 'Wildcampen', label: 'Wildcampen (wo erlaubt)' },
  { value: 'Park4Night', label: 'Park4Night Spots' },
];

const facilitiesOptions = [
  { value: 'Strom', label: 'Stromanschluss' },
  { value: 'Wasser', label: 'Frischwasser' },
  { value: 'Entsorgung', label: 'Ver-/Entsorgung' },
  { value: 'WLAN', label: 'WLAN' },
  { value: 'Sanitär', label: 'Sanitäranlagen' },
  { value: 'Waschmaschine', label: 'Waschmaschine' },
  { value: 'Hundefreundlich', label: 'Hundefreundlich' },
  { value: 'Schwimmbad', label: 'Schwimmbad' },
];

const companionOptions = [
  { value: 'Partner', label: 'Partner / Ehepartner' },
  { value: 'Freunde', label: 'Freunde' },
  { value: 'Familie', label: 'Familie' },
  { value: 'Kinder', label: 'Kinder' },
  { value: 'Babys', label: 'Babys / Kleinkinder' },
  { value: 'Haustiere', label: 'Haustiere / Hunde' },
  { value: 'Mehrgenerationenreise', label: 'Mehrgenerationenreise' },
  { value: 'Seniorengruppe', label: 'Seniorengruppe' },
];

export function AccommodationSection({ formData, onChange, onCheckboxChange }: AccommodationSectionProps) {
  return (
    <SectionCard icon="🏕️" title="Übernachtungsoptionen" subtitle="(Mehrfachauswahl möglich)" iconColor="bg-pink-100" titleColor="text-pink-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Row 1 */}
        <div className="space-y-3">
          <Label className="font-medium">Reisebegleitung</Label>
          <CheckboxGroup
            name="travelCompanions"
            options={companionOptions}
            selectedValues={formData.travelCompanions}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Unterkunftstyp</Label>
          <CheckboxGroup
            name="accommodationType"
            options={accommodationTypeOptions}
            selectedValues={formData.accommodationType}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Benötigte Ausstattung</Label>
          <CheckboxGroup
            name="facilities"
            options={facilitiesOptions}
            selectedValues={formData.facilities}
            onChange={onCheckboxChange}
          />
        </div>

        {/* Row 2 */}
        <div className="space-y-3">
          <Label className="font-medium">Anzahl Reisende</Label>
          <FormSlider
            id="numberOfTravelers"
            label=""
            value={formData.numberOfTravelers ? parseInt(formData.numberOfTravelers) : 1}
            min={1}
            max={8}
            step={1}
            unit="Personen"
            onChange={(v) => onChange({ numberOfTravelers: v.toString() })}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Max. Budget pro Nacht</Label>
          <FormSlider
            id="avgCampsitePriceMax"
            label=""
            value={formData.avgCampsitePriceMax ? parseInt(formData.avgCampsitePriceMax) : 0}
            min={0}
            max={150}
            step={5}
            unit="€"
            onChange={(v) => onChange({ avgCampsitePriceMax: v.toString() })}
          />
        </div>

        <div className="space-y-3">
          {/* Empty column */}
        </div>

        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          <Label htmlFor="accommodation">Zusätzliche Übernachtungswünsche</Label>
          <Textarea
            id="accommodation"
            placeholder="Spezifische Wünsche für Campingplätze/Stellplätze (z. B. Schwimmbecken, Hundestrand, Restaurant, Fahrradverleih)"
            value={formData.accommodation}
            onChange={(e) => onChange({ accommodation: e.target.value })}
            rows={2}
          />
        </div>
      </div>
    </SectionCard>
  );
}
