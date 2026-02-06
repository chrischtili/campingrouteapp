import { FormData } from "@/types/routePlanner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionCard } from "./SectionCard";
import { FormSlider } from "./FormSlider";

interface VehicleSectionProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export function VehicleSection({ formData, onChange }: VehicleSectionProps) {
  return (
    <SectionCard icon="🚐" title="Fahrzeugspezifische Filter" iconColor="bg-green-100" titleColor="text-green-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormSlider
          id="vehicleLength"
          label="Länge"
          value={parseFloat(formData.vehicleLength) || 7}
          min={5}
          max={12}
          step={0.1}
          unit="m"
          onChange={(v) => onChange({ vehicleLength: v.toString() })}
        />

        <FormSlider
          id="vehicleHeight"
          label="Höhe"
          value={parseFloat(formData.vehicleHeight) || 2.9}
          min={2}
          max={3.8}
          step={0.1}
          unit="m"
          onChange={(v) => onChange({ vehicleHeight: v.toString() })}
        />

        <FormSlider
          id="vehicleWidth"
          label="Breite"
          value={parseFloat(formData.vehicleWidth) || 2.3}
          min={1.9}
          max={2.5}
          step={0.1}
          unit="m"
          onChange={(v) => onChange({ vehicleWidth: v.toString() })}
        />

        <FormSlider
          id="vehicleWeight"
          label="Zulässiges Gesamtgewicht"
          value={parseFloat(formData.vehicleWeight) || 3.5}
          min={3.5}
          max={7.5}
          step={0.1}
          unit="t"
          onChange={(v) => onChange({ vehicleWeight: v.toString() })}
        />

        <FormSlider
          id="axleLoad"
          label="Max. Achslast"
          value={parseFloat(formData.axleLoad) || 2.5}
          min={1.5}
          max={4.5}
          step={0.1}
          unit="t"
          onChange={(v) => onChange({ axleLoad: v.toString() })}
        />

        <div className="space-y-2">
          <Label htmlFor="fuelType">Kraftstoffart</Label>
          <Select value={formData.fuelType} onValueChange={(value) => onChange({ fuelType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="-- Bitte wählen --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Benzin">Benzin</SelectItem>
              <SelectItem value="LPG">LPG / Autogas</SelectItem>
              <SelectItem value="Elektro">Elektro</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <FormSlider
          id="solarPower"
          label="Solaranlage"
          value={parseFloat(formData.solarPower) || 300}
          min={50}
          max={1000}
          step={50}
          unit="W"
          onChange={(v) => onChange({ solarPower: v.toString() })}
        />

        <FormSlider
          id="batteryCapacity"
          label="Aufbaubatterie"
          value={parseFloat(formData.batteryCapacity) || 200}
          min={50}
          max={1000}
          step={25}
          unit="Ah"
          onChange={(v) => onChange({ batteryCapacity: v.toString() })}
        />

        <div className="space-y-2">
          <Label htmlFor="toiletteSystem">Toilettensystem</Label>
          <Select value={formData.toiletteSystem} onValueChange={(value) => onChange({ toiletteSystem: value })}>
            <SelectTrigger>
              <SelectValue placeholder="-- Bitte wählen --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Kassettentoilette">Kassettentoilette</SelectItem>
              <SelectItem value="Chemietoilette">Chemietoilette</SelectItem>
              <SelectItem value="Trockentrenntoilette">Trockentrenntoilette</SelectItem>
              <SelectItem value="Festtanktoilette">Festtanktoilette</SelectItem>
              <SelectItem value="Clesana">Clesana</SelectItem>
              <SelectItem value="Keine">Keine Toilette</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SectionCard>
  );
}
