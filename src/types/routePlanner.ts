export interface FormData {
  startPoint: string;
  destination: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  durationFlexible: boolean;
  distance: string;
  maxDailyDistance: string;
  travelPace: string;
  routeType: string;
  gpxOutputMode: string[];
  stageDestination1: string;
  stageDestination2: string;
  stageArrivalTime1: string;
  stageArrivalTime2: string;
  vehicleLength: string;
  vehicleHeight: string;
  vehicleWidth: string;
  weightClass: string;
  vehicleType: string;
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
  budgetLevel: string;
  quietPlaces: boolean;
  accommodation: string;
  travelStyle: string;
  activities: string[];
  travelCompanions: string[];
  avoidHighways: string[];
  avoidTollCountries: string[];
  avoidRegions: string;
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
  startTime: '',
  endTime: '',
  durationFlexible: false,
  distance: '',
  maxDailyDistance: '250',
  travelPace: '',
  routeType: '',
  gpxOutputMode: [],
  stageDestination1: '',
  stageDestination2: '',
  stageArrivalTime1: '',
  stageArrivalTime2: '',
  vehicleLength: '7',
  vehicleHeight: '2.9',
  vehicleWidth: '2.3',
  weightClass: '',
  vehicleType: '',
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
  budgetLevel: '',
  quietPlaces: false,
  accommodation: '',
  travelStyle: '',
  activities: [],
  travelCompanions: [],
  avoidHighways: [],
  avoidTollCountries: [],
  avoidRegions: '',
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
  googleModel: 'gemini-3.1-pro-preview'
};
