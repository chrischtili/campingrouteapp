import type { PlaceCategory, PlaceSearchResult, PlaceSuggestion } from "@/types/placeFinder";

interface SearchPlacesOptions {
  query: string;
  categories: PlaceCategory[];
  limit?: number;
  suggestion?: PlaceSuggestion;
}

interface SearchPlaceSuggestionsOptions {
  query: string;
  limit?: number;
}

export async function searchPlaceSuggestions({
  query,
  limit = 6,
}: SearchPlaceSuggestionsOptions): Promise<PlaceSuggestion[]> {
  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(limit),
  });

  const response = await fetch(`/api/places/suggest?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || `suggest_failed_${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data?.suggestions) ? (data.suggestions as PlaceSuggestion[]) : [];
}

export async function searchPlaces({
  query,
  categories,
  limit = 8,
  suggestion,
}: SearchPlacesOptions): Promise<PlaceSearchResult[]> {
  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(limit),
  });

  if (suggestion) {
    params.set("lat", String(suggestion.lat));
    params.set("lon", String(suggestion.lon));
    params.set("bbox", suggestion.boundingBox);
  }

  categories.forEach((category) => params.append("category", category));

  const response = await fetch(`/api/places/search?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || `search_failed_${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data?.results) ? (data.results as PlaceSearchResult[]) : [];
}
