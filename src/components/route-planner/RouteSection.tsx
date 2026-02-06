import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionCard } from "./SectionCard";
import { FormSlider } from "./FormSlider";

export function RouteSection({ formData, onChange }: RouteSectionProps) {
  // Handle date selection logic
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    onChange({ startDate: newStartDate });
    
    // If end date is empty or before start date, set it to start date
    if (!formData.endDate || new Date(formData.endDate) < new Date(newStartDate)) {
      onChange({ endDate: newStartDate });
    }
  };

  return (
    <SectionCard icon="🗺️" title="Reiseroute" iconColor="bg-blue-100" titleColor="text-blue-700">
      {/* Routentyp und Reisestil - ganz oben */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="routeType">Routentyp</Label>
          <Select value={formData.routeType} onValueChange={(value) => onChange({ routeType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="-- Bitte wählen --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="One-Way Route">One-Way Route</SelectItem>
              <SelectItem value="Hin- und Rückfahrt">Hin- und Rückfahrt</SelectItem>
              <SelectItem value="Rundreise">Rundreise</SelectItem>
              <SelectItem value="Mehrere Ziele">Mehrere Ziele / Etappenreise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="travelStyle">Reisestil</Label>
          <Select value={formData.travelStyle} onValueChange={(value) => onChange({ travelStyle: value })}>
            <SelectTrigger>
              <SelectValue placeholder="-- Bitte wählen --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Abenteuer">Abenteuer & Outdoor</SelectItem>
              <SelectItem value="Entspannung">Entspannung & Wellness</SelectItem>
              <SelectItem value="Kultur">Kultur & Geschichte</SelectItem>
              <SelectItem value="Natur">Natur & Wandern</SelectItem>
              <SelectItem value="Familie">Familie & Freizeit</SelectItem>
              <SelectItem value="Gourmet">Gourmet & Kulinarik</SelectItem>
              <SelectItem value="Slow Travel">Slow Travel & Nachhaltigkeit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hauptformular */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startPoint">
            Start <span className="text-destructive">*</span>
          </Label>
          <Input
            id="startPoint"
            placeholder="z.B. München, Deutschland"
            value={formData.startPoint}
            onChange={(e) => onChange({ startPoint: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">
            Ziel <span className="text-destructive">*</span>
          </Label>
          <Input
            id="destination"
            placeholder="z.B. Schwarzwald, Deutschland"
            value={formData.destination}
            onChange={(e) => onChange({ destination: e.target.value })}
            required
          />
        </div>

        {/* Etappenziel-Felder - nur bei "Mehrere Ziele / Etappenreise" */}
        {formData.routeType === 'Mehrere Ziele' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="stageDestination1">Etappenziel 1</Label>
              <Input
                id="stageDestination1"
                placeholder="z.B. Stuttgart, Deutschland"
                value={formData.stageDestination1}
                onChange={(e) => onChange({ stageDestination1: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stageDestination2">Etappenziel 2</Label>
              <Input
                id="stageDestination2"
                placeholder="z.B. Karlsruhe, Deutschland"
                value={formData.stageDestination2}
                onChange={(e) => onChange({ stageDestination2: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="startDate">Abreise</Label>
          <div className="relative z-50 mb-8">
            <input
              id="startDate"
              type="date"
              value={formData.startDate || ''}
              onChange={handleStartDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-10 px-3 py-2 border rounded-md border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Ankunft</Label>
          <div className="relative z-50">
            <input
              id="endDate"
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => onChange({ endDate: e.target.value })}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              className="w-full h-10 px-3 py-2 border rounded-md border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <FormSlider
            id="maxDailyDistance"
            label="Max. Fahrstrecke pro Tag (km)"
            value={parseInt(formData.maxDailyDistance) || 250}
            min={100}
            max={1000}
            step={50}
            unit="km"
            onChange={(value) => onChange({ maxDailyDistance: value.toString() })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="routeAdditionalInfo">Zusätzliche Routeninformationen</Label>
          <Textarea
            id="routeAdditionalInfo"
            placeholder="Besondere Wünsche für die Route (z. B. konkrete Zwischenziele, persönliche Präferenzen, spezielle Anforderungen)"
            value={formData.routeAdditionalInfo}
            onChange={(e) => onChange({ routeAdditionalInfo: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </SectionCard>
  );
}

interface RouteSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}