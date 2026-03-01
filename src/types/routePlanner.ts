export interface RouteStage {
  destination: string;
  arrivalDate: string;
  arrivalTime: string;
}

export interface FormData {
  startPoint: string;
  destination: string;
  returnDestination: string;
  vacationDestination: string;
  startDate: string;
  endDate: string;
  destinationStayPlanned: boolean;
  startTime: string;
  endTime: string;
  durationFlexible: boolean;
  distance: string;
  maxDailyDistance: string;
  travelPace: string;
  routeType: string;
  gpxOutputMode: string[];
  stages: RouteStage[];
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
  returnDestination: '',
  vacationDestination: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  destinationStayPlanned: false,
  startTime: '',
  endTime: '',
  durationFlexible: false,
  distance: '',
  maxDailyDistance: '250',
  travelPace: '',
  routeType: '',
  gpxOutputMode: [],
  stages: [],
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
