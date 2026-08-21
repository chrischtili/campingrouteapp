import React, { useEffect, useState } from 'react';
import { 
  Compass, 
  Search, 
  Star, 
  Plus, 
  Heart, 
  X, 
  Globe, 
  ChevronRight,
  Info,
  Sparkles,
  MapPin,
  Share2,
  Image as ImageIcon,
  Camera,
  MessageSquare,
  Navigation,
  Key,
  Shield,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './entdecken.css';
import { Navbar } from "@/components/route-planner/Navbar";
import { Footer } from "@/components/route-planner/Footer";
import { AppBreadcrumbs, type BreadcrumbItem } from "@/components/AppBreadcrumbs";
import { setDiscoverBreadcrumbs, useDiscoverBreadcrumbs } from "@/lib/discoverBreadcrumbs";

export interface AISettings {
  provider: 'gemini' | 'deepseek' | 'openai' | 'claude';
  model: string;
  apiKey: string;
}

export const DEFAULT_MODELS: { [key: string]: { id: string; label: string; tag?: string }[] } = {
  deepseek: [
    { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', tag: 'Empfohlen · Sehr schnell' },
    { id: 'deepseek-v4-chat', label: 'DeepSeek V4 Chat', tag: 'Neueste Generation' },
    { id: 'deepseek-v4-reasoner', label: 'DeepSeek V4 Reasoner', tag: 'Tiefes Denken' },
    { id: 'deepseek-chat', label: 'DeepSeek V3 (Chat)', tag: 'Standard' },
    { id: 'deepseek-reasoner', label: 'DeepSeek R1 (Reasoner)', tag: 'Reasoning' }
  ],
  openai: [
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', tag: 'Empfohlen · Blitzschnell' },
    { id: 'gpt-4o', label: 'GPT-4o', tag: 'Omni Flagship' },
    { id: 'gpt-4.5-preview', label: 'GPT-4.5 Preview', tag: 'Neuestes Großmodell' },
    { id: 'gpt-5', label: 'GPT-5', tag: 'Next Gen' },
    { id: 'o3-mini', label: 'o3-mini', tag: 'Neues Reasoning' },
    { id: 'o1', label: 'o1', tag: 'Reasoning' }
  ],
  gemini: [
    { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash', tag: 'Empfohlen · Next Gen' },
    { id: 'gemini-3.7-pro', label: 'Gemini 3.7 Pro', tag: 'Höchste Präzision' },
    { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', tag: 'Schnell' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tag: 'Stabil' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', tag: 'Standard' }
  ],
  claude: [
    { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet', tag: 'Empfohlen · Hybrid Reasoning' },
    { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', tag: 'Ultra-schnell' },
    { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', tag: 'Präzise' },
    { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus', tag: 'Kreativ' }
  ]
};

interface RouteStage {
  stage_number: number;
  place_id: string;
  distance_km: number;
  drive_hours: number;
  stage_title: string;
}

interface RouteInfo {
  origin: string;
  destination: string;
  originCoords: [number, number];
  destinationCoords: [number, number];
  totalKm: number;
  totalDriveHours: number;
  numStops: number;
  stages: RouteStage[];
}

interface Place {
  id: string;
  name: string;
  type: string; // 'campground' | 'caravan' | 'glamping' | 'attraction'
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
  city?: string;
  description: string;
  amenities: string;
  rating: number;
  price: string;
  price_min?: number;
  price_max?: number;
  currency?: string;
  is_free?: number;
  contact: string;
  website?: string;
  phone?: string;
  address: string;
  image_url?: string;
  distance_km?: number;
  osm_id?: string;
  is_curated?: boolean;
  stage_number?: number;
  distance_from_origin_km?: number;
  drive_time_hours?: number;
  distance_to_route_km?: number;
}

interface Review {
  id: string;
  place_id: string;
  author: string;
  content: string;
  rating: number;
  created_at: string;
}

interface List {
  id: string;
  name: string;
  description: string;
  item_count: number;
}

const COUNTRY_NAMES: { [lang: string]: { [key: string]: string } } = {
  de: {
    "DE": "Deutschland", "AT": "Österreich", "CH": "Schweiz", "DK": "Dänemark", "NO": "Norwegen", "SE": "Schweden", "FR": "Frankreich", "NL": "Niederlande", "BE": "Belgien", "LU": "Luxemburg", "FI": "Finnland", "IT": "Italien", "ES": "Spanien", "PT": "Portugal", "HR": "Kroatien", "GR": "Griechenland", "SI": "Slowenien", "CZ": "Tschechien", "PL": "Polen", "HU": "Ungarn", "GB": "Großbritannien"
  },
  en: {
    "DE": "Germany", "AT": "Austria", "CH": "Switzerland", "DK": "Denmark", "NO": "Norway", "SE": "Sweden", "FR": "France", "NL": "Netherlands", "BE": "Belgium", "LU": "Luxembourg", "FI": "Finland", "IT": "Italy", "ES": "Spain", "PT": "Portugal", "HR": "Croatia", "GR": "Greece", "SI": "Slovenia", "CZ": "Czech Republic", "PL": "Poland", "HU": "Hungary", "GB": "United Kingdom"
  },
  fr: {
    "DE": "Allemagne", "AT": "Autriche", "CH": "Suisse", "DK": "Danemark", "NO": "Norvège", "SE": "Suède", "FR": "France", "NL": "Pays-Bas", "BE": "Belgique", "LU": "Luxembourg", "FI": "Finlande", "IT": "Italie", "ES": "Espagne", "PT": "Portugal", "HR": "Croatie", "GR": "Grèce", "SI": "Slovénie", "CZ": "République tchèque", "PL": "Pologne", "HU": "Hongrie", "GB": "Royaume-Uni"
  },
  it: {
    "DE": "Germania", "AT": "Austria", "CH": "Svizzera", "DK": "Danimarca", "NO": "Norvegia", "SE": "Svezia", "FR": "Francia", "NL": "Paesi Bassi", "BE": "Belgio", "LU": "Lussemburgo", "FI": "Finlandia", "IT": "Italia", "ES": "Spagna", "PT": "Portogallo", "HR": "Croazia", "GR": "Grecia", "SI": "Slovenia", "CZ": "Repubblica Ceca", "PL": "Polonia", "HU": "Ungheria", "GB": "Regno Unito"
  },
  nl: {
    "DE": "Duitsland", "AT": "Oostenrijk", "CH": "Zwitserland", "DK": "Denemarken", "NO": "Noorwegen", "SE": "Zweden", "FR": "Frankrijk", "NL": "Nederland", "BE": "België", "LU": "Luxemburg", "FI": "Finland", "IT": "Italië", "ES": "Spanje", "PT": "Portugal", "HR": "Kroatië", "GR": "Griekenland", "SI": "Slovenië", "CZ": "Tsjechië", "PL": "Polen", "HU": "Hongarije", "GB": "Verenigd Koninkrijk"
  }
};

const getCountryName = (code: string, lang: string = 'de'): string => {
  const l = (lang || 'de').slice(0, 2).toLowerCase();
  const dict = COUNTRY_NAMES[l] || COUNTRY_NAMES.de;
  return dict[code] || code;
};

const COUNTRY_FLAGS: { [key: string]: string } = {
  "DE": "🇩🇪",
  "AT": "🇦🇹",
  "CH": "🇨🇭",
  "DK": "🇩🇰",
  "NO": "🇳🇴",
  "SE": "🇸🇪",
  "FR": "🇫🇷",
  "NL": "🇳🇱",
  "BE": "🇧🇪",
  "LU": "🇱🇺",
  "FI": "🇫🇮",
  "IT": "🇮🇹",
  "ES": "🇪🇸",
  "PT": "🇵🇹",
  "HR": "🇭🇷",
  "GR": "🇬🇷",
  "SI": "🇸🇮",
  "CZ": "🇨🇿",
  "PL": "🇵🇱",
  "HU": "🇭🇺",
  "GB": "🇬🇧"
};

const BADGES_BY_COUNTRY: { [key: string]: string[] } = {
  "DE": [
    "Schlösser und Sehenswürdigkeiten in Bayern",
    "Ruhige Stellplätze im Schwarzwald am Fluss",
    "Campingplätze an der Ostseeküste mit Meerblick",
    "Wellness-Camping im Allgäu mit Sauna"
  ],
  "AT": [
    "Camping am Wörthersee mit Hund erlaubt",
    "Stellplätze in Tirol mit Blick auf die Alpen",
    "Campingplätze im Salzkammergut direkt am See",
    "Sehenswürdigkeiten rund um Salzburg und Wolfgangsee"
  ],
  "CH": [
    "Camping im Berner Oberland nahe Lauterbrunnen",
    "Stellplätze im Tessin mit mediterranem Vibe",
    "Campingplätze in Graubünden zum Wandern",
    "Sehenswürdigkeiten rund um den Vierwaldstättersee"
  ],
  "FR": [
    "Campingplätze an der Côte d'Azur nahe Strand",
    "Stellplätze im Elsass an der Weinstraße",
    "Natur-Camping in der Dordogne mit Fluss",
    "Sehenswürdigkeiten in der Provence zwischen Lavendelfeldern"
  ],
  "IT": [
    "Campingplätze am Gardasee mit Pool",
    "Stellplätze in der Toskana auf einem Weingut",
    "Camping auf Sardinien nahe Traumstränden",
    "Sehenswürdigkeiten in Rom und Umgebung"
  ],
  "NL": [
    "Campingplätze auf Texel direkt in den Dünen",
    "Stellplätze am IJsselmeer für Wassersportler",
    "Familien-Camping in Zeeland nahe Nordsee",
    "Ausflugsziele in Nordholland und Amsterdam"
  ],
  "NO": [
    "Campingplätze in Norwegen mit Sauna",
    "Stellplätze auf den Lofoten direkt am Fjord",
    "Wildnis-Camping nahe Jotunheimen Nationalpark",
    "Sehenswürdigkeiten entlang der Atlantikstraße"
  ],
  "SE": [
    "Glamping-Plätze in Schweden direkt am See",
    "Ruhige Stellplätze in Småland im Wald",
    "Schärengarten-Camping nahe Stockholm",
    "Sehenswürdigkeiten rund um den Siljansee"
  ],
  "DK": [
    "Ruhige Stellplätze in Dänemark mit Strandnähe",
    "Familien-Camping auf Rømø direkt am Nordseestrand",
    "Campingplätze auf Bornholm nahe Klippen",
    "Sehenswürdigkeiten in Kopenhagen und Umgebung"
  ],
  "ES": [
    "Camping an der Costa Brava nahe Strand",
    "Stellplätze auf Mallorca mit Meerblick",
    "Camping mit Pool an der Costa Blanca",
    "Sehenswürdigkeiten in Barcelona und Umgebung"
  ],
  "PT": [
    "Camping an der Algarve direkt am Meer",
    "Surf-Camping an der Atlantikküste",
    "Ruhige Stellplätze im Alentejo",
    "Sehenswürdigkeiten in Lissabon"
  ],
  "HR": [
    "Camping in Istrien mit Pool",
    "Stellplätze in Dalmatien nahe Stränden",
    "Natur-Camping auf den Inseln der Kvarner Bucht",
    "Sehenswürdigkeiten in Split und Umgebung"
  ],
  "GR": [
    "Camping auf Kreta direkt am Strand",
    "Stellplätze auf dem Peloponnes",
    "Glamping in Griechenland mit Blick aufs Meer",
    "Sehenswürdigkeiten in Athen"
  ],
  "SI": [
    "Camping am Bleder See mit Bergblick",
    "Natur-Camping in den Julischen Alpen",
    "Stellplätze in Slowenien für Wanderer",
    "Sehenswürdigkeiten in Ljubljana"
  ],
  "CZ": [
    "Camping in Südböhmen an der Moldau",
    "Ruhige Stellplätze in der Böhmischen Schweiz",
    "Camping bei Prag für Städtereisen",
    "Sehenswürdigkeiten in Prag"
  ],
  "PL": [
    "Camping an der polnischen Ostseeküste",
    "Natur-Camping in den Masuren",
    "Stellplätze in Danzig und Umgebung",
    "Sehenswürdigkeiten in Krakau"
  ],
  "HU": [
    "Camping am Plattensee für Familien",
    "Stellplätze in Ungarn bei Thermalbädern",
    "Ruhiges Camping in der Puszta",
    "Sehenswürdigkeiten in Budapest"
  ],
  "GB": [
    "Camping im Lake District mit Bergblick",
    "Stellplätze in Cornwall nahe der Küste",
    "Natur-Camping in den schottischen Highlands",
    "Sehenswürdigkeiten in London"
  ]
};

const FALLBACK_BADGES = [
  "Glamping-Plätze in Schweden direkt am See",
  "Ruhige Stellplätze in Dänemark mit Strandnähe",
  "Schlösser und Sehenswürdigkeiten in Bayern",
  "Campingplätze am Gardasee mit Pool"
];

const REGIONS_BY_COUNTRY: { [key: string]: { states: string[], popular: string[] } } = {
  "DE": {
    states: ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"],
    popular: ["Schwarzwald", "Bodensee", "Ostsee", "Nordsee", "Allgäu", "Harz", "Eifel", "Sächsische Schweiz", "Mosel", "Bayerischer Wald", "Spreewald", "Mecklenburgische Seenplatte", "Lüneburger Heide"]
  },
  "AT": {
    states: ["Burgenland", "Kärnten", "Niederösterreich", "Oberösterreich", "Salzburg", "Steiermark", "Tirol", "Vorarlberg", "Wien"],
    popular: ["Salzkammergut", "Wörthersee", "Zillertal", "Ötztal", "Achensee", "Arlberg", "Grossglockner", "Wachau", "Dachstein", "Bregenzerwald", "Kitzbüheler Alpen", "Neusiedlersee"]
  },
  "CH": {
    states: ["Graubünden", "Wallis", "Tessin", "Bern", "Zürich", "Luzern", "St. Gallen", "Waadt", "Neuenburg", "Freiburg", "Aargau", "Basel-Landschaft", "Genf", "Jura", "Schaffhausen", "Solothurn", "Thurgau"],
    popular: ["Vierwaldstättersee", "Berner Oberland", "Engadin", "Lauterbrunnental", "Zermatt", "Lago Maggiore", "Genfersee", "Bodensee", "Jungfrau-Region", "Toggenburg"]
  },
  "FR": {
    states: ["Provence-Alpes-Côte d'Azur", "Auvergne-Rhône-Alpes", "Bretagne", "Nouvelle-Aquitaine", "Normandie", "Occitanie", "Pays de la Loire", "Centre-Val de Loire", "Hauts-de-France", "Île-de-France"],
    popular: ["Côte d'Azur", "Französische Alpen", "Dordogne", "Loire-Tal", "Korsika", "Elsass", "Vogesen", "Ardèche", "Pyrenäen", "Verdon-Schlucht", "Bretagne-Küste"]
  },
  "IT": {
    states: ["Trentino-Südtirol", "Toskana", "Venetien", "Lombardei", "Sardinien", "Sizilien", "Piemont", "Apulien", "Umbrien", "Abruzzen", "Ligurien", "Kampanien", "Emilia-Romagna", "Latium", "Kalabrien", "Friaul-Julisch Venetien", "Marken", "Aostatal", "Basilikata", "Molise"],
    popular: ["Gardasee", "Südtirol", "Dolomiten", "Toskanische Hügel", "Amalfiküste", "Comer See", "Adriaküste", "Langhe", "Cinque Terre", "Maggioresee"]
  },
  "NL": {
    states: ["Gelderland", "Zeeland", "Noord-Holland", "Zuid-Holland", "Noord-Brabant", "Friesland", "Overijssel", "Limburg", "Drenthe", "Flevoland", "Utrecht", "Groningen"],
    popular: ["Texel", "IJsselmeer", "Nordseeküste", "Veluwe", "Schelde-Delta", "Ameland", "Waddeneilanden", "Lauwersmeer"]
  },
  "NO": {
    states: [],
    popular: ["Lofoten", "Geirangerfjord", "Hardangerfjord", "Jotunheimen", "Nordkap", "Tromsø", "Sognefjord", "Senja", "Preikestolen"]
  },
  "SE": {
    states: [],
    popular: ["Öland", "Gotland", "Schärengarten", "Vätternsee", "Siljansee", "Vänernsee", "Schwedisch Lappland", "Kosterhavet", "Göta-Kanal"]
  },
  "DK": {
    states: [],
    popular: ["Rømø", "Skagen", "Bornholm", "Ostseeküste (Dänemark)", "Nordseeküste (Dänemark)", "Fünen", "Lalandia", "Blåvand", "Møns Klint"]
  },
  "FI": {
    states: [],
    popular: ["Lappland", "Finnische Seenplatte", "Åland-Inseln", "Saimaa-See", "Koli-Nationalpark", "Archipel-Nationalpark"]
  },
  "BE": {
    states: [],
    popular: ["Ardennen", "Belgische Küste", "Hohes Venn", "Brügge & Umland", "Maastal"]
  },
  "LU": {
    states: [],
    popular: ["Müllerthal (Kleine Luxemburger Schweiz)", "Ösling (Luxemburger Ardennen)", "Moseltal (Luxemburg)", "Stausee von Esch-Sauer"]
  },
  "ES": {
    states: [],
    popular: ["Costa Brava", "Costa Blanca", "Costa del Sol", "Mallorca", "Balearen"]
  },
  "PT": {
    states: [],
    popular: ["Algarve"]
  },
  "HR": {
    states: [],
    popular: ["Istrien", "Kvarner", "Dalmatien"]
  },
  "GR": {
    states: [],
    popular: ["Kreta", "Peloponnes", "Rhodos"]
  },
  "SI": {
    states: [],
    popular: ["Bleder See", "Slowenische Alpen"]
  },
  "CZ": {
    states: [],
    popular: ["Böhmische Schweiz", "Südböhmen"]
  },
  "PL": {
    states: [],
    popular: ["Polnische Ostsee", "Masurische Seenplatte"]
  },
  "HU": {
    states: [],
    popular: ["Plattensee"]
  },
  "GB": {
    states: [],
    popular: ["Lake District", "Cornwall", "Schottische Highlands"]
  }
};

function getFallbackImage(place: Place): string {
  const campgroundImages = [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80"
  ];
  const caravanImages = [
    "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80"
  ];
  const glampingImages = [
    "https://images.unsplash.com/photo-1526495124232-a02e18494d1a?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=600&q=80"
  ];
  const attractionImages = [
    "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
  ];

  const hash = place.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  if (place.type === 'caravan') {
    return caravanImages[hash % caravanImages.length];
  } else if (place.type === 'glamping') {
    return glampingImages[hash % glampingImages.length];
  } else if (place.type === 'attraction') {
    return attractionImages[hash % attractionImages.length];
  } else {
    return campgroundImages[hash % campgroundImages.length];
  }
}

function EntdeckenContent() {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'de').slice(0, 2).toLowerCase();
  const t = currentLang === 'en' ? en : currentLang === 'fr' ? fr : currentLang === 'it' ? it : currentLang === 'nl' ? nl : de;

  const [activeTab, setActiveTab] = useState<'explore' | 'lists'>('explore');
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapPoints, setMapPoints] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [listItems, setListItems] = useState<Place[]>([]);
  const [countryStats, setCountryStats] = useState<{ [key: string]: number }>({});
  const [attractionStats, setAttractionStats] = useState<{ [key: string]: number }>({});
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchSummary, setSearchSummary] = useState('');
  const [recommendationTitle, setRecommendationTitle] = useState('');
  const [curatedIds, setCuratedIds] = useState<string[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routePolyline, setRoutePolyline] = useState<[number, number][] | null>(null);
  const [selectedCountryView, setSelectedCountryView] = useState<string | null>(null);
  const [countryAttractions, setCountryAttractions] = useState<Place[]>([]);
  const [subdivisionStats, setSubdivisionStats] = useState<{ [key: string]: number }>({});
  const [countryTab, setCountryTab] = useState<'camping' | 'attractions'>('camping');
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modals state
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [newListVal, setNewListVal] = useState({ name: '', description: '' });
  const [showSaveToListModal, setShowSaveToListModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewVal, setNewReviewVal] = useState({ author: '', content: '', rating: 5 });
  const [featuredCountry, setFeaturedCountry] = useState<string>('DE');

  // AI Settings & Custom Key state
  const [showAISettingsModal, setShowAISettingsModal] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem('campingroute_discover_ai');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      provider: 'gemini',
      model: 'gemini-3.7-flash',
      apiKey: ''
    };
  });
  const [tempAISettings, setTempAISettings] = useState<AISettings>(aiSettings);
  const [showApiKeyMask, setShowApiKeyMask] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCustomModel, setIsCustomModel] = useState(false);

  const handleOpenAISettings = () => {
    setTempAISettings(aiSettings);
    setTestResult(null);
    setShowApiKeyMask(false);
    const providerModels = DEFAULT_MODELS[aiSettings.provider] || [];
    setIsCustomModel(!providerModels.some(m => m.id === aiSettings.model));
    setShowAISettingsModal(true);
  };

  const handleSaveAISettings = () => {
    setAiSettings(tempAISettings);
    localStorage.setItem('campingroute_discover_ai', JSON.stringify(tempAISettings));
    setShowAISettingsModal(false);
  };

  const handleDeleteAISettings = () => {
    const cleared: AISettings = { provider: 'gemini', model: 'gemini-3.7-flash', apiKey: '' };
    setAiSettings(cleared);
    setTempAISettings(cleared);
    localStorage.removeItem('campingroute_discover_ai');
    setTestResult({ success: true, message: t.aiKeyClearedMsg || 'API-Schlüssel wurde erfolgreich aus deinem Browser gelöscht.' });
  };

  const handleTestAIKey = async () => {
    if (!tempAISettings.apiKey || !tempAISettings.apiKey.trim()) {
      setTestResult({ success: false, message: t.aiPleaseEnterKey || 'Bitte gib zuerst einen API-Key ein.' });
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await fetch('/discover/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempAISettings)
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || t.aiTestFailedMsg || 'Verbindungstest fehlgeschlagen.' });
    } finally {
      setIsTestingKey(false);
    }
  };

  // MCP Server info modal state
  const [showMCPModal, setShowMCPModal] = useState(false);
  const [copiedMCP, setCopiedMCP] = useState(false);

  const mcpConfigCode = JSON.stringify({
    mcpServers: {
      campingroute: {
        serverUrl: "https://campingroute.app/discover/mcp"
      }
    }
  }, null, 2);

  const handleCopyMCP = () => {
    navigator.clipboard.writeText(mcpConfigCode);
    setCopiedMCP(true);
    setTimeout(() => setCopiedMCP(false), 2500);
  };

  // Map reference for place detail page
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const leafletMapRef = React.useRef<L.Map | null>(null);
  const markerLayerRef = React.useRef<L.LayerGroup | null>(null);
  const wasOpenRef = React.useRef(false);
  const prevPlaceIdRef = React.useRef<string | null>(null);

  // Map reference for the results minimap
  const resultsMapRef = React.useRef<HTMLDivElement>(null);
  const resultsLeafletMapRef = React.useRef<L.Map | null>(null);
  const resultsClusterRef = React.useRef<L.MarkerClusterGroup | null>(null);
  const resultsOriginalViewRef = React.useRef<{ center: L.LatLng; zoom: number } | null>(null);
  const mapMarkersRef = React.useRef<Record<string, { marker: L.CircleMarker; radius: number; fillOpacity: number }>>({});

  // Vergrößert den Kartenpunkt beim Hovern über eine Ergebniskarte und zoomt
  // zu ihm, damit er auch aus einem Cluster einzeln sichtbar wird.
  const highlightMapMarker = (id: string) => {
    const entry = mapMarkersRef.current[id];
    if (!entry) return;
    entry.marker.setRadius(entry.radius + 5).setStyle({ fillOpacity: 1, weight: 3 });
    resultsClusterRef.current?.zoomToShowLayer(entry.marker);
  };
  const unhighlightMapMarker = (id: string) => {
    const entry = mapMarkersRef.current[id];
    if (entry) entry.marker.setRadius(entry.radius).setStyle({ fillOpacity: entry.fillOpacity, weight: entry.radius > 5 ? 2.5 : 1.5 });
    // Map wieder zur ursprünglichen Ansicht zurückbringen
    const view = resultsOriginalViewRef.current;
    const map = resultsLeafletMapRef.current;
    if (view && map) map.setView(view.center, view.zoom, { animate: true });
  };

  // NOTE: URL history sync is disabled when embedded in campingroute_app - the
  // outer router owns the URL. Navigation here is purely state-based.

  // Open the internal AI settings panel when the navbar button asks for it.
  React.useEffect(() => {
    const openSettings = () => handleOpenAISettings();
    window.addEventListener('campingroute:open-ai-settings', openSettings);
    const openMCP = () => setShowMCPModal(true);
    window.addEventListener('campingroute:open-mcp', openMCP);
    const openCountry = (e: Event) => {
      const code = ((e as CustomEvent).detail?.code as string) || 'DE';
      openCountryView(code, 'camping');
    };
    window.addEventListener('campingroute:open-country', openCountry);
    return () => {
      window.removeEventListener('campingroute:open-ai-settings', openSettings);
      window.removeEventListener('campingroute:open-mcp', openMCP);
      window.removeEventListener('campingroute:open-country', openCountry);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Report the current navigation path so campingroute_app's breadcrumbs can
  // show Länder / Regionen / Sehenswürdigkeiten / Orte in the current language.
  useEffect(() => {
    const countryName = (c?: string) => (c ? getCountryName(c, currentLang) : '');
    const typePlural = (tp: string) =>
      tp === 'attraction' ? t.tabHighlights : tp === 'caravan' ? t.placeTypeStellplatz : tp === 'glamping' ? t.placeTypeGlamping : t.tabCamping;
    const parentLabel = (c: string) =>
      countryTab === 'attractions'
        ? (t.attractionsInRegion || 'Sehenswürdigkeiten in {{country}}').replace('{{country}}', countryName(c))
        : (t.campingIn || 'Camping in {{country}}').replace('{{country}}', countryName(c));

    const trail: BreadcrumbItem[] = [
      { label: t.tabExplore || 'Entdecken', path: '/discover', onClick: () => { setSelectedPlace(null); resetSearch(); } },
    ];
    if (selectedPlace) {
      const code = selectedPlace.country;
      trail.push({
        label: `${typePlural(selectedPlace.type)} in ${countryName(code)}`,
        onClick: () => openCountryView(code, selectedPlace.type === 'attraction' ? 'attractions' : 'camping'),
      });
      trail.push({ label: selectedPlace.name });
    } else if (selectedCountryView && !hasSearched) {
      trail.push({ label: parentLabel(selectedCountryView) });
    } else if (hasSearched) {
      if (selectedCountryView) {
        trail.push({
          label: parentLabel(selectedCountryView),
          onClick: () => openCountryView(selectedCountryView, countryTab),
        });
      } else {
        trail.push({ label: t.searchResults || 'Suchergebnisse' });
      }
      if (searchQuery) trail.push({ label: searchQuery });
    }
    setDiscoverBreadcrumbs(trail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlace, selectedCountryView, countryTab, hasSearched, searchQuery, currentLang, t]);

  // Guess home country from browser locale on mount
  useEffect(() => {
    const lang = navigator.language || '';
    if (lang.includes('-')) {
      const region = lang.split('-')[1].toUpperCase();
      if (['DE', 'AT', 'CH', 'DK', 'NO', 'SE'].includes(region)) {
        setFeaturedCountry(region);
        return;
      }
    }
    if (lang.startsWith('de')) {
      setFeaturedCountry('DE');
    } else if (lang.startsWith('no')) {
      setFeaturedCountry('NO');
    } else if (lang.startsWith('sv')) {
      setFeaturedCountry('SE');
    } else if (lang.startsWith('da')) {
      setFeaturedCountry('DK');
    }
  }, []);

  // Initialize/update the results minimap whenever new map points arrive
  useEffect(() => {
    if (!hasSearched || mapPoints.length === 0 || !resultsMapRef.current) return;
    mapMarkersRef.current = {};
    resultsClusterRef.current = null;
    resultsOriginalViewRef.current = null;
    if (resultsLeafletMapRef.current) {
      resultsLeafletMapRef.current.remove();
      resultsLeafletMapRef.current = null;
    }
    const map = L.map(resultsMapRef.current, { attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>-Mitwirkende'
    }).addTo(map);
    const colorFor: { [key: string]: string } = {
      campground: '#059669', caravan: '#2563eb', glamping: '#7c3aed', attraction: '#ea580c'
    };
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    
    // If route polyline is available, draw it on the map
    if (routePolyline && routePolyline.length >= 2) {
      L.polyline(routePolyline, {
        color: '#059669',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8'
      }).addTo(map);
    }

    // Add Start & Destination markers if route info is present
    if (routeInfo && routeInfo.originCoords && routeInfo.destinationCoords) {
      const startMarker = L.circleMarker(routeInfo.originCoords, {
        radius: 9,
        color: '#ffffff',
        weight: 2.5,
        fillColor: '#10b981',
        fillOpacity: 1
      }).bindPopup(`<b>🚩 Start: ${esc(routeInfo.origin)}</b>`);
      startMarker.addTo(map);

      const destMarker = L.circleMarker(routeInfo.destinationCoords, {
        radius: 9,
        color: '#ffffff',
        weight: 2.5,
        fillColor: '#ef4444',
        fillOpacity: 1
      }).bindPopup(`<b>🏁 Ziel: ${esc(routeInfo.destination)}</b>`);
      destMarker.addTo(map);
    }

    // Marker clustering so ALL results are shown
    const cluster = L.markerClusterGroup({ maxClusterRadius: 45, showCoverageOnHover: false, spiderfyOnMaxZoom: true });
    const bounds = L.latLngBounds([] as [number, number][]);

    if (routeInfo && routeInfo.originCoords && routeInfo.destinationCoords) {
      bounds.extend(routeInfo.originCoords);
      bounds.extend(routeInfo.destinationCoords);
    }

    mapPoints.forEach((p) => {
      const isCuratedPoint = curatedIds.includes(p.id);
      const marker = L.circleMarker([p.latitude, p.longitude], {
        radius: isCuratedPoint ? 8 : 5,
        color: isCuratedPoint ? '#f59e0b' : '#ffffff',
        weight: isCuratedPoint ? 2.5 : 1.5,
        fillColor: colorFor[p.type] || '#059669',
        fillOpacity: 0.95
      });
      const distHtml = p.distance_km ? `<div style="color:#6b7280;font-size:0.75rem;margin-top:2px">${p.distance_km} km entfernt</div>` : '';
      let badgeHtml = isCuratedPoint ? `<div style="display:inline-block;background:#fef3c7;color:#b45309;font-weight:800;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-bottom:4px">✨ KI-Top-Empfehlung</div>` : '';
      if (p.stage_number) {
        badgeHtml = `<div style="display:inline-block;background:#059669;color:#ffffff;font-weight:800;font-size:0.7rem;padding:2px 6px;border-radius:4px;margin-bottom:4px">✨ Etappe ${p.stage_number}</div>`;
      }
      marker.bindPopup(
        `<div style="min-width:160px;font-family:inherit">
           ${badgeHtml}
           <div style="font-weight:700;font-size:0.9rem;color:#111827">${esc(p.name)}</div>
           ${distHtml}
           <button class="map-open-btn" style="margin-top:8px;width:100%;background:#059669;color:#fff;border:none;border-radius:6px;padding:5px 8px;font-weight:700;font-size:0.8rem;cursor:pointer">Öffnen</button>
         </div>`
      );
      marker.on('popupopen', (e) => {
        const btn = e.popup.getElement()?.querySelector('button.map-open-btn') as HTMLElement | null;
        if (btn) {
          btn.onclick = () => { openPlaceFromMap(p.id); };
        }
      });
      cluster.addLayer(marker);
      mapMarkersRef.current[p.id] = { marker, radius: isCuratedPoint ? 8 : 5, fillOpacity: 0.95 };
      bounds.extend([p.latitude, p.longitude] as [number, number]);
    });
    map.addLayer(cluster);
    resultsClusterRef.current = cluster;

    if (mapPoints.length === 1 && !routeInfo) {
      map.setView([mapPoints[0].latitude, mapPoints[0].longitude], 13);
    } else {
      map.fitBounds(bounds, { padding: [25, 25], maxZoom: 14 });
    }
    // Ursprüngliche Ansicht merken, um sie nach Hover wiederherzustellen
    resultsOriginalViewRef.current = { center: map.getCenter(), zoom: map.getZoom() };
    resultsLeafletMapRef.current = map;
    setTimeout(() => map.invalidateSize(), 150);
    return () => {
      if (resultsLeafletMapRef.current) {
        resultsLeafletMapRef.current.remove();
        resultsLeafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapPoints, hasSearched, routePolyline, routeInfo]);

  // Fetch initial data on mount
  useEffect(() => {
    fetchLists();
    fetchCountryStats();
    fetchAttractionStats();

    // Track discover visit
    fetch('/api/count-discover', { method: 'POST' }).catch(() => {});
  }, []);

  // Sync featured places with chosen featuredCountry
  useEffect(() => {
    fetchFeaturedPlaces(featuredCountry);
  }, [featuredCountry]);

  // Fetch top attractions when selectedCountryView changes
  useEffect(() => {
    if (selectedCountryView) {
      fetch(`/discover/api/countries/${selectedCountryView}/attractions`)
        .then(res => res.json())
        .then(data => setCountryAttractions(data || []))
        .catch(e => console.error('Error fetching country attractions:', e));
    } else {
      setCountryAttractions([]);
    }
  }, [selectedCountryView]);

  // Fetch subdivision counts when selectedCountryView or countryTab changes
  useEffect(() => {
    if (selectedCountryView && REGIONS_BY_COUNTRY[selectedCountryView]) {
      const body = {
        ...REGIONS_BY_COUNTRY[selectedCountryView],
        type: countryTab === 'camping' ? 'camping' : 'attraction'
      };
      fetch(`/discover/api/countries/${selectedCountryView}/subdivision-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(data => setSubdivisionStats(data || {}))
        .catch(e => console.error('Error fetching subdivision stats:', e));
    } else {
      setSubdivisionStats({});
    }
  }, [selectedCountryView, countryTab]);

  // Fetch reviews and nearby places when a place is selected
  useEffect(() => {
    if (selectedPlace) {
      fetchReviews(selectedPlace.id);
      fetchNearbyPlaces(selectedPlace.id);
    } else {
      setNearbyPlaces([]);
    }
  }, [selectedPlace]);

  // Lock body scroll while the place detail modal is open
  useEffect(() => {
    if (selectedPlace) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [selectedPlace]);

  // Create/tear down the modal map only when the modal opens/closes.
  // The map instance is kept alive while pivoting between nearby places so the
  // viewport never jumps.
  useEffect(() => {
    const isOpen = !!selectedPlace;
    if (isOpen && !wasOpenRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedPlace.latitude, selectedPlace.longitude],
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>-Mitwirkende'
      }).addTo(map);
      leafletMapRef.current = map;
      markerLayerRef.current = L.layerGroup().addTo(map);
      prevPlaceIdRef.current = null; // force an initial fit on first markers
      setTimeout(() => map.invalidateSize(), 120);
    } else if (!isOpen && wasOpenRef.current && leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
      markerLayerRef.current = null;
    }
    wasOpenRef.current = isOpen;
  }, [selectedPlace]);

  // Update markers (selected place + nearby) without recreating the map.
  // The view is only adjusted on a genuine fresh open, never when pivoting.
  useEffect(() => {
    const map = leafletMapRef.current;
    const layer = markerLayerRef.current;
    if (!selectedPlace || !map || !layer) return;

    layer.clearLayers();

    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="marker-pin ${selectedPlace.type} selected"></div>`
    });
    L.marker([selectedPlace.latitude, selectedPlace.longitude], { icon })
      .addTo(layer)
      .bindPopup(`<b>${escHtml(selectedPlace.name)}</b>`);

    const colorFor: { [key: string]: string } = {
      campground: '#059669', caravan: '#2563eb', glamping: '#7c3aed', attraction: '#ea580c'
    };
    const bounds = L.latLngBounds([[selectedPlace.latitude, selectedPlace.longitude]] as [number, number][]);
    nearbyPlaces.forEach((p) => {
      L.circleMarker([p.latitude, p.longitude], {
        radius: 6, color: '#ffffff', weight: 1.5,
        fillColor: colorFor[p.type] || '#059669', fillOpacity: 0.9
      })
        .addTo(layer)
        .bindPopup(`<b>${escHtml(p.name)}</b>${p.distance_km ? `<br/><small>${p.distance_km} km</small>` : ''}`);
      bounds.extend([p.latitude, p.longitude] as [number, number]);
    });

    // Only fit the view on a genuinely fresh open; never when the nearby list
    // simply arrives for the same place.
    const isNewPlace = prevPlaceIdRef.current !== selectedPlace.id;
    if (isNewPlace) {
      if (nearbyPlaces.length > 0) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
      } else {
        map.setView([selectedPlace.latitude, selectedPlace.longitude], 13);
      }
    }
    prevPlaceIdRef.current = selectedPlace.id;
  }, [selectedPlace, nearbyPlaces]);

  // Fetch items when a list is selected
  useEffect(() => {
    if (selectedList) {
      fetchListItems(selectedList.id);
    }
  }, [selectedList]);

  const fetchFeaturedPlaces = async (countryCode?: string) => {
    try {
      const countryVal = countryCode || featuredCountry;
      const url = countryVal === 'ALL' ? '/discover/api/search' : `/discover/api/search?country=${countryVal}`;
      const response = await fetch(url);
      const data = await response.json();
      setPlaces(data.places || []);
      setMapPoints([]);
      setSearchSummary('');
    } catch (e) {
      console.error('Error fetching featured places:', e);
    }
  };

  const fetchCountryStats = async () => {
    try {
      const response = await fetch('/discover/api/countries/stats');
      const data = await response.json();
      const statsMap: { [key: string]: number } = {};
      data.forEach((item: { country: string; count: number }) => {
        statsMap[item.country] = item.count;
      });
      setCountryStats(statsMap);
    } catch (e) {
      console.error('Error fetching country stats:', e);
    }
  };

  const fetchAttractionStats = async () => {
    try {
      const response = await fetch('/discover/api/countries/attraction-stats');
      const data = await response.json();
      const statsMap: { [key: string]: number } = {};
      data.forEach((item: { country: string; count: number }) => {
        statsMap[item.country] = item.count;
      });
      setAttractionStats(statsMap);
    } catch (e) {
      console.error('Error fetching country attraction stats:', e);
    }
  };

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      if (document.documentElement) {
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
      if (document.body) {
        document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    } catch {
      window.scrollTo(0, 0);
    }
  };

  const handleSearch = async (e?: React.FormEvent, customQuery?: string, pageNum?: number) => {
    if (e) e.preventDefault();
    const pageToFetch = pageNum !== undefined ? pageNum : 1;
    setCurrentPage(pageToFetch);
    const queryToRun = customQuery !== undefined ? customQuery : searchQuery;
    if (customQuery !== undefined) {
      setSearchQuery(customQuery);
    }

    setIsSearching(true);
    setHasSearched(true);
    setSelectedPlace(null);
    setSearchSummary('');
    setRecommendationTitle('');
    setCuratedIds([]);
    setRouteInfo(null);
    setRoutePolyline(null);

    // Sofort nach oben scrollen
    scrollToTop();

    try {
      const headers: Record<string, string> = {};
      if (aiSettings.apiKey && aiSettings.apiKey.trim()) {
        headers['x-ai-provider'] = aiSettings.provider;
        headers['x-ai-key'] = aiSettings.apiKey.trim();
        headers['x-ai-model'] = aiSettings.model;
      }
      const response = await fetch(`/discover/api/search?q=${encodeURIComponent(queryToRun)}&page=${pageToFetch}&limit=${itemsPerPage}`, {
        headers
      });
      const data = await response.json();
      const searchPlaces = data.places || [];
      setPlaces(searchPlaces);
      setMapPoints(data.mapPoints || []);
      setSearchSummary(data.summary || '');
      setRecommendationTitle(data.recommendationTitle || '');
      setCuratedIds(data.curatedIds || []);
      setRouteInfo(data.route || null);
      setRoutePolyline(data.routePolyline || null);
      setTotalItems(data.total || 0);
      if (searchPlaces.length > 0 && !selectedCountryView) {
        setSelectedCountryView(searchPlaces[0].country);
      }
      setTimeout(scrollToTop, 50);
    } catch (e) {
      console.error('Error executing AI search:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setSearchSummary('');
    setRecommendationTitle('');
    setCuratedIds([]);
    setRouteInfo(null);
    setRoutePolyline(null);
    setSelectedCountryView(null);
    setTotalItems(0);
    setCurrentPage(1);
    setMapPoints([]);
    scrollToTop();
    setTimeout(scrollToTop, 50);
    fetchFeaturedPlaces();
  };

  const openCountryView = (code: string, tab: 'camping' | 'attractions' = 'camping') => {
    setActiveTab('explore');
    setSelectedPlace(null);
    setSelectedList(null);
    setHasSearched(false);
    setSearchQuery('');
    setCountryTab(tab);
    setSelectedCountryView(code);
    scrollToTop();
    setTimeout(scrollToTop, 60);
  };

  // Open a place from the results minimap popup (fetches the full record)
  const openPlaceFromMap = async (id: string) => {
    try {
      const response = await fetch(`/discover/api/places/${id}`);
      const place = await response.json();
      if (place && place.id) {
        setSelectedPlace(place);
      }
    } catch (e) {
      console.error('Fehler beim Öffnen des Ortes:', e);
    }
  };

  const fetchReviews = async (placeId: string) => {
    try {
      const response = await fetch(`/discover/api/places/${placeId}/reviews`);
      const data = await response.json();
      setReviews(data);
    } catch (e) {
      console.error('Error fetching reviews:', e);
    }
  };

  const fetchNearbyPlaces = async (placeId: string) => {
    try {
      const response = await fetch(`/discover/api/places/${placeId}/nearby`);
      const data = await response.json();
      setNearbyPlaces(data || []);
    } catch (e) {
      console.error('Error fetching nearby places:', e);
    }
  };

  const fetchLists = async () => {
    try {
      const response = await fetch('/discover/api/lists');
      const data = await response.json();
      setLists(data);
    } catch (e) {
      console.error('Error fetching lists:', e);
    }
  };

  const fetchListItems = async (listId: string) => {
    try {
      const response = await fetch(`/discover/api/lists/${listId}/items`);
      const data = await response.json();
      setListItems(data);
    } catch (e) {
      console.error('Error fetching list items:', e);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListVal.name) return;

    try {
      const response = await fetch('/discover/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListVal),
      });

      if (response.ok) {
        setNewListVal({ name: '', description: '' });
        setShowAddListModal(false);
        fetchLists();
      }
    } catch (e) {
      console.error('Error creating list:', e);
    }
  };

  const handleSaveToList = async (listId: string) => {
    if (!selectedPlace) return;

    try {
      const response = await fetch(`/discover/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ place_id: selectedPlace.id }),
      });

      if (response.ok) {
        setShowSaveToListModal(false);
        fetchLists();
        alert(t.savedSuccessAlert || `Ort erfolgreich im Roadtrip gespeichert!`);
      }
    } catch (e) {
      console.error('Error saving to list:', e);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace || !newReviewVal.author || !newReviewVal.content) return;

    try {
      const response = await fetch(`/discover/api/places/${selectedPlace.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReviewVal),
      });

      if (response.ok) {
        setNewReviewVal({ author: '', content: '', rating: 5 });
        setShowReviewModal(false);
        fetchReviews(selectedPlace.id);
        // Refresh local place data
        const freshDetail = await fetch(`/discover/api/places/${selectedPlace.id}`);
        const freshPlace = await freshDetail.json();
        setSelectedPlace(freshPlace);
      }
    } catch (e) {
      console.error('Error submitting review:', e);
    }
  };

  // Helper to determine type label in current language
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'campground': return t.placeTypeCamping;
      case 'caravan': return t.placeTypeStellplatz;
      case 'glamping': return t.placeTypeGlamping;
      case 'attraction': return t.placeTypeAttraction;
      default: return type;
    }
  };

  const getTypeLabelPlural = (type: string) => {
    switch (type) {
      case 'campground': return t.tabCamping;
      case 'caravan': return t.placeTypeStellplatz;
      case 'glamping': return t.placeTypeGlamping;
      case 'attraction': return t.tabHighlights;
      default: return type;
    }
  };

const cleanImageUrl = (url: string | null) => {
  if (!url) return null;
  return url.replace(/^http:\/\//i, 'https://');
};

// Escape HTML entities so place names are safe inside map popups
const escHtml = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Prefer the structured image_url column, fall back to legacy markdown-in-description
const getImageUrl = (place: Place): string | null => {
  if (place.image_url) return cleanImageUrl(place.image_url);
  const match = (place.description || '').match(/!\[.*?\]\((.*?)\)/);
  return cleanImageUrl(match ? match[1] : null);
};

const getCleanDescription = (place: Place): string => {
  return (place.description || '').replace(/!\[.*?\]\((.*?)\)/g, '').trim();
};

const getAmenityList = (place: Place): string[] => {
  return (place.amenities || '').split(',').map(a => a.trim()).filter(Boolean);
};

const getWebsiteUrl = (place: Place): string | null => {
  if (place.website) return place.website;
  if (place.contact && place.contact.includes('http')) {
    const m = place.contact.split('|').find(c => c.trim().startsWith('http'));
    return m ? m.trim() : null;
  }
  return null;
};

  const copyShareLink = () => {
    if (!selectedPlace) return;
    const base = window.location.origin.includes('localhost') ? window.location.origin : 'https://campingroute.app';
    navigator.clipboard.writeText(`${base}/place/${selectedPlace.id}`);
    alert(t.linkCopiedAlert || "Teilungslink wurde in die Zwischenablage kopiert!");
  };

  return (
    <div className="entdecken-root" style={{ background: 'var(--gray-50)', minHeight: '100vh' }}>

      {/* Main Container */}
      <div style={{ width: '100%', margin: '0 auto', maxWidth: '1200px', padding: '2rem 1.5rem' }}>
        
        {/* Breadcrumbs kommen von campingroute_app (AppBreadcrumbs) */}

        {/* Place Detail Modal Overlay */}
        {selectedPlace && (
          <div
            className="place-modal-overlay"
            onClick={() => setSelectedPlace(null)}
          >
            {(() => {
          const imageUrl = getImageUrl(selectedPlace);
          const cleanDescription = getCleanDescription(selectedPlace);

          return (
            <div className="place-modal-container" onClick={(e) => e.stopPropagation()}>
              {/* Mobile Drag/Pull Indicator */}
              <div className="sm:hidden" style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.6rem', paddingBottom: '0.2rem', background: 'white' }}>
                <div style={{ width: '40px', height: '4px', borderRadius: '9999px', background: 'var(--gray-300)' }} />
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedPlace(null)}
                aria-label="Schließen"
                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 1100, background: 'rgba(31,41,55,0.9)', color: '#fff', border: 'none', borderRadius: '9999px', width: '38px', height: '38px', fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >×</button>
              {/* Breadcrumbs */}
              <div style={{ background: 'white', borderBottom: '1px solid var(--gray-100)', padding: '0.75rem 1.5rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-400)', fontWeight: 600, flexWrap: 'wrap' }}>
                  <a href="/" onClick={(e) => { e.preventDefault(); resetSearch(); setSelectedPlace(null); }} style={{ color: 'var(--primary-700)', textDecoration: 'none' }}>{t.navHome || 'Startseite'}</a>
                  <span>/</span>
                  <a href="/discover" onClick={(e) => { e.preventDefault(); setSelectedPlace(null); }} style={{ color: 'var(--primary-700)', textDecoration: 'none' }}>{t.navDiscover || 'Entdecken'}</a>
                  <span>/</span>
                  <a href="/" onClick={(e) => { e.preventDefault(); setSelectedPlace(null); setSelectedCountryView(selectedPlace.country); setHasSearched(false); }} style={{ color: 'var(--primary-700)', textDecoration: 'none' }}>{getCountryName(selectedPlace.country, currentLang)}</a>
                  <span>/</span>
                  <a href="/" onClick={(e) => { e.preventDefault(); setSelectedPlace(null); handleSearch(undefined, `${getTypeLabelPlural(selectedPlace.type)} in ${getCountryName(selectedPlace.country, currentLang)}`); }} style={{ color: 'var(--primary-700)', textDecoration: 'none' }}>{getTypeLabelPlural(selectedPlace.type)}</a>
                  {searchQuery && (
                    <>
                      <span>/</span>
                      <a href="/" onClick={(e) => { e.preventDefault(); setSelectedPlace(null); }} style={{ color: 'var(--primary-700)', textDecoration: 'none' }}>
                        {searchQuery.replace(/Camping in /gi, '').replace(/Camping im /gi, '').replace(/Camping /gi, '').trim()}
                      </a>
                    </>
                  )}
                  <span>/</span>
                  <span style={{ color: 'var(--gray-700)' }}>{selectedPlace.name}</span>
                </div>
              </div>

              {/* Map Banner */}
              <div style={{ position: 'relative', height: '320px', width: '100%', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-200)' }}>
                <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
                
                {/* Floating location badge */}
                <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', zIndex: 1000, background: 'rgba(31, 41, 55, 0.95)', color: 'white', padding: '0.45rem 1rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, boxShadow: 'var(--shadow-md)' }}>
                  <MapPin size={14} className="text-primary-400" />
                  <span>{selectedPlace.city || selectedPlace.address.split(',')[selectedPlace.address.split(',').length - 1]?.trim() || selectedPlace.address}, {getCountryName(selectedPlace.country, currentLang)}</span>
                </div>

              </div>

              {/* Grid Content Columns */}
              <div className="detail-grid-container responsive-detail-grid">
                
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                  {/* Place Header Block */}
                  <div className="detail-card">
                    <span className={`place-card-type ${selectedPlace.type}`} style={{ display: 'inline-block', marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
                      {getTypeLabel(selectedPlace.type)}
                    </span>
                    <h1 className="detail-title">{selectedPlace.name}</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                      <MapPin size={16} className="shrink-0" />
                      <span>{selectedPlace.address}</span>
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500, marginTop: '0.75rem' }}>
                      Datenquelle:{" "}
                      {(() => {
                        const osmMatch = (selectedPlace.osm_id || '').match(/^(node|way|relation)-(\d+)$/);
                        const wdId = (selectedPlace.id || selectedPlace.osm_id || '').match(/wikidata-(Q\d+)/i)?.[1];
                        if (selectedPlace.type === 'attraction' && wdId) {
                          return (
                            <a href={`https://www.wikidata.org/wiki/${wdId}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-700)', textDecoration: 'underline' }}>
                              Wikidata
                            </a>
                          );
                        }
                        if (selectedPlace.type !== 'attraction' && osmMatch) {
                          return (
                            <a href={`https://www.openstreetmap.org/${osmMatch[1]}/${osmMatch[2]}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-700)', textDecoration: 'underline' }}>
                              OpenStreetMap
                            </a>
                          );
                        }
                        return selectedPlace.type === 'attraction' ? 'Wikidata' : 'OpenStreetMap';
                      })()}
                      {selectedPlace.type !== 'attraction' && selectedPlace.website ? ' · verifizierte Website' : ''}
                    </p>
                  </div>

                  {/* See What It's Really Like */}
                  <div className="detail-card">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', overflowWrap: 'break-word' }}>{t.placeOverviewTitle}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1.25rem', overflowWrap: 'break-word' }}>{t.placeOverviewSubtitle}</p>
                    
                    <div style={{ background: 'var(--gray-50)', border: '1px dashed var(--gray-300)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', color: 'var(--gray-400)' }}>
                      <ImageIcon size={28} style={{ margin: '0 auto 0.5rem auto' }} />
                      <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.noVideoReports}</p>
                      <p style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>{t.noVideoReportsSub}</p>
                      <button style={{ background: 'var(--primary-700)', color: 'white', border: 'none', borderRadius: '18px', padding: '0.45rem 1.25rem', fontWeight: 700, fontSize: '0.82rem', marginTop: '0.85rem', cursor: 'pointer' }}>{t.addContentBtn}</button>
                    </div>
                  </div>

                  {/* About & Description */}
                  <div className="detail-card">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>{t.aboutLabel}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: '1.65', whiteSpace: 'pre-line', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{cleanDescription}</p>
                    
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '1.25rem', marginBottom: '0.65rem' }}>{t.amenitiesLabel}</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {getAmenityList(selectedPlace).map((amenity, i) => (
                        <span key={i} className="amenity-tag" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)', fontSize: '0.78rem', fontWeight: 600, padding: '0.3rem 0.65rem', borderRadius: '8px' }}>
                          {amenity.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                    {getAmenityList(selectedPlace).length === 0 && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', fontStyle: 'italic', marginTop: '0.4rem' }}>{t.noAmenitiesAvailable}</p>
                    )}
                  </div>

                  {/* Reviews Section */}
                  <div className="detail-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{t.reviewsTitle}</h3>
                      <button onClick={() => setShowReviewModal(true)} style={{ background: 'var(--primary-700)', color: 'white', border: 'none', borderRadius: '9999px', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>{t.writeReviewBtn}</button>
                    </div>
                    
                    {reviews.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', fontStyle: 'italic', textAlign: 'center', padding: '1.5rem' }}>{t.noReviews}</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {reviews.map((review) => (
                          <div key={review.id} style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span style={{ fontWeight: 700, color: 'var(--gray-800)', fontSize: '0.85rem' }}>{review.author}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#b45309', fontSize: '0.82rem', fontWeight: 700 }}>
                                <Star size={12} fill="#b45309" />
                                <span>{review.rating}</span>
                              </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: '1.5', overflowWrap: 'break-word' }}>{review.content}</p>
                            <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.2rem', display: 'block' }}>{review.created_at}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                  
                  {/* Save box */}
                  <div className="detail-card">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.35rem' }}>{t.saveLocation}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '0.85rem' }}>{t.saveLocationDesc}</p>
                    <button 
                      onClick={() => setShowSaveToListModal(true)}
                      style={{ width: '100%', background: 'var(--primary-700)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.65rem 1rem', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', cursor: 'pointer' }}
                    >
                      <Heart size={16} />
                      <span>{t.addToRoadtrip}</span>
                    </button>
                  </div>

                  {/* Stayed here box */}
                  <div className="detail-card">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.35rem' }}>{t.alreadyBeenHere}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '0.85rem' }}>{t.alreadyBeenHereDesc}</p>
                    
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', marginBottom: '0.85rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => { setNewReviewVal({ ...newReviewVal, rating: star }); setShowReviewModal(true); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-200)' }}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star size={22} style={{ color: star <= selectedPlace.rating ? '#b45309' : 'var(--gray-200)' }} fill={star <= selectedPlace.rating ? '#b45309' : 'none'} />
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setShowReviewModal(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontSize: '0.82rem', fontWeight: 700, width: '100%', textAlign: 'center', cursor: 'pointer' }}
                    >
                      {t.writeReviewBtn}
                    </button>
                  </div>

                  {/* Photos box */}
                  <div className="detail-card">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem' }}>{t.photoGallery}</h4>
                    {imageUrl ? (
                      <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '170px' }}>
                        <img src={imageUrl} alt={selectedPlace.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = getFallbackImage(selectedPlace); }} />
                      </div>
                    ) : (
                      <div style={{ background: 'var(--gray-50)', border: '1px dashed var(--gray-300)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', color: 'var(--gray-400)' }}>
                        <Camera size={26} style={{ margin: '0 auto 0.4rem auto' }} />
                        <p style={{ fontSize: '0.78rem', fontWeight: 600 }}>{t.noPhotos}</p>
                        <button style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.4rem', cursor: 'pointer' }}>{t.uploadPhoto}</button>
                      </div>
                    )}
                  </div>

                  {/* Share box */}
                  <div className="detail-card">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.35rem' }}>{t.shareLocation}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '0.85rem' }}>{t.shareLocationDesc}</p>
                    
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button onClick={copyShareLink} style={{ flex: '1 1 auto', minWidth: '75px', background: 'var(--gray-100)', border: 'none', color: 'var(--gray-700)', padding: '0.55rem 0.7rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                        <Share2 size={15} />
                        <span>{t.shareBtn}</span>
                      </button>
                      {getWebsiteUrl(selectedPlace) && (
                        <a href={getWebsiteUrl(selectedPlace)!} target="_blank" rel="noreferrer" style={{ flex: '1 1 auto', minWidth: '85px', background: 'var(--gray-100)', border: 'none', color: 'var(--gray-700)', padding: '0.55rem 0.7rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', textDecoration: 'none' }}>
                          <Globe size={15} />
                          <span>{t.websiteLink}</span>
                        </a>
                      )}
                      {selectedPlace.phone && (
                        <a href={`tel:${selectedPlace.phone.replace(/[^+\d]/g, '')}`} style={{ flex: '1 1 auto', minWidth: '80px', background: 'var(--gray-100)', border: 'none', color: 'var(--gray-700)', padding: '0.55rem 0.7rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', textDecoration: 'none' }}>
                          <MessageSquare size={15} />
                          <span>{t.callBtn}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Nearby Places box */}
                  <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                      {selectedPlace.type === 'attraction' ? 'Campingplätze in der Nähe' : 'Sehenswürdigkeiten in der Nähe'}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '1.25rem' }}>
                      {selectedPlace.type === 'attraction' ? 'Unterkünfte in der Umgebung' : 'Ausflugsziele und Naturwunder'}
                    </p>
                    
                    {nearbyPlaces.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', fontStyle: 'italic', margin: 0 }}>Keine weiteren Orte im Umkreis gefunden.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {nearbyPlaces.map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => setSelectedPlace(item)}
                            style={{ 
                              display: 'flex', 
                              gap: '0.75rem', 
                              alignItems: 'center', 
                              padding: '0.6rem', 
                              borderRadius: '10px', 
                              border: '1px solid var(--gray-100)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease-in-out'
                            }}
                            className="hover:border-primary-500 hover:shadow-xs hover:bg-gray-50"
                          >
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '8px', 
                              background: item.type === 'attraction' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(5, 150, 105, 0.1)', 
                              color: item.type === 'attraction' ? 'var(--primary-700)' : 'var(--emerald-700)',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {item.type === 'attraction' ? <Compass size={16} /> : <MapPin size={16} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-800)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h5>
                              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', margin: '0.15rem 0 0 0', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>{item.address.split(',')[0]}</span>
                                <span style={{ fontWeight: 600, color: 'var(--primary-700)', flexShrink: 0 }}>{item.distance_km} km</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          );
            })()}
          </div>
        )}

        {/* Explore / Search Mode */}
        {activeTab === 'explore' && (
            <div>
              {/* AI Search Hero Area (nur auf der Startseite) */}
              {!hasSearched && !selectedCountryView && (
              <div style={{ 
                textAlign: 'center', 
                padding: '5rem 1.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.55)), url("/hero-bg.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '24px',
                color: 'white',
                marginBottom: '2.5rem',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.3s ease-in-out'
              }}>
                {!hasSearched && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.2)', color: 'white', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase', backdropFilter: 'blur(4px)' }}>
                    <Sparkles size={12} />
                    Early Beta — AI Search
                  </div>
                )}
                <h1 style={{ 
                  fontSize: hasSearched ? '2rem' : '2.8rem', 
                  fontWeight: 800, 
                  color: 'white', 
                  letterSpacing: '-0.02em', 
                  marginBottom: '1rem', 
                  maxWidth: '700px', 
                  lineHeight: '1.15',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  transition: 'all 0.3s ease-in-out'
                }}>
                  {t.heroTitle}
                </h1>
                {!hasSearched && (
                  <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.95)', maxWidth: '600px', lineHeight: '1.6', marginBottom: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {t.heroSubtitle}
                  </p>
                )}

                {/* Natural Language Search Bar */}
                <form onSubmit={handleSearch} style={{ maxWidth: '720px', width: '100%', background: 'white', border: '1px solid var(--gray-200)', borderRadius: '24px', padding: '0.45rem', display: 'flex', gap: '0.5rem', boxShadow: 'var(--shadow-lg)', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '1rem', position: 'relative' }}>
                    <Search size={20} style={{ color: 'var(--gray-400)', position: 'absolute', left: '1rem' }} />
                    <input 
                      type="text" 
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', padding: '0.8rem 1rem 0.8rem 2rem', fontSize: '1.05rem', color: 'var(--gray-800)' }}
                    />
                  </div>
                  <button type="submit" style={{ background: 'var(--primary-700)', color: 'white', border: 'none', borderRadius: '18px', padding: '0 1.75rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }} className="search-submit-btn">
                    <Sparkles size={16} />
                    {t.searchBtn}
                  </button>
                </form>

                {/* Suggestions Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', maxWidth: '700px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{t.suggestionsTitle}</span>
                  {(() => {
                    const country = selectedCountryView || featuredCountry || 'DE';
                    const activeBadges = BADGES_BY_COUNTRY[country] || FALLBACK_BADGES;
                    return activeBadges.map((badgeText, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSearch(undefined, badgeText)} 
                        style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '9999px', padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }} 
                        className="suggestion-badge-hero"
                      >
                        {badgeText}
                      </button>
                    ));
                  })()}
                </div>
              </div>
              )}

              {/* Unique Brand Info Panel (Forest Green Outdoor Vibe) */}
              {!hasSearched && !selectedCountryView && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', 
                  borderRadius: '24px', 
                  padding: '2.5rem', 
                  color: 'white', 
                  marginBottom: '3.5rem',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative background circle */}
                  <div style={{ position: 'absolute', right: '-50px', bottom: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)' }} />
                  
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15', padding: '0.75rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MessageSquare size={26} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#facc15' }}>{t.step1Label}</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.2rem 0 0.5rem 0', color: 'white' }}>{t.step1Title}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#a7f3d0', lineHeight: '1.5', margin: 0 }}>{t.step1Desc}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15', padding: '0.75rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Compass size={26} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#facc15' }}>{t.step2Label}</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.2rem 0 0.5rem 0', color: 'white' }}>{t.step2Title}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#a7f3d0', lineHeight: '1.5', margin: 0 }}>{t.step2Desc}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15', padding: '0.75rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Heart size={26} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#facc15' }}>{t.step3Label}</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.2rem 0 0.5rem 0', color: 'white' }}>{t.step3Title}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#a7f3d0', lineHeight: '1.5', margin: 0 }}>{t.step3Desc}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Campgrounds by Country */}
              {!hasSearched && !selectedCountryView && (
                <div style={{ marginBottom: '3.5rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.35rem' }}>{t.campgroundsByCountry}</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>{t.campgroundsByCountrySubtitle}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                    {Object.keys(COUNTRY_FLAGS).map((code) => (
                      <div 
                        key={code}
                        onClick={() => openCountryView(code, 'camping')}
                        style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: 'var(--shadow-sm)' }}
                        className="hover:scale-102 hover:shadow-md"
                      >
                        <div style={{ fontSize: '2.5rem', background: 'var(--gray-50)', padding: '0.5rem', borderRadius: '12px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {COUNTRY_FLAGS[code]}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)' }}>{getCountryName(code, currentLang)}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>
                            {(t.placesCount || '{{count}} Plätze').replace('{{count}}', String(countryStats[code] || 0))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attractions by Country */}
              {!hasSearched && !selectedCountryView && (
                <div style={{ marginBottom: '3.5rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.35rem' }}>{t.attractionsByCountry}</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>{t.attractionsByCountrySubtitle}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                    {Object.keys(COUNTRY_FLAGS)
                      .filter(code => attractionStats[code] > 0)
                      .map((code) => (
                        <div 
                          key={code}
                          onClick={() => openCountryView(code, 'attractions')}
                          style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: 'var(--shadow-sm)' }}
                          className="hover:scale-102 hover:shadow-md"
                        >
                          <div style={{ fontSize: '2.5rem', background: 'var(--gray-50)', padding: '0.5rem', borderRadius: '12px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {COUNTRY_FLAGS[code]}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)' }}>{getCountryName(code, currentLang)}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>
                              {(t.attractionsCount || '{{count}} Sehenswürdigkeiten').replace('{{count}}', String(attractionStats[code] || 0))}
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Country Subdivisions Page View */}
              {selectedCountryView && !hasSearched && (
                <div className="country-detail-card" style={{ background: 'var(--card-bg, white)', border: '1px solid var(--card-border, var(--gray-200))', borderRadius: '16px', padding: '1.25rem sm:padding: 2rem', boxShadow: 'var(--shadow-sm)', marginBottom: '3.5rem', marginTop: '1rem' }}>
                  
                  {/* Country Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem' }}>
                    <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{COUNTRY_FLAGS[selectedCountryView]}</span>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--gray-900)' }}>
                        {countryTab === 'camping' ? `Camping in ${getCountryName(selectedCountryView, currentLang)}` : `${t.tabHighlights} in ${getCountryName(selectedCountryView, currentLang)}`}
                      </h2>
                      <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', margin: '0.2rem 0 0 0' }}>
                        {countryTab === 'camping'
                          ? (t.campsiteCount || '{{count}} Plätze').replace('{{count}}', String(countryStats[selectedCountryView] || 0)) + ' nach Region oder Bundesland'
                          : (t.attractionCount || '{{count}} Sehenswürdigkeiten').replace('{{count}}', String(attractionStats[selectedCountryView] || 0)) + ' nach Region oder Bundesland'}
                      </p>
                    </div>
                  </div>

                  {/* Responsive Tab Switcher & Action Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1.25rem' }}>
                    
                    {/* Segmented Control Tabs */}
                    <div className="segmented-control" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: (attractionStats[selectedCountryView] || 0) > 0 ? '1fr 1fr' : '1fr', 
                      gap: '0.35rem', 
                      background: 'var(--gray-100)', 
                      padding: '4px', 
                      borderRadius: '12px', 
                      width: '100%',
                      maxWidth: '560px',
                      boxSizing: 'border-box'
                    }}>
                      <button 
                        onClick={() => { setCountryTab('camping'); scrollToTop(); }}
                        style={{
                          padding: '0.55rem 0.5rem',
                          borderRadius: '9px',
                          border: 'none',
                          background: countryTab === 'camping' ? 'white' : 'transparent',
                          color: countryTab === 'camping' ? 'var(--primary-800)' : 'var(--gray-600)',
                          fontWeight: countryTab === 'camping' ? 800 : 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          minWidth: 0,
                          boxShadow: countryTab === 'camping' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <MapPin size={14} className="shrink-0" style={{ color: countryTab === 'camping' ? 'var(--primary-700)' : 'var(--gray-400)' }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.tabCamping}</span>
                        <span className="country-stats-badge" style={{ 
                          background: countryTab === 'camping' ? 'var(--primary-100)' : 'var(--gray-200)', 
                          color: countryTab === 'camping' ? 'var(--primary-800)' : 'var(--gray-600)',
                          padding: '0.1rem 0.4rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.7rem', 
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {(countryStats[selectedCountryView] || 0).toLocaleString('de-DE')}
                        </span>
                      </button>

                      {(attractionStats[selectedCountryView] || 0) > 0 && (
                        <button 
                          onClick={() => { setCountryTab('attractions'); scrollToTop(); }}
                          style={{
                            padding: '0.55rem 0.5rem',
                            borderRadius: '9px',
                            border: 'none',
                            background: countryTab === 'attractions' ? 'white' : 'transparent',
                            color: countryTab === 'attractions' ? 'var(--primary-800)' : 'var(--gray-600)',
                            fontWeight: countryTab === 'attractions' ? 800 : 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            minWidth: 0,
                            boxShadow: countryTab === 'attractions' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Compass size={14} className="shrink-0" style={{ color: countryTab === 'attractions' ? 'var(--primary-700)' : 'var(--gray-400)' }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.tabHighlights}</span>
                          <span className="country-stats-badge" style={{ 
                            background: countryTab === 'attractions' ? 'var(--primary-100)' : 'var(--gray-200)', 
                            color: countryTab === 'attractions' ? 'var(--primary-800)' : 'var(--gray-600)',
                            padding: '0.1rem 0.4rem', 
                            borderRadius: '9999px', 
                            fontSize: '0.7rem', 
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {(attractionStats[selectedCountryView] || 0).toLocaleString('de-DE')}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Button: Alle Ergebnisse des Landes anzeigen */}
                    <button 
                      onClick={() => handleSearch(undefined, countryTab === 'camping' ? `Camping in ${getCountryName(selectedCountryView, currentLang)}` : `Sehenswürdigkeiten in ${getCountryName(selectedCountryView, currentLang)}`)}
                      style={{
                        width: '100%',
                        maxWidth: '560px',
                        padding: '0.6rem 0.9rem',
                        borderRadius: '10px',
                        border: '1px solid var(--primary-200)',
                        background: 'var(--primary-50)',
                        color: 'var(--primary-800)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Search size={14} />
                      <span>{countryTab === 'camping' 
                        ? (t.allPlacesIn || 'Alle {{count}} Plätze in {{country}} anzeigen').replace('{{count}}', String(countryStats[selectedCountryView] || 0)).replace('{{country}}', getCountryName(selectedCountryView, currentLang))
                        : (t.allAttractionsIn || 'Alle {{count}} Ziele in {{country}} anzeigen').replace('{{count}}', String(attractionStats[selectedCountryView] || 0)).replace('{{country}}', getCountryName(selectedCountryView, currentLang))}</span>
                    </button>
                  </div>

                  {REGIONS_BY_COUNTRY[selectedCountryView] && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {REGIONS_BY_COUNTRY[selectedCountryView].states.filter(state => !(subdivisionStats[state] !== undefined && subdivisionStats[state] === 0)).length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gray-800)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📍 {countryTab === 'camping' ? t.regionsStates : t.attractionsRegions}
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                            {REGIONS_BY_COUNTRY[selectedCountryView].states
                              .filter(state => !(subdivisionStats[state] !== undefined && subdivisionStats[state] === 0))
                              .map((state) => (
                              <button 
                                key={state}
                                onClick={() => handleSearch(undefined, countryTab === 'camping' ? `Camping in ${state}` : `Sehenswürdigkeiten in ${state}`)}
                                style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                                className="hover-card-btn"
                              >
                                <MapPin size={18} style={{ color: 'var(--primary-700)', flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                                    {state.replace(/ \(Kanton\)/gi, '').replace(/ \(Luxemburg\)/gi, '').replace(/ \(Wallonien\)/gi, '').replace(/ \(Lappland\)/gi, '')}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.1rem', fontWeight: 600 }}>
                                    {subdivisionStats[state] !== undefined 
                                      ? (countryTab === 'camping' 
                                          ? (t.campsiteCount || '{{count}} Plätze').replace('{{count}}', String(subdivisionStats[state]))
                                          : (t.attractionCount || '{{count}} Sehenswürdigkeiten').replace('{{count}}', String(subdivisionStats[state])))
                                      : (t.loadingCount || 'Lädt...')}
                                  </div>
                                </div>
                              </button>
                          ))}
                        </div>
                      </div>
                      )}

                      {REGIONS_BY_COUNTRY[selectedCountryView].popular.filter(reg => !(subdivisionStats[reg] !== undefined && subdivisionStats[reg] === 0)).length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gray-800)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🏖️ {countryTab === 'camping' ? t.regionsPopular : t.attractionsPopular}
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                            {REGIONS_BY_COUNTRY[selectedCountryView].popular
                              .filter(reg => !(subdivisionStats[reg] !== undefined && subdivisionStats[reg] === 0))
                              .map((reg) => (
                              <button 
                                key={reg}
                                onClick={() => handleSearch(undefined, countryTab === 'camping' ? `Camping ${reg}` : `Sehenswürdigkeiten in ${reg}`)}
                                style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                                className="hover-card-btn"
                              >
                                <Compass size={18} style={{ color: 'var(--primary-700)', flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gray-900)' }}>{reg}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.1rem', fontWeight: 600 }}>
                                    {subdivisionStats[reg] !== undefined 
                                      ? (countryTab === 'camping' 
                                          ? (t.campsiteCount || '{{count}} Plätze').replace('{{count}}', String(subdivisionStats[reg]))
                                          : (t.attractionCount || '{{count}} Sehenswürdigkeiten').replace('{{count}}', String(subdivisionStats[reg])))
                                      : (t.loadingCount || 'Lädt...')}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {countryAttractions.length > 0 && (
                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--gray-100)', paddingTop: '1.5rem' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gray-800)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🏛️ Beliebte Sehenswürdigkeiten & Ausflugsziele
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                            {countryAttractions.map((attr) => {
                              const imageUrl = getImageUrl(attr);
                              const cleanDescription = getCleanDescription(attr);
                              return (
                                <div 
                                  key={attr.id}
                                  onClick={() => setSelectedPlace(attr)}
                                  style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}
                                  className="hover:scale-102 hover:shadow-md"
                                >
                                  <div style={{ height: '140px', width: '100%', background: 'var(--gray-100)', position: 'relative' }}>
                                    <img 
                                      src={imageUrl || getFallbackImage(attr)}
                                      alt={attr.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => { e.currentTarget.src = getFallbackImage(attr); }}
                                    />
                                    <span style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(31, 41, 55, 0.95)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                                      Attraktion
                                    </span>
                                  </div>
                                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--gray-900)' }}>{attr.name}</h4>
                                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', margin: '0 0 0.5rem 0' }}>{attr.address}</p>
                                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: '1.4', height: '2.4rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0 }}>
                                        {cleanDescription}
                                      </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 700, color: '#b45309' }}>
                                      <Star size={12} fill="#b45309" />
                                      <span>{attr.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Results Grid Section */}
              {(hasSearched || !selectedCountryView) && (
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {hasSearched ? (
                    <span>
                      {recommendationTitle ? (
                        <>
                          <span style={{ color: 'var(--primary-800)' }}>✨ {recommendationTitle}</span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 600, marginLeft: '0.75rem' }}>
                            ({curatedIds.length > 0 ? `${curatedIds.length} Empfehlungen · ${totalItems} Treffer` : `${totalItems} Treffer`})
                          </span>
                        </>
                      ) : (
                        `${t.searchResults} (${totalItems})`
                      )}
                    </span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span>{t.featuredTitle}</span>
                      <select 
                        value={featuredCountry}
                        onChange={(e) => setFeaturedCountry(e.target.value)}
                        style={{ background: 'white', border: '1px solid var(--gray-300)', borderRadius: '8px', padding: '0.25rem 0.75rem', fontSize: '1rem', fontWeight: 700, color: 'var(--primary-800)', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="ALL">{currentLang === 'en' ? 'All Europe' : currentLang === 'fr' ? "Toute l'Europe" : currentLang === 'it' ? 'Tutta Europa' : currentLang === 'nl' ? 'Heel Europa' : 'Ganz Europa'}</option>
                        {Object.keys(COUNTRY_FLAGS).map((c) => (
                          <option key={c} value={c}>{getCountryName(c, currentLang)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {hasSearched && (
                    <button onClick={resetSearch} style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>{t.resetSearch}</button>
                  )}
                </h2>

                {isSearching ? (
                  /* Loading Spinner */
                  <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem auto', border: '3px solid var(--gray-200)', borderTop: '3px solid var(--primary-600)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ color: 'var(--gray-500)', fontWeight: 600 }}>{t.loadingText}</p>
                  </div>
                ) : places.length === 0 ? (
                  /* Empty Results / Missing Key Beta Guidance */
                  !aiSettings.apiKey ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '3rem 2rem', 
                      background: 'white', 
                      border: '1px solid var(--gray-200)', 
                      borderRadius: '20px',
                      boxShadow: 'var(--shadow-sm)',
                      maxWidth: '700px',
                      margin: '0 auto'
                    }}>
                      {/* Beta Badge */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <Sparkles size={14} />
                        {t.betaByokBadge || 'BETA-PHASE · BRING YOUR OWN KEY'}
                      </div>

                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
                        {t.betaByokTitle || 'Intelligente KI-Suche & Kuration aktivieren'}
                      </h3>

                      <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '540px', margin: '0 auto 1.5rem auto' }}>
                        {t.betaByokDesc || `Für freie Textbeschreibungen wie „${searchQuery}“ oder individuelle Routen-Stopps nutzt CampingRoute modernste KI.`}
                      </p>

                      {/* CTA Button to open Settings Modal */}
                      <button
                        onClick={handleOpenAISettings}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: 'var(--primary-700)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '0.8rem 1.85rem',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                          transition: 'all 0.2s',
                          marginBottom: '1.75rem'
                        }}
                        className="hover:scale-102"
                      >
                        <Key size={18} />
                        {t.betaByokBtn || '🔑 Jetzt KI-Key eintragen (Google, DeepSeek, OpenAI, Claude)'}
                      </button>

                      {/* Feature & Privacy Highlights Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', textAlign: 'left', background: 'var(--gray-50)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--gray-200)' }}>
                        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                          <Shield size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: '1.45' }}>
                            <strong style={{ color: 'var(--gray-900)', display: 'block', marginBottom: '0.15rem' }}>{t.betaPrivacyTitle || '100% DSGVO-konform:'}</strong>
                            {t.betaPrivacyText || 'Dein API-Schlüssel wird ausschließlich lokal in deinem Browser (localStorage) gespeichert und niemals auf unseren Servern abgelegt.'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                          <Compass size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: '1.45' }}>
                            <strong style={{ color: 'var(--gray-900)', display: 'block', marginBottom: '0.15rem' }}>{t.betaSimpleSearchesTitle || 'Einfache Suchen ohne Key:'}</strong>
                            {t.betaSimpleSearchesText || 'Orts- & Regions-Suchen klappen immer direkt ohne Key!'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Standard Empty State if key is present but no database results match */
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)' }}>
                      <Info size={48} style={{ color: 'var(--gray-300)', marginBottom: '1rem' }} />
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>{t.noMatchingPlacesTitle || 'Keine passenden Orte gefunden'}</h3>
                      <p style={{ color: 'var(--gray-500)', maxWidth: '440px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
                        {t.noMatchingPlacesText || 'Zu deiner Beschreibung wurden leider keine Treffer in der Datenbank gefunden. Versuche es mit einer allgemeineren Beschreibung oder ändere die Filter.'}
                      </p>
                      <button onClick={resetSearch} className="action-button secondary">{t.resetSearch || 'Suche zurücksetzen'}</button>
                    </div>
                  )
                ) : (
                  /* Places Grid */
                  <div>
                    {/* Route Corridor Banner */}
                    {routeInfo && (
                      <div style={{
                        background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        marginBottom: '1.5rem',
                        color: 'white',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                              <Navigation size={22} color="#34d399" />
                            </div>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                                🚩 {routeInfo.origin} ➔ 🏁 {routeInfo.destination}
                              </h3>
                              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                                Ca. {routeInfo.totalKm} km Gesamtstrecke · ~{routeInfo.totalDriveHours} Std. Fahrzeit · {routeInfo.numStops} empfohlene Etappen-Stopps
                              </p>
                            </div>
                          </div>
                          <span style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                            {t.routeCorridorActive || '✨ Routen-Korridor aktiv'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="results-layout" style={{ display: 'grid', gap: '2rem', alignItems: 'start' }}>
                      <div className="results-list">
                    {searchSummary && (
                      <div 
                        className="search-summary-card"
                        style={{ 
                          background: 'linear-gradient(135deg, var(--primary-50) 0%, #ffffff 100%)', 
                          borderLeft: '4px solid var(--primary-600)',
                          boxShadow: 'var(--shadow-sm)',
                          borderRadius: '8px', 
                          padding: '1.5rem', 
                          marginBottom: '2rem', 
                          color: 'var(--gray-700)', 
                          fontSize: '1rem', 
                          lineHeight: '1.6' 
                        }}
                      >
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          ✨ {recommendationTitle || t.guideSummaryTitle || 'CampingRoute Reiseführer-Zusammenfassung'}
                        </h3>
                        <div 
                           dangerouslySetInnerHTML={{ __html: searchSummary }} 
                          style={{ fontSize: '0.95rem' }}
                        />
                      </div>
                    )}

                    {/* Mini-Map aller Ergebnisse */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    {places.map((place) => {
                      const imageUrl = getImageUrl(place);
                      const cleanDescription = getCleanDescription(place);
                      const isCurated = place.is_curated || curatedIds.includes(place.id);

                      return (
                        <div 
                          key={place.id} 
                          className="place-grid-card" 
                          onClick={() => setSelectedPlace(place)}
                          onMouseEnter={() => highlightMapMarker(place.id)}
                          onMouseLeave={() => unhighlightMapMarker(place.id)}
                          style={{ 
                            background: 'white', 
                            border: isCurated ? '2px solid #059669' : '1px solid var(--gray-200)', 
                            borderRadius: 'var(--radius-md)', 
                            overflow: 'hidden', 
                            cursor: 'pointer', 
                            transition: 'transform 0.2s, box-shadow 0.2s', 
                            boxShadow: isCurated ? '0 4px 14px rgba(5, 150, 105, 0.18)' : 'var(--shadow-sm)',
                            position: 'relative'
                          }}
                        >
                          {/* Card Image */}
                          <div style={{ height: '160px', width: '100%', background: 'var(--gray-100)', position: 'relative', overflow: 'hidden' }}>
                            <img 
                              src={imageUrl || getFallbackImage(place)} 
                              alt={place.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => { e.currentTarget.src = getFallbackImage(place); }}
                            />
                            <span className={`place-card-type ${place.type}`} style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', margin: 0, boxShadow: 'var(--shadow-sm)' }}>
                              {getTypeLabel(place.type)}
                            </span>
                            {place.stage_number ? (
                              <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', margin: 0, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                                <MapPin size={12} />
                                {(t.stageNumber || 'Etappe {{number}}').replace('{{number}}', String(place.stage_number))}
                              </span>
                            ) : isCurated ? (
                              <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', margin: 0, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                                <Sparkles size={12} />
                                {t.topRecommendation || 'Top-Empfehlung'}
                              </span>
                            ) : null}
                          </div>

                          {/* Card Content */}
                          <div style={{ padding: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.name}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {place.city || place.address.split(',')[0]}, {getCountryName(place.country, currentLang)}
                            </p>
                            
                            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: '1.5', height: '2.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '1rem' }}>
                              {cleanDescription}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--gray-100)', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: '#b45309' }}>
                                <Star size={14} fill="#b45309" />
                                <span>{place.rating}</span>
                              </div>
                              <span style={{ fontWeight: 600, color: 'var(--gray-600)' }}>{place.price}</span>
                              {place.distance_from_origin_km !== undefined ? (
                                <span style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Navigation size={12} /> nach {place.distance_from_origin_km} km ({place.drive_time_hours}h)
                                </span>
                              ) : place.distance_km !== undefined ? (
                                <span style={{ fontWeight: 600, color: 'var(--primary-700)', fontSize: '0.75rem' }}>
                                  {place.distance_km} km entfernt
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>

                    {/* Pagination Component */}
                    {totalItems > itemsPerPage && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                        {/* Previous Button */}
                        <button
                          disabled={currentPage === 1}
                          onClick={() => handleSearch(undefined, undefined, currentPage - 1)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '1px solid var(--gray-200)',
                            background: 'white',
                            color: currentPage === 1 ? 'var(--gray-300)' : 'var(--gray-700)',
                            cursor: currentPage === 1 ? 'default' : 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            transition: 'all 0.2s'
                          }}
                        >
                          &lt;
                        </button>

                        {/* Page Numbers */}
                        {(() => {
                          const totalPages = Math.ceil(totalItems / itemsPerPage);
                          const pages = [];
                          const range = 2;
                          const start = Math.max(1, currentPage - range);
                          const end = Math.min(totalPages, currentPage + range);

                          if (start > 1) {
                            pages.push(
                              <button
                                key={1}
                                onClick={() => handleSearch(undefined, undefined, 1)}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  border: currentPage === 1 ? 'none' : '1px solid var(--gray-200)',
                                  background: currentPage === 1 ? 'var(--primary-700)' : 'white',
                                  color: currentPage === 1 ? 'white' : 'var(--gray-700)',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  fontWeight: 700
                                }}
                              >
                                1
                              </button>
                            );
                            if (start > 2) {
                              pages.push(<span key="dots-start" style={{ color: 'var(--gray-400)', padding: '0 0.25rem' }}>...</span>);
                            }
                          }

                          for (let i = start; i <= end; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => handleSearch(undefined, undefined, i)}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  border: i === currentPage ? 'none' : '1px solid var(--gray-200)',
                                  background: i === currentPage ? 'var(--primary-700)' : 'white',
                                  color: i === currentPage ? 'white' : 'var(--gray-700)',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  fontWeight: 700
                                }}
                              >
                                {i}
                              </button>
                            );
                          }

                          if (end < totalPages) {
                            if (end < totalPages - 1) {
                              pages.push(<span key="dots-end" style={{ color: 'var(--gray-400)', padding: '0 0.25rem' }}>...</span>);
                            }
                            pages.push(
                              <button
                                key={totalPages}
                                onClick={() => handleSearch(undefined, undefined, totalPages)}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  border: totalPages === currentPage ? 'none' : '1px solid var(--gray-200)',
                                  background: totalPages === currentPage ? 'var(--primary-700)' : 'white',
                                  color: totalPages === currentPage ? 'white' : 'var(--gray-700)',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  fontWeight: 700
                                }}
                              >
                                {totalPages}
                              </button>
                            );
                          }

                          return pages;
                        })()}

                        {/* Next Button */}
                        <button
                          disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                          onClick={() => handleSearch(undefined, undefined, currentPage + 1)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '1px solid var(--gray-200)',
                            background: 'white',
                            color: currentPage === Math.ceil(totalItems / itemsPerPage) ? 'var(--gray-300)' : 'var(--gray-700)',
                            cursor: currentPage === Math.ceil(totalItems / itemsPerPage) ? 'default' : 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            transition: 'all 0.2s'
                          }}
                        >
                          &gt;
                        </button>
                      </div>
                    )}
                      </div>

                      <div className="results-map-col">
                        {hasSearched && mapPoints.length > 0 && (
                          <div style={{ marginBottom: '2rem' }}>
                            <div ref={resultsMapRef} style={{ height: '320px', borderRadius: '12px', border: '1px solid var(--gray-200)', zIndex: 1 }} />
                            <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.4rem' }}>
                              🗺️ {routeInfo 
                                ? `${mapPoints.length} Orte auf der Karte (Routenlinie von ${routeInfo.origin} nach ${routeInfo.destination})` 
                                : (t.mapLegend || '{{count}} Orte auf der Karte').replace('{{count}}', String(mapPoints.length))}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          )}

        {/* Saved Lists Mode */}
        {activeTab === 'lists' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {!selectedList ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{t.roadtripTitle}</h2>
                  <button 
                    onClick={() => setShowAddListModal(true)}
                    style={{ 
                      background: 'var(--primary-700)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '9999px',
                      padding: '0.6rem 1.25rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={18} />
                    {t.createRoadtrip}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {lists.map((list) => (
                    <div 
                      key={list.id} 
                      className="list-card"
                      onClick={() => setSelectedList(list)}
                      style={{ margin: 0 }}
                    >
                      <div className="list-card-title">
                        {list.name}
                        <span className="list-card-count">{list.item_count} {t.itemCount}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        {list.description || t.noDescription || 'Keine Beschreibung vorhanden.'}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <button 
                  onClick={() => setSelectedList(null)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--primary-700)', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginBottom: '1rem',
                    fontSize: '0.95rem'
                  }}
                >
                  {t.backToLists}
                </button>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>{selectedList.name}</h2>
                <p style={{ fontSize: '0.95rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>{selectedList.description}</p>

                {listItems.length === 0 ? (
                  <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>{t.noSavedPlacesInList || 'Noch keine gespeicherten Orte in diesem Roadtrip. Suche in "Entdecken" nach Orten und füge sie hinzu!'}</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {listItems.map((item) => (
                      <div 
                        key={item.id}
                        className="place-grid-card"
                        onClick={() => setSelectedPlace(item)}
                        style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer' }}
                      >
                        <div style={{ padding: '1.25rem' }}>
                          <span className={`place-card-type ${item.type}`}>{getTypeLabel(item.type)}</span>
                          <h3 className="place-card-title" style={{ marginTop: '0.5rem' }}>{item.name}</h3>
                          <p className="place-card-country">{item.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create List */}
      {showAddListModal && (
        <div className="modal-overlay" onClick={() => setShowAddListModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 800 }}>{t.createRoadtrip}</h3>
              <button className="close-btn" onClick={() => setShowAddListModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateList}>
              <div className="modal-content">
                <div className="form-group">
                  <label className="form-label">{t.roadtripNameLabel}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="z.B. Norwegen Fjorde Sommer 2026"
                    required
                    value={newListVal.name}
                    onChange={(e) => setNewListVal({ ...newListVal, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.roadtripDescLabel}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="z.B. Campingplätze und Stellplätze entlang der Westküste"
                    value={newListVal.description}
                    onChange={(e) => setNewListVal({ ...newListVal, description: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="action-button secondary" onClick={() => setShowAddListModal(false)}>{t.cancelBtn}</button>
                  <button type="submit" className="action-button">{t.createBtn}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Save to List */}
      {showSaveToListModal && (
        <div className="modal-overlay" onClick={() => setShowSaveToListModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 800 }}>{t.saveToRoadtripTitle}</h3>
              <button className="close-btn" onClick={() => setShowSaveToListModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-content">
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '1.25rem' }}>{t.selectRoadtripText} <strong>{selectedPlace?.name}</strong>:</p>
              {lists.length === 0 ? (
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginBottom: '1rem' }}>{t.noRoadtrips}</p>
                  <button className="action-button" onClick={() => { setShowSaveToListModal(false); setShowAddListModal(true); }}>{t.createRoadtripListBtn}</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {lists.map((list) => (
                    <button 
                      key={list.id} 
                      onClick={() => handleSaveToList(list.id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        width: '100%', 
                        padding: '1rem', 
                        border: '1px solid var(--gray-200)', 
                        borderRadius: 'var(--radius-md)', 
                        background: 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.95rem'
                      }}
                      className="hover:border-primary-500"
                    >
                      {list.name}
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Review */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 800 }}>{t.writeReviewTitle}</h3>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddReview}>
              <div className="modal-content">
                <div className="form-group">
                  <label className="form-label">{t.nameLabel}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="z.B. Christian M."
                    required
                    value={newReviewVal.author}
                    onChange={(e) => setNewReviewVal({ ...newReviewVal, author: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.ratingLabel}</label>
                  <select 
                    className="form-input"
                    value={newReviewVal.rating}
                    onChange={(e) => setNewReviewVal({ ...newReviewVal, rating: parseInt(e.target.value) })}
                  >
                    <option value="5">{t.rating5}</option>
                    <option value="4">{t.rating4}</option>
                    <option value="3">{t.rating3}</option>
                    <option value="2">{t.rating2}</option>
                    <option value="1">{t.rating1}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.experienceLabel}</label>
                  <textarea 
                    className="form-input" 
                    rows={4}
                    placeholder={t.experiencePlaceholder}
                    required
                    value={newReviewVal.content}
                    onChange={(e) => setNewReviewVal({ ...newReviewVal, content: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="action-button secondary" onClick={() => setShowReviewModal(false)}>{t.cancelBtn}</button>
                  <button type="submit" className="action-button">{t.submitBtn}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Settings & Bring Your Own Key (BYOK) */}
      {showAISettingsModal && (
        <div className="modal-overlay" onClick={() => setShowAISettingsModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', width: '100%' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'rgba(5, 150, 105, 0.1)', padding: '0.4rem', borderRadius: '8px', color: 'var(--primary-700)' }}>
                  <Key size={20} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, margin: 0, fontSize: '1.2rem', color: 'var(--gray-900)' }}>{t.aiSettingsTitle || 'KI-Einstellungen & Eigener API-Key'}</h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>{t.aiSettingsSubtitle || 'Wähle dein bevorzugtes KI-Modell und nutze deinen eigenen Schlüssel'}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowAISettingsModal(false)}><X size={18} /></button>
            </div>

            <div className="modal-content" style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              
              {/* DSGVO & Privacy Notice Box */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', 
                border: '1px solid #bbf7d0', 
                borderRadius: '12px', 
                padding: '1rem 1.25rem', 
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}>
                <Shield size={20} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8rem', color: '#166534', lineHeight: '1.5' }}>
                  <strong style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem', color: '#14532d' }}>
                    {t.aiPrivacyTitle || '🔒 Datenschutz & DSGVO-Hinweis (100% lokal)'}
                  </strong>
                  {t.aiPrivacyText || 'Dein API-Schlüssel wird ausschließlich lokal in deinem Browser (localStorage) gespeichert und niemals auf unseren Servern dauerhaft gesichert oder protokolliert. Bei einer Suchanfrage wird er per verschlüsselter HTTPS-Verbindung temporär an den jeweiligen KI-Anbieter übermittelt.'}
                </div>
              </div>

              {/* Provider Tabs */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-700)', marginBottom: '0.5rem', display: 'block' }}>
                  {t.aiStep1 || '1. KI-Anbieter wählen'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                  {[
                    { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 3.7 / 2.5', color: '#2563eb', bg: '#eff6ff' },
                    { id: 'deepseek', name: 'DeepSeek', desc: 'V4 Flash / R1', color: '#d97706', bg: '#fffbeb' },
                    { id: 'openai', name: 'OpenAI', desc: 'GPT-4o / GPT-4.5 / o3', color: '#059669', bg: '#f0fdf4' },
                    { id: 'claude', name: 'Anthropic Claude', desc: 'Claude 3.7 Sonnet', color: '#7c3aed', bg: '#f5f3ff' }
                  ].map((p) => {
                    const isSelected = tempAISettings.provider === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const defMod = (DEFAULT_MODELS[p.id] && DEFAULT_MODELS[p.id][0]?.id) || '';
                          setTempAISettings({ ...tempAISettings, provider: p.id as any, model: defMod });
                          setIsCustomModel(false);
                          setTestResult(null);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          border: isSelected ? `2px solid ${p.color}` : '1px solid var(--gray-200)',
                          background: isSelected ? p.bg : 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isSelected ? p.color : 'var(--gray-800)' }}>
                          {p.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>
                          {p.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Model Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-700)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t.aiStep2 || '2. Modell-Auswahl'}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500 }}>{t.aiStep2Subtitle || 'Neueste Generationen 2026/2025'}</span>
                </label>

                {!isCustomModel ? (
                  <select
                    className="form-input"
                    value={tempAISettings.model}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM_MANUAL') {
                        setIsCustomModel(true);
                      } else {
                        setTempAISettings({ ...tempAISettings, model: e.target.value });
                      }
                      setTestResult(null);
                    }}
                    style={{ fontWeight: 600, fontSize: '0.9rem', padding: '0.75rem' }}
                  >
                    {(DEFAULT_MODELS[tempAISettings.provider] || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label} ({m.id}) {m.tag ? `— ${m.tag}` : ''}
                      </option>
                    ))}
                    <option value="CUSTOM_MANUAL">{t.aiCustomModelOption || '✏️ Anderes Modell eingeben (Custom Model ID)...'}</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={t.aiCustomModelPlaceholder || "z.B. gemini-3.7-flash oder claude-3-7-sonnet"}
                      value={tempAISettings.model}
                      onChange={(e) => setTempAISettings({ ...tempAISettings, model: e.target.value })}
                      style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomModel(false);
                        const def = (DEFAULT_MODELS[tempAISettings.provider] && DEFAULT_MODELS[tempAISettings.provider][0]?.id) || '';
                        setTempAISettings({ ...tempAISettings, model: def });
                      }}
                      style={{ padding: '0.5rem 1rem', background: 'var(--gray-100)', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {t.aiListBtn || 'Liste'}
                    </button>
                  </div>
                )}
              </div>

              {/* API Key Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-700)', margin: 0 }}>
                    {(t.aiStep3 || '3. Dein {{provider}} API-Key').replace('{{provider}}', tempAISettings.provider.toUpperCase())}
                  </label>
                  
                  {/* Provider Key Link */}
                  {tempAISettings.provider === 'gemini' && (
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                      {t.aiGetGeminiKey || 'Kostenlosen Gemini Key holen'} <ExternalLink size={12} />
                    </a>
                  )}
                  {tempAISettings.provider === 'deepseek' && (
                    <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                      {t.aiGetDeepseekKey || 'DeepSeek Key erstellen'} <ExternalLink size={12} />
                    </a>
                  )}
                  {tempAISettings.provider === 'openai' && (
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                      {t.aiGetOpenaiKey || 'OpenAI Key erstellen'} <ExternalLink size={12} />
                    </a>
                  )}
                  {tempAISettings.provider === 'claude' && (
                    <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                      {t.aiGetClaudeKey || 'Anthropic Claude Key erstellen'} <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showApiKeyMask ? 'text' : 'password'}
                    className="form-input"
                    placeholder={
                      tempAISettings.provider === 'gemini' ? 'AIzaSy...' :
                      tempAISettings.provider === 'claude' ? 'sk-ant-api03-...' : 'sk-...'
                    }
                    value={tempAISettings.apiKey}
                    onChange={(e) => {
                      setTempAISettings({ ...tempAISettings, apiKey: e.target.value });
                      setTestResult(null);
                    }}
                    style={{ paddingRight: '2.75rem', fontSize: '0.9rem', fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeyMask(!showApiKeyMask)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--gray-400)',
                      padding: 0
                    }}
                    title={showApiKeyMask ? (t.aiHideKey || 'Schlüssel verbergen') : (t.aiShowKey || 'Schlüssel anzeigen')}
                  >
                    {showApiKeyMask ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: testResult.success ? '#f0fdf4' : '#fef2f2',
                  color: testResult.success ? '#166534' : '#991b1b',
                  border: testResult.success ? '1px solid #bbf7d0' : '1px solid #fecaca'
                }}>
                  {testResult.success ? <CheckCircle size={16} color="#16a34a" /> : <AlertTriangle size={16} color="#dc2626" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--gray-100)', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleTestAIKey}
                    disabled={isTestingKey || !tempAISettings.apiKey}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'white',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '8px',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--gray-700)',
                      cursor: isTestingKey || !tempAISettings.apiKey ? 'not-allowed' : 'pointer',
                      opacity: !tempAISettings.apiKey ? 0.6 : 1
                    }}
                  >
                    {isTestingKey ? <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid var(--gray-300)', borderTop: '2px solid var(--primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Cpu size={15} />}
                    {isTestingKey ? (t.aiTestingKey || 'Prüfe...') : (t.aiTestKeyBtn || 'Verbindung testen')}
                  </button>

                  {aiSettings.apiKey && (
                    <button
                      type="button"
                      onClick={handleDeleteAISettings}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '0.6rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#dc2626',
                        cursor: 'pointer'
                      }}
                      title={t.aiDeleteKeyTitle || "Löscht den Key rückstandslos aus deinem Browser"}
                    >
                      <Trash2 size={14} />
                      {t.aiDeleteKeyBtn || 'Löschen'}
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="action-button secondary"
                    onClick={() => setShowAISettingsModal(false)}
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    {t.cancelBtn || 'Abbrechen'}
                  </button>
                  <button
                    type="button"
                    className="action-button"
                    onClick={handleSaveAISettings}
                    style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 800 }}
                  >
                    {t.aiSaveAndActivate || 'Speichern & Aktivieren'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal: MCP Server Info & Setup */}
      {showMCPModal && (
        <div className="modal-overlay" onClick={() => setShowMCPModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '100%' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'rgba(5, 150, 105, 0.1)', padding: '0.4rem', borderRadius: '8px', color: '#059669' }}>
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, margin: 0, fontSize: '1.2rem', color: 'var(--gray-900)' }}>{t.mcpServer || 'CampingRoute MCP-Server'}</h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>{t.mcpServerDesc || 'Model Context Protocol für Claude Desktop, Cursor & KI-Agenten'}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowMCPModal(false)}><X size={18} /></button>
            </div>

            <div className="modal-content" style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              
              {/* Info Box */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)', 
                border: '1px solid #ddd6fe', 
                borderRadius: '12px', 
                padding: '1rem 1.25rem', 
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}>
                <Sparkles size={20} style={{ color: '#7c3aed', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', color: '#5b21b6', lineHeight: '1.5' }}>
                  <strong style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem', color: '#4c1d95' }}>
                    {t.mcpServerHeading || 'Verbinde deine eigene KI mit 20.000+ Campingplätzen in Europa'}
                  </strong>
                  {t.mcpServerIntro || 'Mit dem offiziellen MCP-Server kann dein KI-Assistent (z. B. Claude Desktop oder Cursor) direkt auf verifizierte Campingplätze, Stellplätze, Ausstattungen und Sehenswürdigkeiten zugreifen – 100% über dein eigenes KI-Guthaben / deinen Key.'}
                </div>
              </div>

              {/* Endpoint URL Box */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-700)', marginBottom: '0.4rem', display: 'block' }}>
                  {t.mcpEndpointLabel || 'MCP Server Endpoint URL'}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value="https://campingroute.app/discover/mcp" 
                    className="form-input" 
                    style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-800)', background: 'var(--gray-50)' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("https://campingroute.app/discover/mcp");
                      setCopiedMCP(true);
                      setTimeout(() => setCopiedMCP(false), 2000);
                    }}
                    style={{ padding: '0.5rem 1rem', background: 'var(--gray-100)', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    {copiedMCP ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    {copiedMCP ? (t.mcpCopied || 'Kopiert!') : (t.mcpCopy || 'Kopieren')}
                  </button>
                </div>
              </div>

              {/* Configuration Snippet for Claude Desktop */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-700)', margin: 0 }}>
                    {t.mcpConfigLabel || 'Einbindung in MCP-Clients (claude_desktop_config.json / Cursor / Agenten)'}
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyMCP}
                    style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}
                  >
                    {copiedMCP ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                    {copiedMCP ? (t.mcpCopiedConfig || 'JSON kopiert!') : (t.mcpCopyConfig || 'JSON kopieren')}
                  </button>
                </div>

                <pre style={{ 
                  background: '#1e293b', 
                  color: '#f8fafc', 
                  padding: '1rem', 
                  borderRadius: '10px', 
                  fontSize: '0.8rem', 
                  fontFamily: 'monospace', 
                  overflowX: 'auto',
                  margin: 0
                }}>
                  <code>{mcpConfigCode}</code>
                </pre>
              </div>

              {/* Available Tools Overview */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-700)', marginBottom: '0.5rem', display: 'block' }}>
                  {t.mcpToolsHeader || 'Verfügbare MCP-Tools für deine KI (7 Tools)'}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { name: 'search_places', desc: t.mcpTool1Desc || 'Sucht europaweit nach Campingplätzen, Stellplätzen & Sehenswürdigkeiten mit Filtern nach Land, Region, Ort, Typ & Merkmalen.' },
                    { name: 'get_place_details', desc: t.mcpTool2Desc || 'Liefert vollständige Kontaktdaten, Koordinaten, Preise, Sanitär-Ausstattung und Details zu einem Platz.' },
                    { name: 'get_reviews', desc: t.mcpTool3Desc || 'Ruft echte Reiseberichte und Bewertungen von Campern zu einem Platz ab.' },
                    { name: 'add_review', desc: t.mcpTool4Desc || 'Schreibt eine neue Bewertung und vergibt Sterne für einen besuchten Platz.' },
                    { name: 'get_lists', desc: t.mcpTool5Desc || 'Gibt alle erstellten Reiselisten und Favoriten-Sammlungen zurück.' },
                    { name: 'create_list', desc: t.mcpTool6Desc || 'Erstellt eine neue Reiseliste (z. B. für eine geplante Route oder Favoriten).' },
                    { name: 'save_to_list', desc: t.mcpTool7Desc || 'Speichert einen Campingplatz oder Spot in einer bestimmten Reiseliste.' }
                  ].map((tItem) => (
                    <div key={tItem.name} style={{ background: 'var(--gray-50)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#7c3aed' }}>{tItem.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.15rem' }}>{tItem.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="action-button"
                  onClick={() => setShowMCPModal(false)}
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 800 }}
                >
                  {t.mcpClose || 'Schließen'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Entdecken() {
  const crumbs = useDiscoverBreadcrumbs();
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <AppBreadcrumbs items={crumbs} />
        <EntdeckenContent />
      </div>
      <Footer />
    </>
  );
}
