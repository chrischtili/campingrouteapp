import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { 
  Compass, 
  Search, 
  Star, 
  Plus, 
  Heart, 
  X, 
  Globe, 
  ChevronRight,
  ChevronDown,
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
  Check,
  Columns as ColumnsIcon,
  Map as MapIcon,
  List as ListIcon,
  Maximize2,
  Calendar,
  Wine,
  Download
} from 'lucide-react';
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './entdecken.css';
import { Navbar } from "@/components/route-planner/Navbar";
import { Footer } from "@/components/route-planner/Footer";
import { AppBreadcrumbs, type BreadcrumbItem } from "@/components/AppBreadcrumbs";
import { setDiscoverBreadcrumbs, useDiscoverBreadcrumbs } from "@/lib/discoverBreadcrumbs";
import { FAMOUS_TRAILS, GERMAN_STATES_LIST, getNearbyTrails, type Trail } from "@/data/trails";
import { GERMAN_FLAGSHIP_EVENTS, type FlagshipEvent } from "@/data/flagshipEvents";
import { CULINARY_SPOTS, getNearbyCulinarySpots, type CulinarySpot } from "@/data/culinarySpots";
import { FEATURED_CAMPING_SPOTS, FEATURED_HIGHLIGHTS, type InspirationCampingSpot, type InspirationHighlight } from "@/data/featuredInspirations";

export type { Trail, FlagshipEvent, CulinarySpot, InspirationCampingSpot, InspirationHighlight };

export interface GermanEvent {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  locality?: string;
  postalCode?: string;
  streetAddress?: string;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
  types?: string[];
  image_url?: string;
  image_copyright?: string;
  url?: string;
}

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

