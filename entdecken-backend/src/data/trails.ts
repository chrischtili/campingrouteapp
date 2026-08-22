export interface Trail {
  id: string;
  name: string;
  type: "hiking" | "biking" | "both";
  region: string;
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
}

export const FAMOUS_TRAILS: Trail[] = [
  {
    "id": "trail-westweg-schwarzwald",
    "name": "Westweg Schwarzwald",
    "type": "hiking",
    "region": "Schwarzwald",
    "country": "DE",
    "distance_km": 285,
    "duration_hours": 80,
    "difficulty": "hard",
    "elevation_gain_m": 7800,
    "description": "Der älteste und berühmteste Höhenwanderweg Deutschlands führt von Pforzheim quer durch den Schwarzwald bis nach Basel. Fantastische Fernsichten über Vogesen und Schweizer Alpen.",
    "highlights": [
      "Mummelsee",
      "Feldberg-Gipfel (1.493m)",
      "Titisee",
      "Saiger Höhe",
      "Belchen"
    ],
    "image_url": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    "start_location": "Pforzheim",
    "end_location": "Basel",
    "latitude": 48.595,
    "longitude": 8.225,
    "campsites_along_count": 24,
    "rating": 4.9,
    "search_query": "Camping im Schwarzwald"
  },
  {
    "id": "trail-moselsteig",
    "name": "Moselsteig & Mosel-Radweg",
    "type": "both",
    "region": "Mosel",
    "country": "DE",
    "distance_km": 365,
    "duration_hours": 95,
    "difficulty": "medium",
    "elevation_gain_m": 4500,
    "description": "Spektakuläre Weinbergs-Steillagen, romantische Burgen und sanfte Flussschleifen. Einer der abwechslungsreichsten Qualitätswander- und Radwege Europas mit hervorragender Camping-Dichte.",
    "highlights": [
      "Burg Eltz",
      "Bremmer Calmont (steilster Weinberg)",
      "Cochem",
      "Bernkastel-Kues",
      "Porta Nigra"
    ],
    "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "start_location": "Perl (Dreiländereck)",
    "end_location": "Koblenz (Deutsches Eck)",
    "latitude": 50.147,
    "longitude": 7.165,
    "campsites_along_count": 38,
    "rating": 4.9,
    "search_query": "Camping an der Mosel"
  },
  {
    "id": "trail-rheinsteig",
    "name": "Rheinsteig",
    "type": "hiking",
    "region": "Mittelrhein",
    "country": "DE",
    "distance_km": 320,
    "duration_hours": 85,
    "difficulty": "medium",
    "elevation_gain_m": 6200,
    "description": "Führt rechtsrheinisch durch das UNESCO-Welterbe Oberes Mittelrheintal von Bonn über Koblenz nach Wiesbaden. Dichte Burgendichte und Traumblicke auf den Rhein.",
    "highlights": [
      "Loreley-Felsen",
      "Drachenfels",
      "Marksburg",
      "Pfalzgrafenstein",
      "Schloss Biebrich"
    ],
    "image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "start_location": "Bonn",
    "end_location": "Wiesbaden",
    "latitude": 50.155,
    "longitude": 7.728,
    "campsites_along_count": 29,
    "rating": 4.8,
    "search_query": "Camping am Rhein"
  },
  {
    "id": "trail-malerweg",
    "name": "Malerweg Elbsandsteingebirge",
    "type": "hiking",
    "region": "Sächsische Schweiz",
    "country": "DE",
    "distance_km": 112,
    "duration_hours": 36,
    "difficulty": "medium",
    "elevation_gain_m": 4100,
    "description": "Gilt als einer der schönsten Wanderwege Deutschlands. Wilde Felsenschluchten, mystische Tafelberge und die weltberühmte Basteibrücke inspirierten schon Caspar David Friedrich.",
    "highlights": [
      "Basteibrücke",
      "Festung Königstein",
      "Schrammsteine",
      "Kuhstall",
      "Kirnitzschtal"
    ],
    "image_url": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    "start_location": "Liebethal",
    "end_location": "Pirna",
    "latitude": 50.962,
    "longitude": 14.072,
    "campsites_along_count": 16,
    "rating": 4.9,
    "search_query": "Camping in Sächsische Schweiz"
  },
  {
    "id": "trail-altmuehltal-panoramaweg",
    "name": "Altmühltal-Panoramaweg & Radweg",
    "type": "both",
    "region": "Altmühltal",
    "country": "DE",
    "distance_km": 200,
    "duration_hours": 55,
    "difficulty": "easy",
    "elevation_gain_m": 2100,
    "description": "Wunderschöne Jura-Felsformationen, sonnige Wacholderheiden und sanft fließende Flussauen im Naturpark Altmühltal. Extrem familien- und wohnmobilfreundlich.",
    "highlights": [
      "Zwölf Apostel Felsen",
      "Donaudurchbruch Weltenburg",
      "Burg Prunn",
      "Befreiungshalle"
    ],
    "image_url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    "start_location": "Gunzenhausen",
    "end_location": "Kelheim",
    "latitude": 48.915,
    "longitude": 11.455,
    "campsites_along_count": 22,
    "rating": 4.8,
    "search_query": "Camping im Altmühltal"
  },
  {
    "id": "trail-bodensee-radweg",
    "name": "Bodensee-Radweg & Rundwanderweg",
    "type": "biking",
    "region": "Bodensee",
    "country": "DE",
    "distance_km": 260,
    "duration_hours": 20,
    "difficulty": "easy",
    "elevation_gain_m": 650,
    "description": "Der beliebteste Radfernweg Europas umrundet den gesamten Bodensee durch drei Länder (Deutschland, Österreich, Schweiz) vor einer atemberaubenden Alpenkulisse.",
    "highlights": [
      "Blumeninsel Mainau",
      "Pfahlbauten Unteruhldingen",
      "Altstadt Lindau",
      "Rheinfall",
      "Meersburg"
    ],
    "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "start_location": "Konstanz",
    "end_location": "Konstanz",
    "latitude": 47.66,
    "longitude": 9.175,
    "campsites_along_count": 32,
    "rating": 4.9,
    "search_query": "Camping am Bodensee"
  },
  {
    "id": "trail-heidschnuckenweg",
    "name": "Heidschnuckenweg",
    "type": "hiking",
    "region": "Lüneburger Heide",
    "country": "DE",
    "distance_km": 223,
    "duration_hours": 60,
    "difficulty": "easy",
    "elevation_gain_m": 850,
    "description": "Verbindet Hamburg mit Celle und führt mitten durch die lila blühenden Heideflächen, dichte Kiefernwälder und idyllische Wacholderhaine des autofreien Naturschutzgebiets.",
    "highlights": [
      "Wilseder Berg (169m)",
      "Totengrund",
      "Pietzmoor",
      "Heidedörfer Undeloh & Wilsede"
    ],
    "image_url": "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
    "start_location": "Hamburg-Fischbek",
    "end_location": "Celle",
    "latitude": 53.165,
    "longitude": 9.96,
    "campsites_along_count": 18,
    "rating": 4.7,
    "search_query": "Camping in der Lüneburger Heide"
  },
  {
    "id": "trail-donauradweg-bayern",
    "name": "Donauradweg (Deutsche Donau)",
    "type": "biking",
    "region": "Bayern",
    "country": "DE",
    "distance_km": 590,
    "duration_hours": 35,
    "difficulty": "easy",
    "elevation_gain_m": 950,
    "description": "Von der Donauquelle in Donaueschingen über das Durchbruchstal der Schwäbischen Alb, Ulm, Regensburg bis in die Dreiflüssestadt Passau. Flach, verkehrsarm und naturnah.",
    "highlights": [
      "Ulmer Münster",
      "Kloster Weltenburg",
      "UNESCO-Altstadt Regensburg",
      "Walhalla",
      "Passau"
    ],
    "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "start_location": "Donaueschingen",
    "end_location": "Passau",
    "latitude": 48.775,
    "longitude": 11.95,
    "campsites_along_count": 45,
    "rating": 4.8,
    "search_query": "Camping in Bayern"
  },
  {
    "id": "trail-harzer-hexenstieg",
    "name": "Harzer Hexen-Stieg",
    "type": "hiking",
    "region": "Harz",
    "country": "DE",
    "distance_km": 97,
    "duration_hours": 28,
    "difficulty": "medium",
    "elevation_gain_m": 2400,
    "description": "Quer über den Harz und hinauf auf den sagenumwobenen Brocken. Urige Nadelwälder, Moore des Oberharzer Wasserregals und das spektakuläre Bodetal.",
    "highlights": [
      "Brockengipfel (1.141m)",
      "Bodetal-Schlucht",
      "Oderteich",
      "Dammgraben",
      "Rübeland-Höhlen"
    ],
    "image_url": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    "start_location": "Osterode",
    "end_location": "Thale",
    "latitude": 51.799,
    "longitude": 10.615,
    "campsites_along_count": 14,
    "rating": 4.8,
    "search_query": "Camping im Harz"
  },
  {
    "id": "trail-ostseekuesten-radweg",
    "name": "Ostseeküsten-Radweg (EuroVelo 10)",
    "type": "biking",
    "region": "Ostsee",
    "country": "DE",
    "distance_km": 1100,
    "duration_hours": 75,
    "difficulty": "easy",
    "elevation_gain_m": 1200,
    "description": "Endlose weiße Sandstrände, Steilküsten, traditionsreiche Hansestädte und die Kreidefelsen von Rügen. Der Traumweg für Sommer- und Campingurlauber.",
    "highlights": [
      "Nationalpark Jasmund (Kreidefelsen)",
      "Fischland-Darß-Zingst",
      "Wismar & Stralsund",
      "Warnemünde",
      "Usedom"
    ],
    "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "start_location": "Flensburg",
    "end_location": "Ahlbeck (Usedom)",
    "latitude": 54.32,
    "longitude": 12.85,
    "campsites_along_count": 65,
    "rating": 4.9,
    "search_query": "Camping an der Ostsee"
  },
  {
    "id": "trail-eifelsteig",
    "name": "Eifelsteig",
    "type": "hiking",
    "region": "Eifel",
    "country": "DE",
    "distance_km": 313,
    "duration_hours": 85,
    "difficulty": "medium",
    "elevation_gain_m": 6400,
    "description": "Motto: „Wo Fels und Wasser dich begleiten“. Führt durch das Hohe Venn, den Nationalpark Eifel mit seinen Stauseen und die vulkanischen Maare der Vulkaneifel bis nach Trier.",
    "highlights": [
      "Hohes Venn",
      "Rursee",
      "Vulkanmaare Daun",
      "Gerolsteiner Dolomiten",
      "Genovevahöhle"
    ],
    "image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "start_location": "Aachen-Kornelimünster",
    "end_location": "Trier",
    "latitude": 50.45,
    "longitude": 6.65,
    "campsites_along_count": 21,
    "rating": 4.8,
    "search_query": "Camping in der Eifel"
  },
  {
    "id": "trail-allgaeu-wandertrilogie",
    "name": "Wandertrilogie Allgäu",
    "type": "hiking",
    "region": "Allgäu",
    "country": "DE",
    "distance_km": 358,
    "duration_hours": 110,
    "difficulty": "hard",
    "elevation_gain_m": 9200,
    "description": "Drei Weghöhen durch die Traumlandschaft des Allgäus: Von sanften Hügeln und Wasserfällen bis zu hochalpinen Gratkraxeleien in den Allgäuer Hochalpen.",
    "highlights": [
      "Breitachklamm",
      "Nebelhorn",
      "Schloss Neuschwanstein",
      "Großer Alpsee",
      "Forggensee"
    ],
    "image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "start_location": "Oberstdorf",
    "end_location": "Füssen",
    "latitude": 47.53,
    "longitude": 10.35,
    "campsites_along_count": 28,
    "rating": 4.9,
    "search_query": "Camping im Allgäu"
  }
];

export function getNearbyTrails(lat: number, lon: number, maxDistanceKm: number = 45): (Trail & { distance_to_place_km: number })[] {
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

  return FAMOUS_TRAILS
    .map(t => ({
      ...t,
      distance_to_place_km: calcDist(lat, lon, t.latitude, t.longitude)
    }))
    .filter(t => t.distance_to_place_km <= maxDistanceKm)
    .sort((a, b) => a.distance_to_place_km - b.distance_to_place_km);
}
