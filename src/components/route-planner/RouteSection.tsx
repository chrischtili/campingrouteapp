import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionCard } from "./SectionCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import de from 'date-fns/locale/de';

interface RouteSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

// Register German locale for DatePicker
registerLocale('de', de);
setDefaultLocale('de');

export function RouteSection({ formData, onChange }: RouteSectionProps) {
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
          <div className="relative z-50">
            <DatePicker
              id="startDate"
              selected={formData.startDate ? new Date(formData.startDate) : null}
              onChange={(date) => onChange({ 
                startDate: date ? date.toISOString().split('T')[0] : '', 
                endDate: date ? date.toISOString().split('T')[0] : formData.endDate 
              })}
              minDate={new Date()}
              dateFormat="dd.MM.yyyy"
              className="w-full h-10 px-3 py-2 border rounded-md border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholderText="Datum auswählen"
              wrapperClassName="w-full"
              locale="de"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              highlightDates={[
                // Deutsche Feiertage 2024
                new Date(2024, 0, 1),   // Neujahr
                new Date(2024, 4, 1),   // Tag der Arbeit
                new Date(2024, 9, 3),   // Tag der Deutschen Einheit
                new Date(2024, 11, 25), // 1. Weihnachtsfeiertag
                new Date(2024, 11, 26), // 2. Weihnachtsfeiertag
                // Ostern 2024 (berechnet)
                new Date(2024, 2, 29),  // Karfreitag
                new Date(2024, 3, 1),   // Ostermontag
                // Pfingsten 2024
                new Date(2024, 4, 19),  // Pfingstsonntag
                new Date(2024, 4, 20),  // Pfingstmontag
              ]}
              popperClassName="react-datepicker-popper"
              popperPlacement="bottom-start"
              popperModifiers={[
                {
                  name: 'preventOverflow',
                  options: {
                    rootBoundary: 'viewport',
                    padding: 12,
                  },
                },
                {
                  name: 'flip',
                  options: {
                    fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                  },
                },
              ]}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Ankunft</Label>
          <div className="relative z-50">
            <DatePicker
              id="endDate"
              selected={formData.endDate ? new Date(formData.endDate) : null}
              onChange={(date) => onChange({ 
                endDate: date ? date.toISOString().split('T')[0] : '' 
              })}
              minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
              dateFormat="dd.MM.yyyy"
              className="w-full h-10 px-3 py-2 border rounded-md border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholderText="Datum auswählen"
              wrapperClassName="w-full"
              locale="de"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              highlightDates={[
                // Deutsche Feiertage 2024
                new Date(2024, 0, 1),   // Neujahr
                new Date(2024, 4, 1),   // Tag der Arbeit
                new Date(2024, 9, 3),   // Tag der Deutschen Einheit
                new Date(2024, 11, 25), // 1. Weihnachtsfeiertag
                new Date(2024, 11, 26), // 2. Weihnachtsfeiertag
                // Ostern 2024 (berechnet)
                new Date(2024, 2, 29),  // Karfreitag
                new Date(2024, 3, 1),   // Ostermontag
                // Pfingsten 2024
                new Date(2024, 4, 19),  // Pfingstsonntag
                new Date(2024, 4, 20),  // Pfingstmontag
              ]}
              popperClassName="react-datepicker-popper"
              popperPlacement="bottom-start"
              popperModifiers={[
                {
                  name: 'preventOverflow',
                  options: {
                    rootBoundary: 'viewport',
                    padding: 12,
                  },
                },
                {
                  name: 'flip',
                  options: {
                    fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                  },
                },
              ]}
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
