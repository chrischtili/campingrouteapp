export interface CulinarySpot {
  id: string;
  name: string;
  type: 'winery' | 'farm_shop' | 'cheese_dairy' | 'regiomat';
  subtypeLabel: string;
  region: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  products: string[];
  hasCampsite: boolean;
  pitchNote?: string;
  website?: string;
  phone?: string;
  image_url?: string;
}

export const CULINARY_SPOTS: CulinarySpot[] = [
  {
    id: "culinary-hanewald-schwerdt",
    name: "Weingut & Wohnmobilstellplatz Hanewald-Schwerdt",
    type: "winery",
    subtypeLabel: "Weingut & Winzerstube",
    region: "Deutsche Weinstraße",
    state: "Rheinland-Pfalz",
    country: "DE",
    latitude: 49.4955,
    longitude: 8.1522,
    address: "Pochelstraße 37a, 67098 Bad Dürkheim",
    description: "Familiengeführtes Qualitätsweingut mit eigenem Wohnmobilstellplatz direkt an den Weinbergen. Verkostung von Riesling, Spätburgunder und Pfälzer Spezialitäten.",
    products: ["Riesling", "Spätburgunder", "Grauburgunder", "Traubensaft", "Weinproben"],
    hasCampsite: true,
    pitchNote: "Eigener Wohnmobilstellplatz mit Strom & Wasser auf dem Weingut (ca. 16 € / Nacht).",
    website: "https://www.hanewald-schwerdt.de",
    phone: "+49 6322 63206",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "culinary-hofgut-neuhof",
    name: "Hofgut Neuhof & Hofladen Dreieich",
    type: "farm_shop",
    subtypeLabel: "Bio-Hofladen & Gutsschänke",
    region: "Rhein-Main / Odenwald",
    state: "Hessen",
    country: "DE",
    latitude: 50.0215,
    longitude: 8.7392,
    address: "Neuhof 1, 63303 Dreieich",
    description: "Historisches Hofgut mit großem Bio-Hofladen, eigener Bäckerei, regionalem Fleisch, frischem Gemüse, Hofcafé und Gutsschänke.",
    products: ["Bio-Eier", "Bauernbrot", "Frisches Gemüse", "Hausmacher Wurst", "Käsespezialitäten"],
    hasCampsite: false,
    pitchNote: "Großer Tagesparkplatz, mehrere Campingplätze im Umkreis von 10 km.",
    website: "https://www.hofgut-neuhof.de",
    phone: "+49 6102 3200",
    image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "culinary-weingut-dr-loosen",
    name: "Weingut Dr. Loosen & Mosel-Vinothek",
    type: "winery",
    subtypeLabel: "Prädikatsweingut (VDP)",
    region: "Mosel",
    state: "Rheinland-Pfalz",
    country: "DE",
    latitude: 49.9234,
    longitude: 7.0612,
    address: "St. Johannishof, 54470 Bernkastel-Kues",
    description: "Weltbekanntes Mosel-Weingut mit Steillagen-Rieslingen, Weinverkostungen mit Blick auf die Moselschleife und regionalem Verkauf.",
    products: ["Steillagen-Riesling", "Alte Reben", "Eiswein", "Sekt", "Winzer-Präsente"],
    hasCampsite: false,
    pitchNote: "Wohnmobilstellplatz Kueser Plateau in 3 km Entfernung.",
    website: "https://drloosen.de",
    phone: "+49 6531 3426",
    image_url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "culinary-hofkaeserei-tegernsee",
    name: "Naturkäserei TegernseerLand",
    type: "cheese_dairy",
    subtypeLabel: "Schaukäserei & Almladen",
    region: "Tegernsee / Bayerische Alpen",
    state: "Bayern",
    country: "DE",
    latitude: 47.7012,
    longitude: 11.7345,
    address: "Reißenbichlweg 1, 83703 Gmund am Tegernsee",
    description: "Genossenschaftliche Heumilch-Käserei am Tegernsee. Bietet feinsten Bergkäse, Heumilchbutter, frischen Almjoghurt und Brotzeiten in der Gaststube.",
    products: ["Heumilch-Bergkäse", "Tegernseer Camembert", "Almbutter", "Frischmilch", "Bio-Honig"],
    hasCampsite: false,
    pitchNote: "Campingplatz Wallberg und Seecamping Tegernsee in der Nähe.",
    website: "https://www.naturkaeserei.de",
    phone: "+49 8022 188400",
    image_url: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "culinary-regiomat-schwarzwald",
    name: "24/7 Schwarzwald-Regiomat & Milchtankstelle Schultishof",
    type: "regiomat",
    subtypeLabel: "24h-Regiomat & Milchtankstelle",
    region: "Schwarzwald",
    state: "Baden-Württemberg",
    country: "DE",
    latitude: 48.1256,
    longitude: 8.0894,
    address: "Untertal 12, 79215 Elzach",
    description: "24/7 Verkaufsautomat mit frischer Weidemilch zum Selberzapfen, Schwarzwälder Schinken, Grillfleisch, Eiern aus Freilandhaltung und hausgemachter Marmelade.",
    products: ["24h Frische Weidemilch", "Schwarzwälder Schinken", "Grillfleisch & Bratwürste", "Freilandeier", "Hof-Käse"],
    hasCampsite: false,
    pitchNote: "Ideal für Spätankömmlinge. Camping Elztalblick nur 4 km entfernt.",
    website: "https://schwarzwald-tourismus.info",
    image_url: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "culinary-weingut-juliusspital",
    name: "Weingut Juliusspital Würzburg",
    type: "winery",
    subtypeLabel: "Traditionsweingut & Vinothek",
    region: "Franken",
    state: "Bayern",
    country: "DE",
    latitude: 49.7967,
    longitude: 9.9324,
    address: "Klinikstraße 1, 97070 Würzburg",
    description: "Zweitgrößtes Weingut Deutschlands mit über 440 Jahren Tradition. Weltberühmt für fränkische Silvaner im traditionellen Bocksbeutel.",
    products: ["Würzburger Stein Silvaner", "Bocksbeutel", "Riesling", "Fränkischer Rotwein", "Weinpräsente"],
    hasCampsite: false,
    pitchNote: "Campingplatz Kalte Quelle Würzburg am Mainufer.",
    website: "https://www.weingut-juliusspital.de",
    phone: "+49 931 3931400",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "culinary-spargelhof-klaistow",
    name: "Erlebnishof & Hofladen Klaistow",
    type: "farm_shop",
    subtypeLabel: "Erlebnis-Bauernhof & Hofbäckerei",
    region: "Havelland / Fläming",
    state: "Brandenburg",
    country: "DE",
    latitude: 52.2845,
    longitude: 12.8423,
    address: "Glindower Weg 30, 14547 Beelitz / Klaistow",
    description: "Großer Erlebnishof mit Beelitzer Spargel, Heidelbeeren, Kürbissen, eigener Holzofenbäckerei, Hofladen, Wildgehege und Wohnmobilstellplätzen.",
    products: ["Beelitzer Spargel", "Heidelbeeren", "Holzofenbrot", "Kürbisse", "Hausgemachtes Eis"],
    hasCampsite: true,
    pitchNote: "Wohnmobilstellplätze für autarke Camper direkt auf dem Hofgelände vorhanden.",
    website: "https://www.spargelhof-klaistow.de",
    phone: "+49 33206 610",
    image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "culinary-weingut-st-antony",
    name: "Weingut St. Antony Roter Hang",
    type: "winery",
    subtypeLabel: "Bio-Weingut & Vinothek",
    region: "Rheinhessen",
    state: "Rheinland-Pfalz",
    country: "DE",
    latitude: 49.8821,
    longitude: 8.3542,
    address: "Wilhelminenstraße 13, 55283 Nierstein",
    description: "Zertifiziertes Bio-Weingut am weltberühmten Roten Hang von Nierstein. Außergewöhnliche Rieslinge und Blaufränkisch mit atemberaubender Rhein-Aussicht.",
    products: ["Bio-Riesling Roter Hang", "Blaufränkisch", "Chardonnay", "Naturwein", "Tasting Flights"],
    hasCampsite: false,
    pitchNote: "Reisemobilstellplatz Nierstein am Rheinufer nur 1,5 km entfernt.",
    website: "https://st-antony.de",
    phone: "+49 6133 93080",
    image_url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "culinary-hofkaeserei-andechs",
    name: "Klosterbrauerei & Hofladen Andechs",
    type: "farm_shop",
    subtypeLabel: "Klostergut & Brauerei",
    region: "Fünfseenland / Ammersee",
    state: "Bayern",
    country: "DE",
    latitude: 47.9745,
    longitude: 11.1823,
    address: "Bergstraße 2, 82346 Andechs",
    description: "Heiliger Berg Andechs: Berühmte Klosterbrauerei, Klostermetzgerei, Hofladen mit Bio-Käse und Biergarten mit Panoramablick auf die Alpen.",
    products: ["Andechser Doppelbock", "Klosterkäse", "Bauernschinken", "Klostersenf", "Bio-Backwaren"],
    hasCampsite: true,
    pitchNote: "Offizieller Wohnmobilstellplatz direkt am Klosterparkplatz Andechs.",
    website: "https://www.andechs.de",
    phone: "+49 8152 3760",
    image_url: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "culinary-regiomat-bodensee",
    name: "Bodensee-Obsthof & 24h-Regiomat Steffelin",
    type: "regiomat",
    subtypeLabel: "24h-Obst- & Saftautomat",
    region: "Bodensee",
    state: "Baden-Württemberg",
    country: "DE",
    latitude: 47.7412,
    longitude: 9.3145,
    address: "Klufterner Straße 3, 88677 Markdorf / Bodensee",
    description: "24/7 Automat mit sonnengereiften Bodensee-Äpfeln, frisch gepressten Säften, Beerenobst, Honig und feinen Obstbränden aus eigener Destillerie.",
    products: ["Bodensee-Äpfel", "Direktsaft", "Obstbrände & Liköre", "Blütenhonig", "Erdbeeren"],
    hasCampsite: false,
    pitchNote: "Camping Markdorf und Camping Schloss Kirchberg in 5 km Entfernung.",
    website: "https://www.steffelin.de",
    image_url: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80"
  }
];