export function safeHighlights(hl: any): string[] {
  if (Array.isArray(hl)) return hl.map(String);
  if (typeof hl === 'string' && hl.trim()) {
    try {
      const parsed = JSON.parse(hl);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
    return [hl.trim()];
  }
  return [];
}

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
  const [homeCountryTab, setHomeCountryTab] = useState<'camping' | 'attractions'>('camping');
  const [subdivisionViewMode, setSubdivisionViewMode] = useState<'states' | 'popular'>('states');
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const itemsPerPage = 12;

  // Modals state
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [newListVal, setNewListVal] = useState({ name: '', description: '' });
  const [showSaveToListModal, setShowSaveToListModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [featuredCountry, setFeaturedCountry] = useState<string>('DE');
  const [trails, setTrails] = useState<Trail[]>(() => FAMOUS_TRAILS);
  const [trailFilter, setTrailFilter] = useState<'all' | 'hiking' | 'biking'>('all');
  const [trailStateFilter, setTrailStateFilter] = useState<string>('Alle Bundesländer');
  const [trailSearchText, setTrailSearchText] = useState<string>('');
  const [trailViewMode, setTrailViewMode] = useState<'grid' | 'split' | 'map'>('grid');
  const [visibleTrailsCount, setVisibleTrailsCount] = useState<number>(12);
  const [nearbyTrails, setNearbyTrails] = useState<Trail[]>([]);
  const [nearbyCulinarySpots, setNearbyCulinarySpots] = useState<(CulinarySpot & { distance_to_place_km?: number })[]>([]);
  const [isLoadingTrails, setIsLoadingTrails] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [trailPolyline, setTrailPolyline] = useState<[number, number][]>([]);
  const [trailStartCoords, setTrailStartCoords] = useState<[number, number] | null>(null);
  const [trailEndCoords, setTrailEndCoords] = useState<[number, number] | null>(null);
  const [trailCampsites, setTrailCampsites] = useState<Place[]>([]);
  const [isLoadingTrailCampsites, setIsLoadingTrailCampsites] = useState(false);
  const trailMapContainerRef = useRef<HTMLDivElement | null>(null);
  const trailLeafletMapRef = useRef<L.Map | null>(null);
  const trailWasOpenRef = useRef<boolean>(false);
  const trailsOverviewMapContainerRef = useRef<HTMLDivElement | null>(null);
  const trailsOverviewLeafletMapRef = useRef<L.Map | null>(null);
  const trailsOverviewClusterRef = useRef<L.MarkerClusterGroup | null>(null);

  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Alle Bundesländer': trails.length };
    GERMAN_STATES_LIST.forEach(s => {
      if (s === 'Alle Bundesländer') return;
      counts[s] = trails.filter(t => t.state === s || (t.region || '').includes(s)).length;
    });
    return counts;
  }, [trails]);

  const filteredTrails = useMemo(() => {
    return trails.filter(trail => {
      if (trailFilter === 'hiking' && trail.type === 'biking') return false;
      if (trailFilter === 'biking' && trail.type === 'hiking') return false;
      
      if (trailStateFilter !== 'Alle Bundesländer' && trailStateFilter !== 'all') {
        const matchesState = trail.state === trailStateFilter || (trail.region || '').includes(trailStateFilter);
        if (!matchesState) return false;
      }

      if (trailSearchText.trim()) {
        const q = trailSearchText.toLowerCase().trim();
        const matchName = (trail.name || '').toLowerCase().includes(q);
        const matchRegion = (trail.region || '').toLowerCase().includes(q);
        const matchState = (trail.state || '').toLowerCase().includes(q);
        const matchDesc = (trail.description || '').toLowerCase().includes(q);
        if (!matchName && !matchRegion && !matchState && !matchDesc) return false;
      }

      return true;
    });
  }, [trails, trailFilter, trailStateFilter, trailSearchText]);

  // Events & Wine Festivals State (Open Data Germany / DZT + Flagship German Festivals)
  const [events, setEvents] = useState<GermanEvent[]>(() => GERMAN_FLAGSHIP_EVENTS as unknown as GermanEvent[]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventCategory, setEventCategory] = useState<'all' | 'wine' | 'culture' | 'festival' | 'market' | 'sport'>('all');
  const [eventStateFilter, setEventStateFilter] = useState<string>('Alle Bundesländer');
  const [eventSearchText, setEventSearchText] = useState<string>('');
  const [visibleEventsCount, setVisibleEventsCount] = useState<number>(12);
  const [selectedEvent, setSelectedEvent] = useState<GermanEvent | null>(null);
  const [eventCampsites, setEventCampsites] = useState<Place[]>([]);
  const [isLoadingEventCampsites, setIsLoadingEventCampsites] = useState<boolean>(false);

  const openEventDetails = (event: GermanEvent) => {
    setSelectedEvent(event);
    try {
      window.history.pushState({ modal: 'event', eventId: event.id }, '', `#event-${event.id}`);
    } catch {}
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
    if (window.location.hash.startsWith('#event-')) {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {}
    }
  };

  const openPlace = (place: Place) => {
    setSelectedPlace(place);
    try {
      window.history.pushState({ modal: 'place', placeId: place.id }, '', `#place-${place.id}`);
    } catch {}
  };

  const closePlace = () => {
    setSelectedPlace(null);
    if (window.location.hash.startsWith('#place-')) {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {}
    }
  };

  const openTrail = (trail: Trail) => {
    setSelectedTrail(trail);
    try {
      window.history.pushState({ modal: 'trail', trailId: trail.id }, '', `#trail-${trail.id}`);
    } catch {}
  };

  const closeTrail = () => {
    setSelectedTrail(null);
    if (window.location.hash.startsWith('#trail-')) {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {}
    }
  };

  // Culinary / Farm shops & Wineries state (Open Data & OSM)
  const [culinarySpots, setCulinarySpots] = useState<CulinarySpot[]>(() => CULINARY_SPOTS);
  const [culinaryFilter, setCulinaryFilter] = useState<'all' | 'winery' | 'farm_shop' | 'cheese_dairy' | 'regiomat'>('all');
  const [culinaryStateFilter, setCulinaryStateFilter] = useState<string>('Alle Bundesländer');
  const [culinarySearchText, setCulinarySearchText] = useState<string>('');
  const [selectedCulinarySpot, setSelectedCulinarySpot] = useState<CulinarySpot | null>(null);
  const [culinaryViewMode, setCulinaryViewMode] = useState<'split' | 'map' | 'grid'>('split');
  const [visibleCulinaryCount, setVisibleCulinaryCount] = useState<number>(24);
  const culinaryOverviewMapContainerRef = useRef<HTMLDivElement | null>(null);
  const culinaryOverviewLeafletMapRef = useRef<L.Map | null>(null);
  const culinaryOverviewClusterRef = useRef<L.MarkerClusterGroup | null>(null);

  // Fetch dynamic culinary spots from backend
  useEffect(() => {
    let isCurrent = true;
    const fetchCulinary = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (culinaryFilter !== 'all') queryParams.append('type', culinaryFilter);
        if (culinaryStateFilter !== 'Alle Bundesländer') queryParams.append('state', culinaryStateFilter);
        if (culinarySearchText.trim()) queryParams.append('search', culinarySearchText.trim());

        const qStr = queryParams.toString();
        const url = qStr ? `/api/culinary?${qStr}` : '/api/culinary';

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch culinary spots');
        const data = await res.json();
        if (isCurrent && data.spots && Array.isArray(data.spots)) {
          setCulinarySpots(data.spots);
        }
      } catch {
        // Graceful fallback: locally bundled CULINARY_SPOTS are used
      }
    };

    fetchCulinary();
    return () => { isCurrent = false; };
  }, [culinaryFilter, culinaryStateFilter, culinarySearchText]);

  const culinaryCategoryCounts = useMemo(() => {
    return {
      all: CULINARY_SPOTS.length,
      winery: CULINARY_SPOTS.filter(s => s.type === 'winery').length,
      farm_shop: CULINARY_SPOTS.filter(s => s.type === 'farm_shop').length,
      cheese_dairy: CULINARY_SPOTS.filter(s => s.type === 'cheese_dairy').length,
      regiomat: CULINARY_SPOTS.filter(s => s.type === 'regiomat').length
    };
  }, []);

  const [culinaryCampsites, setCulinaryCampsites] = useState<Place[]>([]);
  const [isLoadingCulinaryCampsites, setIsLoadingCulinaryCampsites] = useState(false);

  const openCulinarySpot = (spot: CulinarySpot) => {
    setSelectedCulinarySpot(spot);
    try {
      window.history.pushState({ modal: 'culinary', spotId: spot.id }, '', `#culinary-${spot.id}`);
    } catch {}
  };

  const closeCulinarySpot = () => {
    setSelectedCulinarySpot(null);
    setCulinaryCampsites([]);
    if (window.location.hash.startsWith('#culinary-')) {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {}
    }
  };

  // Fetch verified campsites near the selected culinary spot
  useEffect(() => {
    if (selectedCulinarySpot) {
      setIsLoadingCulinaryCampsites(true);
      setCulinaryCampsites([]);
      let isCurrent = true;

      const url1 = `/discover/api/trails/nearby-campsites?lat=${selectedCulinarySpot.latitude}&lon=${selectedCulinarySpot.longitude}&radius=35&limit=8`;
      const url2 = `/api/trails/nearby-campsites?lat=${selectedCulinarySpot.latitude}&lon=${selectedCulinarySpot.longitude}&radius=35&limit=8`;
      fetch(url1)
        .then(res => res.ok ? res.json() : fetch(url2).then(r => r.json()))
        .then(data => {
          if (!isCurrent) return;
          if (data && data.places && Array.isArray(data.places)) {
            setCulinaryCampsites(data.places);
          } else {
            setCulinaryCampsites([]);
          }
        })
        .catch(() => {
          if (isCurrent) setCulinaryCampsites([]);
        })
        .finally(() => {
          if (isCurrent) setIsLoadingCulinaryCampsites(false);
        });

      return () => { isCurrent = false; };
    } else {
      setCulinaryCampsites([]);
    }
  }, [selectedCulinarySpot]);

  const openNearbyCampsitesForCulinary = (spot: CulinarySpot) => {
    closeCulinarySpot();
    const rawList = (culinaryCampsites && culinaryCampsites.length > 0)
      ? culinaryCampsites
      : [];

    const validPlaces = rawList.map((p: any) => ({
      ...p,
      latitude: Number(p.latitude || p.lat),
      longitude: Number(p.longitude || p.lon),
      city: p.city || p.locality || '',
      type: p.type || p.category || 'camp_site'
    }));

    setPlaces(validPlaces);
    setTotalItems(validPlaces.length);
    setMapPoints(validPlaces);
    setViewMode('split');
    setCurrentPage(1);
    setHasSearched(true);
    setSearchSummary('');
    setSearchQuery(`Camping & Stellplätze nahe ${spot.name}`);
    setRecommendationTitle(`🏕️ ${validPlaces.length} Camping- & Stellplätze nahe ${spot.name}`);
    setActiveTab('explore');
  };

  // Dynamic randomized inspirations for Camping and Highlights hubs (4 items per visit)
  const [sampleCampingList] = useState<InspirationCampingSpot[]>(() => {
    return [...FEATURED_CAMPING_SPOTS].sort(() => 0.5 - Math.random()).slice(0, 4);
  });
  const [sampleHighlightsList] = useState<InspirationHighlight[]>(() => {
    return [...FEATURED_HIGHLIGHTS].sort(() => 0.5 - Math.random()).slice(0, 4);
  });

  const filteredCulinarySpots = useMemo(() => {
    return culinarySpots.filter(spot => {
      if (culinaryFilter !== 'all' && spot.type !== culinaryFilter) return false;
      if (culinaryStateFilter !== 'Alle Bundesländer' && spot.state !== culinaryStateFilter) return false;
      if (culinarySearchText.trim()) {
        const q = culinarySearchText.toLowerCase();
        const matchName = spot.name.toLowerCase().includes(q);
        const matchRegion = spot.region.toLowerCase().includes(q);
        const matchState = (spot.state || '').toLowerCase().includes(q);
        const matchDesc = spot.description.toLowerCase().includes(q);
        const matchProd = spot.products.some(p => p.toLowerCase().includes(q));
        if (!matchName && !matchRegion && !matchState && !matchDesc && !matchProd) return false;
      }
      return true;
    });
  }, [culinarySpots, culinaryFilter, culinaryStateFilter, culinarySearchText]);

  // Router navigation & active hub detection
  const { hub } = useParams<{ hub?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const currentHub = useMemo<'all' | 'camping' | 'genuss' | 'touren' | 'events' | 'highlights' | 'lists'>(() => {
    if (activeTab === 'lists') return 'lists';
    if (!hub) return 'all';
    const h = hub.toLowerCase();
    if (['camping', 'campingplaetze', 'stellplaetze', 'pitches', 'campgrounds'].includes(h)) return 'camping';
    if (['genuss', 'weingueter', 'hoflaeden', 'culinary', 'wineries', 'farm-shops'].includes(h)) return 'genuss';
    if (['touren', 'trails', 'wandern', 'radwege', 'hiking'].includes(h)) return 'touren';
    if (['events', 'veranstaltungen', 'feste', 'festivals'].includes(h)) return 'events';
    if (['highlights', 'sehenswuerdigkeiten', 'attractions', 'sights'].includes(h)) return 'highlights';
    if (['listen', 'lists', 'favoriten', 'saved'].includes(h)) return 'lists';
    return 'all';
  }, [hub, activeTab]);

  const handleHubSelect = (targetHub: 'all' | 'camping' | 'genuss' | 'touren' | 'events' | 'highlights' | 'lists') => {
    setSelectedPlace(null);
    setSelectedTrail(null);
    setSelectedEvent(null);
    setSelectedCulinarySpot(null);
    setHasSearched(false);
    setSearchQuery('');
    
    const base = location.pathname.startsWith('/discover') ? '/discover' 
      : location.pathname.startsWith('/decouvrir') ? '/decouvrir'
      : location.pathname.startsWith('/scopri') ? '/scopri'
      : location.pathname.startsWith('/ontdekken') ? '/ontdekken'
      : '/entdecken';

    if (targetHub === 'all') {
      setActiveTab('explore');
      navigate(base);
    } else if (targetHub === 'lists') {
      setActiveTab('lists');
      navigate(`${base}/listen`);
    } else {
      setActiveTab('explore');
      navigate(`${base}/${targetHub}`);
    }
  };

  // React to route changes: reset active filters, modals, and country view so cross-hub links always work smoothly
  useEffect(() => {
    setSelectedPlace(null);
    setSelectedTrail(null);
    setSelectedEvent(null);
    setSelectedCulinarySpot(null);
    setSelectedCountryView(null);
    setHasSearched(false);
    setSearchQuery('');
    if (activeTab === 'lists' && hub !== 'listen' && hub !== 'lists') {
      setActiveTab('explore');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [hub, location.pathname]);

  useEffect(() => {
    const handlePopState = () => {
      if (selectedCulinarySpot) {
        setSelectedCulinarySpot(null);
        return;
      }
      if (selectedEvent) {
        setSelectedEvent(null);
        return;
      }
      if (selectedTrail) {
        setSelectedTrail(null);
        return;
      }
      if (selectedPlace) {
        setSelectedPlace(null);
        return;
      }
      if (selectedCountryView) {
        setSelectedCountryView(null);
        return;
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedCulinarySpot, selectedEvent, selectedTrail, selectedPlace, selectedCountryView]);

  // Fetch verified nearby campsites for selected event from SQLite database without AI key
  useEffect(() => {
    if (!selectedEvent) {
      setEventCampsites([]);
      setIsLoadingEventCampsites(false);
      return;
    }

    const lat = selectedEvent.latitude;
    const lon = selectedEvent.longitude;
    if (!lat || !lon) {
      setEventCampsites([]);
      return;
    }

    setIsLoadingEventCampsites(true);
    let isCurrent = true;

    const nearbyUrl = `/discover/api/trails/nearby-campsites?lat=${lat}&lon=${lon}&radius=35&limit=20`;
    fetch(nearbyUrl)
      .then(res => res.ok ? res.json() : fetch(`/api/trails/nearby-campsites?lat=${lat}&lon=${lon}&radius=35&limit=20`).then(r => r.json()))
      .then(data => {
        if (!isCurrent) return;
        if (data && data.places && Array.isArray(data.places)) {
          setEventCampsites(data.places);
        } else {
          setEventCampsites([]);
        }
      })
      .catch(() => {
        if (isCurrent) setEventCampsites([]);
      })
      .finally(() => {
        if (isCurrent) setIsLoadingEventCampsites(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedEvent]);

  const EVENT_FALLBACK_IMAGES: Record<string, string[]> = {
    wine: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=800&q=80"
    ],
    culture: [
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80"
    ],
    festival: [
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80"
    ],
    market: [
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80"
    ],
    sport: [
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"
    ],
    all: [
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80"
    ]
  };

  const getEventFallback = (event?: GermanEvent | null) => {
    if (!event) return EVENT_FALLBACK_IMAGES.all[0];
    const cat = (event as any).category || eventCategory || 'all';
    const list = EVENT_FALLBACK_IMAGES[cat] || EVENT_FALLBACK_IMAGES.all;
    let hash = 0;
    const key = event.id || event.name || 'event';
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    return list[Math.abs(hash) % list.length];
  };

  const fetchEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const params = new URLSearchParams();
      params.append('dateRangeStart', today);

      const res = await fetch(`/discover/api/dzt/events?${params.toString()}`)
        .then(r => r.ok ? r.json() : fetch(`/api/dzt/events?${params.toString()}`).then(r => r.json()));
      
      if (res && res.success && Array.isArray(res.data)) {
        const liveEvents = res.data;
        const liveNames = new Set(liveEvents.map((e: any) => (e.name || '').toLowerCase().trim()));
        const uniqueFlagships = GERMAN_FLAGSHIP_EVENTS.filter(f => !liveNames.has(f.name.toLowerCase().trim()));
        setEvents([...(uniqueFlagships as unknown as GermanEvent[]), ...liveEvents]);
      } else {
        setEvents(GERMAN_FLAGSHIP_EVENTS as unknown as GermanEvent[]);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents(GERMAN_FLAGSHIP_EVENTS as unknown as GermanEvent[]);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getUpcomingEventDates = (startDate?: string, endDate?: string, isRecurring = false) => {
    if (!startDate) return { startDate, endDate, isRecurringNextYear: false, isPast: false };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let start = new Date(startDate);
    let end = endDate ? new Date(endDate) : new Date(startDate);

    if (isNaN(start.getTime())) return { startDate, endDate, isRecurringNextYear: false, isPast: false };

    let isRecurringNextYear = false;
    let isPast = false;

    // Check if event has already passed
    if (end < today) {
      if (isRecurring) {
        // Automatically roll forward year for annual/recurring festivals
        while (end < today) {
          isRecurringNextYear = true;
          start.setFullYear(start.getFullYear() + 1);
          if (endDate && !isNaN(end.getTime())) {
            end.setFullYear(end.getFullYear() + 1);
          } else {
            end = new Date(start);
          }
        }
      } else {
        isPast = true;
      }
    }

    const formatIso = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    return {
      startDate: formatIso(start),
      endDate: endDate ? formatIso(end) : undefined,
      isRecurringNextYear,
      isPast
    };
  };

  const filteredEvents = useMemo(() => {
    const enriched = events.map(e => {
      const isRecurring = Boolean((e as any).isFlagship || (e as any).id?.startsWith('flagship-') || (e as any).category === 'wine' || (e as any).category === 'festival' || (e as any).category === 'culture');
      const dateInfo = getUpcomingEventDates(e.startDate, e.endDate, isRecurring);
      return {
        ...e,
        startDate: dateInfo.startDate || e.startDate,
        endDate: dateInfo.endDate || e.endDate,
        isRecurringNextYear: dateInfo.isRecurringNextYear,
        isPast: dateInfo.isPast
      };
    })
    // Filter out expired one-off events
    .filter(e => !e.isPast);

    let list = enriched;
    if (eventCategory !== 'all') {
      list = list.filter(e => (e as any).category === eventCategory || !(e as any).category);
    }
    if (eventStateFilter !== 'Alle Bundesländer' && eventStateFilter !== 'all') {
      list = list.filter(e => (e as any).state === eventStateFilter || (e.locality || '').includes(eventStateFilter));
    }
    if (eventSearchText.trim()) {
      const q = eventSearchText.toLowerCase().trim();
      list = list.filter(e => 
        (e.name || '').toLowerCase().includes(q) ||
        (e.locality || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q)
      );
    }

    // Sort chronologically by upcoming start date
    return list.sort((a, b) => {
      const da = a.startDate ? new Date(a.startDate).getTime() : 9999999999999;
      const db = b.startDate ? new Date(b.startDate).getTime() : 9999999999999;
      return da - db;
    });
  }, [events, eventCategory, eventStateFilter, eventSearchText]);

  const formatEventDate = (start?: string, end?: string) => {
    if (!start) return '';
    try {
      const s = new Date(start);
      if (isNaN(s.getTime())) return start;
      const sStr = s.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
      if (end && end !== start) {
        const e = new Date(end);
        if (!isNaN(e.getTime())) {
          const eStr = e.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
          return `${sStr} – ${eStr}`;
        }
      }
      return sStr;
    } catch {
      return start;
    }
  };

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

  // Open the internal AI settings or MCP panel when the navbar button or query param asks for it.
  React.useEffect(() => {
    // Check URL parameters / hash on initial mount (e.g. from Footer navigation)
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('openMCP') === 'true' || window.location.hash === '#mcp') {
        setShowMCPModal(true);
      }
      if (params.get('openAISettings') === 'true' || window.location.hash === '#ai-settings') {
        handleOpenAISettings();
      }
    } catch {}

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

    const hubName =
      currentHub === 'camping' ? (t.hubCamping || 'Camping & Stellplätze') :
      currentHub === 'genuss' ? (t.hubGenuss || 'Hofläden & Winzer') :
      currentHub === 'touren' ? (t.hubTouren || 'Wander- & Radwege') :
      currentHub === 'events' ? (t.hubEvents || 'Events & Weinfeste') :
      currentHub === 'highlights' ? (t.hubHighlights || 'Sehenswürdigkeiten') :
      currentHub === 'lists' ? (t.hubLists || 'Meine Listen') : null;

    const trail: BreadcrumbItem[] = [
      { label: t.tabExplore || 'Entdecken', path: '/discover', onClick: () => { setSelectedPlace(null); setSelectedCulinarySpot(null); setSelectedTrail(null); resetSearch(); handleHubSelect('all'); } },
    ];

    if (currentHub !== 'all' && hubName) {
      trail.push({
        label: hubName,
        onClick: () => { setSelectedPlace(null); setSelectedCulinarySpot(null); setSelectedTrail(null); handleHubSelect(currentHub); },
      });
    }

    if (selectedCulinarySpot) {
      trail.push({ label: selectedCulinarySpot.name });
    } else if (selectedTrail) {
      trail.push({ label: selectedTrail.name });
    } else if (selectedPlace) {
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
  }, [selectedPlace, selectedCulinarySpot, selectedTrail, currentHub, selectedCountryView, countryTab, hasSearched, searchQuery, currentLang, t]);

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

  // Re-invalidate map size when view mode changes
  useEffect(() => {
    if (resultsLeafletMapRef.current) {
      setTimeout(() => {
        resultsLeafletMapRef.current?.invalidateSize();
      }, 200);
    }
  }, [viewMode]);

  const fetchTrails = async (filter: 'all' | 'hiking' | 'biking' = trailFilter) => {
    setIsLoadingTrails(true);
    try {
      const res = await fetch(`/api/trails?type=${filter}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTrails(data.map((t: any) => ({
            ...t,
            highlights: safeHighlights(t.highlights)
          })));
          return;
        }
      }
    } catch (e) {
      console.error('Failed to fetch trails from backend, using local dataset:', e);
    } finally {
      setIsLoadingTrails(false);
    }
    // Local fallback filtering
    if (filter === 'all') {
      setTrails(FAMOUS_TRAILS);
    } else {
      setTrails(FAMOUS_TRAILS.filter(t => t.type === filter || t.type === 'both'));
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchLists();
    fetchCountryStats();
    fetchAttractionStats();
    fetchTrails();

    // Track discover visit
    fetch('/api/count-discover', { method: 'POST' }).catch(() => {});
  }, []);

  // Sync featured places with chosen featuredCountry
  useEffect(() => {
    fetchFeaturedPlaces(featuredCountry);
  }, [featuredCountry]);

  // Sync trails when filter changes
  useEffect(() => {
    fetchTrails(trailFilter);
  }, [trailFilter]);

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

  // Dynamic SEO & Schema.org JSON-LD for Search Engines & AI Web Crawlers
  useEffect(() => {
    let pageTitle = 'Camping & Stellplätze in Europa entdecken | CampingRoute';
    let metaDesc = 'Entdecke über 20.000 verifizierte Campingplätze, Wohnmobilstellplätze, Wanderwege, Weinfeste und Hofläden in Europa.';
    let jsonLdData: any = null;

    if (selectedCulinarySpot) {
      pageTitle = `${selectedCulinarySpot.name} (${selectedCulinarySpot.subtypeLabel}) – Camping in der Nähe | CampingRoute`;
      metaDesc = `${selectedCulinarySpot.name} in ${selectedCulinarySpot.region}: ${selectedCulinarySpot.description} Direktvermarkter mit Camping- & Stellplätzen in der Umgebung.`;
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': selectedCulinarySpot.type === 'winery' ? 'Winery' : 'LocalBusiness',
        'name': selectedCulinarySpot.name,
        'description': selectedCulinarySpot.description,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': selectedCulinarySpot.address,
          'addressRegion': selectedCulinarySpot.state,
          'addressCountry': 'DE'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': selectedCulinarySpot.latitude,
          'longitude': selectedCulinarySpot.longitude
        },
        'telephone': selectedCulinarySpot.phone,
        'url': selectedCulinarySpot.website || 'https://campingroute.app/discover?tab=culinary'
      };
    } else if (selectedTrail) {
      pageTitle = `${selectedTrail.name} (${selectedTrail.distance_km} km) – Wander- & Radweg mit Camping | CampingRoute`;
      metaDesc = `${selectedTrail.name} in ${selectedTrail.region}: ${selectedTrail.description} Entdecke verifizierte Campingplätze und Stellplätze entlang der Route.`;
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        'name': selectedTrail.name,
        'description': selectedTrail.description,
        'touristType': selectedTrail.type === 'biking' ? 'Biking' : 'Hiking',
        'distance': `${selectedTrail.distance_km} km`,
        'itinerary': {
          '@type': 'ItemList',
          'itemListElement': safeHighlights(selectedTrail.highlights).map((hl, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'name': hl
          }))
        }
      };
    } else if (selectedEvent) {
      pageTitle = `${selectedEvent.name} – Event & Camping in Deutschland | CampingRoute`;
      metaDesc = `${selectedEvent.name} in ${selectedEvent.locality || 'Deutschland'}: ${selectedEvent.description || 'Kulturelles Highlight und Veranstaltung mit passenden Camping- und Stellplätzen in der Umgebung.'}`;
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        'name': selectedEvent.name,
        'description': selectedEvent.description,
        'startDate': selectedEvent.startDate,
        'endDate': selectedEvent.endDate,
        'location': {
          '@type': 'Place',
          'name': selectedEvent.locality || selectedEvent.name,
          'address': selectedEvent.streetAddress || selectedEvent.locality
        }
      };
    } else if (selectedPlace) {
      pageTitle = `${selectedPlace.name} (${selectedPlace.city || selectedPlace.country}) – Camping & Stellplatz | CampingRoute`;
      metaDesc = `${selectedPlace.name} in ${selectedPlace.city || selectedPlace.country}: ${selectedPlace.description || 'Verifizierter Camping- und Stellplatz mit Ausflugszielen, Wanderwegen und Hofläden in der Nähe.'}`;
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': selectedPlace.type === 'attraction' ? 'TouristAttraction' : 'Campground',
        'name': selectedPlace.name,
        'description': selectedPlace.description,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': selectedPlace.address,
          'addressLocality': selectedPlace.city,
          'addressCountry': selectedPlace.country
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': selectedPlace.latitude,
          'longitude': selectedPlace.longitude
        },
        'url': selectedPlace.website || window.location.href
      };
    } else if (activeTab === 'culinary') {
      pageTitle = 'Hofläden, Winzer & 24h-Regiomaten in Deutschland – Camping & Genuss | CampingRoute';
      metaDesc = 'Finde über 1.500 Winzerstuben, Hofläden, Käsereien und 24h-Regiomaten in Deutschland mit passenden Camping- und Stellplätzen in der Nähe.';
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'Hofläden, Winzer & Regiomaten Deutschland',
        'description': metaDesc,
        'url': 'https://campingroute.app/discover?tab=culinary'
      };
    } else if (activeTab === 'trails') {
      pageTitle = 'Wander- & Radwege mit Campingplätzen in Deutschland | CampingRoute';
      metaDesc = 'Entdecke über 16.000 offizielle Wanderwege, Radrouten und Etappentouren mit Übernachtungsmöglichkeiten auf Camping- und Stellplätzen.';
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'Wander- & Radwege mit Campingplätzen',
        'description': metaDesc,
        'url': 'https://campingroute.app/discover?tab=trails'
      };
    } else if (activeTab === 'events') {
      pageTitle = 'Veranstaltungen, Weinfeste & Kultur in Deutschland – Camping & Events | CampingRoute';
      metaDesc = 'Offizielle Feste, Märkte, Weinfeste und Kultur-Events in ganz Deutschland mit Camping- und Stellplatztipps.';
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'Veranstaltungen & Kultur-Events Deutschland',
        'description': metaDesc,
        'url': 'https://campingroute.app/discover?tab=events'
      };
    }

    document.title = pageTitle;
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', metaDesc);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', metaDesc);

    let scriptTag = document.getElementById('dynamic-jsonld') as HTMLScriptElement;
    if (jsonLdData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLdData);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [activeTab, selectedPlace, selectedTrail, selectedCulinarySpot, selectedEvent]);

  // Fetch reviews, nearby places, and nearby trails when a place is selected
  useEffect(() => {
    if (selectedPlace) {
      const isCustomInsp = selectedPlace.id.startsWith('insp-');

      // 1. Instant calculation of trails from the full dataset (670+ German Open Data trails)
      const memoryTrails = getNearbyTrails(selectedPlace.latitude, selectedPlace.longitude, 50, trails).slice(0, 4);
      setNearbyTrails(memoryTrails);

      // 2. Instant calculation of nearby farm shops, wineries & regiomats
      const memoryCulinary = getNearbyCulinarySpots(selectedPlace.latitude, selectedPlace.longitude, 35, culinarySpots).slice(0, 4);
      setNearbyCulinarySpots(memoryCulinary);

      if (isCustomInsp) {
        setReviews([]);
      } else {
        fetchReviews(selectedPlace.id);
      }

      fetchNearbyPlaces(selectedPlace.id, selectedPlace.latitude, selectedPlace.longitude, selectedPlace.type);

      if (!isCustomInsp) {
        // Also try API endpoint to enrich or supplement for real DB places
        fetch(`/discover/api/places/${selectedPlace.id}/nearby-trails`)
          .then(res => res.ok ? res.json() : [])
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              setNearbyTrails(data);
            }
          })
          .catch(() => {});

        // Fetch nearby culinary spots from API
        fetch(`/api/culinary/nearby?lat=${selectedPlace.latitude}&lon=${selectedPlace.longitude}&radius=35&limit=4`)
          .then(res => res.ok ? res.json() : { spots: [] })
          .then(data => {
            if (data && data.spots && Array.isArray(data.spots) && data.spots.length > 0) {
              setNearbyCulinarySpots(data.spots);
            }
          })
          .catch(() => {});
      }
    } else {
      setNearbyPlaces([]);
      setNearbyTrails([]);
      setNearbyCulinarySpots([]);
    }
  }, [selectedPlace, trails, culinarySpots]);

  // Fetch campsites, trail polyline and lock scroll for selected trail
  useEffect(() => {
    if (selectedTrail) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setIsLoadingTrailCampsites(true);

      // Immediately clear previous trail state so no old markers or bounds are drawn
      setTrailCampsites([]);
      setTrailPolyline([]);
      setTrailStartCoords(null);
      setTrailEndCoords(null);

      let isCurrent = true;

      // 1. Calculate realistic corridor / radius based on trail length (e.g. 8 km for short day hikes)
      const distKm = selectedTrail.distance_km || 10;
      const dynamicRadius = distKm < 15 ? 8 : (distKm < 50 ? 12 : 15);

      // 2. Fetch exact nearby campsites within dynamic radius
      const nearbyUrl = `/discover/api/trails/nearby-campsites?lat=${selectedTrail.latitude}&lon=${selectedTrail.longitude}&radius=${dynamicRadius}&limit=15`;
      fetch(nearbyUrl)
        .then(res => res.ok ? res.json() : fetch(`/api/trails/nearby-campsites?lat=${selectedTrail.latitude}&lon=${selectedTrail.longitude}&radius=${dynamicRadius}&limit=15`).then(r => r.json()))
        .then(data => {
          if (!isCurrent) return;
          if (data && data.places && Array.isArray(data.places)) {
            setTrailCampsites(data.places);
          } else {
            setTrailCampsites([]);
          }
        })
        .catch(() => {
          if (isCurrent) setTrailCampsites([]);
        })
        .finally(() => {
          if (isCurrent) setIsLoadingTrailCampsites(false);
        });

      // 3. Fetch full trail details & geometry / polyline if not already available
      if (selectedTrail.polyline && selectedTrail.polyline.length > 0) {
        setTrailPolyline(selectedTrail.polyline);
        setTrailStartCoords(selectedTrail.start_coords || selectedTrail.polyline[0]);
        setTrailEndCoords(selectedTrail.end_coords || selectedTrail.polyline[selectedTrail.polyline.length - 1]);
      } else {
        const detailsUrl = `/discover/api/trails/details?id=${encodeURIComponent(selectedTrail.id)}`;
        fetch(detailsUrl)
          .then(res => res.ok ? res.json() : fetch(`/api/trails/details?id=${encodeURIComponent(selectedTrail.id)}`).then(r => r.json()))
          .then(data => {
            if (!isCurrent) return;
            if (data && data.polyline && Array.isArray(data.polyline) && data.polyline.length > 1) {
              // Sanity check: polyline points must be within reasonable distance of trail center (< 50km)
              const validPolyline: [number, number][] = data.polyline.filter(([lat, lon]: [number, number]) => {
                return typeof lat === 'number' && typeof lon === 'number' &&
                  Math.abs(lat - selectedTrail.latitude) < 0.8 &&
                  Math.abs(lon - selectedTrail.longitude) < 1.2;
              });
              if (validPolyline.length > 1) {
                setTrailPolyline(validPolyline);
                setTrailStartCoords(data.start_coords || validPolyline[0]);
                setTrailEndCoords(data.end_coords || validPolyline[validPolyline.length - 1]);
                return;
              }
            }
            setTrailPolyline([[selectedTrail.latitude, selectedTrail.longitude]]);
            setTrailStartCoords([selectedTrail.latitude, selectedTrail.longitude]);
            setTrailEndCoords([selectedTrail.latitude, selectedTrail.longitude]);
          })
          .catch(() => {
            if (isCurrent) {
              setTrailPolyline([[selectedTrail.latitude, selectedTrail.longitude]]);
            }
          });
      }

      return () => {
        isCurrent = false;
        document.body.style.overflow = prev;
      };
    } else {
      setTrailCampsites([]);
      setTrailPolyline([]);
      setTrailStartCoords(null);
      setTrailEndCoords(null);
    }
  }, [selectedTrail]);

  // GPX Download handler for selectedTrail
  const handleDownloadGpx = () => {
    if (!selectedTrail) return;
    const points = (trailPolyline && trailPolyline.length > 1) 
      ? trailPolyline 
      : (selectedTrail.polyline && selectedTrail.polyline.length > 0)
        ? selectedTrail.polyline
        : [[selectedTrail.latitude, selectedTrail.longitude]];

    const trkpts = points.map(([lat, lon]) => `      <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}"><ele>0</ele></trkpt>`).join('\n');
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="CampingRoute.app - Open Data Germany" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${selectedTrail.name.replace(/[<>&'"]/g, '')}</name>
    <desc>${(selectedTrail.description || '').replace(/[<>&'"]/g, '')}</desc>
    <author>
      <name>CampingRoute.app / DZT Open Data Germany</name>
    </author>
  </metadata>
  <trk>
    <name>${selectedTrail.name.replace(/[<>&'"]/g, '')}</name>
    <type>${selectedTrail.type === 'biking' ? 'Cycling' : 'Hiking'}</type>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTrail.name.toLowerCase().replace(/[^a-z0-9äöüß]+/gi, '_')}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Trail Detail Map initialization & drawing (Polyline + Start/End + Campsites)
  useEffect(() => {
    const isOpen = !!selectedTrail;
    if (isOpen && trailMapContainerRef.current) {
      // Destroy old instance if exists
      if (trailLeafletMapRef.current) {
        trailLeafletMapRef.current.remove();
        trailLeafletMapRef.current = null;
      }

      const map = L.map(trailMapContainerRef.current, {
        center: [selectedTrail.latitude, selectedTrail.longitude],
        zoom: 12,
        zoomControl: true,
        attributionControl: true
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
      }).addTo(map);

      trailLeafletMapRef.current = map;
      setTimeout(() => map.invalidateSize(), 150);
    } else if (!isOpen && trailLeafletMapRef.current) {
      trailLeafletMapRef.current.remove();
      trailLeafletMapRef.current = null;
    }
    trailWasOpenRef.current = isOpen;
  }, [selectedTrail]);

  // Update Polyline, Start/End markers, and campsite markers on Trail Modal Map
  useEffect(() => {
    const map = trailLeafletMapRef.current;
    if (!map || !selectedTrail) return;

    // Clear non-tile layers if any
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([[selectedTrail.latitude, selectedTrail.longitude]]);

    // 1. Draw Route Polyline (Streckenverlauf) if available
    if (trailPolyline && trailPolyline.length >= 2) {
      trailPolyline.forEach(([lat, lon]) => {
        if (Math.abs(lat - selectedTrail.latitude) < 0.8 && Math.abs(lon - selectedTrail.longitude) < 1.2) {
          bounds.extend([lat, lon]);
        }
      });

      // White outline casing
      L.polyline(trailPolyline, {
        color: '#ffffff',
        weight: 8,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Vibrant Red/Crimson Track Polyline (Streckenverlauf)
      L.polyline(trailPolyline, {
        color: '#e11d48',
        weight: 4.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Start Marker (🟢)
      const startPt = trailStartCoords || trailPolyline[0];
      if (startPt) {
        const startIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background: #10b981; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 2.5px solid white; font-weight: 800;">🟢</div>`
        });
        L.marker(startPt, { icon: startIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup(`<b>Startpunkt:</b> ${escHtml(selectedTrail.start_location)}`);
      }

      // End Marker (🏁)
      const endPt = trailEndCoords || trailPolyline[trailPolyline.length - 1];
      if (endPt) {
        const endIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background: #dc2626; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 2.5px solid white; font-weight: 800;">🏁</div>`
        });
        L.marker(endPt, { icon: endIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup(`<b>Ziel:</b> ${escHtml(selectedTrail.end_location)}`);
      }
    } else {
      // Single center marker
      const trailIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background: #059669; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 2px solid white;">🥾</div>`
      });
      L.marker([selectedTrail.latitude, selectedTrail.longitude], { icon: trailIcon })
        .addTo(map)
        .bindPopup(`<b>${escHtml(selectedTrail.name)}</b><br/>${selectedTrail.start_location} ➔ ${selectedTrail.end_location}`)
        .openPopup();
    }

    // 2. Add campsite markers (only close to the selected trail)
    if (trailCampsites && trailCampsites.length > 0) {
      trailCampsites.forEach(p => {
        const distLabel = (p as any).distance_km !== undefined ? ` · 📍 ${(p as any).distance_km} km` : '';
        L.circleMarker([p.latitude, p.longitude], {
          radius: 8,
          color: '#ffffff',
          weight: 2.5,
          fillColor: p.type === 'caravan' ? '#2563eb' : '#059669',
          fillOpacity: 0.95
        })
          .addTo(map)
          .bindPopup(`<b>${escHtml(p.name)}</b><br/>${getTypeLabel(p.type)}${distLabel}<br/>⭐ ${p.rating || '4.5'}`);
      });
    }

    // Smoothly fit bounds on trail route without re-jumping when campsites load
    if (trailPolyline && trailPolyline.length >= 2) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 13, animate: false });
    } else {
      map.setView([selectedTrail.latitude, selectedTrail.longitude], 12, { animate: false });
    }
  }, [trailPolyline, trailStartCoords, trailEndCoords, trailCampsites, selectedTrail]);

  // Trails Overview Map Effect (when in map or split view mode)
  useEffect(() => {
    if (hasSearched || selectedCountryView || (trailViewMode !== 'split' && trailViewMode !== 'map')) {
      if (trailsOverviewLeafletMapRef.current) {
        trailsOverviewLeafletMapRef.current.remove();
        trailsOverviewLeafletMapRef.current = null;
      }
      return;
    }

    const container = trailsOverviewMapContainerRef.current;
    if (!container) return;

    // If existing map points to a detached or different container, remove it first
    if (trailsOverviewLeafletMapRef.current) {
      if (trailsOverviewLeafletMapRef.current.getContainer() !== container) {
        trailsOverviewLeafletMapRef.current.remove();
        trailsOverviewLeafletMapRef.current = null;
      }
    }

    if (!trailsOverviewLeafletMapRef.current) {
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      const map = L.map(container, {
        center: [51.1657, 10.4515],
        zoom: 6,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      trailsOverviewLeafletMapRef.current = map;
    }

    const map = trailsOverviewLeafletMapRef.current;
    if (!map) return;

    // Clear previous cluster / markers
    if (trailsOverviewClusterRef.current) {
      map.removeLayer(trailsOverviewClusterRef.current);
    }

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 40,
      showCoverageOnHover: false
    });

    const bounds = L.latLngBounds([]);
    const trailsToDisplay = filteredTrails.slice(0, 150);

    trailsToDisplay.forEach((trail) => {
      bounds.extend([trail.latitude, trail.longitude]);
      const isBiking = trail.type === 'biking';
      const isHiking = trail.type === 'hiking';
      const iconEmoji = isBiking ? '🚴' : isHiking ? '🥾' : '🥾';
      const bgColor = isBiking ? '#2563eb' : '#059669';

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background: ${bgColor}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 2px solid white; cursor: pointer;">${iconEmoji}</div>`
      });

      const marker = L.marker([trail.latitude, trail.longitude], { icon: customIcon });
      
      const popupHtml = document.createElement('div');
      popupHtml.style.width = '230px';
      popupHtml.style.fontFamily = 'inherit';
      popupHtml.innerHTML = `
        <div style="width: 100%; height: 110px; border-radius: 8px; overflow: hidden; background: #e5e7eb; margin-bottom: 6px;">
          <img src="${cleanImageUrl(trail.image_url) || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'" />
        </div>
        <div style="font-size: 0.72rem; font-weight: 800; color: ${bgColor}; text-transform: uppercase;">
          ${isBiking ? '🚴 Radweg' : '🥾 Wanderweg'} · ${trail.distance_km} km
        </div>
        <div style="font-size: 0.9rem; font-weight: 800; color: #111827; margin: 2px 0 4px 0; line-height: 1.2;">
          ${escHtml(trail.name)}
        </div>
        <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 8px;">
          ${escHtml(trail.region)} · ${trail.difficulty === 'easy' ? 'Leicht' : trail.difficulty === 'medium' ? 'Mittel' : 'Anspruchsvoll'}
        </div>
        <button class="open-trail-popup-btn" style="width: 100%; padding: 7px; background: #059669; color: white; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
          Tour & Plätze ansehen ➔
        </button>
      `;

      popupHtml.querySelector('.open-trail-popup-btn')?.addEventListener('click', () => {
        setSelectedTrail(trail);
      });

      marker.bindPopup(popupHtml);
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    trailsOverviewClusterRef.current = cluster;

    if (bounds.isValid() && trailsToDisplay.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }

    const t1 = setTimeout(() => map.invalidateSize(), 60);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [filteredTrails, trailViewMode, hasSearched, selectedCountryView]);

  // Culinary Overview Map Effect (Genuss Hub)
  useEffect(() => {
    if (hasSearched || selectedCountryView || currentHub !== 'genuss' || culinaryViewMode === 'grid') {
      if (culinaryOverviewLeafletMapRef.current) {
        culinaryOverviewLeafletMapRef.current.remove();
        culinaryOverviewLeafletMapRef.current = null;
      }
      return;
    }

    const container = culinaryOverviewMapContainerRef.current;
    if (!container) return;

    // If existing map points to a detached or different container, remove it first
    if (culinaryOverviewLeafletMapRef.current) {
      if (culinaryOverviewLeafletMapRef.current.getContainer() !== container) {
        culinaryOverviewLeafletMapRef.current.remove();
        culinaryOverviewLeafletMapRef.current = null;
      }
    }

    if (!culinaryOverviewLeafletMapRef.current) {
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      const map = L.map(container, {
        center: [51.1657, 10.4515],
        zoom: 6,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      culinaryOverviewLeafletMapRef.current = map;
    }

    const map = culinaryOverviewLeafletMapRef.current;
    if (!map) return;

    // Clear previous cluster / markers
    if (culinaryOverviewClusterRef.current) {
      map.removeLayer(culinaryOverviewClusterRef.current);
    }

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 40,
      showCoverageOnHover: false
    });

    const bounds = L.latLngBounds([]);
    const spotsToDisplay = filteredCulinarySpots.slice(0, 300);

    spotsToDisplay.forEach((spot) => {
      bounds.extend([spot.latitude, spot.longitude]);
      const isWinery = spot.type === 'winery';
      const isCheese = spot.type === 'cheese_dairy';
      const isRegiomat = spot.type === 'regiomat';
      const iconEmoji = isWinery ? '🍷' : isCheese ? '🧀' : isRegiomat ? '🥩' : '🚜';
      const bgColor = isWinery ? '#9333ea' : isCheese ? '#d97706' : isRegiomat ? '#0284c7' : '#16a34a';

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="position: relative; background: ${bgColor}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 2px solid white; cursor: pointer;">
          ${iconEmoji}
          ${spot.hasCampsite ? '<span style="position: absolute; top: -4px; right: -4px; font-size: 10px; background: #059669; border-radius: 50%; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; border: 1.5px solid white;">🚐</span>' : ''}
        </div>`
      });

      const marker = L.marker([spot.latitude, spot.longitude], { icon: customIcon });
      
      const popupHtml = document.createElement('div');
      popupHtml.style.width = '240px';
      popupHtml.style.fontFamily = 'inherit';
      popupHtml.innerHTML = `
        <div style="width: 100%; height: 115px; border-radius: 8px; overflow: hidden; background: #e5e7eb; margin-bottom: 6px;">
          <img src="${cleanImageUrl(spot.image_url) || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80'}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80'" />
        </div>
        <div style="font-size: 0.72rem; font-weight: 800; color: ${bgColor}; text-transform: uppercase;">
          ${isWinery ? '🍷 Weingut' : isCheese ? '🧀 Käserei' : isRegiomat ? '🥩 24h-Regiomat' : '🚜 Hofladen'}
          ${spot.hasCampsite ? ' · 🚐 Stellplatz' : ''}
        </div>
        <div style="font-size: 0.92rem; font-weight: 800; color: #111827; margin: 2px 0 4px 0; line-height: 1.2;">
          ${escHtml(spot.name)}
        </div>
        <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 8px;">
          ${escHtml(spot.address || spot.region || spot.state)}
        </div>
        <button class="open-culinary-popup-btn" style="width: 100%; padding: 7px; background: ${bgColor}; color: white; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
          Öffnen & Details ➔
        </button>
      `;

      popupHtml.querySelector('.open-culinary-popup-btn')?.addEventListener('click', () => {
        openCulinarySpot(spot);
      });

      marker.bindPopup(popupHtml);
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    culinaryOverviewClusterRef.current = cluster;

    if (bounds.isValid() && spotsToDisplay.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }

    const t1 = setTimeout(() => map.invalidateSize(), 60);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [filteredCulinarySpots, culinaryViewMode, currentHub, hasSearched, selectedCountryView]);

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
    try {
      window.history.pushState({ view: 'country', code, tab }, '', `#country-${code}`);
    } catch {}
    scrollToTop();
    setTimeout(scrollToTop, 60);
  };

  // Open a place from the results minimap popup (fetches the full record)
  const openPlaceFromMap = async (id: string) => {
    try {
      const response = await fetch(`/discover/api/places/${id}`);
      const place = await response.json();
      if (place && place.id) {
        openPlace(place);
      }
    } catch (e) {
      console.error('Fehler beim Öffnen des Ortes:', e);
    }
  };

  const fetchReviews = async (placeId: string) => {
    try {
      const response = await fetch(`/discover/api/places/${placeId}/reviews`);
      if (!response.ok) {
        setReviews([]);
        return;
      }
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching reviews:', e);
      setReviews([]);
    }
  };

  const fetchNearbyPlaces = async (placeId: string, lat?: number, lon?: number, type?: string) => {
    try {
      let url = `/discover/api/places/${placeId}/nearby`;
      if (lat !== undefined && lon !== undefined) {
        url += `?lat=${lat}&lon=${lon}&type=${type || ''}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        setNearbyPlaces([]);
        return;
      }
      const data = await response.json();
      setNearbyPlaces(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching nearby places:', e);
      setNearbyPlaces([]);
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

const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) return false;
  
  // Exclude non-image DZT/Onlim entity or JSON-LD API endpoints
  if (trimmed.includes('onlim.com/entity') || trimmed.includes('/api/v4/universal') || trimmed.includes('wikidata.org/wiki/')) {
    return false;
  }
  
  return true;
};

const cleanImageUrl = (url: string | null | undefined): string | null => {
  if (!isValidImageUrl(url)) return null;
  return url!.trim().replace(/^http:\/\//i, 'https://');
};

// Escape HTML entities so place names are safe inside map popups
const escHtml = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Prefer the structured image_url column, fall back to legacy markdown-in-description
const getImageUrl = (place: Place): string | null => {
  if (place.image_url && isValidImageUrl(place.image_url)) {
    return cleanImageUrl(place.image_url);
  }
  const match = (place.description || '').match(/!\[.*?\]\((.*?)\)/);
  if (match && isValidImageUrl(match[1])) {
    return cleanImageUrl(match[1]);
  }
  return null;
};

const getCleanDescription = (place: Place): string => {
  const desc = (place.description || '').replace(/!\[.*?\]\((.*?)\)/g, '').trim();
  if (desc.startsWith('http://onlim.com/entity/') || desc.startsWith('https://onlim.com/entity/') || desc.startsWith('https://data.bayerncloud.digital/api/')) {
    return '';
  }
  return desc;
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
    <main id="main-content" tabIndex={-1} className="entdecken-root" style={{ background: 'var(--gray-50)', minHeight: 'auto' }}>

      {/* Main Container */}
      <div style={{ width: '100%', margin: '0 auto', maxWidth: '1200px', padding: '1.25rem 1.5rem 0.5rem 1.5rem' }}>
        
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
              <div className="sm:hidden" style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.6rem', paddingBottom: '0.2rem', background: 'var(--card-bg)' }}>
                <div style={{ width: '40px', height: '4px', borderRadius: '9999px', background: 'var(--gray-300)' }} />
              </div>

              {/* Close button */}
              <button
                onClick={closePlace}
                aria-label="Schließen"
                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 1100, background: 'rgba(31,41,55,0.9)', color: '#fff', border: 'none', borderRadius: '9999px', width: '38px', height: '38px', fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >×</button>
              {/* Breadcrumbs */}
              <div style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)', padding: '0.75rem 1.5rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-600)', fontWeight: 600, flexWrap: 'wrap' }}>
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
                  <span style={{ color: 'var(--gray-900)' }}>{selectedPlace.name}</span>
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
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 500, marginTop: '0.75rem' }}>
                      Datenquelle:{" "}
                      {(() => {
                        const hasDzt = (selectedPlace.source || '').includes('dzt') || selectedPlace.id?.startsWith('dzt-');
                        const osmMatch = (selectedPlace.osm_id || selectedPlace.id || '').match(/^(?:osm-)?(node|way|relation)-(\d+)$/);
                        const wdId = (selectedPlace.id || selectedPlace.osm_id || '').match(/wikidata-(Q\d+)/i)?.[1];

                        const dztLink = (
                          <a href="https://open-data-germany.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-700)', textDecoration: 'underline' }}>
                            DZT Knowledge Graph (Open Data Germany)
                          </a>
                        );

                        const osmLink = osmMatch ? (
                          <a href={`https://www.openstreetmap.org/${osmMatch[1]}/${osmMatch[2]}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-700)', textDecoration: 'underline' }}>
                            OpenStreetMap
                          </a>
                        ) : <span>OpenStreetMap</span>;

                        const wdLink = wdId ? (
                          <a href={`https://www.wikidata.org/wiki/${wdId}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-700)', textDecoration: 'underline' }}>
                            Wikidata
                          </a>
                        ) : <span>Wikidata</span>;

                        if (hasDzt) {
                          if (osmMatch || (selectedPlace.source || '').includes('osm')) {
                            return (
                              <>
                                {dztLink} &amp; {osmLink}
                              </>
                            );
                          }
                          return dztLink;
                        }

                        if (selectedPlace.type === 'attraction' && wdId) {
                          return wdLink;
                        }

                        return osmLink;
                      })()}
                      {selectedPlace.website ? ' · verifizierte Website' : ''}
                    </p>
                  </div>

                  {/* See What It's Really Like */}
                  <div className="detail-card">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', overflowWrap: 'break-word' }}>{t.placeOverviewTitle}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1.25rem', overflowWrap: 'break-word' }}>{t.placeOverviewSubtitle}</p>
                    
                    <div style={{ background: 'var(--gray-50)', border: '1px dashed var(--gray-300)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', color: 'var(--gray-600)' }}>
                      <ImageIcon size={28} style={{ margin: '0 auto 0.5rem auto' }} />
                      <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.noVideoReports}</p>
                      <p style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
                        {selectedPlace.type === 'attraction' 
                          ? (t.noVideoReportsSubAttraction || 'Erstelle den ersten Videobeitrag über diesen Ort!') 
                          : t.noVideoReportsSub}
                      </p>
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
                      <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', fontStyle: 'italic', marginTop: '0.4rem' }}>{t.noAmenitiesAvailable}</p>
                    )}
                  </div>

                  {/* Nearby Places Section (Left Column: 2-column wide grid) */}
                  <div className="detail-card">
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
                      {selectedPlace.type === 'attraction' 
                        ? (t.nearbyCampsitesTitle || '🏕️ Campingplätze in der Nähe') 
                        : (t.nearbyAttractionsTitle || '🏰 Sehenswürdigkeiten in der Nähe')}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1.1rem' }}>
                      {selectedPlace.type === 'attraction' 
                        ? (t.nearbyCampsitesSubtitle || 'Unterkünfte und Stellplätze in der Umgebung') 
                        : (t.nearbyAttractionsSubtitle || 'Ausflugsziele und Naturwunder in der Umgebung')}
                    </p>
                    
                    {nearbyPlaces.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontStyle: 'italic', margin: 0 }}>
                        {t.noNearbyPlacesFound || 'Keine weiteren Orte im Umkreis gefunden.'}
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                        {nearbyPlaces.map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => openPlace(item)}
                            title={item.name}
                            style={{ 
                              display: 'flex', 
                              gap: '0.75rem', 
                              alignItems: 'center', 
                              padding: '0.75rem 0.85rem', 
                              borderRadius: '12px', 
                              border: '1px solid var(--card-border)',
                              background: 'var(--gray-50)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease-in-out'
                            }}
                            className="nearby-place-item hover:border-primary-500 hover:shadow-sm hover:bg-white"
                          >
                            <div style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '10px', 
                              background: item.type === 'attraction' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(5, 150, 105, 0.15)', 
                              color: item.type === 'attraction' ? 'var(--primary-700)' : 'var(--primary-700)',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {item.type === 'attraction' ? <Compass size={18} /> : <MapPin size={18} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h5 
                                title={item.name}
                                style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 0.2rem 0', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                              >
                                {item.name}
                              </h5>
                              <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>{item.city || item.address?.split(',')[0] || item.state || ''}</span>
                                <span style={{ fontWeight: 700, color: 'var(--primary-700)', flexShrink: 0 }}>{item.distance_km} km</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reviews Section */}
                  <div className="detail-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{t.reviewsTitle}</h3>
                      <button onClick={() => setShowReviewModal(true)} style={{ background: 'var(--primary-700)', color: 'white', border: 'none', borderRadius: '9999px', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>{t.writeReviewBtn}</button>
                    </div>
                    
                    {reviews.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontStyle: 'italic', textAlign: 'center', padding: '1.5rem' }}>{t.noReviews}</p>
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
                            <span style={{ fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: '0.2rem', display: 'block' }}>{review.created_at}</span>
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
                      <div style={{ background: 'var(--gray-50)', border: '1px dashed var(--gray-300)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', color: 'var(--gray-600)' }}>
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

                  {/* Nearby Trails Section (in Right Column for perfect vertical balance) */}
                  <div className="detail-card">
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      🥾 {t.nearbyTrailsTitle || 'Wander- & Radwege ab hier'}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.85rem' }}>
                      {t.nearbyTrailsSubtitle || 'Touren und Steige in der direkten Umgebung'}
                    </p>
                    
                    {nearbyTrails.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontStyle: 'italic', margin: 0 }}>
                        {t.noNearbyTrails || 'Keine bekannten Fernwanderwege im direkten Nahbereich.'}
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {nearbyTrails.map((tr) => (
                          <div 
                            key={tr.id}
                            onClick={() => {
                              closePlace();
                              openTrail(tr);
                            }}
                            title={`${tr.name} (${tr.distance_km} km)`}
                            style={{ 
                              display: 'flex', 
                              gap: '0.75rem', 
                              alignItems: 'center', 
                              padding: '0.65rem 0.75rem', 
                              borderRadius: '10px', 
                              border: '1px solid var(--card-border)',
                              background: 'var(--gray-50)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease-in-out'
                            }}
                            className="nearby-place-item hover:border-primary-500 hover:shadow-sm hover:bg-white"
                          >
                            <div style={{ 
                              width: '34px', 
                              height: '34px', 
                              borderRadius: '8px', 
                              background: tr.type === 'biking' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                              color: tr.type === 'biking' ? '#2563eb' : '#059669',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {tr.type === 'biking' ? <Navigation size={17} /> : <Compass size={17} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.2rem' }}>
                                <h5 
                                  title={tr.name}
                                  style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, color: 'var(--gray-900)', lineHeight: '1.25', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}
                                >
                                  {tr.name}
                                </h5>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-block', background: tr.difficulty === 'easy' ? '#ecfdf5' : tr.difficulty === 'medium' ? '#fef3c7' : '#fee2e2', color: tr.difficulty === 'easy' ? '#059669' : tr.difficulty === 'medium' ? '#b45309' : '#dc2626' }}>
                                  {tr.difficulty === 'easy' ? (t.difficultyEasy || 'Leicht') : tr.difficulty === 'medium' ? (t.difficultyMedium || 'Mittel') : (t.difficultyHard || 'Schwer')}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                <span>{tr.distance_km} km</span>
                                <span>·</span>
                                <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>{tr.distance_to_place_km} km vom Platz</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nearby Culinary Spots (Wineries, Farm Shops, Regiomats) */}
                  <div className="detail-card">
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      🍇 Hofläden, Winzer & Automaten
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.85rem' }}>
                      Regionale Spezialitäten, Weinverkauf und 24h-Regiomaten in der Nähe
                    </p>
                    
                    {nearbyCulinarySpots.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontStyle: 'italic', margin: 0 }}>
                        Keine Erzeuger oder Hofläden im direkten 35-km-Nahbereich registriert.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {nearbyCulinarySpots.map((spot) => (
                          <div 
                            key={spot.id}
                            onClick={() => {
                              closePlace();
                              openCulinarySpot(spot);
                            }}
                            title={`${spot.name} (${spot.distance_to_place_km || spot.distance_km} km)`}
                            style={{ 
                              display: 'flex', 
                              gap: '0.75rem', 
                              alignItems: 'center', 
                              padding: '0.65rem 0.75rem', 
                              borderRadius: '10px', 
                              border: '1px solid var(--card-border)', 
                              background: 'var(--gray-50)', 
                              cursor: 'pointer', 
                              transition: 'all 0.15s ease-in-out' 
                            }}
                            className="nearby-place-item hover:border-primary-500 hover:shadow-sm hover:bg-white"
                          >
                            <div style={{ 
                              width: '34px', 
                              height: '34px', 
                              borderRadius: '8px', 
                              background: spot.type === 'winery' ? 'rgba(147, 51, 234, 0.15)' : spot.type === 'cheese_dairy' ? 'rgba(217, 119, 6, 0.15)' : spot.type === 'regiomat' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(22, 163, 74, 0.15)', 
                              fontSize: '17px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              flexShrink: 0 
                            }}>
                              {spot.type === 'winery' ? '🍷' : spot.type === 'cheese_dairy' ? '🧀' : spot.type === 'regiomat' ? '🥩' : '🚜'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.2rem' }}>
                                <h5 
                                  title={spot.name}
                                  style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, color: 'var(--gray-900)', lineHeight: '1.25', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}
                                >
                                  {spot.name}
                                </h5>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-block', background: spot.type === 'winery' ? '#faf5ff' : spot.type === 'cheese_dairy' ? '#fffbeb' : '#f0fdf4', color: spot.type === 'winery' ? '#9333ea' : spot.type === 'cheese_dairy' ? '#d97706' : '#16a34a' }}>
                                  {spot.subtypeLabel}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{spot.products.slice(0, 2).join(' · ')}</span>
                                <span>·</span>
                                <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>{spot.distance_to_place_km || spot.distance_km} km vom Platz</span>
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

        {/* Trail Detail Modal Overlay */}
        {selectedTrail && (
          <div
            className="place-modal-overlay"
            onClick={closeTrail}
          >
            <div className="place-modal-container" onClick={(e) => e.stopPropagation()}>
              {/* Mobile Drag/Pull Indicator */}
              <div className="sm:hidden" style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.6rem', paddingBottom: '0.2rem', background: 'var(--card-bg)' }}>
                <div style={{ width: '40px', height: '4px', borderRadius: '9999px', background: 'var(--gray-300)' }} />
              </div>

              {/* Close button */}
              <button
                onClick={closeTrail}
                aria-label="Schließen"
                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 1100, background: 'rgba(31,41,55,0.9)', color: '#fff', border: 'none', borderRadius: '9999px', width: '38px', height: '38px', fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >×</button>

              {/* Breadcrumbs */}
              <div style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)', padding: '0.75rem 1.5rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-600)', fontWeight: 600, flexWrap: 'wrap' }}>
                  <a href="/" onClick={(e) => { e.preventDefault(); setSelectedTrail(null); resetSearch(); }} style={{ color: 'var(--primary-700)', textDecoration: 'none' }}>{t.navHome || 'Startseite'}</a>
                  <span>/</span>
                  <a href="/discover" onClick={(e) => { e.preventDefault(); setSelectedTrail(null); }} style={{ color: 'var(--primary-700)', textDecoration: 'none' }}>{t.navDiscover || 'Entdecken'}</a>
                  <span>/</span>
                  <span style={{ color: 'var(--primary-700)' }}>🥾 {t.trailsTitle || 'Wander- & Radfernwege'}</span>
                  <span>/</span>
                  <span style={{ color: 'var(--gray-900)' }}>{selectedTrail.name}</span>
                </div>
              </div>

              {/* Map Banner */}
              <div style={{ position: 'relative', height: '320px', width: '100%', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-200)' }}>
                <div ref={trailMapContainerRef} style={{ height: '100%', width: '100%' }}></div>
                
                {/* Floating location badge */}
                <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', zIndex: 1000, background: 'rgba(31, 41, 55, 0.95)', color: 'white', padding: '0.45rem 1rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, boxShadow: 'var(--shadow-md)' }}>
                  <Compass size={16} className="text-primary-400" />
                  <span>{selectedTrail.start_location} ➔ {selectedTrail.end_location} ({selectedTrail.region})</span>
                </div>
              </div>

              {/* Grid Content Columns */}
              <div className="detail-grid-container responsive-detail-grid">
                
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                  <div className="detail-card">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span className="place-card-type campground" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        {selectedTrail.type === 'biking' ? '🚴 Radfernweg' : selectedTrail.type === 'hiking' ? '🥾 Qualitätswanderweg' : '🥾 & 🚴 Panorama-Tour'}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: selectedTrail.difficulty === 'easy' ? '#ecfdf5' : selectedTrail.difficulty === 'medium' ? '#fef3c7' : '#fee2e2', color: selectedTrail.difficulty === 'easy' ? '#059669' : selectedTrail.difficulty === 'medium' ? '#b45309' : '#dc2626' }}>
                        {selectedTrail.difficulty === 'easy' ? (t.difficultyEasy || 'Leicht') : selectedTrail.difficulty === 'medium' ? (t.difficultyMedium || 'Mittel') : (t.difficultyHard || 'Anspruchsvoll')}
                      </span>
                    </div>

                    <h1 className="detail-title">{selectedTrail.name}</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={16} className="shrink-0 text-primary-600" />
                      <span>Region: {selectedTrail.region} · Deutschland</span>
                    </p>

                    {/* Trail Specs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', margin: '1.25rem 0', padding: '1rem', background: 'var(--gray-50)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>Gesamtlänge</span>
                        <p style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: 'var(--gray-900)' }}>📍 {selectedTrail.distance_km} km</p>
                      </div>
                      {selectedTrail.duration_hours && (
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>Reine Gehzeit</span>
                          <p style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: 'var(--gray-900)' }}>⏱️ {selectedTrail.duration_hours} Std.</p>
                        </div>
                      )}
                      {selectedTrail.elevation_gain_m && (
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>Höhenmeter</span>
                          <p style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: 'var(--gray-900)' }}>⛰️ +{selectedTrail.elevation_gain_m} hm</p>
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>Camping-Dichte</span>
                        <p style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: '#059669' }}>
                          🏕️ {isLoadingTrailCampsites ? '...' : `${trailCampsites.length} ${trailCampsites.length === 1 ? 'Platz' : 'Plätze'}`}
                        </p>
                      </div>
                    </div>

                    {/* GPX Download Action */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <button
                        onClick={handleDownloadGpx}
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          borderRadius: '10px',
                          padding: '0.65rem 1.1rem',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.15s ease-in-out'
                        }}
                        className="hover:bg-emerald-100 hover:shadow-sm"
                      >
                        <Download size={17} />
                        <span>📥 GPX-Track herunterladen (Navi / Komoot / Garmin)</span>
                      </button>
                    </div>

                    {/* Highlights */}
                    {safeHighlights(selectedTrail.highlights).length > 0 && (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                          ✨ Besondere Highlights entlang der Strecke
                        </h4>
                        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                          {safeHighlights(selectedTrail.highlights).map((hl, idx) => (
                            <span key={idx} style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(5, 150, 105, 0.1)', color: 'var(--primary-800)', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                              ✓ {hl}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.4rem' }}>
                        📖 Routenbeschreibung & Charakteristik
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', lineHeight: '1.6', margin: 0 }}>
                        {selectedTrail.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Campsites along this trail */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                  <div className="detail-card">
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {selectedTrail.distance_km < 25 ? '🏕️ Camping & Stellplätze in der Nähe' : '🏕️ Camping & Stellplätze an der Route'} ({isLoadingTrailCampsites ? '...' : trailCampsites.length})
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                      {selectedTrail.distance_km < 25 
                        ? `Verifizierte Übernachtungsorte im Umkreis von bis zu ${selectedTrail.distance_km < 15 ? 8 : (selectedTrail.distance_km < 50 ? 12 : 15)} km` 
                        : 'Verifizierte Übernachtungsorte im Korridor entlang des Streckenverlaufs'}
                    </p>

                    {isLoadingTrailCampsites ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontStyle: 'italic' }}>Nahegelegene Plätze werden gesucht...</p>
                    ) : trailCampsites.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontStyle: 'italic' }}>
                        {selectedTrail.distance_km < 25 
                          ? `Keine Campingplätze im direkten Umkreis von ${selectedTrail.distance_km < 15 ? 8 : (selectedTrail.distance_km < 50 ? 12 : 15)} km gefunden.` 
                          : 'Keine Campingplätze im Korridor entlang des Streckenverlaufs gefunden.'}
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                        {trailCampsites.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => { closeTrail(); openPlace(p); }}
                            style={{
                              display: 'flex',
                              gap: '0.75rem',
                              alignItems: 'center',
                              padding: '0.6rem',
                              borderRadius: '10px',
                              border: '1px solid var(--card-border)',
                              background: 'var(--gray-50)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease-in-out'
                            }}
                            className="nearby-place-item hover:border-primary-500"
                          >
                            <div style={{ width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--gray-200)' }}>
                              <img src={getImageUrl(p) || getFallbackImage(p)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = getFallbackImage(p); }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h5 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--gray-900)' }}>
                                {p.name}
                              </h5>
                              <div style={{ fontSize: '0.74rem', color: 'var(--gray-500)', margin: '0.15rem 0 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{getTypeLabel(p.type)} · {p.city || (p.address ? p.address.split(',')[0] : '')}</span>
                                {(p as any).distance_km !== undefined ? (
                                  <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>📍 {(p as any).distance_km} km</span>
                                ) : (
                                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ {p.rating || '4.5'}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action button inside right card */}
                    <button
                      onClick={() => {
                        const targetTrail = selectedTrail;
                        const placesToOpen = trailCampsites;
                        setSelectedTrail(null);

                        if (placesToOpen && placesToOpen.length > 0) {
                          setSearchQuery(`Camping an der Tour: ${targetTrail.name}`);
                          setPlaces(placesToOpen);
                          setTotalItems(placesToOpen.length);
                          setHasSearched(true);
                          setViewMode('split');
                          setSelectedCountryView(null);
                          setMapPoints(placesToOpen.map(p => ({
                            id: p.id,
                            name: p.name,
                            type: p.type,
                            latitude: p.latitude,
                            longitude: p.longitude,
                            rating: p.rating,
                            city: p.city,
                            country: p.country,
                            state: p.state,
                            address: p.address,
                            image_url: p.image_url,
                            reviews_count: p.review_count,
                            price: p.price
                          })));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          const targetQuery = targetTrail.search_query || `Camping in ${targetTrail.region}`;
                          setSearchQuery(targetQuery);
                          handleSearch(undefined, targetQuery);
                        }
                      }}
                      style={{
                        width: '100%',
                        marginTop: '1.25rem',
                        padding: '0.75rem',
                        background: 'var(--primary-600)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      className="hover:bg-primary-700"
                    >
                      <MapIcon size={16} />
                      <span>
                        {trailCampsites.length === 1
                          ? 'Den 1 Platz auf großer Karte öffnen'
                          : trailCampsites.length > 1
                          ? `Alle ${trailCampsites.length} Plätze auf großer Karte öffnen`
                          : 'Campingplätze im weiteren Umkreis suchen'}
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Culinary Spot Detail Modal Overlay */}
        {selectedCulinarySpot && (
          <div
            className="place-modal-overlay"
            onClick={closeCulinarySpot}
          >
            <div className="place-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
              <div className="sm:hidden" style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.6rem', paddingBottom: '0.2rem', background: 'var(--card-bg)' }}>
                <div style={{ width: '40px', height: '4px', borderRadius: '9999px', background: 'var(--gray-300)' }} />
              </div>
              <button
                onClick={closeCulinarySpot}
                aria-label="Schließen"
                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 1100, background: 'rgba(31,41,55,0.9)', color: '#fff', border: 'none', borderRadius: '9999px', width: '38px', height: '38px', fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
              
              <div style={{ position: 'relative', height: '260px', width: '100%', overflow: 'hidden' }}>
                <img
                  src={selectedCulinarySpot.image_url || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80'}
                  alt={selectedCulinarySpot.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', color: 'white' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: selectedCulinarySpot.type === 'winery' ? '#9333ea' : selectedCulinarySpot.type === 'cheese_dairy' ? '#d97706' : selectedCulinarySpot.type === 'regiomat' ? '#2563eb' : '#059669', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {selectedCulinarySpot.type === 'winery' ? '🍷 Weingut & Winzer' : selectedCulinarySpot.type === 'cheese_dairy' ? '🧀 Schaukäserei & Almladen' : selectedCulinarySpot.type === 'regiomat' ? '🥩 24h-Regiomat' : '🚜 Hofladen & Direktvermarkter'}
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 0.3rem 0', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    {selectedCulinarySpot.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>
                    <MapPin size={14} />
                    <span>{selectedCulinarySpot.region} · {selectedCulinarySpot.state}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1.75rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>Über diesen Betrieb</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--gray-700)', lineHeight: '1.6', margin: 0 }}>
                    {selectedCulinarySpot.description}
                  </p>
                </div>

                {/* Products */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>Regionale Spezialitäten & Angebote</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {selectedCulinarySpot.products.map((p, idx) => (
                      <span key={idx} style={{ background: 'var(--primary-50)', color: 'var(--primary-800)', border: '1px solid var(--primary-200)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pitch notice & Nearby Campsites */}
                <div style={{ background: selectedCulinarySpot.hasCampsite ? 'rgba(5, 150, 105, 0.08)' : 'var(--gray-100)', border: selectedCulinarySpot.hasCampsite ? '1px solid var(--primary-300)' : '1px solid var(--card-border)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: culinaryCampsites.length > 0 ? '0.75rem' : 0 }}>
                    <div style={{ fontSize: '1.5rem' }}>{selectedCulinarySpot.hasCampsite ? '🚐' : '🏕️'}</div>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: selectedCulinarySpot.hasCampsite ? 'var(--primary-900)' : 'var(--gray-800)', margin: '0 0 0.2rem 0' }}>
                        {selectedCulinarySpot.hasCampsite ? 'Wohnmobilstellplatz direkt vor Ort' : 'Übernachtungsempfehlung für Camper'}
                      </h4>
                      <p style={{ fontSize: '0.84rem', color: 'var(--gray-700)', margin: 0, lineHeight: '1.4' }}>
                        {selectedCulinarySpot.pitchNote || 'Mehrere verifizierte Camping- und Stellplätze befinden sich in unmittelbarer Nähe.'}
                      </p>
                    </div>
                  </div>

                  {/* Inline Nearby Campsites */}
                  {isLoadingCulinaryCampsites ? (
                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontStyle: 'italic', margin: '0.5rem 0 0 0' }}>
                      Suche verifizierte Stellplätze in der Nähe...
                    </p>
                  ) : culinaryCampsites.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Verifizierte Plätze in der Umgebung ({culinaryCampsites.length}):
                      </div>
                      {culinaryCampsites.slice(0, 3).map((cp) => (
                        <div
                          key={cp.id}
                          onClick={() => {
                            closeCulinarySpot();
                            setSelectedPlace(cp);
                          }}
                          style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '10px',
                            padding: '0.55rem 0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          className="hover:border-primary-500 hover:shadow-sm"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                            <span style={{ fontSize: '1.15rem' }}>🏕️</span>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {cp.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--gray-500)' }}>
                                {cp.locality || cp.region || selectedCulinarySpot.region}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)', flexShrink: 0 }}>
                            Ansehen →
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Address & Actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} />
                    <span>{selectedCulinarySpot.address}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedCulinarySpot.phone && (
                      <a
                        href={`tel:${selectedCulinarySpot.phone}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--gray-100)', color: 'var(--gray-800)', padding: '0.5rem 0.9rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}
                      >
                        📞 Anrufen
                      </a>
                    )}
                    {selectedCulinarySpot.website && (
                      <a
                        href={selectedCulinarySpot.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-600)', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} />
                        <span>Website</span>
                      </a>
                    )}
                    <button
                      onClick={() => openNearbyCampsitesForCulinary(selectedCulinarySpot)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--gray-900)', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', border: 'none' }}
                    >
                      <MapIcon size={14} />
                      <span>Plätze in der Nähe ({isLoadingCulinaryCampsites ? '...' : culinaryCampsites.length})</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Explore / Search Mode */}
        {activeTab === 'explore' && (
            <div>
              {/* AI Search Hero Area (nur auf der Startseite) */}
              {!hasSearched && !selectedCountryView && currentHub === 'all' && (
              <div className="hero-banner">
                {!hasSearched && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.2)', color: 'white', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase', backdropFilter: 'blur(4px)' }}>
                    <Sparkles size={12} />
                    Early Beta — AI Search
                  </div>
                )}
                <h1 className="hero-title">
                  {t.heroTitle}
                </h1>
                {!hasSearched && (
                  <p className="hero-subtitle">
                    {t.heroSubtitle}
                  </p>
                )}

                {/* Natural Language Search Bar */}
                <form onSubmit={handleSearch} className="hero-search-form">
                  <div className="hero-search-input-wrapper">
                    <Search size={20} className="hero-search-icon" />
                    <input 
                      type="text" 
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="hero-search-input"
                    />
                  </div>
                  <button type="submit" className="hero-search-btn search-submit-btn">
                    <Sparkles size={16} />
                    <span>{t.searchBtn}</span>
                  </button>
                </form>
              </div>
              )}

              {/* Unique Brand Info Panel (Forest Green Outdoor Vibe) - Nur auf der Übersicht */}
              {!hasSearched && !selectedCountryView && currentHub === 'all' && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', 
                  borderRadius: '24px', 
                  padding: '2rem', 
                  color: 'white', 
                  marginBottom: '1.75rem',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2rem',
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

              {/* Quick Hub Navigation Cards (in Overview Mode) */}
              {!hasSearched && !selectedCountryView && currentHub === 'all' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Compass size={20} className="text-primary-600" />
                    Themenwelten für Camper entdecken
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
                    <div onClick={() => handleHubSelect('camping')} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }} className="hover:scale-102 hover:shadow-md hover:border-emerald-500">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏕️</div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.25rem 0' }}>Camping & Stellplätze</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: 0 }}>Über 20.000 geprüfte Plätze in ganz Europa mit KI-Suche.</p>
                    </div>
                    <div onClick={() => handleHubSelect('genuss')} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }} className="hover:scale-102 hover:shadow-md hover:border-purple-500">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍇</div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.25rem 0' }}>Hofläden & Winzer</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: 0 }}>Weingüter, Bio-Bauernhöfe & 24h-Regiomaten direkt ab Erzeuger.</p>
                    </div>
                    <div onClick={() => handleHubSelect('touren')} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }} className="hover:scale-102 hover:shadow-md hover:border-blue-500">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥾</div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.25rem 0' }}>Wander- & Radwege</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: 0 }}>100+ Fernwege mit GPX-Tracks & Stellplätzen am Weg.</p>
                    </div>
                    <div onClick={() => handleHubSelect('events')} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }} className="hover:scale-102 hover:shadow-md hover:border-amber-500">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.25rem 0' }}>Events & Weinfeste</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: 0 }}>Weinfeste, Festivals & Traditionen mit Camping in der Nähe.</p>
                    </div>
                    <div onClick={() => handleHubSelect('highlights')} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }} className="hover:scale-102 hover:shadow-md hover:border-emerald-500">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏰</div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.25rem 0' }}>Sehenswürdigkeiten</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: 0 }}>Burgen, Schlösser, Naturparke und Highlights in Europa.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Genuss Hub: Hofläden, Weingüter & 24h-Regiomaten */}
              {!hasSearched && !selectedCountryView && currentHub === 'genuss' && (
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#9333ea15', color: '#9333ea', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        <Wine size={13} />
                        Regionale Erzeuger & Open Data
                      </div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🍇 Hofläden, Weingüter & Direktvermarkter
                      </h2>
                      <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', margin: 0 }}>
                        Regionale Winzerstuben, Bio-Bauernhöfe, Almsennereien und 24/7-Regiomaten für deinen kulinarischen Roadtrip-Stopp.
                      </p>
                    </div>

                    {/* Right Controls: View Mode & State Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {/* View Mode Toggle */}
                      <div className="view-mode-toggle-group">
                        <button
                          type="button"
                          onClick={() => setCulinaryViewMode('split')}
                          className={`view-mode-btn ${culinaryViewMode === 'split' ? 'active' : ''}`}
                          title="Geteilt (Liste + Karte)"
                        >
                          <ColumnsIcon size={15} />
                          <span className="hidden sm:inline">Geteilt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCulinaryViewMode('map')}
                          className={`view-mode-btn ${culinaryViewMode === 'map' ? 'active' : ''}`}
                          title="Große Karte"
                        >
                          <MapIcon size={15} />
                          <span className="hidden sm:inline">Große Karte</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCulinaryViewMode('grid')}
                          className={`view-mode-btn ${culinaryViewMode === 'grid' ? 'active' : ''}`}
                          title="Kacheln"
                        >
                          <ListIcon size={15} />
                          <span className="hidden sm:inline">Kacheln</span>
                        </button>
                      </div>

                      {/* State Filter */}
                      <div style={{ position: 'relative', minWidth: '180px' }}>
                        <select
                          aria-label="Bundesland Filter Hofläden und Weingüter"
                          value={culinaryStateFilter}
                          onChange={(e) => setCulinaryStateFilter(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 2rem 0.45rem 0.75rem',
                            borderRadius: '10px',
                            border: culinaryStateFilter !== 'Alle Bundesländer' ? '1.5px solid var(--primary-600)' : '1px solid var(--card-border)',
                            background: culinaryStateFilter !== 'Alle Bundesländer' ? 'var(--primary-50)' : 'var(--card-bg)',
                            color: culinaryStateFilter !== 'Alle Bundesländer' ? 'var(--primary-800)' : 'var(--gray-800)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none',
                            WebkitAppearance: 'none'
                          }}
                        >
                          {GERMAN_STATES_LIST.map((st) => (
                            <option key={st} value={st}>
                              {st === 'Alle Bundesländer' ? `📍 ${st}` : st}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--gray-500)' }} />
                      </div>
                    </div>
                  </div>

                  {/* Filter Tabs & Search Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: `✨ Alle (${culinaryCategoryCounts.all})` },
                        { id: 'winery', label: `🍷 Weingüter & Winzer (${culinaryCategoryCounts.winery})` },
                        { id: 'farm_shop', label: `🚜 Hofläden & Bio-Höfe (${culinaryCategoryCounts.farm_shop})` },
                        { id: 'cheese_dairy', label: `🧀 Schaukäsereien (${culinaryCategoryCounts.cheese_dairy})` },
                        { id: 'regiomat', label: `🥩 24h-Regiomaten (${culinaryCategoryCounts.regiomat})` },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCulinaryFilter(cat.id as any)}
                          style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '9999px',
                            border: culinaryFilter === cat.id ? '1.5px solid var(--primary-600)' : '1px solid var(--card-border)',
                            background: culinaryFilter === cat.id ? 'var(--primary-50)' : 'var(--card-bg)',
                            color: culinaryFilter === cat.id ? 'var(--primary-800)' : 'var(--gray-700)',
                            fontSize: '0.82rem',
                            fontWeight: culinaryFilter === cat.id ? 800 : 600,
                            cursor: 'pointer',
                            boxShadow: culinaryFilter === cat.id ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Quick Search */}
                    <div style={{ position: 'relative', minWidth: '220px', flex: '1', maxWidth: '340px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                      <input
                        type="text"
                        placeholder="Erzeuger, Ort, Produkte suchen..."
                        value={culinarySearchText}
                        onChange={(e) => setCulinarySearchText(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.75rem 0.45rem 2rem',
                          borderRadius: '10px',
                          border: '1px solid var(--card-border)',
                          background: 'var(--card-bg)',
                          fontSize: '0.82rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Culinary Content Layout based on culinaryViewMode */}
                  {filteredCulinarySpots.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Keine Erzeuger gefunden</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Probiere einen anderen Suchbegriff oder wähle ein anderes Bundesland.</p>
                    </div>
                  ) : (
                    <div>
                      {/* MAP ONLY VIEW */}
                      {culinaryViewMode === 'map' && (
                        <div style={{ height: '640px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
                          <div ref={culinaryOverviewMapContainerRef} style={{ height: '100%', width: '100%' }} />
                        </div>
                      )}

                      {/* SPLIT VIEW (List + Sticky Map) */}
                      {culinaryViewMode === 'split' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '740px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {filteredCulinarySpots.slice(0, visibleCulinaryCount).map((spot) => (
                              <div
                                key={spot.id}
                                onClick={() => openCulinarySpot(spot)}
                                style={{
                                  background: 'var(--card-bg)',
                                  border: '1px solid var(--card-border)',
                                  borderRadius: '14px',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  gap: '0.85rem',
                                  padding: '0.75rem',
                                  boxShadow: 'var(--shadow-sm)',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                  minHeight: '115px',
                                  transition: 'all 0.15s ease'
                                }}
                                className="hover:border-primary-500 hover:shadow-md"
                              >
                                <div style={{ width: '115px', minHeight: '100px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'var(--gray-200)' }}>
                                  <img
                                    src={spot.image_url || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80'}
                                    alt={spot.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80';
                                    }}
                                  />
                                </div>
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: spot.type === 'winery' ? '#9333ea' : spot.type === 'cheese_dairy' ? '#d97706' : spot.type === 'regiomat' ? '#0284c7' : '#16a34a', textTransform: 'uppercase' }}>
                                        {spot.subtypeLabel}
                                      </span>
                                      {spot.hasCampsite && (
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#ecfdf5', color: '#059669' }}>
                                          🚐 Stellplatz
                                        </span>
                                      )}
                                    </div>
                                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.25rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
                                      {spot.name}
                                    </h4>
                                    <p style={{ fontSize: '0.74rem', color: 'var(--gray-500)', margin: 0 }}>
                                      📍 {spot.address || spot.region || spot.state}
                                    </p>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--gray-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                      {spot.products.slice(0, 2).join(' · ')}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                                      Details →
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {visibleCulinaryCount < filteredCulinarySpots.length && (
                              <button
                                onClick={() => setVisibleCulinaryCount(prev => prev + 24)}
                                style={{ padding: '0.65rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-700)', cursor: 'pointer', flexShrink: 0 }}
                              >
                                Mehr Orte laden ({filteredCulinarySpots.length - visibleCulinaryCount} verbleibend)
                              </button>
                            )}
                          </div>
                          <div style={{ height: '740px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '1.5rem' }}>
                            <div ref={culinaryOverviewMapContainerRef} style={{ height: '100%', width: '100%' }} />
                          </div>
                        </div>
                      )}

                      {/* GRID VIEW */}
                      {culinaryViewMode === 'grid' && (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                            {filteredCulinarySpots.slice(0, visibleCulinaryCount).map((spot) => (
                              <div
                                key={spot.id}
                                onClick={() => openCulinarySpot(spot)}
                                style={{
                                  background: 'var(--card-bg)',
                                  border: '1px solid var(--card-border)',
                                  borderRadius: '16px',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  boxShadow: 'var(--shadow-sm)',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                className="hover:scale-102 hover:shadow-md"
                              >
                                <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden', background: 'var(--gray-200)' }}>
                                  <img
                                    src={spot.image_url || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80'}
                                    alt={spot.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80';
                                    }}
                                  />
                                  <span
                                    style={{
                                      position: 'absolute',
                                      top: '10px',
                                      left: '10px',
                                      background: spot.type === 'winery' ? '#9333ea' : spot.type === 'cheese_dairy' ? '#d97706' : spot.type === 'regiomat' ? '#0284c7' : '#16a34a',
                                      color: 'white',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      textTransform: 'uppercase',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                  >
                                    {spot.subtypeLabel}
                                  </span>
                                  {spot.hasCampsite && (
                                    <span
                                      style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'rgba(5, 150, 105, 0.95)',
                                        color: 'white',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                      }}
                                    >
                                      🚐 Stellplatz am Hof
                                    </span>
                                  )}
                                </div>

                                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    <MapPin size={13} />
                                    <span>{spot.region} · {spot.state}</span>
                                  </div>
                                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.5rem 0', lineHeight: '1.3' }}>
                                    {spot.name}
                                  </h3>
                                  <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', margin: '0 0 0.85rem 0', lineHeight: '1.45', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {spot.description}
                                  </p>

                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: 'auto' }}>
                                    {spot.products.slice(0, 3).map((p, idx) => (
                                      <span key={idx} style={{ background: 'var(--gray-100)', color: 'var(--gray-700)', padding: '2px 7px', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 600 }}>
                                        {p}
                                      </span>
                                    ))}
                                    {spot.products.length > 3 && (
                                      <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)', alignSelf: 'center' }}>
                                        +{spot.products.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {visibleCulinaryCount < filteredCulinarySpots.length && (
                            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                              <button
                                onClick={() => setVisibleCulinaryCount(prev => prev + 24)}
                                style={{
                                  padding: '0.75rem 2rem',
                                  background: 'var(--card-bg)',
                                  border: '1.5px solid var(--primary-600)',
                                  borderRadius: '9999px',
                                  fontSize: '0.9rem',
                                  fontWeight: 800,
                                  color: 'var(--primary-800)',
                                  cursor: 'pointer',
                                  boxShadow: 'var(--shadow-sm)'
                                }}
                              >
                                Weitere Hofläden & Winzer laden ({filteredCulinarySpots.length - visibleCulinaryCount} verbleibend)
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Unified Country Explorer Section */}
              {!hasSearched && !selectedCountryView && (currentHub === 'camping' || currentHub === 'highlights') && (() => {
                const isHighlightsHub = currentHub === 'highlights';
                const explorerTab = isHighlightsHub ? 'attractions' : 'camping';
                return (
                <div style={{ marginBottom: '1.75rem' }}>
                  
                  {/* Inspiration Row: Dynamic sample cards */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: isHighlightsHub ? 'rgba(124, 58, 237, 0.1)' : 'rgba(5, 150, 105, 0.1)', color: isHighlightsHub ? '#7c3aed' : '#059669', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        <Sparkles size={13} />
                        {isHighlightsHub ? 'Ausgewählte Highlights' : 'Ausgewählte Camping-Tipps'}
                      </div>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.25rem 0' }}>
                        {isHighlightsHub ? '✨ Zur Inspiration: Besondere Sehenswürdigkeiten' : '✨ Zur Inspiration: Beliebte Camping- & Stellplätze'}
                      </h2>
                      <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', margin: 0 }}>
                        {isHighlightsHub 
                          ? 'Kleine zufällige Auswahl faszinierender Schlösser, Naturwunder und Reiseziele in Europa'
                          : 'Kleine zufällige Auswahl handverlesener Camping- und Stellplätze für deine nächste Tour'}
                      </p>
                    </div>

                    {/* Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                      {isHighlightsHub ? (
                        sampleHighlightsList.map((spot) => (
                          <div
                            key={spot.id}
                            onClick={() => openPlace(spot.place as unknown as Place)}
                            style={{
                              background: 'var(--card-bg)',
                              border: '1px solid var(--card-border)',
                              borderRadius: '16px',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: 'var(--shadow-sm)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            className="hover:scale-102 hover:shadow-md"
                          >
                            <div style={{ position: 'relative', height: '165px', width: '100%', overflow: 'hidden', background: 'var(--gray-200)' }}>
                              <img
                                src={spot.imageUrl}
                                alt={spot.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '10px',
                                  left: '10px',
                                  background: '#7c3aed',
                                  color: 'white',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              >
                                {spot.categoryLabel}
                              </span>
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '10px',
                                  right: '10px',
                                  background: 'rgba(0,0,0,0.6)',
                                  backdropFilter: 'blur(4px)',
                                  color: 'white',
                                  padding: '3px 7px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}
                              >
                                {spot.flag} {spot.country}
                              </span>
                            </div>

                            <div style={{ padding: '1.15rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.3rem', fontWeight: 600 }}>
                                <MapPin size={13} />
                                <span>{spot.region}</span>
                              </div>
                              <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.4rem 0', lineHeight: '1.3' }}>
                                {spot.name}
                              </h3>
                              <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: '0 0 0.75rem 0', lineHeight: '1.4', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {spot.description}
                              </p>
                              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--gray-100)', paddingTop: '0.65rem' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  🔎 Details & Camping in der Nähe
                                </span>
                                <ChevronRight size={15} style={{ color: 'var(--primary-700)' }} />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        sampleCampingList.map((spot) => (
                          <div
                            key={spot.id}
                            onClick={() => openPlace(spot.place as unknown as Place)}
                            style={{
                              background: 'var(--card-bg)',
                              border: '1px solid var(--card-border)',
                              borderRadius: '16px',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: 'var(--shadow-sm)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            className="hover:scale-102 hover:shadow-md"
                          >
                            <div style={{ position: 'relative', height: '165px', width: '100%', overflow: 'hidden', background: 'var(--gray-200)' }}>
                              <img
                                src={spot.imageUrl}
                                alt={spot.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '10px',
                                  left: '10px',
                                  background: '#059669',
                                  color: 'white',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              >
                                {spot.categoryLabel}
                              </span>
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '10px',
                                  right: '10px',
                                  background: 'rgba(0,0,0,0.6)',
                                  backdropFilter: 'blur(4px)',
                                  color: 'white',
                                  padding: '3px 7px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}
                              >
                                {spot.flag} {spot.country}
                              </span>
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: '10px',
                                  left: '10px',
                                  background: 'rgba(0,0,0,0.7)',
                                  color: '#facc15',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800
                                }}
                              >
                                {spot.highlightTag}
                              </span>
                            </div>

                            <div style={{ padding: '1.15rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.3rem', fontWeight: 600 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <MapPin size={13} />
                                  <span>{spot.region}</span>
                                </div>
                                <span style={{ color: '#d97706', fontWeight: 700 }}>
                                  ⭐ {spot.rating} ({spot.reviewsCount})
                                </span>
                              </div>
                              <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.4rem 0', lineHeight: '1.3' }}>
                                {spot.name}
                              </h3>
                              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--gray-100)', paddingTop: '0.65rem' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  🔎 Details & Platz ansehen
                                </span>
                                <ChevronRight size={15} style={{ color: 'var(--primary-700)' }} />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Countries Grid Section */}
                  <div style={{ marginBottom: '1.25rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isHighlightsHub ? '🏰 Alle Sehenswürdigkeiten nach Ländern' : '🌍 Alle Camping-Reiseziele nach Ländern'}
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', margin: 0 }}>
                      {isHighlightsHub
                        ? (t.attractionsByCountrySubtitle || 'Entdecke beliebte Parks, Schlösser und Sehenswürdigkeiten')
                        : (t.campgroundsByCountrySubtitle || 'Entdecke geprüfte Camping- und Stellplätze in ganz Europa')}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                    {Object.keys(COUNTRY_FLAGS).map((code) => {
                      const count = isHighlightsHub ? (attractionStats[code] || 0) : (countryStats[code] || 0);
                      if (isHighlightsHub && count === 0) return null;

                      return (
                        <div 
                          key={code}
                          onClick={() => openCountryView(code, explorerTab)}
                          style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '14px',
                            padding: '1rem 1.15rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                          className="hover:scale-102 hover:shadow-md hover:border-primary-400"
                        >
                          <div style={{ fontSize: '2.3rem', background: 'var(--gray-50)', padding: '0.35rem', borderRadius: '10px', width: '54px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {COUNTRY_FLAGS[code]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {getCountryName(code, currentLang)}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                                {isHighlightsHub ? `🏛️ ${count.toLocaleString('de-DE')} Ziele` : `🏕️ ${count.toLocaleString('de-DE')} Plätze`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                );
              })()}

              {/* Hiking & Cycling Trails Section */}
              {!hasSearched && !selectedCountryView && currentHub === 'touren' && (
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🥾 {t.trailsTitle || 'Wander- & Radfernwege'} <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: 'rgba(5, 150, 105, 0.12)', color: '#059669' }}>Open Data Germany ({trails.length}+)</span>
                      </h2>
                      <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', margin: 0 }}>
                        {t.trailsSubtitle || 'Offizielle Qualitätswanderwege und Radfernwege nach Bundesland gefiltert mit verifizierten Campingplätzen am Weg'}
                      </p>
                    </div>

                    {/* Search & Type Filters & View Mode Switcher */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Trail Search Input */}
                      <div style={{ position: 'relative', minWidth: '220px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)' }} />
                        <input
                          type="text"
                          value={trailSearchText}
                          onChange={(e) => { setTrailSearchText(e.target.value); setVisibleTrailsCount(12); }}
                          placeholder="Tour oder Region suchen..."
                          style={{
                            padding: '0.45rem 0.75rem 0.45rem 2rem',
                            borderRadius: '10px',
                            border: '1px solid var(--card-border)',
                            background: 'var(--card-bg)',
                            fontSize: '0.82rem',
                            color: 'var(--gray-900)',
                            outline: 'none',
                            width: '100%'
                          }}
                        />
                        {trailSearchText && (
                          <button
                            onClick={() => { setTrailSearchText(''); setVisibleTrailsCount(12); }}
                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-600)', cursor: 'pointer', fontSize: '1rem' }}
                          >×</button>
                        )}
                      </div>

                      {/* Bundesland Dropdown Selector */}
                      <div style={{ position: 'relative', minWidth: '190px' }}>
                        <select
                          id="trail-state-filter"
                          aria-label="Bundesland für Wander- und Radwege filtern"
                          value={trailStateFilter}
                          onChange={(e) => { setTrailStateFilter(e.target.value); setVisibleTrailsCount(12); }}
                          style={{
                            width: '100%',
                            padding: '0.45rem 2rem 0.45rem 0.75rem',
                            borderRadius: '10px',
                            border: trailStateFilter !== 'Alle Bundesländer' ? '1.5px solid var(--primary-600)' : '1px solid var(--card-border)',
                            background: trailStateFilter !== 'Alle Bundesländer' ? 'var(--primary-50)' : 'var(--card-bg)',
                            color: trailStateFilter !== 'Alle Bundesländer' ? 'var(--primary-800)' : 'var(--gray-800)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none',
                            WebkitAppearance: 'none'
                          }}
                        >
                          {GERMAN_STATES_LIST.map((st) => {
                            const count = stateCounts[st] || 0;
                            if (st !== 'Alle Bundesländer' && count === 0) return null;
                            return (
                              <option key={st} value={st}>
                                {st === 'Alle Bundesländer' ? `📍 ${st} (${count})` : `${st} (${count})`}
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--gray-500)' }} />
                      </div>

                      {/* Type Pills */}
                      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--gray-100)', padding: '4px', borderRadius: '12px' }}>
                        <button
                          onClick={() => { setTrailFilter('all'); setVisibleTrailsCount(12); }}
                          style={{
                            padding: '0.4rem 0.85rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: trailFilter === 'all' ? 'var(--card-bg)' : 'transparent',
                            color: trailFilter === 'all' ? 'var(--primary-700)' : 'var(--gray-600)',
                            boxShadow: trailFilter === 'all' ? 'var(--shadow-sm)' : 'none'
                          }}
                        >
                          {t.allTrails || 'Alle'}
                        </button>
                        <button
                          onClick={() => { setTrailFilter('hiking'); setVisibleTrailsCount(12); }}
                          style={{
                            padding: '0.4rem 0.85rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: trailFilter === 'hiking' ? 'var(--card-bg)' : 'transparent',
                            color: trailFilter === 'hiking' ? 'var(--primary-700)' : 'var(--gray-600)',
                            boxShadow: trailFilter === 'hiking' ? 'var(--shadow-sm)' : 'none'
                          }}
                        >
                          {t.hikingTrails || '🥾 Wandern'}
                        </button>
                        <button
                          onClick={() => { setTrailFilter('biking'); setVisibleTrailsCount(12); }}
                          style={{
                            padding: '0.4rem 0.85rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: trailFilter === 'biking' ? 'var(--card-bg)' : 'transparent',
                            color: trailFilter === 'biking' ? 'var(--primary-700)' : 'var(--gray-600)',
                            boxShadow: trailFilter === 'biking' ? 'var(--shadow-sm)' : 'none'
                          }}
                        >
                          {t.bikingTrails || '🚴 Radwege'}
                        </button>
                      </div>

                      {/* View Mode Switcher */}
                      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--gray-100)', padding: '4px', borderRadius: '12px' }}>
                        <button
                          onClick={() => { setTrailViewMode('grid'); setTimeout(() => trailsOverviewLeafletMapRef.current?.invalidateSize(), 150); }}
                          style={{
                            padding: '0.4rem 0.65rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: trailViewMode === 'grid' ? 'var(--card-bg)' : 'transparent',
                            color: trailViewMode === 'grid' ? 'var(--primary-700)' : 'var(--gray-600)',
                            boxShadow: trailViewMode === 'grid' ? 'var(--shadow-sm)' : 'none'
                          }}
                          title="Rasteransicht"
                        >
                          <ColumnsIcon size={14} />
                          <span className="hidden sm:inline">Raster</span>
                        </button>
                        <button
                          onClick={() => { setTrailViewMode('split'); setTimeout(() => trailsOverviewLeafletMapRef.current?.invalidateSize(), 150); }}
                          style={{
                            padding: '0.4rem 0.65rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: trailViewMode === 'split' ? 'var(--card-bg)' : 'transparent',
                            color: trailViewMode === 'split' ? 'var(--primary-700)' : 'var(--gray-600)',
                            boxShadow: trailViewMode === 'split' ? 'var(--shadow-sm)' : 'none'
                          }}
                          title="Split-Ansicht"
                        >
                          <ColumnsIcon size={14} style={{ transform: 'rotate(90deg)' }} />
                          <span className="hidden sm:inline">Split</span>
                        </button>
                        <button
                          onClick={() => { setTrailViewMode('map'); setTimeout(() => trailsOverviewLeafletMapRef.current?.invalidateSize(), 150); }}
                          style={{
                            padding: '0.4rem 0.65rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: trailViewMode === 'map' ? 'var(--card-bg)' : 'transparent',
                            color: trailViewMode === 'map' ? 'var(--primary-700)' : 'var(--gray-600)',
                            boxShadow: trailViewMode === 'map' ? 'var(--shadow-sm)' : 'none'
                          }}
                          title="Kartenansicht"
                        >
                          <MapIcon size={14} />
                          <span className="hidden sm:inline">Karte</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Results Count & Filter Summary */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--gray-500)', fontWeight: 600, flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span>
                        Zeige {Math.min(visibleTrailsCount, filteredTrails.length)} von {filteredTrails.length} Touren {trailStateFilter !== 'Alle Bundesländer' ? `in ${trailStateFilter}` : 'in ganz Deutschland'}
                      </span>
                      {trailStateFilter !== 'Alle Bundesländer' && (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.3rem', 
                          padding: '2px 8px', 
                          borderRadius: '9999px', 
                          background: 'var(--primary-100)', 
                          color: 'var(--primary-800)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          📍 {trailStateFilter}
                          <button
                            onClick={() => { setTrailStateFilter('Alle Bundesländer'); setVisibleTrailsCount(12); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-800)', fontSize: '0.85rem', padding: 0, lineHeight: 1 }}
                            title="Filter entfernen"
                          >×</button>
                        </span>
                      )}
                    </div>
                    {(trailSearchText || trailFilter !== 'all' || trailStateFilter !== 'Alle Bundesländer') && (
                      <button
                        onClick={() => {
                          setTrailFilter('all');
                          setTrailStateFilter('Alle Bundesländer');
                          setTrailSearchText('');
                          setVisibleTrailsCount(12);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Filter zurücksetzen
                      </button>
                    )}
                  </div>

                  {/* Trails Content Layout based on trailViewMode */}
                  {filteredTrails.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Keine Touren gefunden</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Probiere einen anderen Suchbegriff oder wähle ein anderes Bundesland.</p>
                    </div>
                  ) : (
                    <div>
                      {/* MAP ONLY VIEW */}
                      {trailViewMode === 'map' && (
                        <div style={{ height: '620px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
                          <div ref={trailsOverviewMapContainerRef} style={{ height: '100%', width: '100%' }} />
                        </div>
                      )}

                      {/* SPLIT VIEW (List + Sticky Map) */}
                      {trailViewMode === 'split' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '720px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {filteredTrails.slice(0, visibleTrailsCount).map((trail) => (
                              <div
                                key={trail.id}
                                onClick={() => openTrail(trail)}
                                style={{
                                  background: 'var(--card-bg)',
                                  border: '1px solid var(--card-border)',
                                  borderRadius: '14px',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  gap: '0.85rem',
                                  padding: '0.75rem',
                                  boxShadow: 'var(--shadow-sm)',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                  minHeight: '115px',
                                  transition: 'all 0.15s ease'
                                }}
                                className="hover:border-primary-500 hover:shadow-md"
                              >
                                <div style={{ width: '115px', minHeight: '100px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'var(--gray-200)' }}>
                                  <img
                                    src={cleanImageUrl(trail.image_url) || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'}
                                    alt={trail.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80';
                                    }}
                                  />
                                </div>
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: trail.type === 'biking' ? '#2563eb' : '#059669', textTransform: 'uppercase' }}>
                                        {trail.type === 'biking' ? '🚴 Radweg' : '🥾 Wanderweg'}
                                      </span>
                                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: trail.difficulty === 'easy' ? '#ecfdf5' : trail.difficulty === 'medium' ? '#fef3c7' : '#fee2e2', color: trail.difficulty === 'easy' ? '#059669' : trail.difficulty === 'medium' ? '#b45309' : '#dc2626' }}>
                                        {trail.difficulty === 'easy' ? 'Leicht' : trail.difficulty === 'medium' ? 'Mittel' : 'Schwer'}
                                      </span>
                                    </div>
                                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.25rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
                                      {trail.name}
                                    </h4>
                                    <p style={{ fontSize: '0.74rem', color: 'var(--gray-500)', margin: 0 }}>
                                      {trail.region || trail.state} · <strong>📍 {trail.distance_km} km</strong> {trail.duration_hours ? `· ⏱️ ${trail.duration_hours}h` : ''}
                                    </p>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669' }}>
                                      🏕️ {trail.distance_km < 25 ? 'Camping in der Nähe' : 'Camping an der Route'}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                                      Details →
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {visibleTrailsCount < filteredTrails.length && (
                              <button
                                onClick={() => setVisibleTrailsCount(prev => prev + 12)}
                                style={{ padding: '0.65rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-700)', cursor: 'pointer', flexShrink: 0 }}
                              >
                                Mehr Touren laden ({filteredTrails.length - visibleTrailsCount} verbleibend)
                              </button>
                            )}
                          </div>
                          <div style={{ height: '720px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '1.5rem' }}>
                            <div ref={trailsOverviewMapContainerRef} style={{ height: '100%', width: '100%' }} />
                          </div>
                        </div>
                      )}

                      {/* GRID VIEW */}
                      {trailViewMode === 'grid' && (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                            {filteredTrails.slice(0, visibleTrailsCount).map((trail) => (
                              <div
                                key={trail.id}
                                onClick={() => openTrail(trail)}
                                style={{
                                  background: 'var(--card-bg)',
                                  border: '1px solid var(--card-border)',
                                  borderRadius: '16px',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  boxShadow: 'var(--shadow-sm)',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                className="hover:scale-102 hover:shadow-md"
                              >
                                {/* Image banner */}
                                <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden', background: 'var(--gray-200)' }}>
                                  <img
                                    src={cleanImageUrl(trail.image_url) || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'}
                                    alt={trail.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80';
                                    }}
                                  />
                                  {/* Type Badge */}
                                  <span
                                    style={{
                                      position: 'absolute',
                                      top: '10px',
                                      left: '10px',
                                      background: trail.type === 'biking' ? '#2563eb' : trail.type === 'hiking' ? '#059669' : '#7c3aed',
                                      color: 'white',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                  >
                                    {trail.type === 'biking' ? '🚴 Radweg' : trail.type === 'hiking' ? '🥾 Wanderweg' : '🥾 & 🚴 Tour'}
                                  </span>

                                  {/* Difficulty Badge */}
                                  <span
                                    style={{
                                      position: 'absolute',
                                      top: '10px',
                                      right: '10px',
                                      background: trail.difficulty === 'easy' ? '#10b981' : trail.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                                      color: 'white',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                  >
                                    {trail.difficulty === 'easy' ? (t.difficultyEasy || 'Leicht') : trail.difficulty === 'medium' ? (t.difficultyMedium || 'Mittel') : (t.difficultyHard || 'Anspruchsvoll')}
                                  </span>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {trail.region} {trail.state && trail.state !== trail.region ? `· ${trail.state}` : ''}
                                      </span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 800 }}>
                                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                                        <span>{trail.rating}</span>
                                      </div>
                                    </div>

                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                                      {trail.name}
                                    </h3>

                                    {/* Trail specs */}
                                    <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.75rem', padding: '0.4rem 0.6rem', background: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                                      <span><strong>📍 {trail.distance_km} km</strong></span>
                                      {trail.duration_hours && <span><strong>⏱️ {trail.duration_hours}h</strong></span>}
                                      {trail.elevation_gain_m && <span><strong>⛰️ +{trail.elevation_gain_m}m</strong></span>}
                                    </div>

                                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: '1.45', marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                      {trail.description}
                                    </p>

                                    {/* Highlights chips */}
                                    {safeHighlights(trail.highlights).length > 0 && (
                                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        {safeHighlights(trail.highlights).slice(0, 3).map((hl, idx) => (
                                          <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--gray-100)', borderRadius: '4px', color: 'var(--gray-700)', fontWeight: 600 }}>
                                            ✓ {hl}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Footer */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                      🏕️ {trail.distance_km < 25 ? 'Camping in der Nähe' : 'Camping an der Route'}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTrail(trail);
                                      }}
                                      style={{
                                        background: 'var(--primary-600)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.45rem 0.85rem',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                      }}
                                      className="hover:bg-primary-700"
                                    >
                                      {t.exploreTrail || 'Details & Plätze'} →
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Load More Button */}
                          {visibleTrailsCount < filteredTrails.length && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                              <button
                                onClick={() => setVisibleTrailsCount(prev => prev + 12)}
                                style={{
                                  background: 'var(--card-bg)',
                                  border: '1px solid var(--card-border)',
                                  padding: '0.75rem 2rem',
                                  borderRadius: '12px',
                                  fontSize: '0.9rem',
                                  fontWeight: 700,
                                  color: 'var(--primary-700)',
                                  cursor: 'pointer',
                                  boxShadow: 'var(--shadow-sm)',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}
                                className="hover:border-primary-600 hover:shadow-md"
                              >
                                <span>🥾 Weitere {Math.min(12, filteredTrails.length - visibleTrailsCount)} Touren laden (noch {filteredTrails.length - visibleTrailsCount})</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Events & Wine Festivals Section (DZT Open Data Germany) */}
              {!hasSearched && !selectedCountryView && currentHub === 'events' && (
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🎉 {t.eventsTitle || 'Veranstaltungen & Weinfeste'} <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed' }}>Open Data Germany (DZT)</span>
                      </h2>
                      <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', margin: 0 }}>
                        {t.eventsSubtitle || 'Offizielle Events, Weinfeste, Märkte und Kulturhöhepunkte der Bundesländer mit direkter Stellplatzanbindung'}
                      </p>
                    </div>

                    {/* Search & Bundesland selector */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Event Search */}
                      <div style={{ position: 'relative', minWidth: '220px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)' }} />
                        <input
                          type="text"
                          value={eventSearchText}
                          onChange={(e) => { setEventSearchText(e.target.value); setVisibleEventsCount(12); }}
                          placeholder={t.searchEventsPlaceholder || "Event, Fest oder Ort suchen..."}
                          style={{
                            padding: '0.45rem 0.75rem 0.45rem 2rem',
                            borderRadius: '10px',
                            border: '1px solid var(--card-border)',
                            background: 'var(--card-bg)',
                            fontSize: '0.82rem',
                            color: 'var(--gray-900)',
                            outline: 'none',
                            width: '100%'
                          }}
                        />
                        {eventSearchText && (
                          <button
                            onClick={() => { setEventSearchText(''); setVisibleEventsCount(12); }}
                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-600)', cursor: 'pointer', fontSize: '1rem' }}
                          >×</button>
                        )}
                      </div>

                      {/* Bundesland Dropdown */}
                      <div style={{ position: 'relative', minWidth: '190px' }}>
                        <select
                          id="event-state-filter"
                          aria-label="Bundesland für Veranstaltungen filtern"
                          value={eventStateFilter}
                          onChange={(e) => { setEventStateFilter(e.target.value); setVisibleEventsCount(12); }}
                          style={{
                            width: '100%',
                            padding: '0.45rem 2rem 0.45rem 0.75rem',
                            borderRadius: '10px',
                            border: eventStateFilter !== 'Alle Bundesländer' ? '1.5px solid var(--primary-600)' : '1px solid var(--card-border)',
                            background: eventStateFilter !== 'Alle Bundesländer' ? 'var(--primary-50)' : 'var(--card-bg)',
                            color: eventStateFilter !== 'Alle Bundesländer' ? 'var(--primary-800)' : 'var(--gray-800)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none',
                            WebkitAppearance: 'none'
                          }}
                        >
                          {GERMAN_STATES_LIST.map((st) => (
                            <option key={st} value={st}>
                              {st === 'Alle Bundesländer' ? `📍 ${st}` : st}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--gray-500)' }} />
                      </div>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {[
                      { id: 'all', label: t.allEvents || 'Alle Events' },
                      { id: 'wine', label: t.wineEvents || '🍷 Weinfeste & Genuss' },
                      { id: 'culture', label: t.cultureEvents || '🎭 Kultur & Brauchtum' },
                      { id: 'festival', label: t.festivalEvents || '🎪 Festivals & Musik' },
                      { id: 'market', label: t.marketEvents || '🥖 Märkte & Stadtfeste' },
                      { id: 'sport', label: t.sportEvents || '🏃 Sport & Aktiv' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setEventCategory(cat.id as any); setVisibleEventsCount(12); }}
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: '9999px',
                          border: eventCategory === cat.id ? '1.5px solid var(--primary-600)' : '1px solid var(--card-border)',
                          background: eventCategory === cat.id ? 'var(--primary-50)' : 'var(--card-bg)',
                          color: eventCategory === cat.id ? 'var(--primary-800)' : 'var(--gray-700)',
                          fontSize: '0.82rem',
                          fontWeight: eventCategory === cat.id ? 800 : 600,
                          cursor: 'pointer',
                          boxShadow: eventCategory === cat.id ? 'var(--shadow-sm)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Events Grid */}
                  {filteredEvents.length === 0 && isLoadingEvents ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--gray-500)' }}>
                      <div className="spinner" style={{ width: '28px', height: '28px', margin: '0 auto 0.75rem auto' }}></div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.loadingEvents || 'Lade offizielle Open Data Veranstaltungen...'}</p>
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--gray-50)', borderRadius: '16px', border: '1px dashed var(--gray-300)' }}>
                      <p style={{ fontWeight: 700, color: 'var(--gray-700)', margin: '0 0 0.25rem 0' }}>
                        {t.noEventsFound || 'Keine Veranstaltungen für diesen Filter gefunden.'}
                      </p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', margin: 0 }}>
                        Versuche eine andere Kategorie oder wähle ein anderes Bundesland.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredEvents.slice(0, visibleEventsCount).map((event) => {
                          const dateDisplay = formatEventDate(event.startDate, event.endDate);
                          return (
                            <div
                              key={event.id}
                              className="event-card group"
                              style={{
                                background: 'var(--card-bg)',
                                borderRadius: '16px',
                                border: '1px solid var(--card-border)',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'all 0.25s ease'
                              }}
                            >
                              {/* Event Image */}
                              <div style={{ position: 'relative', height: '170px', background: 'var(--gray-100)', overflow: 'hidden' }}>
                                <img
                                  src={event.image_url || getEventFallback(event)}
                                  alt={event.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    const fallback = getEventFallback(event);
                                    if (target.src !== fallback) {
                                      target.src = fallback;
                                    }
                                  }}
                                />
                                {/* Date Badge */}
                                {dateDisplay && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    background: 'rgba(15, 23, 42, 0.85)',
                                    backdropFilter: 'blur(6px)',
                                    color: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                                  }}>
                                    <Calendar size={12} color="#fbbf24" />
                                    {dateDisplay}
                                  </div>
                                )}
                                {/* Locality Tag */}
                                {event.locality && (
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '10px',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    color: 'var(--gray-900)',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                                  }}>
                                    <MapPin size={11} className="text-primary-600" />
                                    {event.locality}
                                  </div>
                                )}
                              </div>

                              {/* Event Content */}
                              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.4rem 0', lineHeight: 1.3 }}>
                                  {event.name}
                                </h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', margin: '0 0 0.85rem 0', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                                  {event.description || 'Offizielle Veranstaltung im DZT Tourismus-Kalender.'}
                                </p>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
                                  <button
                                    onClick={() => openEventDetails(event)}
                                    style={{
                                      flex: 1,
                                      padding: '0.5rem 0.65rem',
                                      borderRadius: '10px',
                                      background: 'var(--primary-50)',
                                      border: '1px solid var(--primary-200)',
                                      color: 'var(--primary-800)',
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.35rem',
                                      transition: 'all 0.15s ease'
                                    }}
                                    className="hover:bg-primary-100"
                                    title="Campings & Stellplätze in dieser Umgebung suchen"
                                  >
                                    ⛺ {t.campsitesNearEvent || 'Stellplätze in der Nähe'}
                                  </button>
                                  <button
                                    onClick={() => openEventDetails(event)}
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      borderRadius: '10px',
                                      background: 'var(--gray-100)',
                                      border: 'none',
                                      color: 'var(--gray-800)',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem'
                                    }}
                                    className="hover:bg-gray-200"
                                  >
                                    Details <ChevronRight size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {visibleEventsCount < filteredEvents.length && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                          <button
                            onClick={() => setVisibleEventsCount(prev => prev + 12)}
                            style={{
                              background: 'var(--card-bg)',
                              border: '1px solid var(--card-border)',
                              padding: '0.75rem 2rem',
                              borderRadius: '12px',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: 'var(--primary-700)',
                              cursor: 'pointer',
                              boxShadow: 'var(--shadow-sm)',
                              transition: 'all 0.2s ease'
                            }}
                            className="hover:border-primary-600 hover:shadow-md"
                          >
                            <span>🎉 Weitere {Math.min(12, filteredEvents.length - visibleEventsCount)} Events laden (noch {filteredEvents.length - visibleEventsCount})</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
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

                  {/* Action Bar */}
                  <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1.25rem' }}>
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

                  {REGIONS_BY_COUNTRY[selectedCountryView] && (() => {
                    const availableStates = REGIONS_BY_COUNTRY[selectedCountryView].states.filter(state => !(subdivisionStats[state] !== undefined && subdivisionStats[state] === 0));
                    const availablePopular = REGIONS_BY_COUNTRY[selectedCountryView].popular.filter(reg => !(subdivisionStats[reg] !== undefined && subdivisionStats[reg] === 0));
                    const hasBoth = availableStates.length > 0 && availablePopular.length > 0;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Segment switcher between Bundesländer / Urlaubsregionen */}
                        {hasBoth && (
                          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--gray-100)', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
                            <button
                              onClick={() => setSubdivisionViewMode('states')}
                              style={{
                                padding: '0.45rem 0.9rem',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                background: subdivisionViewMode === 'states' ? 'var(--card-bg)' : 'transparent',
                                color: subdivisionViewMode === 'states' ? 'var(--primary-700)' : 'var(--gray-600)',
                                boxShadow: subdivisionViewMode === 'states' ? 'var(--shadow-sm)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <MapPin size={14} />
                              <span>{countryTab === 'camping' ? t.regionsStates : t.attractionsRegions} ({availableStates.length})</span>
                            </button>
                            <button
                              onClick={() => setSubdivisionViewMode('popular')}
                              style={{
                                padding: '0.45rem 0.9rem',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                background: subdivisionViewMode === 'popular' ? 'var(--card-bg)' : 'transparent',
                                color: subdivisionViewMode === 'popular' ? 'var(--primary-700)' : 'var(--gray-600)',
                                boxShadow: subdivisionViewMode === 'popular' ? 'var(--shadow-sm)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Compass size={14} />
                              <span>{countryTab === 'camping' ? t.regionsPopular : t.attractionsPopular} ({availablePopular.length})</span>
                            </button>
                          </div>
                        )}

                        {/* States Grid */}
                        {(!hasBoth || subdivisionViewMode === 'states') && availableStates.length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gray-800)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              📍 {countryTab === 'camping' ? t.regionsStates : t.attractionsRegions}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.65rem' }}>
                              {availableStates.map((state) => (
                                <button 
                                  key={state}
                                  onClick={() => handleSearch(undefined, countryTab === 'camping' ? `Camping in ${state}` : `Sehenswürdigkeiten in ${state}`)}
                                  style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '0.75rem 0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.65rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                                  className="hover-card-btn hover:border-primary-400"
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                    <MapPin size={16} style={{ color: 'var(--primary-700)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {state.replace(/ \(Kanton\)/gi, '').replace(/ \(Luxemburg\)/gi, '').replace(/ \(Wallonien\)/gi, '').replace(/ \(Lappland\)/gi, '')}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', borderRadius: '9999px', background: 'var(--primary-50)', color: 'var(--primary-700)', flexShrink: 0 }}>
                                    {subdivisionStats[state] !== undefined 
                                      ? (countryTab === 'camping' 
                                          ? `${subdivisionStats[state]} Plätze`
                                          : `${subdivisionStats[state]} Ziele`)
                                      : '...'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Popular Regions Grid */}
                        {(!hasBoth || subdivisionViewMode === 'popular') && availablePopular.length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gray-800)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              🏖️ {countryTab === 'camping' ? t.regionsPopular : t.attractionsPopular}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.65rem' }}>
                              {availablePopular.map((reg) => (
                                <button 
                                  key={reg}
                                  onClick={() => handleSearch(undefined, countryTab === 'camping' ? `Camping ${reg}` : `Sehenswürdigkeiten in ${reg}`)}
                                  style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '0.75rem 0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.65rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                                  className="hover-card-btn hover:border-primary-400"
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                    <Compass size={16} style={{ color: 'var(--primary-700)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {reg}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', borderRadius: '9999px', background: 'var(--primary-50)', color: 'var(--primary-700)', flexShrink: 0 }}>
                                    {subdivisionStats[reg] !== undefined 
                                      ? (countryTab === 'camping' 
                                          ? `${subdivisionStats[reg]} Plätze`
                                          : `${subdivisionStats[reg]} Ziele`)
                                      : '...'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Results Grid Section - nur bei aktiver Suche */}
              {hasSearched && (
                <div>
                  <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
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
                          id="featured-country-select"
                          aria-label="Land für Highlights und Campingplätze auswählen"
                          value={featuredCountry}
                          onChange={(e) => setFeaturedCountry(e.target.value)}
                          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0.25rem 0.75rem', fontSize: '1rem', fontWeight: 700, color: 'var(--primary-700)', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="ALL">{currentLang === 'en' ? 'All Europe' : currentLang === 'fr' ? "Toute l'Europe" : currentLang === 'it' ? 'Tutta Europa' : currentLang === 'nl' ? 'Heel Europa' : 'Ganz Europa'}</option>
                          {Object.keys(COUNTRY_FLAGS).map((c) => (
                            <option key={c} value={c}>{getCountryName(c, currentLang)}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    </h2>

                    {hasSearched && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {/* View Mode Segmented Controls */}
                        <div className="view-mode-toggle-group">
                          <button
                            type="button"
                            onClick={() => setViewMode('split')}
                            className={`view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                            title={t.viewSplit || 'Geteilt'}
                          >
                            <ColumnsIcon size={15} />
                            <span className="hidden sm:inline">{t.viewSplit || 'Geteilt'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewMode('map')}
                            className={`view-mode-btn ${viewMode === 'map' ? 'active' : ''}`}
                            title={t.viewMap || 'Große Karte'}
                          >
                            <MapIcon size={15} />
                            <span className="hidden sm:inline">{t.viewMap || 'Große Karte'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                            title={t.viewList || 'Nur Liste'}
                          >
                            <ListIcon size={15} />
                            <span className="hidden sm:inline">{t.viewList || 'Nur Liste'}</span>
                          </button>
                        </div>

                        <button onClick={resetSearch} style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>{t.resetSearch}</button>
                      </div>
                    )}
                  </div>

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
                      background: 'var(--card-bg)', 
                      border: '1px solid var(--card-border)', 
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
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)' }}>
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

                    <div className={`results-layout view-${viewMode}`}>
                      <div className="results-list">
                    {searchSummary && (
                      <div 
                        className="search-summary-card"
                        style={{ 
                          background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--card-bg) 100%)', 
                          border: '1px solid var(--card-border)',
                          borderLeft: '4px solid var(--primary-600)',
                          boxShadow: 'var(--shadow-sm)',
                          borderRadius: '12px', 
                          padding: '1.5rem', 
                          marginBottom: '2rem', 
                          color: 'var(--gray-800)', 
                          fontSize: '1rem', 
                          lineHeight: '1.6' 
                        }}
                      >
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-700)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          ✨ {recommendationTitle || t.guideSummaryTitle || 'CampingRoute Reiseführer-Zusammenfassung'}
                        </h3>
                        <div 
                          dangerouslySetInnerHTML={{ __html: searchSummary }} 
                          style={{ fontSize: '0.95rem', color: 'var(--gray-700)' }}
                        />
                      </div>
                    )}

                    {/* Places cards grid */}
                    <div className="places-cards-grid" style={{ display: 'grid', gridTemplateColumns: viewMode === 'split' ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                    {places.map((place) => {
                      const imageUrl = getImageUrl(place);
                      const cleanDescription = getCleanDescription(place);
                      const isCurated = place.is_curated || curatedIds.includes(place.id);

                      return (
                        <div 
                          key={place.id} 
                          className="place-grid-card" 
                          onClick={() => openPlace(place)}
                          onMouseEnter={() => highlightMapMarker(place.id)}
                          onMouseLeave={() => unhighlightMapMarker(place.id)}
                          style={{
                            background: 'var(--card-bg)',
                            border: isCurated ? '2px solid var(--primary-500)' : '1px solid var(--card-border)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: isCurated ? '0 4px 16px rgba(16, 185, 129, 0.15)' : 'var(--shadow-sm)',
                            position: 'relative',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          }}
                        >
                          {/* Image Box */}
                          <div style={{ position: 'relative', height: '160px', width: '100%', background: 'var(--gray-200)', overflow: 'hidden' }}>
                            <img 
                              src={imageUrl || getFallbackImage(place)} 
                              alt={place.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.src = getFallbackImage(place);
                              }}
                            />
                            {/* Type Badge */}
                            <span 
                              style={{ 
                                position: 'absolute', 
                                top: '10px', 
                                left: '10px', 
                                background: isCurated ? '#059669' : place.type === 'campground' ? '#10b981' : place.type === 'caravan' ? '#3b82f6' : place.type === 'glamping' ? '#8b5cf6' : '#f97316', 
                                color: 'white', 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                fontSize: '0.7rem', 
                                fontWeight: 800, 
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                            >
                              {isCurated ? (t.topRecommendation || 'Top-Empfehlung') : getTypeLabel(place.type)}
                            </span>

                            {/* Stage Badge if Route */}
                            {place.stage_number && (
                              <span 
                                style={{ 
                                  position: 'absolute', 
                                  top: '10px', 
                                  right: '10px', 
                                  background: '#059669', 
                                  color: 'white', 
                                  padding: '3px 8px', 
                                  borderRadius: '6px', 
                                  fontSize: '0.7rem', 
                                  fontWeight: 800,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              >
                                {(t.stageNumber || 'Etappe {{number}}').replace('{{number}}', String(place.stage_number))}
                              </span>
                            )}
                          </div>

                          {/* Content Box */}
                          <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.25rem', lineHeight: '1.3' }}>
                                {place.name}
                              </h3>
                              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {place.address || `${place.latitude.toFixed(3)}, ${place.longitude.toFixed(3)}`}
                              </p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.8em' }}>
                                {cleanDescription}
                              </p>
                            </div>

                            {/* Footer inside card */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--gray-100)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 800 }}>
                                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                <span>{place.rating || '4.5'}</span>
                              </div>
                              {place.distance_from_origin_km ? (
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                                  {(t.distanceAfterOrigin || 'nach {{km}} km ({{h}}h)')
                                    .replace('{{km}}', String(place.distance_from_origin_km))
                                    .replace('{{h}}', String(place.drive_hours_from_origin || 0))}
                                </span>
                              ) : place.distance_km ? (
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                                  {(t.distanceAway || '{{km}} km entfernt').replace('{{km}}', String(place.distance_km))}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>

                    {/* Pagination */}
                    {totalItems > itemsPerPage && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                        {(() => {
                          const onPageClick = (targetPage: number) => {
                            if (places.length === totalItems && totalItems > 0) {
                              setCurrentPage(targetPage);
                            } else {
                              handleSearch(undefined, undefined, targetPage);
                            }
                          };
                          const totalPages = Math.ceil(totalItems / itemsPerPage);
                          const pages = [];
                          const range = 2;
                          const start = Math.max(1, currentPage - range);
                          const end = Math.min(totalPages, currentPage + range);

                          return (
                            <>
                              <button
                                disabled={currentPage === 1}
                                onClick={() => onPageClick(currentPage - 1)}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  border: '1px solid var(--card-border)',
                                  background: 'var(--card-bg)',
                                  color: currentPage === 1 ? 'var(--gray-300)' : 'var(--gray-700)',
                                  cursor: currentPage === 1 ? 'default' : 'pointer',
                                  fontSize: '0.95rem',
                                  fontWeight: 700,
                                  transition: 'all 0.2s'
                                }}
                              >
                                &lt;
                              </button>
                              
                              {start > 1 && (
                                <>
                                  <button
                                    onClick={() => onPageClick(1)}
                                    style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: '50%',
                                      border: currentPage === 1 ? 'none' : '1px solid var(--card-border)',
                                      background: currentPage === 1 ? 'var(--primary-600)' : 'var(--card-bg)',
                                      color: currentPage === 1 ? '#ffffff' : 'var(--gray-700)',
                                      cursor: 'pointer',
                                      fontSize: '0.85rem',
                                      fontWeight: 700
                                    }}
                                  >
                                    1
                                  </button>
                                  {start > 2 && <span style={{ color: 'var(--gray-600)', padding: '0 0.25rem' }}>...</span>}
                                </>
                              )}

                              {Array.from({ length: end - start + 1 }, (_, idx) => start + idx).map((i) => (
                                <button
                                  key={i}
                                  onClick={() => onPageClick(i)}
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    border: i === currentPage ? 'none' : '1px solid var(--card-border)',
                                    background: i === currentPage ? 'var(--primary-600)' : 'var(--card-bg)',
                                    color: i === currentPage ? '#ffffff' : 'var(--gray-700)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 700
                                  }}
                                >
                                  {i}
                                </button>
                              ))}

                              {end < totalPages && (
                                <>
                                  {end < totalPages - 1 && <span style={{ color: 'var(--gray-600)', padding: '0 0.25rem' }}>...</span>}
                                  <button
                                    onClick={() => onPageClick(totalPages)}
                                    style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: '50%',
                                      border: totalPages === currentPage ? 'none' : '1px solid var(--card-border)',
                                      background: totalPages === currentPage ? 'var(--primary-600)' : 'var(--card-bg)',
                                      color: totalPages === currentPage ? '#ffffff' : 'var(--gray-700)',
                                      cursor: 'pointer',
                                      fontSize: '0.85rem',
                                      fontWeight: 700
                                    }}
                                  >
                                    {totalPages}
                                  </button>
                                </>
                              )}

                              <button
                                disabled={currentPage === totalPages}
                                onClick={() => onPageClick(currentPage + 1)}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  border: '1px solid var(--card-border)',
                                  background: 'var(--card-bg)',
                                  color: currentPage === totalPages ? 'var(--gray-300)' : 'var(--gray-700)',
                                  cursor: currentPage === totalPages ? 'default' : 'pointer',
                                  fontSize: '0.95rem',
                                  fontWeight: 700,
                                  transition: 'all 0.2s'
                                }}
                              >
                                &gt;
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    )}
                      </div>

                      <div className="results-map-col">
                        {hasSearched && mapPoints.length > 0 && (
                          <div className="results-map-wrapper">
                            <div ref={resultsMapRef} style={{ width: '100%', height: '100%', minHeight: '380px', zIndex: 1 }} />
                            <div className="map-legend-overlay" style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', color: '#f8fafc', padding: '8px 14px', borderRadius: '10px', fontSize: '0.78rem', zIndex: 1000, pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.15)', lineHeight: 1.4 }}>
                              🗺️ {routeInfo 
                                ? `${mapPoints.length} Orte auf der Karte (Routenlinie von ${routeInfo.origin} nach ${routeInfo.destination})` 
                                : (t.mapLegend || '{{count}} Orte auf der Karte').replace('{{count}}', String(mapPoints.length))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Floating Map Toggle Button */}
                    {hasSearched && mapPoints.length > 0 && (
                      <div className="mobile-floating-map-wrapper md:hidden">
                        <button
                          type="button"
                          onClick={() => setViewMode(viewMode === 'map' ? 'split' : 'map')}
                          className="mobile-floating-map-btn"
                        >
                          {viewMode === 'map' ? <ListIcon size={18} /> : <MapIcon size={18} />}
                          <span>{viewMode === 'map' ? (t.showList || 'Liste anzeigen') : (t.showMap || 'Karte anzeigen')}</span>
                        </button>
                      </div>
                    )}
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
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>{t.noSavedPlacesInList || 'Noch keine gespeicherten Orte in diesem Roadtrip. Suche in "Entdecken" nach Orten und füge sie hinzu!'}</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {listItems.map((item) => (
                      <div 
                        key={item.id}
                        className="place-grid-card"
                        onClick={() => setSelectedPlace(item)}
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer' }}
                      >
                        <div style={{ padding: '1.25rem' }}>
                          <span className={`place-card-type ${item.type}`}>{getTypeLabel(item.type)}</span>
                          <h3 className="place-card-title" style={{ marginTop: '0.5rem', color: 'var(--gray-900)' }}>{item.name}</h3>
                          <p className="place-card-country" style={{ color: 'var(--gray-500)' }}>{item.address}</p>
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
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>{t.noRoadtrips}</p>
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
                        border: '1px solid var(--card-border)', 
                        borderRadius: 'var(--radius-md)', 
                        background: 'var(--card-bg)',
                        color: 'var(--gray-900)',
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
                  <label htmlFor="review-rating-select" className="form-label">{t.ratingLabel}</label>
                  <select 
                    id="review-rating-select"
                    aria-label="Bewertung in Sternen"
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
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 500 }}>{t.aiStep2Subtitle || 'Neueste Generationen 2026/2025'}</span>
                </label>

                {!isCustomModel ? (
                  <select
                    id="ai-model-select"
                    aria-label="KI-Modell auswählen"
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
                      color: 'var(--gray-600)',
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
                      background: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
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
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-700)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{t.mcpToolsHeader || 'Verfügbare MCP-Tools für deine KI (10 Tools)'}</span>
                  <span style={{ fontSize: '0.72rem', background: '#f5f3ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '9999px', fontWeight: 800 }}>10 Tools aktiv</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { name: 'search_places', cat: '🏕️ Camping & Stellplätze', desc: t.mcpTool1Desc || 'Sucht europaweit nach Campingplätzen, Stellplätzen & Sehenswürdigkeiten mit Filtern nach Land, Region, Ort, Typ & Merkmalen.' },
                    { name: 'get_place_details', cat: '🏕️ Camping & Stellplätze', desc: t.mcpTool2Desc || 'Liefert vollständige Kontaktdaten, Koordinaten, Preise, Sanitär-Ausstattung und Details zu einem Platz.' },
                    { name: 'get_german_trails', cat: '🥾 Wandern & Radfahren', desc: t.mcpTool8Desc || 'Durchsucht offizielle Wander- und Radfernwege mit GPX-Streckenverlauf, Höhenmetern und nahen Campingplätzen (DZT Knowledge Graph).' },
                    { name: 'get_german_events', cat: '📅 Events & Weinfeste', desc: t.mcpTool9Desc || 'Findet offizielle deutsche Weinfeste, Festivals, Kultur- und Sportveranstaltungen über ganz Deutschland (DZT Knowledge Graph).' },
                    { name: 'get_german_pois', cat: '🏰 Sehenswürdigkeiten', desc: t.mcpTool10Desc || 'Liefert verifizierte Sehenswürdigkeiten, Schlösser, Naturparke und Kultur-Highlights für Roadtrips (DZT Knowledge Graph).' },
                    { name: 'get_reviews', cat: '⭐ Bewertungen', desc: t.mcpTool3Desc || 'Ruft echte Reiseberichte und Bewertungen von Campern zu einem Platz ab.' },
                    { name: 'add_review', cat: '⭐ Bewertungen', desc: t.mcpTool4Desc || 'Schreibt eine neue Bewertung und vergibt Sterne für einen besuchten Platz.' },
                    { name: 'get_lists', cat: '📁 Reiselisten', desc: t.mcpTool5Desc || 'Gibt alle erstellten Reiselisten und Favoriten-Sammlungen zurück.' },
                    { name: 'create_list', cat: '📁 Reiselisten', desc: t.mcpTool6Desc || 'Erstellt eine neue Reiseliste (z. B. für eine geplante Route oder Favoriten).' },
                    { name: 'save_to_list', cat: '📁 Reiselisten', desc: t.mcpTool7Desc || 'Speichert einen Campingplatz oder Spot in einer bestimmten Reiseliste.' }
                  ].map((tItem) => (
                    <div key={tItem.name} style={{ background: 'var(--gray-50)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--gray-200)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem', color: '#7c3aed' }}>{tItem.name}</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'white', border: '1px solid var(--gray-200)', color: 'var(--gray-600)' }}>{tItem.cat}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', lineHeight: 1.4 }}>{tItem.desc}</div>
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

      {/* Selected Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={closeEventDetails} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '880px', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px', padding: 0, background: 'var(--card-bg)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}
          >
            {/* Modal Image Header */}
            <div style={{ position: 'relative', height: '240px', background: 'var(--gray-100)', overflow: 'hidden' }}>
              <img
                src={selectedEvent.image_url || getEventFallback(selectedEvent)}
                alt={selectedEvent.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const fallback = getEventFallback(selectedEvent);
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />
              <button
                onClick={closeEventDetails}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Column: Event Information */}
                <div className="md:col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedEvent.startDate && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', background: 'var(--primary-100)', color: 'var(--primary-800)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={12} /> {formatEventDate(selectedEvent.startDate, selectedEvent.endDate)}
                      </span>
                    )}
                    {selectedEvent.locality && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: 'var(--gray-100)', color: 'var(--gray-800)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={12} /> {selectedEvent.locality} {selectedEvent.postalCode ? `(${selectedEvent.postalCode})` : ''}
                      </span>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0.25rem 0', lineHeight: 1.3 }}>
                    {selectedEvent.name}
                  </h2>

                  {selectedEvent.streetAddress && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: 0 }}>
                      📍 <strong>Veranstaltungsort:</strong> {selectedEvent.streetAddress}, {selectedEvent.postalCode} {selectedEvent.locality}
                    </p>
                  )}

                  <div style={{ fontSize: '0.88rem', color: 'var(--gray-700)', lineHeight: 1.6, whiteSpace: 'pre-line', marginTop: '0.25rem' }}>
                    {selectedEvent.fullDescription || selectedEvent.description}
                  </div>

                  {/* License & Copyright Info */}
                  {selectedEvent.image_copyright && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      Bildnachweis: {selectedEvent.image_copyright}
                    </div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)' }}>
                    {t.eventLicenseNotice || 'Datenquelle: Deutsche Zentrale für Tourismus (DZT) · Open Data Germany'}
                  </div>

                  {selectedEvent.url && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <a
                        href={selectedEvent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.6rem 1rem',
                          borderRadius: '10px',
                          background: 'var(--gray-100)',
                          color: 'var(--gray-800)',
                          textDecoration: 'none',
                          fontSize: '0.82rem',
                          fontWeight: 700
                        }}
                        className="hover:bg-gray-200"
                      >
                        <Globe size={14} /> Offizielle Event-Website <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Right Column: Nearby Campsites from SQLite Database */}
                <div className="md:col-span-5" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ background: 'var(--gray-50)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--gray-200)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      🏕️ Camping & Stellplätze in der Nähe ({isLoadingEventCampsites ? '...' : eventCampsites.length})
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: 'var(--gray-500)', margin: '0 0 0.75rem 0' }}>
                      Verifizierte Übernachtungsorte im Umkreis von bis zu 35 km
                    </p>

                    {isLoadingEventCampsites ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-500)' }}>
                        <div className="spinner" style={{ width: '20px', height: '20px', margin: '0 auto 0.5rem auto' }}></div>
                        <p style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>Suche Stellplätze in der Nähe...</p>
                      </div>
                    ) : eventCampsites.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', fontStyle: 'italic', margin: 0, padding: '1rem 0' }}>
                        Keine registrierten Campingplätze im direkten 35 km Umkreis gefunden.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                        {eventCampsites.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              closeEventDetails();
                              openPlace(p);
                            }}
                            style={{
                              display: 'flex',
                              gap: '0.65rem',
                              alignItems: 'center',
                              padding: '0.5rem',
                              borderRadius: '10px',
                              border: '1px solid var(--card-border)',
                              background: 'white',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease-in-out'
                            }}
                            className="hover:border-primary-500 hover:shadow-sm"
                          >
                            <div style={{ width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--gray-200)' }}>
                              <img
                                src={getImageUrl(p) || getFallbackImage(p)}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.currentTarget.src = getFallbackImage(p); }}
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h5 style={{ fontSize: '0.82rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--gray-900)' }}>
                                {p.name}
                              </h5>
                              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', margin: '0.15rem 0 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{getTypeLabel(p.type)} · {p.city || (p.address ? p.address.split(',')[0] : '')}</span>
                                {typeof (p as any).distance_km === 'number' && (
                                  <span style={{ fontWeight: 700, color: 'var(--primary-700)', marginLeft: '4px' }}>
                                    {(p as any).distance_km} km
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Entdecken() {
  const crumbs = useDiscoverBreadcrumbs();
  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-emerald-700 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-2xl focus:outline-none"
      >
        Zum Hauptinhalt springen
      </a>
      <Navbar />
      <div className="pt-16">
        <AppBreadcrumbs items={crumbs} />
        <EntdeckenContent />
      </div>
      <Footer />
    </>
  );
}
