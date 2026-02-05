import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionCard } from "./SectionCard";

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
    <SectionCard icon="🗺️" title="Reiseroute">
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
          <Label htmlFor="maxDailyDistance">Max. Fahrstrecke pro Tag (km)</Label>
          <Input
            id="maxDailyDistance"
            type="number"
            placeholder="z.B. 300"
            value={formData.maxDailyDistance}
            onChange={(e) => onChange({ maxDailyDistance: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="routeType">Routentyp</Label>
          <Select value={formData.routeType} onValueChange={(value) => onChange({ routeType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="-- Bitte wählen --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rundreise">Rundreise</SelectItem>
              <SelectItem value="Hin- und Rückfahrt">Hin- und Rückfahrt</SelectItem>
              <SelectItem value="One-Way Route">One-Way Route</SelectItem>
              <SelectItem value="Mehrere Ziele">Mehrere Ziele / Etappenreise</SelectItem>
            </SelectContent>
          </Select>
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