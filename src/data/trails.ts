export interface Trail {
  id: string;
  name: string;
  type: "hiking" | "biking" | "both";
  region: string;
  state?: string;
  country: string;
  distance_km: number;
  duration_hours?: number;
  difficulty: "easy" | "medium" | "hard";
  elevation_gain_m?: number;
  description: string;
  highlights: string[];
  image_url: string;
  start_location: string;
  end_location: string;
  latitude: number;
  longitude: number;
  campsites_along_count: number;
  rating: number;
  search_query?: string;
  distance_to_place_km?: number;
  source?: string;
  uri?: string;
  polyline?: [number, number][];
  start_coords?: [number, number];
  end_coords?: [number, number];
}

export const GERMAN_STATES_LIST = [
  "Alle Bundesländer",
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen"
] as const;

export const FAMOUS_TRAILS: Trail[] = [
  {
    id: "trail-rheinsteig",
    name: "Rheinsteig",
    type: "hiking",
    region: "Mittelrhein & Rheingau",
    state: "Rheinland-Pfalz",
    country: "DE",
    distance_km: 320,
    duration_hours: 80,
    difficulty: "hard",
    elevation_gain_m: 11200,
    description: "Spektakulärer Fernwanderweg von Bonn über Koblenz nach Wiesbaden durch das UNESCO-Welterbe Oberes Mittelrheintal mit Burgen, Weinbergen und Felssteigen.",
    highlights: ["UNESCO-Welterbe Mittelrhein", "Loreley-Aussicht", "Marksburg & Festung Ehrenbreitstein", "Rhein-Weinberge"],
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    start_location: "Bonn",
    end_location: "Wiesbaden",
    latitude: 50.148,
    longitude: 7.726,
    campsites_along_count: 24,
    rating: 4.9,
    search_query: "Camping Mittelrhein Loreley",
    source: "dzt_opendata"
  },
  {
    id: "trail-malerweg",
    name: "Malerweg Elbsandsteingebirge",
    type: "hiking",
    region: "Sächsische Schweiz",
    state: "Sachsen",
    country: "DE",
    distance_km: 116,
    duration_hours: 36,
    difficulty: "hard",
    elevation_gain_m: 3800,
    description: "Einer der traditionsreichsten und schönsten Wanderwege Deutschlands durch wildromantische Felsenschluchten und Tafelberge der Sächsischen Schweiz.",
    highlights: ["Basteibrücke", "Festung Königstein", "Schrammsteine", "Kirnitzschtal"],
    image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    start_location: "Liebethal",
    end_location: "Pirna",
    latitude: 50.962,
    longitude: 14.072,
    campsites_along_count: 18,
    rating: 5.0,
    search_query: "Camping Sächsische Schweiz Bastei",
    source: "dzt_opendata"
  },
  {
    id: "trail-donauradweg-de",
    name: "Donauradweg (Deutsche Etappe)",
    type: "biking",
    region: "Donautal & Bayern",
    state: "Bayern",
    country: "DE",
    distance_km: 595,
    duration_hours: 38,
    difficulty: "easy",
    elevation_gain_m: 1200,
    description: "Von der Donauquelle in Donaueschingen über das Durchbruchstal bei Beuron, Ulm, Regensburg bis nach Passau.",
    highlights: ["Donaudurchbruch Weltenburg", "Regensburger Altstadt", "Drei-Flüsse-Stadt Passau", "Kloster Beuron"],
    image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    start_location: "Donaueschingen",
    end_location: "Passau",
    latitude: 48.916,
    longitude: 11.821,
    campsites_along_count: 42,
    rating: 4.9,
    search_query: "Camping Donau Weltenburg Passau",
    source: "dzt_opendata"
  },
  {
    id: "trail-altmuehltal-panoramaweg",
    name: "Altmühltal-Panoramaweg",
    type: "hiking",
    region: "Naturpark Altmühltal",
    state: "Bayern",
    country: "DE",
    distance_km: 200,
    duration_hours: 50,
    difficulty: "medium",
    elevation_gain_m: 4200,
    description: "Entlang der mäandernden Altmühl vorbei an bizarren Dolomitfelsen wie den Zwölf Aposteln, Wacholderheiden und Schlössern.",
    highlights: ["Zwölf Apostel Felsen", "Burg Pappenheim", "Befreiungshalle Kelheim", "Kratzmühlsee"],
    image_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    start_location: "Gunzenhausen",
    end_location: "Kelheim",
    latitude: 48.932,
    longitude: 11.365,
    campsites_along_count: 22,
    rating: 4.8,
    search_query: "Camping Altmühltal",
    source: "dzt_opendata"
  },
  {
    id: "trail-westweg-schwarzwald",
    name: "Westweg Schwarzwald",
    type: "hiking",
    region: "Schwarzwald",
    state: "Baden-Württemberg",
    country: "DE",
    distance_km: 285,
    duration_hours: 75,
    difficulty: "hard",
    elevation_gain_m: 8500,
    description: "Der Klassiker über den Schwarzwald-Hauptkamm von Pforzheim nach Basel mit Feldberg, Belchen und Mummelsee.",
    highlights: ["Feldberggipfel (1493m)", "Mummelsee & Hornisgrinde", "Titisee", "Wutachschlucht"],
    image_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    start_location: "Pforzheim",
    end_location: "Basel",
    latitude: 48.356,
    longitude: 8.163,
    campsites_along_count: 28,
    rating: 4.9,
    search_query: "Camping Schwarzwald Titisee Schluchsee",
    source: "dzt_opendata"
  },
  {
    id: "trail-mosel-radweg",
    name: "Mosel-Radweg",
    type: "biking",
    region: "Moseltal",
    state: "Rheinland-Pfalz",
    country: "DE",
    distance_km: 248,
    duration_hours: 16,
    difficulty: "easy",
    elevation_gain_m: 450,
    description: "Entspanntes Radeln durch steile Weinberge, historische Winzerdörfer, römische Denkmäler und Burgen von Perl über Trier bis Koblenz.",
    highlights: ["Porta Nigra Trier", "Burg Eltz", "Cochem & Reichsburg", "Bernkastel-Kues"],
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    start_location: "Perl",
    end_location: "Koblenz",
    latitude: 50.083,
    longitude: 7.135,
    campsites_along_count: 35,
    rating: 4.9,
    search_query: "Camping Mosel Cochem Bernkastel",
    source: "dzt_opendata"
  },
  {
    id: "trail-harzer-hexenstieg",
    name: "Harzer Hexenstieg",
    type: "hiking",
    region: "Harz",
    state: "Niedersachsen",
    country: "DE",
    distance_km: 97,
    duration_hours: 28,
    difficulty: "medium",
    elevation_gain_m: 2300,
    description: "Von Osterode über den Brocken nach Thale quer durch den Nationalpark Harz mit Bodetal-Schlucht und Hochmooren.",
    highlights: ["Brockengipfel (1141m)", "Bodetal Grand Canyon", "Oberharzer Wasserregal", "Tropfsteinhöhlen Rübeland"],
    image_url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
    start_location: "Osterode am Harz",
    end_location: "Thale",
    latitude: 51.785,
    longitude: 10.612,
    campsites_along_count: 14,
    rating: 4.8,
    search_query: "Camping Harz Brocken",
    source: "dzt_opendata"
  },
  {
    id: "trail-ostseekuesten-radweg",
    name: "Ostseeküsten-Radweg (D2)",
    type: "biking",
    region: "Ostseeküste",
    state: "Mecklenburg-Vorpommern",
    country: "DE",
    distance_km: 430,
    duration_hours: 28,
    difficulty: "easy",
    elevation_gain_m: 750,
    description: "Entlang der Küste von Lübeck über Wismar, Warnemünde, Fischland-Darß, Rügen bis Usedom mit feinsandigen Stränden.",
    highlights: ["Kreidefelsen Rügen", "Fischland-Darß-Zingst", "Kaiserbäder Usedom", "Hansestädte Wismar & Stralsund"],
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    start_location: "Lübeck",
    end_location: "Ahlbeck / Usedom",
    latitude: 54.341,
    longitude: 13.125,
    campsites_along_count: 38,
    rating: 4.9,
    search_query: "Camping Ostsee Rügen Usedom Darß",
    source: "dzt_opendata"
  }
];

export function getNearbyTrails(
  lat: number,
  lon: number,
  maxDistanceKm: number = 55,
  trailsList: Trail[] = FAMOUS_TRAILS
): (Trail & { distance_to_place_km: number })[] {
  function calcDist(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  const sourceList = (trailsList && trailsList.length > 0) ? trailsList : FAMOUS_TRAILS;

  return sourceList
    .filter(t => t && typeof t.latitude === 'number' && typeof t.longitude === 'number')
    .map(t => ({
      ...t,
      distance_to_place_km: calcDist(lat, lon, t.latitude, t.longitude)
    }))
    .filter(t => t.distance_to_place_km <= maxDistanceKm)
    .sort((a, b) => a.distance_to_place_km - b.distance_to_place_km);
}
