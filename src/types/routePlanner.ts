export interface RouteStage {
  destination: string;
  booked: boolean;
  detailsEnabled: boolean;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
}

export interface FormData {
  startPoint: string;
  destination: string;
  returnDestination: string;
  vacationDestination: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  destinationDetailsEnabled: boolean;
  destinationDepartureDate: string;
  destinationDepartureTime: string;
  destinationBooked: boolean;
  destinationStayPlanned: boolean;
  durationFlexible: boolean;
  distance: string;
  maxDailyDistance: string;
  maxDailyDriveHours: string;
  dailyLimitPriority: string;
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
  targetRegions: string;
  preferScenicLongerStops: boolean;
  routePreferences: string[];
  accommodationType: string[];
  avgCampsitePriceMax: string;
  quietPlaces: boolean;
  accommodation: string;
  activities: string[];
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
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  destinationDetailsEnabled: false,
  destinationDepartureDate: '',
  destinationDepartureTime: '',
  destinationBooked: false,
  destinationStayPlanned: false,
  durationFlexible: false,
  distance: '',
  maxDailyDistance: '0',
  maxDailyDriveHours: '0',
  dailyLimitPriority: '',
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
  targetRegions: '',
  preferScenicLongerStops: false,
  routePreferences: [],
  accommodationType: [],
  avgCampsitePriceMax: '50',
  quietPlaces: false,
  accommodation: '',
  activities: [],
  avoidHighways: [],
  avoidTollCountries: [],
  avoidRegions: '',
  facilities: [],
  numberOfTravelers: '2',
  additionalInfo: ''
};

export const initialAISettings: AISettings = {
  aiProvider: 'openai',
  apiKey: '',
  useDirectAI: false,
  openaiModel: 'gpt-5.2',
  mistralModel: 'mistral-large-latest',
  googleModel: 'gemini-3.1-pro-preview'
};
