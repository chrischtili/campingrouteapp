export interface FormData {
  startPoint: string;
  destination: string;
  startDate: string;
  endDate: string;
  distance: string;
  maxDailyDistance: string;
  routeType: string;
  vehicleLength: string;
  vehicleHeight: string;
  vehicleWeight: string;
  vehicleWidth: string;
  axleLoad: string;
  fuelType: string;
  toiletteSystem: string;
  solarPower: string;
  batteryCapacity: string;
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
  anthropicModel: string;
  mistralModel: string;
  googleModel: string;
}

export const initialFormData: FormData = {
  startPoint: '',
  destination: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  distance: '',
  maxDailyDistance: '',
  routeType: '',
  vehicleLength: '7',
  vehicleHeight: '2.9',
  vehicleWeight: '3.5',
  vehicleWidth: '2.3',
  axleLoad: '2.5',
  fuelType: '',
  toiletteSystem: '',
  solarPower: '300',
  batteryCapacity: '200',
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
  aiProvider: 'openai',
  apiKey: '',
  useDirectAI: false,
  openaiModel: 'gpt-4o-2024-05-13',
  anthropicModel: 'claude-3-5-sonnet-20240620',
  mistralModel: 'mistral-large-latest',
  googleModel: 'gemini-1.5-flash-001'
};
