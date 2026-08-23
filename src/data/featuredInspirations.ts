export interface InspirationCampingSpot {
  id: string;
  name: string;
  category: 'camping' | 'pitch' | 'nature';
  categoryLabel: string;
  country: string;
  countryCode: string;
  flag: string;
  region: string;
  rating: number;
  reviewsCount: number;
  highlightTag: string;
  imageUrl: string;
  searchQuery: string;
}

export interface InspirationHighlight {
  id: string;
  name: string;
  category: 'castle' | 'nature' | 'monument' | 'culture';
  categoryLabel: string;
  country: string;
  countryCode: string;
  flag: string;
  region: string;
  description: string;
  imageUrl: string;
  searchQuery: string;
}

export const FEATURED_CAMPING_SPOTS: InspirationCampingSpot[] = [
  {
    id: 'camp-1',
    name: 'Camping Seiser Alm',
    category: 'camping',
    categoryLabel: 'Alpencamping',
    country: 'Italien',
    countryCode: 'IT',
    flag: '🇮🇹',
    region: 'Dolomiten, Südtirol',
    rating: 4.9,
    reviewsCount: 1840,
    highlightTag: '🏔️ Dolomiten-Panorama',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Seiser Alm Südtirol'
  },
  {
    id: 'camp-2',
    name: 'Inselcamping Kap Arkona',
    category: 'camping',
    categoryLabel: 'Ostseecamping',
    country: 'Deutschland',
    countryCode: 'DE',
    flag: '🇩🇪',
    region: 'Rügen, Mecklenburg-Vorpommern',
    rating: 4.8,
    reviewsCount: 920,
    highlightTag: '🌊 Direkt an den Kreidefelsen',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Kap Arkona Rügen'
  },
  {
    id: 'camp-3',
    name: 'Camping Hopfensee',
    category: 'camping',
    categoryLabel: '5-Sterne Wellness',
    country: 'Deutschland',
    countryCode: 'DE',
    flag: '🇩🇪',
    region: 'Allgäu, Bayern',
    rating: 4.9,
    reviewsCount: 2340,
    highlightTag: '🏰 Blick auf Neuschwanstein',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Hopfensee Füssen'
  },
  {
    id: 'camp-4',
    name: 'Camping Kranebitten',
    category: 'pitch',
    categoryLabel: 'Panorama-Stellplatz',
    country: 'Österreich',
    countryCode: 'AT',
    flag: '🇦🇹',
    region: 'Innsbruck, Tirol',
    rating: 4.7,
    reviewsCount: 780,
    highlightTag: '⛰️ Tiroler Bergkulisse',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Innsbruck Tirol'
  },
  {
    id: 'camp-5',
    name: 'Camping La Baume - La Palmeraie',
    category: 'camping',
    categoryLabel: 'Mediterranes Resort',
    country: 'Frankreich',
    countryCode: 'FR',
    flag: '🇫🇷',
    region: 'Côte d’Azur, Provence',
    rating: 4.7,
    reviewsCount: 1450,
    highlightTag: '🌴 Palmenoase & Strand',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Cote d Azur Frejus'
  },
  {
    id: 'camp-6',
    name: 'Olden Camping Gytri',
    category: 'nature',
    categoryLabel: 'Fjord-Naturcamping',
    country: 'Norwegen',
    countryCode: 'NO',
    flag: '🇳🇴',
    region: 'Nordfjord, Vestland',
    rating: 4.9,
    reviewsCount: 650,
    highlightTag: '🏞️ Am türkisen Gletschersee',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Olden Nordfjord'
  },
  {
    id: 'camp-7',
    name: 'Camping Polari',
    category: 'camping',
    categoryLabel: 'Küsten-Campingplatz',
    country: 'Kroatien',
    countryCode: 'HR',
    flag: '🇭🇷',
    region: 'Rovinj, Istrien',
    rating: 4.8,
    reviewsCount: 3100,
    highlightTag: '🏖️ Eigene Badebucht & Pinien',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Rovinj Istrien'
  },
  {
    id: 'camp-8',
    name: 'Camping De Lakens',
    category: 'nature',
    categoryLabel: 'Dünen-Camping',
    country: 'Niederlande',
    countryCode: 'NL',
    flag: '🇳🇱',
    region: 'Bloemendaal, Nordholland',
    rating: 4.7,
    reviewsCount: 1120,
    highlightTag: '🏄 Mitten in den Nordseedünen',
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Bloemendaal aan Zee'
  }
];

