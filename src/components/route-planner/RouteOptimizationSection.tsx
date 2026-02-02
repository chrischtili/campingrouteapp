import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { SectionCard } from "./SectionCard";
import { CheckboxGroup } from "./CheckboxGroup";

interface RouteOptimizationSectionProps {
  formData: FormData;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

const roadTypeOptions = [
  { value: 'Schnellstraßen bevorzugen', label: 'Schnellstraßen bevorzugen (schnellste Route)' },
  { value: 'Landstraßen bevorzugen', label: 'Landstraßen bevorzugen (entspannte Fahrt)' },
  { value: 'Panoramastraßen', label: 'Panoramastraßen (landschaftlich reizvoll)' },
];

const landscapeOptions = [
  { value: 'Seenroute', label: 'Seen & Gewässer einbeziehen' },
  { value: 'Bergstraßen', label: 'Bergpässe & Aussichtspunkte' },
  { value: 'Küstenroute', label: 'Küstenstraßen & Meerblicke' },
  { value: 'Waldrouten', label: 'Wälder & Naturparks' },
];

const trafficOptions = [
  { value: 'Stau vermeiden', label: 'Stau & Rush-Hour vermeiden' },
  { value: 'Tunnel vermeiden', label: 'Tunnel vermeiden' },
  { value: 'Nachtfahrten minimieren', label: 'Nachtfahrten minimieren' },
  { value: 'Baustellen umfahren', label: 'Baustellen umfahren' },
  { value: 'Maut vermeiden', label: 'Mautstraßen vermeiden' },
];

const cultureOptions = [
  { value: 'Städte einbeziehen', label: 'Städte & Kultur einbeziehen' },
  { value: 'Ländliche Routen', label: 'Ländliche & abgelegene Routen' },
  { value: 'Historische Routen', label: 'Historische Straßen (z.B. Römerstraßen)' },
];

export function RouteOptimizationSection({ formData, onCheckboxChange }: RouteOptimizationSectionProps) {
  return (
    <SectionCard icon="🎯" title="Routenoptimierung" subtitle="(Mehrfachauswahl möglich)">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-3">
          <Label className="font-medium">Straßenart Präferenz</Label>
          <CheckboxGroup
            name="routePreferences"
            options={roadTypeOptions}
            selectedValues={formData.routePreferences}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Landschaftliche Highlights</Label>
          <CheckboxGroup
            name="routePreferences"
            options={landscapeOptions}
            selectedValues={formData.routePreferences}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Verkehr & Sicherheit</Label>
          <CheckboxGroup
            name="routePreferences"
            options={trafficOptions}
            selectedValues={formData.routePreferences}
            onChange={onCheckboxChange}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Kultur & Städte</Label>
          <CheckboxGroup
            name="routePreferences"
            options={cultureOptions}
            selectedValues={formData.routePreferences}
            onChange={onCheckboxChange}
          />
        </div>
      </div>
    </SectionCard>
  );
}
