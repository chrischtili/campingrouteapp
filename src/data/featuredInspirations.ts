export interface PlacePayload {
  id: string;
  name: string;
  type: string; // 'campground' | 'caravan' | 'attraction'
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
  city?: string;
  description: string;
  amenities: string;
  rating: number;
  price: string;
  contact: string;
  website?: string;
  address: string;
  image_url?: string;
}

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
  place: PlacePayload;
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
  place: PlacePayload;
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
    searchQuery: 'Camping Südtirol',
    place: {
      id: 'insp-camp-1',
      name: 'Camping Seiser Alm',
      type: 'campground',
      latitude: 46.5458,
      longitude: 11.5342,
      country: 'IT',
      state: 'Südtirol',
      city: 'Völs am Schlern',
      description: 'Erstklassiger Alpen-Campingplatz direkt am Fuße der Seiser Alm und des Schlernmassivs. Beheizter Salzwasserpool, moderne Sanitäreinrichtungen und traumhafter Bergblick im Herzen der Dolomiten.',
      amenities: 'Strom,WLAN,Duschen,WC,Pool,Sauna,Restaurant,Hunde erlaubt,Ver- und Entsorgung',
      rating: 4.9,
      price: 'ab 42 € / Nacht',
      contact: 'info@camping-seiseralm.com',
      website: 'https://www.camping-seiseralm.com',
      address: 'Dolomitenstraße 38, 39050 Völs am Schlern, Italien',
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
    }
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
    searchQuery: 'Camping Rügen',
    place: {
      id: 'insp-camp-2',
      name: 'Inselcamping Kap Arkona',
      type: 'campground',
      latitude: 54.6781,
      longitude: 13.4328,
      country: 'DE',
      state: 'Mecklenburg-Vorpommern',
      city: 'Putgarten (Rügen)',
      description: 'Wunderschöner Naturcampingplatz im äußersten Norden der Insel Rügen. Nur wenige Gehminuten zum Kap Arkona, den Leuchttürmen und dem Fischerdorf Vitt.',
      amenities: 'Strom,Duschen,WC,WLAN,Brötchenservice,Hunde erlaubt,Strandnähe',
      rating: 4.8,
      price: 'ab 34 € / Nacht',
      contact: 'kontakt@inselcamping-kap-arkona.de',
      website: 'https://www.ruegen.de',
      address: 'Dorfstraße 22, 18556 Putgarten, Rügen, Deutschland',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    }
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
    searchQuery: 'Camping Hopfensee',
    place: {
      id: 'osm-way-26598670',
      name: 'Camping Hopfensee',
      type: 'campground',
      latitude: 47.6004508,
      longitude: 10.684623,
      country: 'DE',
      state: 'Bayern',
      city: 'Füssen im Allgäu',
      description: 'Ausgezeichneter 5-Sterne-Campingplatz direkt am Ufer des Hopfensees mit spektakulärem Blick auf die Allgäuer Alpen und die Königsschlösser Neuschwanstein & Hohenschwangau. Großes Wellness- und Hallenbadangebot.',
      amenities: 'Strom,WLAN,Hallenbad,Saunalandschaft,Restaurant,Kinderbetreuung,Wellness,Bootseinstieg',
      rating: 4.9,
      price: 'ab 48 € / Nacht',
      contact: 'info@camping-hopfensee.de',
      website: 'https://www.camping-hopfensee.de',
      address: 'Fischerbichl 17, 87629 Füssen, Deutschland',
      image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    }
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
    searchQuery: 'Camping Innsbruck',
    place: {
      id: 'insp-camp-4',
      name: 'Camping Kranebitten',
      type: 'campground',
      latitude: 47.2662,
      longitude: 11.3195,
      country: 'AT',
      state: 'Tirol',
      city: 'Innsbruck',
      description: 'Idyllisch am Fuße der Nordkette gelegener Campingplatz am Stadtrand von Innsbruck. Perfekter Ausgangspunkt für Bergtouren, Mountainbiken und Kultur.',
      amenities: 'Strom,Duschen,WC,WLAN,Gastronomie,ÖPNV-Anbindung,Ver- und Entsorgung',
      rating: 4.7,
      price: 'ab 36 € / Nacht',
      contact: 'info@kranebitten.tirol',
      website: 'https://www.innsbruck.info',
      address: 'Kranebitter Allee 214, 6020 Innsbruck, Österreich',
      image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'
    }
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
    searchQuery: 'Camping Côte d Azur',
    place: {
      id: 'insp-camp-5',
      name: 'Camping La Baume - La Palmeraie',
      type: 'campground',
      latitude: 43.4651,
      longitude: 6.7412,
      country: 'FR',
      state: 'Provence-Alpes-Côte d\'Azur',
      city: 'Fréjus',
      description: 'Weitläufige Camping-Oase im Schatten duftender Pinien und Palmen nahe den Sandstränden der Côte d’Azur. Großer Aquapark und erstklassige Ausstattung.',
      amenities: 'Strom,Pool,Wasserrutschen,WLAN,Restaurant,Supermarkt,Fitness,Strandbus',
      rating: 4.7,
      price: 'ab 45 € / Nacht',
      contact: 'info@labaume-lapalmeraie.com',
      website: 'https://www.labaume-lapalmeraie.com',
      address: '3775 Rue des Combattants en AFN, 83600 Fréjus, Frankreich',
      image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
    }
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
    searchQuery: 'Camping Geirangerfjord',
    place: {
      id: 'insp-camp-6',
      name: 'Olden Camping Gytri',
      type: 'campground',
      latitude: 61.8152,
      longitude: 6.8423,
      country: 'NO',
      state: 'Vestland',
      city: 'Olden',
      description: 'Spektakulär am Ufer des smaragdgrünen Oldevatnet-Sees mit Blick auf die Gletscherzungen des Jostedalsbreen gelegen. Bootsverleih und Angelmöglichkeiten direkt am Platz.',
      amenities: 'Strom,Duschen,Küche,Bootsverleih,WLAN,Gletscherblick,Wanderwege',
      rating: 4.9,
      price: 'ab 320 NOK / Nacht',
      contact: 'post@oldencamping.com',
      website: 'https://www.oldencamping.com',
      address: 'Oldedalsvegen 795, 6788 Olden, Norwegen',
      image_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'
    }
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
    searchQuery: 'Camping Istrien',
    place: {
      id: 'insp-camp-7',
      name: 'Camping Polari',
      type: 'campground',
      latitude: 45.0612,
      longitude: 13.6738,
      country: 'HR',
      state: 'Istrien',
      city: 'Rovinj',
      description: 'Direkt an einer 2 km langen Bucht mit glasklarem Adria-Wasser und schattenspendenden Olivenbäumen und Pinien. Nur wenige Fahrradminuten von der historischen Altstadt Rovinj entfernt.',
      amenities: 'Strom,Meerzugang,Pool,Restaurants,WLAN,Wassersport,Supermarkt,Hunde erlaubt',
      rating: 4.8,
      price: 'ab 38 € / Nacht',
      contact: 'info@maistra.hr',
      website: 'https://www.maistra.com/camping-polari-rovinj',
      address: 'Polari 1, 52210 Rovinj, Kroatien',
      image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
    }
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
    searchQuery: 'Camping Texel',
    place: {
      id: 'insp-camp-8',
      name: 'Camping De Lakens',
      type: 'campground',
      latitude: 52.4082,
      longitude: 4.5492,
      country: 'NL',
      state: 'Noord-Holland',
      city: 'Bloemendaal aan Zee',
      description: 'Eingebettet in den Nationalpark Zuid-Kennemerland direkt hinter den Dünen der Nordseeküste. Ideal für Surfer, Strandurlauber und Familien.',
      amenities: 'Strom,Wellness,Sauna,Restaurant,Strandzugang,WLAN,Fahrradverleih',
      rating: 4.7,
      price: 'ab 39 € / Nacht',
      contact: 'info@campingdelakens.nl',
      website: 'https://www.campingdelakens.nl',
      address: 'Zeeweg 60, 2051 EC Bloemendaal aan Zee, Niederlande',
      image_url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80'
    }
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
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Neuschwanstein_Castle_2024-02.jpg/1200px-Neuschwanstein_Castle_2024-02.jpg',
    searchQuery: 'Schloss Neuschwanstein',
    place: {
      id: 'dzt-neuschwanstein-q4152',
      name: 'Schloss Neuschwanstein',
      type: 'attraction',
      latitude: 47.557488542,
      longitude: 10.749441807,
      country: 'DE',
      state: 'Bayern',
      city: 'Schwangau / Füssen',
      description: 'Das berühmte Märchenschloss König Ludwigs II. von Bayern, vollendet im 19. Jahrhundert und Vorbild für das Disney-Schloss. Zahlreiche malerische Campingplätze am Forggensee und Hopfensee liegen in direkter Nachbarschaft in den Allgäuer Alpen.',
      amenities: 'Aussichtspunkt,Museum,Führungen,Parkplatz,Gastronomie,Shuttlebus,Wanderwege',
      rating: 4.9,
      price: 'ab 17,50 € Eintritt',
      contact: 'svneuschwanstein@bsv.bayern.de',
      website: 'https://www.neuschwanstein.de',
      address: 'Neuschwansteinstraße 20, 87645 Schwangau, Deutschland',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Neuschwanstein_Castle_2024-02.jpg/1200px-Neuschwanstein_Castle_2024-02.jpg'
    }
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
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/2015-05-13_Basteibr%C3%BCcke-.jpg/1200px-2015-05-13_Basteibr%C3%BCcke-.jpg',
    searchQuery: 'Sächsische Schweiz',
    place: {
      id: 'dzt-bastei-rathen',
      name: 'Basteibrücke (Sächsische Schweiz)',
      type: 'attraction',
      latitude: 50.9622,
      longitude: 14.0722,
      country: 'DE',
      state: 'Sachsen',
      city: 'Lohmen / Rathen',
      description: 'Die 76,5 Meter lange Sandsteinbrücke spannt sich über die tiefen Schluchten der Basteifelsen im Nationalpark Sächsische Schweiz und bietet eine der spektakulärsten Aussichten Europas auf das Elbtal.',
      amenities: 'Aussichtsplattform,Panoramarestaurant,Wanderwege,Parkplatz,ÖPNV-Anbindung',
      rating: 4.8,
      price: 'Kostenlos zugänglich',
      contact: 'info@saechsische-schweiz.de',
      website: 'https://www.saechsische-schweiz.de',
      address: 'Bastei, 01847 Lohmen, Deutschland',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/2015-05-13_Basteibr%C3%BCcke-.jpg/1200px-2015-05-13_Basteibr%C3%BCcke-.jpg'
    }
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
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Wierschem%2C_Burg_Eltz%2C_2012-08_CN-01.jpg/1200px-Wierschem%2C_Burg_Eltz%2C_2012-08_CN-01.jpg',
    searchQuery: 'Burg Eltz',
    place: {
      id: 'dzt-burg-eltz-q153426',
      name: 'Burg Eltz',
      type: 'attraction',
      latitude: 50.205,
      longitude: 7.336666666,
      country: 'DE',
      state: 'Rheinland-Pfalz',
      city: 'Wierschem (Mosel)',
      description: 'Die uneinnehmbare Ritterburg im Elzbachtal ist seit über 850 Jahren im Besitz derselben Familie. Vollständig erhaltene Wohnräume, Waffen- und Schatzkammer umgeben von dichter Moselnatur.',
      amenities: 'Museum,Schatzkammer,Burg-Schenke,Traumpfad-Wanderweg,Pendelbus',
      rating: 4.9,
      price: 'ab 14 € Eintritt',
      contact: 'burg@eltz.de',
      website: 'https://www.burg-eltz.de',
      address: 'Burg Eltz 1, 56294 Wierschem, Deutschland',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Wierschem%2C_Burg_Eltz%2C_2012-08_CN-01.jpg/1200px-Wierschem%2C_Burg_Eltz%2C_2012-08_CN-01.jpg'
    }
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
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/K%C3%B6nigsee_in_Bayern.jpg/1200px-K%C3%B6nigsee_in_Bayern.jpg',
    searchQuery: 'Königssee',
    place: {
      id: 'dzt-koenigssee-bartholomae',
      name: 'Königssee & Wallfahrtskirche St. Bartholomä',
      type: 'attraction',
      latitude: 47.5441,
      longitude: 12.9732,
      country: 'DE',
      state: 'Bayern',
      city: 'Schönau am Königssee',
      description: 'Fjordartiger Gebirgssee im Nationalpark Berchtesgaden, weltberühmt für sein kristallklares Echo und die barocke Wallfahrtskirche St. Bartholomä am Fuße der Watzmann-Ostwand.',
      amenities: 'Elektro-Schifffahrt,Wanderwege,Gastronomie,Nationalpark-Zentrum,Bootssteg',
      rating: 4.9,
      price: 'ab 22,50 € Schifffahrt',
      contact: 'koenigssee@seenschifffahrt.de',
      website: 'https://www.seenschifffahrt.de/de/koenigssee/',
      address: 'Seestraße 33, 83471 Schönau am Königssee, Deutschland',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/K%C3%B6nigsee_in_Bayern.jpg/1200px-K%C3%B6nigsee_in_Bayern.jpg'
    }
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
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Pragser_Wildsee_Seekofel_von_Bucht.jpg/1200px-Pragser_Wildsee_Seekofel_von_Bucht.jpg',
    searchQuery: 'Dolomiten',
    place: {
      id: 'insp-high-5',
      name: 'Pragser Wildsee (Lago di Braies)',
      type: 'attraction',
      latitude: 46.6946,
      longitude: 12.0854,
      country: 'IT',
      state: 'Südtirol',
      city: 'Prags',
      description: 'Malerischer Hochgebirgssee auf 1.496 m Höhe im Naturpark Fanes-Sennes-Prags. Umgeben von den Felswänden des Seekofels mit hölzernen Ruderbooten und Rundwanderweg.',
      amenities: 'Ruderboot-Verleih,Rundwanderweg,Restaurant,Aussichtspunkte,Parkplatz',
      rating: 4.8,
      price: 'Kostenlos zugänglich (Parkplatz/Shuttle gebührenpflichtig)',
      contact: 'info@pragsertal.info',
      website: 'https://www.drei-zinnen.info',
      address: 'St. Veit 27, 39030 Prags, Südtirol, Italien',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Pragser_Wildsee_Seekofel_von_Bucht.jpg/1200px-Pragser_Wildsee_Seekofel_von_Bucht.jpg'
    }
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
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Mont-Saint-Michel_vu_du_ciel.jpg/1200px-Mont-Saint-Michel_vu_du_ciel.jpg',
    searchQuery: 'Camping Bretagne',
    place: {
      id: 'insp-high-6',
      name: 'Mont Saint-Michel & Abtei',
      type: 'attraction',
      latitude: 48.636,
      longitude: -1.5115,
      country: 'FR',
      state: 'Normandie',
      city: 'Le Mont-Saint-Michel',
      description: 'Faszinierende mittelalterliche Festungsinsel mit gotischer Benediktinerabtei, umspült von den stärksten Gezeiten Europas. Weltkulturerbe der UNESCO.',
      amenities: 'Museum,Führungen,Gastronomie,Shuttlebus,Wanderwege über die Bucht',
      rating: 4.8,
      price: 'ab 13 € Abtei-Eintritt',
      contact: 'contact@ot-montsaintmichel.com',
      website: 'https://www.ot-montsaintmichel.com',
      address: 'Grande Rue, 50170 Le Mont-Saint-Michel, Frankreich',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Mont-Saint-Michel_vu_du_ciel.jpg/1200px-Mont-Saint-Michel_vu_du_ciel.jpg'
    }
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
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Geirangerfjord_.jpg/1200px-Geirangerfjord_.jpg',
    searchQuery: 'Geirangerfjord',
    place: {
      id: 'insp-high-7',
      name: 'Geirangerfjord (UNESCO Welterbe)',
      type: 'attraction',
      latitude: 62.1015,
      longitude: 7.0941,
      country: 'NO',
      state: 'Møre og Romsdal',
      city: 'Geiranger',
      description: 'Einer der spektakulärsten Fjorde der Welt mit steil abfallenden Felswänden, Gletschern und den berühmten Wasserfällen „Sieben Schwestern“ und „Freier“.',
      amenities: 'Fjord-Sightseeing,Aussichtsplattform Flydalsjuvet,Kajakverleih,Wanderwege',
      rating: 4.9,
      price: 'Kostenlos zugänglich',
      contact: 'tourist@geiranger.no',
      website: 'https://www.visittorvest.no',
      address: 'Geirangervegen 2, 6216 Geiranger, Norwegen',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Geirangerfjord_.jpg/1200px-Geirangerfjord_.jpg'
    }
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
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Reflection_of_Sanssouci_Palace.jpg/1200px-Reflection_of_Sanssouci_Palace.jpg',
    searchQuery: 'Schloss Sanssouci',
    place: {
      id: 'dzt-sanssouci-potsdam',
      name: 'Schloss & Park Sanssouci',
      type: 'attraction',
      latitude: 52.4042,
      longitude: 13.0385,
      country: 'DE',
      state: 'Brandenburg',
      city: 'Potsdam',
      description: 'Das preußische Versailles: Sommersitz Friedrichs des Großen im Rokoko-Stil auf den weltberühmten Weinbergterrassen mit weitläufigem Parkareal, Neuem Palais und Orangerieschloss.',
      amenities: 'Schlossmuseum,Parkführung,Café,Audioguide,Wander- und Radwege im Park',
      rating: 4.8,
      price: 'ab 14 € Eintritt (Park frei)',
      contact: 'info@spsg.de',
      website: 'https://www.spsg.de',
      address: 'Maulbeerallee, 14469 Potsdam, Deutschland',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Reflection_of_Sanssouci_Palace.jpg/1200px-Reflection_of_Sanssouci_Palace.jpg'
    }
  }
];
