import { FormData } from "@/types/routePlanner";

export const cloneFormDataSnapshot = (formData: FormData): FormData => ({
  ...formData,
  gpxOutputMode: [...formData.gpxOutputMode],
  stages: formData.stages.map((stage) => ({ ...stage })),
  routePreferences: [...formData.routePreferences],
  accommodationType: [...formData.accommodationType],
  activities: [...formData.activities],
  avoidHighways: [...formData.avoidHighways],
  avoidTollCountries: [...formData.avoidTollCountries],
  facilities: [...formData.facilities],
});
