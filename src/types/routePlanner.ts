export interface FormData {
  startPoint: string;
  destination: string;
  startDate: string;
  endDate: string;
  distance: string;
  maxDailyDistance: string;
  routeType: string;
  gpxOutputMode: string[];
  stageDestination1: string;
  stageDestination2: string;
  vehicleLength: string;
  vehicleHeight: string;
  vehicleWeight: string;
  vehicleWidth: string;
  axleLoad: string;
  fuelType: string;
  toiletteSystem: string;
  solarPower: string;
  batteryCapacity: string;
  autonomyDays: string;
  heatingSystem: string;
  levelingJacks: string;
  routeAdditionalInfo: string;
  routePreferences: string[];
  accommodationType: string[];
  avgCampsitePriceMax: string;
  accommodation: string;
  travelStyle: string;
  activities: string[];
  travelCompanions: string[];
  avoidHighways: string[];
  facilities: string[];
  numberOfTravelers: string;
  additionalInfo: string;
}

export interface AISettings {
  aiProvider: string;
  apiKey: string;
  useDirectAI: boolean;
  openaiModel: string;
  mistralModel: string;
  googleModel: string;
}

export const initialFormData: FormData = {
  startPoint: '',
  destination: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  distance: '',
  maxDailyDistance: '250',
  routeType: '',
  gpxOutputMode: [],
  stageDestination1: '',
  stageDestination2: '',
  vehicleLength: '7',
  vehicleHeight: '2.9',
  vehicleWeight: '3.5',
  vehicleWidth: '2.3',
  axleLoad: '2.5',
  fuelType: '',
  toiletteSystem: '',
  solarPower: '0',
  batteryCapacity: '0',
  autonomyDays: '0',
  heatingSystem: '',
  levelingJacks: '',
  routeAdditionalInfo: '',
  routePreferences: [],
  accommodationType: [],
  avgCampsitePriceMax: '50',
  accommodation: '',
  travelStyle: '',
  activities: [],
  travelCompanions: [],
  avoidHighways: [],
  facilities: [],
  numberOfTravelers: '2',
  additionalInfo: ''
};

export const initialAISettings: AISettings = {
  aiProvider: 'google',
  apiKey: '',
  useDirectAI: false,
  openaiModel: 'gpt-5.2',
  mistralModel: 'mistral-large-latest',
  googleModel: 'gemini-3-pro-preview'
};
