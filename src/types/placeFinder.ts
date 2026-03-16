export type PlaceCategory = "camp_site" | "caravan_site";

export interface PlaceSearchResult {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lon: number;
  locality: string;
  country: string;
  address: string;
  website: string;
  phone: string;
  openingHours: string;
  fee: string;
  description: string;
  hasToilets: boolean;
  hasShowers: boolean;
  hasPowerSupply: boolean;
  hasDumpStation: boolean;
  imageUrl: string;
  imageAttribution: string;
  sourceUrl: string;
}
