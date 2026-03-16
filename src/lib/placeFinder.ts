import type { PlaceCategory, PlaceSearchResult } from "@/types/placeFinder";

interface SearchPlacesOptions {
  query: string;
  categories: PlaceCategory[];
  limit?: number;
}

export async function searchPlaces({
  query,
  categories,
  limit = 8,
}: SearchPlacesOptions): Promise<PlaceSearchResult[]> {
  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(limit),
  });

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