export const FEATURED_HIGHLIGHTS: InspirationHighlight[] = [
  {
    id: 'high-1',
    name: 'Schloss Neuschwanstein',
    category: 'castle',
    categoryLabel: 'Märchenschloss',
    country: 'Deutschland',
    countryCode: 'DE',
    flag: '🇩🇪',
    region: 'Allgäu, Bayern',
    description: 'Das weltberühmte Schloss von König Ludwig II. thront spektakulär vor den majestätischen Ammergauer Alpen.',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping nahe Neuschwanstein Füssen'
  },
  {
    id: 'high-2',
    name: 'Basteibrücke & Sächsische Schweiz',
    category: 'nature',
    categoryLabel: 'Felslandschaft & Naturwunder',
    country: 'Deutschland',
    countryCode: 'DE',
    flag: '🇩🇪',
    region: 'Elbsandsteingebirge, Sachsen',
    description: 'Die berühmteste Felsformation des Elbsandsteingebirges bietet spektakuläre Tiefblicke ins Elbtal.',
    imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Sächsische Schweiz Bastei'
  },
  {
    id: 'high-3',
    name: 'Burg Eltz',
    category: 'castle',
    categoryLabel: 'Mittelalterliche Ritterburg',
    country: 'Deutschland',
    countryCode: 'DE',
    flag: '🇩🇪',
    region: 'Moseltal, Rheinland-Pfalz',
    description: 'Versteckt in einem idyllischen Seitental der Mosel gehört Burg Eltz zu den besterhaltenen Burgen Europas.',
    imageUrl: 'https://images.unsplash.com/photo-1599818816935-7140f7b05423?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Mosel Burg Eltz'
  },
  {
    id: 'high-4',
    name: 'Königssee & St. Bartholomä',
    category: 'nature',
    categoryLabel: 'Nationalpark Berchtesgaden',
    country: 'Deutschland',
    countryCode: 'DE',
    flag: '🇩🇪',
    region: 'Berchtesgadener Land, Bayern',
    description: 'Smaragdgrünes Wasser umgeben von steilen Felswänden und der berühmten Watzmann-Ostwand.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Königssee Berchtesgaden'
  },
  {
    id: 'high-5',
    name: 'Pragser Wildsee (Lago di Braies)',
    category: 'nature',
    categoryLabel: 'Alpensee & Dolomiten',
    country: 'Italien',
    countryCode: 'IT',
    flag: '🇮🇹',
    region: 'Pragsertal, Südtirol',
    description: 'Die Perle der Dolomitenseen mit historischem Bootshaus und smaragdgrünem Bergwasser.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Pragser Wildsee Braies'
  },
  {
    id: 'high-6',
    name: 'Mont Saint-Michel',
    category: 'culture',
    categoryLabel: 'UNESCO Welterbe',
    country: 'Frankreich',
    countryCode: 'FR',
    flag: '🇫🇷',
    region: 'Normandie, Frankreich',
    description: 'Die weltberühmte Abtei auf einer felsigen Gezeiteninsel im Wattenmeer der Normandie.',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Mont Saint Michel Normandie'
  },
  {
    id: 'high-7',
    name: 'Geirangerfjord & Trollstigen',
    category: 'nature',
    categoryLabel: 'Fjord-Panorama & Wasserfälle',
    country: 'Norwegen',
    countryCode: 'NO',
    flag: '🇳🇴',
    region: 'Møre og Romsdal, Norwegen',
    description: 'Spektakuläre Felswände, tosende Wasserfälle wie die „Sieben Schwestern“ und die Serpentinenstraße Trollstigen.',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Geiranger Fjord'
  },
  {
    id: 'high-8',
    name: 'Schloss Sanssouci',
    category: 'castle',
    categoryLabel: 'Preußisches Schloss & Park',
    country: 'Deutschland',
    countryCode: 'DE',
    flag: '🇩🇪',
    region: 'Potsdam, Brandenburg',
    description: 'Das Sommerschloss Friedrichs des Großen mit berühmten Weinbergterrassen und weitläufigem Landschaftspark.',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    searchQuery: 'Camping Potsdam Sanssouci'
  }
];
