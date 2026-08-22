import { Database } from 'sqlite';
import { TARGET_COUNTRIES, COUNTRY_NAMES } from './db/geo.js';

export const TYPE_VALUES = ['campground', 'caravan', 'glamping', 'attraction'];

// Popular tourism regions -> generous coordinate bounding boxes. Used to turn a
// detected region name into a deterministic spatial filter (never text matching).
export const REGION_BBOXES: { [key: string]: { latMin: number; latMax: number; lonMin: number; lonMax: number; country?: string } } = {
  // Germany
  'Schwarzwald': { latMin: 47.5, latMax: 49.0, lonMin: 7.5, lonMax: 8.6, country: 'DE' },
  'Bodensee': { latMin: 47.4, latMax: 47.9, lonMin: 8.9, lonMax: 9.8 },
  'Ostsee': { latMin: 53.5, latMax: 55.0, lonMin: 9.5, lonMax: 14.5, country: 'DE' },
  'Nordsee': { latMin: 53.3, latMax: 55.1, lonMin: 6.5, lonMax: 9.0, country: 'DE' },
  'Allgäu': { latMin: 47.3, latMax: 47.9, lonMin: 9.5, lonMax: 10.8, country: 'DE' },
  'Harz': { latMin: 51.5, latMax: 52.0, lonMin: 10.0, lonMax: 11.5, country: 'DE' },
  'Eifel': { latMin: 49.7, latMax: 50.8, lonMin: 6.0, lonMax: 7.5 },
  'Sächsische Schweiz': { latMin: 50.8, latMax: 51.0, lonMin: 14.0, lonMax: 14.4, country: 'DE' },
  'Bayerischer Wald': { latMin: 48.7, latMax: 49.3, lonMin: 12.5, lonMax: 13.9, country: 'DE' },
  'Spreewald': { latMin: 51.8, latMax: 52.1, lonMin: 13.7, lonMax: 14.2, country: 'DE' },
  'Mecklenburgische Seenplatte': { latMin: 53.2, latMax: 53.7, lonMin: 12.1, lonMax: 13.5, country: 'DE' },
  'Lüneburger Heide': { latMin: 52.7, latMax: 53.3, lonMin: 9.5, lonMax: 10.8, country: 'DE' },
  'Mosel': { latMin: 49.7, latMax: 50.4, lonMin: 6.5, lonMax: 7.7, country: 'DE' },
  'Mittelrhein': { latMin: 50.0, latMax: 50.6, lonMin: 7.4, lonMax: 8.2, country: 'DE' },
  'Rhein': { latMin: 49.8, latMax: 50.8, lonMin: 7.0, lonMax: 8.5, country: 'DE' },
  'Altmühltal': { latMin: 48.8, latMax: 49.2, lonMin: 10.7, lonMax: 11.9, country: 'DE' },
  'Franken': { latMin: 49.3, latMax: 50.5, lonMin: 9.8, lonMax: 12.2, country: 'DE' },
  'Donau': { latMin: 48.3, latMax: 49.1, lonMin: 8.5, lonMax: 13.5, country: 'DE' },
  // Austria
  'Salzkammergut': { latMin: 47.5, latMax: 48.0, lonMin: 13.2, lonMax: 14.0, country: 'AT' },
  'Wörthersee': { latMin: 46.5, latMax: 46.7, lonMin: 14.0, lonMax: 14.3, country: 'AT' },
  'Zillertal': { latMin: 47.0, latMax: 47.4, lonMin: 11.7, lonMax: 12.0, country: 'AT' },
  'Ötztal': { latMin: 46.8, latMax: 47.3, lonMin: 10.8, lonMax: 11.2, country: 'AT' },
  'Achensee': { latMin: 47.3, latMax: 47.6, lonMin: 11.6, lonMax: 11.8, country: 'AT' },
  'Arlberg': { latMin: 47.1, latMax: 47.3, lonMin: 10.1, lonMax: 10.3, country: 'AT' },
  'Grossglockner': { latMin: 47.0, latMax: 47.2, lonMin: 12.6, lonMax: 12.9, country: 'AT' },
  'Wachau': { latMin: 48.3, latMax: 48.5, lonMin: 15.3, lonMax: 15.6, country: 'AT' },
  'Dachstein': { latMin: 47.4, latMax: 47.6, lonMin: 13.5, lonMax: 13.8, country: 'AT' },
  'Bregenzerwald': { latMin: 47.2, latMax: 47.5, lonMin: 9.8, lonMax: 10.2, country: 'AT' },
  'Kitzbüheler Alpen': { latMin: 47.2, latMax: 47.5, lonMin: 11.8, lonMax: 12.8, country: 'AT' },
  'Neusiedlersee': { latMin: 47.7, latMax: 48.0, lonMin: 16.7, lonMax: 16.9, country: 'AT' },
  // Italy
  'Gardasee': { latMin: 45.4, latMax: 45.9, lonMin: 10.5, lonMax: 10.9, country: 'IT' },
  'Südtirol': { latMin: 46.2, latMax: 47.1, lonMin: 10.4, lonMax: 12.5, country: 'IT' },
  'Dolomiten': { latMin: 46.2, latMax: 46.8, lonMin: 11.5, lonMax: 12.5, country: 'IT' },
  'Toskana': { latMin: 42.2, latMax: 44.5, lonMin: 9.6, lonMax: 12.4, country: 'IT' },
  'Amalfiküste': { latMin: 40.6, latMax: 40.7, lonMin: 14.3, lonMax: 14.7, country: 'IT' },
  'Comer See': { latMin: 45.8, latMax: 46.2, lonMin: 9.1, lonMax: 9.5, country: 'IT' },
  'Adriaküste': { latMin: 44.0, latMax: 45.8, lonMin: 12.0, lonMax: 13.7, country: 'IT' },
  // France
  "Côte d'Azur": { latMin: 43.0, latMax: 43.8, lonMin: 5.8, lonMax: 7.6, country: 'FR' },
  'Provence': { latMin: 43.0, latMax: 44.5, lonMin: 4.5, lonMax: 7.0, country: 'FR' },
  'Französische Alpen': { latMin: 44.0, latMax: 46.5, lonMin: 5.7, lonMax: 7.2, country: 'FR' },
  'Bretagne': { latMin: 47.2, latMax: 48.9, lonMin: -5.2, lonMax: -1.5, country: 'FR' },
  'Korsika': { latMin: 41.3, latMax: 43.1, lonMin: 8.5, lonMax: 9.6, country: 'FR' },
  // Norway / Netherlands
  'Lofoten': { latMin: 67.8, latMax: 68.7, lonMin: 12.0, lonMax: 15.0, country: 'NO' },
  'Texel': { latMin: 53.0, latMax: 53.2, lonMin: 4.7, lonMax: 4.9, country: 'NL' },
  // Spain
  'Costa Brava': { latMin: 41.5, latMax: 42.5, lonMin: 2.5, lonMax: 3.5, country: 'ES' },
  'Costa Blanca': { latMin: 37.8, latMax: 39.0, lonMin: -0.9, lonMax: 0.6, country: 'ES' },
  'Costa del Sol': { latMin: 36.3, latMax: 37.1, lonMin: -5.6, lonMax: -3.7, country: 'ES' },
  'Mallorca': { latMin: 39.2, latMax: 39.9, lonMin: 2.2, lonMax: 3.5, country: 'ES' },
  'Balearen': { latMin: 38.6, latMax: 40.1, lonMin: 1.0, lonMax: 4.4, country: 'ES' },
  // Portugal
  'Algarve': { latMin: 36.9, latMax: 37.5, lonMin: -9.0, lonMax: -7.3, country: 'PT' },
  // Croatia
  'Istrien': { latMin: 44.8, latMax: 45.5, lonMin: 13.4, lonMax: 14.3, country: 'HR' },
  'Kvarner': { latMin: 44.2, latMax: 45.3, lonMin: 14.0, lonMax: 14.8, country: 'HR' },
  'Dalmatien': { latMin: 42.5, latMax: 44.2, lonMin: 14.5, lonMax: 19.5, country: 'HR' },
  // Greece
  'Kreta': { latMin: 34.9, latMax: 35.7, lonMin: 23.5, lonMax: 26.3, country: 'GR' },
  'Peloponnes': { latMin: 36.5, latMax: 38.4, lonMin: 21.2, lonMax: 23.3, country: 'GR' },
  'Rhodos': { latMin: 35.9, latMax: 36.5, lonMin: 27.7, lonMax: 28.3, country: 'GR' },
  // Slovenia
  'Bleder See': { latMin: 46.3, latMax: 46.5, lonMin: 14.0, lonMax: 14.2, country: 'SI' },
  'Slowenische Alpen': { latMin: 46.2, latMax: 46.6, lonMin: 13.5, lonMax: 14.2, country: 'SI' },
  // Poland
  'Polnische Ostsee': { latMin: 54.0, latMax: 55.0, lonMin: 14.0, lonMax: 19.5, country: 'PL' },
  'Masurische Seenplatte': { latMin: 53.4, latMax: 54.4, lonMin: 20.5, lonMax: 22.5, country: 'PL' },
  // Hungary
  'Plattensee': { latMin: 46.6, latMax: 47.2, lonMin: 17.2, lonMax: 18.3, country: 'HU' },
  // Czechia
  'Böhmische Schweiz': { latMin: 50.7, latMax: 51.1, lonMin: 14.0, lonMax: 14.5, country: 'CZ' },
  'Südböhmen': { latMin: 48.5, latMax: 49.5, lonMin: 13.7, lonMax: 15.0, country: 'CZ' },
  // UK
  'Lake District': { latMin: 54.2, latMax: 54.7, lonMin: -3.4, lonMax: -2.7, country: 'GB' },
  'Cornwall': { latMin: 50.0, latMax: 50.9, lonMin: -5.7, lonMax: -4.3, country: 'GB' },
  'Schottische Highlands': { latMin: 56.5, latMax: 58.0, lonMin: -6.0, lonMax: -3.5, country: 'GB' },
  // Switzerland popular regions
  'Vierwaldstättersee': { latMin: 46.9, latMax: 47.1, lonMin: 8.3, lonMax: 8.6, country: 'CH' },
  'Berner Oberland': { latMin: 46.4, latMax: 46.8, lonMin: 7.5, lonMax: 8.2, country: 'CH' },
  'Engadin': { latMin: 46.4, latMax: 46.7, lonMin: 9.7, lonMax: 10.4, country: 'CH' },
  'Lauterbrunnental': { latMin: 46.5, latMax: 46.6, lonMin: 7.85, lonMax: 8.0, country: 'CH' },
  'Zermatt': { latMin: 45.9, latMax: 46.1, lonMin: 7.6, lonMax: 7.9, country: 'CH' },
  'Lago Maggiore': { latMin: 45.8, latMax: 46.2, lonMin: 8.5, lonMax: 8.9, country: 'CH' },
  'Genfersee': { latMin: 46.3, latMax: 46.5, lonMin: 6.6, lonMax: 7.0, country: 'CH' },
  'Jungfrau-Region': { latMin: 46.5, latMax: 46.6, lonMin: 7.75, lonMax: 8.0, country: 'CH' },
  'Toggenburg': { latMin: 47.2, latMax: 47.4, lonMin: 9.0, lonMax: 9.3, country: 'CH' },
  // France popular regions
  'Dordogne': { latMin: 44.5, latMax: 45.4, lonMin: 0.2, lonMax: 1.9, country: 'FR' },
  'Loire-Tal': { latMin: 47.2, latMax: 47.6, lonMin: -0.2, lonMax: 2.5, country: 'FR' },
  'Elsass': { latMin: 47.5, latMax: 49.1, lonMin: 7.0, lonMax: 8.3, country: 'FR' },
  'Vogesen': { latMin: 47.5, latMax: 48.8, lonMin: 6.9, lonMax: 7.5, country: 'FR' },
  'Ardèche': { latMin: 44.3, latMax: 45.1, lonMin: 3.9, lonMax: 4.8, country: 'FR' },
  'Pyrenäen': { latMin: 42.5, latMax: 43.3, lonMin: -1.6, lonMax: 2.6, country: 'FR' },
  'Verdon-Schlucht': { latMin: 43.7, latMax: 43.95, lonMin: 6.2, lonMax: 6.55, country: 'FR' },
  'Bretagne-Küste': { latMin: 47.3, latMax: 48.9, lonMin: -5.0, lonMax: -1.5, country: 'FR' },
  // Italy popular regions
  'Toskanische Hügel': { latMin: 43.2, latMax: 43.9, lonMin: 10.7, lonMax: 11.7, country: 'IT' },
  'Langhe': { latMin: 44.5, latMax: 44.8, lonMin: 7.7, lonMax: 8.3, country: 'IT' },
  'Cinque Terre': { latMin: 44.0, latMax: 44.2, lonMin: 9.6, lonMax: 9.9, country: 'IT' },
  'Maggioresee': { latMin: 45.7, latMax: 46.1, lonMin: 8.5, lonMax: 8.8, country: 'IT' },
  // Netherlands popular regions
  'IJsselmeer': { latMin: 52.4, latMax: 53.0, lonMin: 5.0, lonMax: 5.7, country: 'NL' },
  'Nordseeküste': { latMin: 51.5, latMax: 53.5, lonMin: 3.3, lonMax: 5.0, country: 'NL' },
  'Veluwe': { latMin: 52.0, latMax: 52.4, lonMin: 5.5, lonMax: 6.1, country: 'NL' },
  'Schelde-Delta': { latMin: 51.3, latMax: 51.8, lonMin: 3.5, lonMax: 4.3, country: 'NL' },
  'Ameland': { latMin: 53.4, latMax: 53.5, lonMin: 5.6, lonMax: 5.95, country: 'NL' },
  'Waddeneilanden': { latMin: 53.3, latMax: 53.6, lonMin: 4.8, lonMax: 6.6, country: 'NL' },
  'Lauwersmeer': { latMin: 53.3, latMax: 53.5, lonMin: 6.1, lonMax: 6.4, country: 'NL' },
  // Norway popular regions
  'Geirangerfjord': { latMin: 61.9, latMax: 62.3, lonMin: 6.8, lonMax: 7.5, country: 'NO' },
  'Hardangerfjord': { latMin: 60.0, latMax: 60.7, lonMin: 5.7, lonMax: 6.9, country: 'NO' },
  'Jotunheimen': { latMin: 61.2, latMax: 61.8, lonMin: 7.6, lonMax: 8.9, country: 'NO' },
  'Nordkap': { latMin: 70.9, latMax: 71.2, lonMin: 25.4, lonMax: 26.6, country: 'NO' },
  'Tromsø': { latMin: 69.5, latMax: 69.9, lonMin: 18.6, lonMax: 19.3, country: 'NO' },
  'Sognefjord': { latMin: 60.9, latMax: 61.6, lonMin: 5.9, lonMax: 7.6, country: 'NO' },
  'Senja': { latMin: 69.0, latMax: 69.5, lonMin: 16.3, lonMax: 18.2, country: 'NO' },
  'Preikestolen': { latMin: 58.9, latMax: 59.1, lonMin: 6.0, lonMax: 6.4, country: 'NO' },
  // Sweden popular regions
  'Öland': { latMin: 56.2, latMax: 57.6, lonMin: 16.3, lonMax: 17.1, country: 'SE' },
  'Gotland': { latMin: 56.9, latMax: 58.1, lonMin: 18.0, lonMax: 19.3, country: 'SE' },
  'Schärengarten': { latMin: 59.0, latMax: 59.6, lonMin: 18.0, lonMax: 19.1, country: 'SE' },
  'Vätternsee': { latMin: 57.8, latMax: 58.7, lonMin: 14.3, lonMax: 15.1, country: 'SE' },
  'Siljansee': { latMin: 60.7, latMax: 61.2, lonMin: 14.6, lonMax: 15.3, country: 'SE' },
  'Vänernsee': { latMin: 58.3, latMax: 59.4, lonMin: 12.7, lonMax: 13.9, country: 'SE' },
  'Schwedisch Lappland': { latMin: 66.0, latMax: 68.6, lonMin: 17.0, lonMax: 23.5, country: 'SE' },
  'Kosterhavet': { latMin: 58.8, latMax: 59.1, lonMin: 10.9, lonMax: 11.3, country: 'SE' },
  'Göta-Kanal': { latMin: 58.2, latMax: 58.6, lonMin: 14.0, lonMax: 16.1, country: 'SE' },
  // Denmark popular regions
  'Rømø': { latMin: 55.0, latMax: 55.3, lonMin: 8.4, lonMax: 8.7, country: 'DK' },
  'Skagen': { latMin: 57.6, latMax: 57.8, lonMin: 10.4, lonMax: 10.7, country: 'DK' },
  'Bornholm': { latMin: 54.9, latMax: 55.4, lonMin: 14.6, lonMax: 15.3, country: 'DK' },
  'Ostseeküste (Dänemark)': { latMin: 54.6, latMax: 57.9, lonMin: 9.6, lonMax: 12.9, country: 'DK' },
  'Nordseeküste (Dänemark)': { latMin: 54.7, latMax: 57.8, lonMin: 7.9, lonMax: 8.7, country: 'DK' },
  'Fünen': { latMin: 55.0, latMax: 55.6, lonMin: 9.9, lonMax: 11.0, country: 'DK' },
  'Lalandia': { latMin: 54.8, latMax: 55.0, lonMin: 11.0, lonMax: 11.3, country: 'DK' },
  'Blåvand': { latMin: 55.5, latMax: 55.6, lonMin: 8.0, lonMax: 8.3, country: 'DK' },
  'Møns Klint': { latMin: 54.9, latMax: 55.0, lonMin: 12.4, lonMax: 12.7, country: 'DK' },
  // Finland popular regions
  'Lappland': { latMin: 66.0, latMax: 70.2, lonMin: 21.0, lonMax: 29.8, country: 'FI' },
  'Finnische Seenplatte': { latMin: 61.3, latMax: 63.6, lonMin: 25.0, lonMax: 29.6, country: 'FI' },
  'Åland-Inseln': { latMin: 59.9, latMax: 60.5, lonMin: 19.4, lonMax: 21.1, country: 'FI' },
  'Saimaa-See': { latMin: 61.0, latMax: 62.5, lonMin: 27.5, lonMax: 29.6, country: 'FI' },
  'Koli-Nationalpark': { latMin: 63.0, latMax: 63.3, lonMin: 29.7, lonMax: 29.95, country: 'FI' },
  'Archipel-Nationalpark': { latMin: 60.0, latMax: 60.4, lonMin: 21.3, lonMax: 22.4, country: 'FI' },
  // Belgium popular regions
  'Ardennen': { latMin: 49.5, latMax: 50.6, lonMin: 4.7, lonMax: 6.3, country: 'BE' },
  'Belgische Küste': { latMin: 51.0, latMax: 51.4, lonMin: 2.5, lonMax: 3.5, country: 'BE' },
  'Hohes Venn': { latMin: 50.4, latMax: 50.6, lonMin: 6.0, lonMax: 6.3, country: 'BE' },
  'Brügge & Umland': { latMin: 51.1, latMax: 51.4, lonMin: 3.1, lonMax: 3.5, country: 'BE' },
  'Maastal': { latMin: 50.3, latMax: 51.1, lonMin: 5.5, lonMax: 6.0, country: 'BE' },
  // Luxembourg popular regions
  'Müllerthal (Kleine Luxemburger Schweiz)': { latMin: 49.7, latMax: 49.95, lonMin: 6.2, lonMax: 6.55, country: 'LU' },
  'Ösling (Luxemburger Ardennen)': { latMin: 49.85, latMax: 50.2, lonMin: 5.7, lonMax: 6.2, country: 'LU' },
  'Moseltal (Luxemburg)': { latMin: 49.65, latMax: 49.85, lonMin: 6.3, lonMax: 6.5, country: 'LU' },
  'Stausee von Esch-Sauer': { latMin: 49.85, latMax: 49.95, lonMin: 5.85, lonMax: 6.05, country: 'LU' }
};

// Deterministic German/English keyword -> SQL filter for common travel features.
// Applied by the intent builder so "mit Pool", "mit Hund", "am See" etc. work
// even when the model only loosely understands them.
export const FEATURE_FILTERS: { [key: string]: { sql: string; params: string[] } } = {
  pool: { sql: "(amenities LIKE ? OR description LIKE ? OR name LIKE ?)", params: ['%pool%', '%pool%', '%pool%'] },
  schwimmbad: { sql: "(description LIKE ? OR amenities LIKE ?)", params: ['%schwimmbad%', '%pool%'] },
  sauna: { sql: "(amenities LIKE ? OR description LIKE ?)", params: ['%sauna%', '%sauna%'] },
  spa: { sql: "(amenities LIKE ? OR description LIKE ? OR name LIKE ?)", params: ['%spa%', '%spa%', '%spa%'] },
  wellness: { sql: "(amenities LIKE ? OR description LIKE ?)", params: ['%wellness%', '%wellness%'] },
  pets: { sql: "(amenities LIKE ? OR description LIKE ?)", params: ['%pets%', '%hund%'] },
  hund: { sql: "(amenities LIKE ? OR description LIKE ?)", params: ['%pets%', '%hund%'] },
  beach: { sql: "(description LIKE ? OR name LIKE ?)", params: ['%strand%', '%strand%'] },
  strand: { sql: "(description LIKE ? OR name LIKE ?)", params: ['%strand%', '%strand%'] },
  sea: { sql: "(description LIKE ? OR name LIKE ? OR address LIKE ?)", params: ['%meer%', '%meer%', '%meer%'] },
  meer: { sql: "(description LIKE ? OR name LIKE ? OR address LIKE ?)", params: ['%meer%', '%meer%', '%meer%'] },
  seaview: { sql: "(description LIKE ? OR amenities LIKE ?)", params: ['%meerblick%', '%meerblick%'] },
  meerblick: { sql: "(description LIKE ? OR amenities LIKE ?)", params: ['%meerblick%', '%meerblick%'] },
  lake: { sql: "(description LIKE ? OR name LIKE ?)", params: ['%see%', '%see%'] },
  see: { sql: "(description LIKE ? OR name LIKE ?)", params: ['%see%', '%see%'] },
  mountain: { sql: "(description LIKE ? OR name LIKE ?)", params: ['%berg%', '%berg%'] },
  berg: { sql: "(description LIKE ? OR name LIKE ?)", params: ['%berg%', '%berg%'] },
  hiking: { sql: "(description LIKE ? OR amenities LIKE ?)", params: ['%wander%', '%hiking%'] },
  wandern: { sql: "(description LIKE ? OR amenities LIKE ?)", params: ['%wander%', '%hiking%'] },
  family: { sql: "(description LIKE ?)", params: ['%familien%'] },
  familien: { sql: "(description LIKE ?)", params: ['%familien%'] },
  quiet: { sql: "(description LIKE ? OR name LIKE ?)", params: ['%ruhig%', '%ruhig%'] },
  vollausstattung: { sql: "(amenities IS NOT NULL AND amenities != '' AND (amenities LIKE '%hookups%' OR amenities LIKE '%showers%' OR amenities LIKE '%toilets%' OR amenities LIKE '%wifi%' OR description LIKE '%ausstattung%' OR description LIKE '%komfort%'))", params: [] },
  komfort: { sql: "(amenities IS NOT NULL AND amenities != '' AND (amenities LIKE '%hookups%' OR amenities LIKE '%showers%' OR amenities LIKE '%toilets%' OR description LIKE '%komfort%'))", params: [] },
  river: { sql: "(description LIKE ? OR name LIKE ? OR address LIKE ?)", params: ['%fluss%', '%ufer%', '%fluss%'] },
  fluss: { sql: "(description LIKE ? OR name LIKE ? OR address LIKE ?)", params: ['%fluss%', '%ufer%', '%fluss%'] },
  waterfront: { sql: "(description LIKE ? OR name LIKE ? OR address LIKE ?)", params: ['%wasser%', '%ufer%', '%strand%'] },
  wine: { sql: "(description LIKE ? OR name LIKE ? OR address LIKE ?)", params: ['%wein%', '%winzer%', '%weingut%'] },
  weingut: { sql: "(description LIKE ? OR name LIKE ? OR address LIKE ?)", params: ['%wein%', '%winzer%', '%weingut%'] },
  'free': { sql: "(is_free = 1 OR price LIKE '%Kostenlos%' OR price LIKE '%Free%')", params: [] }
};

export interface RouteIntent {
  origin: string;
  destination: string;
  origin_lat?: number | null;
  origin_lon?: number | null;
  destination_lat?: number | null;
  destination_lon?: number | null;
  interval_km?: number | null;
  interval_hours?: number | null;
  num_stops?: number | null;
  corridor_width_km?: number | null;
}

export interface SearchIntent {
  types?: string[] | null;
  country?: string | null;
  state?: string | null;
  region?: string | null;
  waterbody?: string | null;
  valley?: string | null;
  landmark?: string | null;
  city?: string | null;
  city_lat?: number | null;
  city_lon?: number | null;
  radius_km?: number | null;
  target_count?: number | null;
  amenities?: string[] | null;
  features?: string[] | null;
  free?: boolean | null;
  max_price?: number | null;
  keywords?: string[] | null;
  sort?: 'distance' | 'rating' | 'relevance' | null;
  route?: RouteIntent | null;
}

export interface BuiltQuery {
  whereSql: string;
  params: any[];
  distance?: { lat: number; lon: number };
  radius_km?: number | null;
  target_count?: number | null;
}

const CITY_RADIUS_DEG = 0.4; // ~35-40 km box around a named town

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function projectPointToRoute(
  pLat: number,
  pLon: number,
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): { progressRatio: number; distanceAlongKm: number; distanceToRouteKm: number } {
  const totalKm = haversineDistance(aLat, aLon, bLat, bLon);
  if (totalKm === 0) {
    const d = haversineDistance(pLat, pLon, aLat, aLon);
    return { progressRatio: 0, distanceAlongKm: 0, distanceToRouteKm: d };
  }

  const midLatRad = (((aLat + bLat) / 2) * Math.PI) / 180;
  const cosMid = Math.cos(midLatRad);

  const dx = (bLon - aLon) * cosMid * 111.32;
  const dy = (bLat - aLat) * 111.32;
  const lenSq = dx * dx + dy * dy;

  const px = (pLon - aLon) * cosMid * 111.32;
  const py = (pLat - aLat) * 111.32;

  let t = lenSq > 0 ? (px * dx + py * dy) / lenSq : 0;
  t = Math.max(0, Math.min(1, t));

  const projLat = aLat + t * (bLat - aLat);
  const projLon = aLon + t * (bLon - aLon);

  const distToRoute = haversineDistance(pLat, pLon, projLat, projLon);
  const distAlong = t * totalKm;

  return {
    progressRatio: t,
    distanceAlongKm: distAlong,
    distanceToRouteKm: distToRoute
  };
}

// Wort-genaues Text-Matching über die FTS5-Tabelle. Verhindert Substring-
// Fehltreffer wie "elbe" -> "Tegelberg".
function ftsSafeTerm(term: string): string {
  const sanitized = String(term)
    .replace(/["'\\(){}[\]^~*?:+\-&|!<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `"${sanitized}"`;
}

function wordMatchClause(term: string, columns: string[]): { sql: string; params: any[] } {
  const expr = columns.map((c) => `${c}:${ftsSafeTerm(term)}`).join(' OR ');
  return {
    sql: 'EXISTS (SELECT 1 FROM places_fts WHERE rowid = places.rowid AND places_fts MATCH ?)',
    params: [expr]
  };
}

/**
 * Deterministically translate a structured intent into a WHERE clause. This is
 * safe by construction: no AI-generated SQL ever touches the database.
 */
export function buildSearchQuery(intent: SearchIntent): BuiltQuery {
  const clauses: string[] = [];
  const params: any[] = [];
  let distance: { lat: number; lon: number } | undefined;

  // Route corridor bounding box
  if (intent.route && typeof intent.route.origin_lat === 'number' && typeof intent.route.origin_lon === 'number' &&
      typeof intent.route.destination_lat === 'number' && typeof intent.route.destination_lon === 'number') {
    const minLat = Math.min(intent.route.origin_lat, intent.route.destination_lat) - 0.6;
    const maxLat = Math.max(intent.route.origin_lat, intent.route.destination_lat) + 0.6;
    const minLon = Math.min(intent.route.origin_lon, intent.route.destination_lon) - 0.8;
    const maxLon = Math.max(intent.route.origin_lon, intent.route.destination_lon) + 0.8;
    clauses.push('latitude BETWEEN ? AND ?');
    params.push(minLat, maxLat);
    clauses.push('longitude BETWEEN ? AND ?');
    params.push(minLon, maxLon);
  }

  if (intent.types && intent.types.length > 0) {
    clauses.push(`type IN (${intent.types.map(() => '?').join(',')})`);
    params.push(...intent.types);
  }

  if (intent.country && TARGET_COUNTRIES.includes(intent.country.toUpperCase())) {
    clauses.push('country = ?');
    params.push(intent.country.toUpperCase());
  }

  if (intent.state) {
    clauses.push('state = ?');
    params.push(intent.state);
  }

  if (intent.region && REGION_BBOXES[intent.region]) {
    const b = REGION_BBOXES[intent.region];
    clauses.push('latitude BETWEEN ? AND ?');
    params.push(b.latMin, b.latMax);
    clauses.push('longitude BETWEEN ? AND ?');
    params.push(b.lonMin, b.lonMax);
    if (b.country) {
      clauses.push('country = ?');
      params.push(b.country);
    }
  }

  // River / Waterbody specific matching (e.g. "Mosel", "Rhein", "Donau", "Elbe", "Loire", "Dordogne", "Chiemsee")
  if (intent.waterbody) {
    const wb = intent.waterbody.trim();
    if (wb) {
      const wm = wordMatchClause(wb, ['name', 'address', 'city', 'description']);
      clauses.push(wm.sql);
      params.push(...wm.params);
    }
  }

  // Valley specific matching (e.g. "Zillertal", "Altmühltal", "Lauterbrunnental")
  if (intent.valley) {
    const val = intent.valley.trim();
    if (val) {
      const wm = wordMatchClause(val, ['name', 'address', 'city', 'description']);
      clauses.push(wm.sql);
      params.push(...wm.params);
    }
  }

  if (intent.city) {
    if (typeof intent.city_lat === 'number' && typeof intent.city_lon === 'number') {
      const d = CITY_RADIUS_DEG;
      clauses.push(
        `((latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?) OR city = ? OR city LIKE ? OR address LIKE ? OR name LIKE ?)`
      );
      params.push(
        intent.city_lat - d, intent.city_lat + d, intent.city_lon - d, intent.city_lon + d,
        intent.city, `%${intent.city}%`, `%${intent.city}%`, `%${intent.city}%`
      );
      distance = { lat: intent.city_lat, lon: intent.city_lon };
    } else {
      clauses.push('(city = ? OR city LIKE ? OR address LIKE ? OR name LIKE ?)');
      params.push(intent.city, `%${intent.city}%`, `%${intent.city}%`, `%${intent.city}%`);
    }
  }

  // Optional radius constraint around the destination ("max 10 km von X").
  if (distance && typeof intent.radius_km === 'number' && intent.radius_km > 0) {
    const latCos = Math.cos((distance.lat * Math.PI) / 180);
    const rDeg = intent.radius_km / 111.0;
    clauses.push(
      `(((latitude - ?) * (latitude - ?)) + ((longitude - ?) * (longitude - ?) * ${latCos} * ${latCos})) <= ?`
    );
    params.push(distance.lat, distance.lat, distance.lon, distance.lon, rDeg * rDeg);
  }

  if (intent.amenities && intent.amenities.length > 0) {
    for (const a of intent.amenities) {
      const am = String(a).toLowerCase().trim();
      if (am) {
        clauses.push('amenities LIKE ?');
        params.push(`%${am}%`);
      }
    }
  }

  if (intent.features && intent.features.length > 0) {
    for (const f of intent.features) {
      const key = String(f).toLowerCase().trim();
      // If waterbody is already filtering by river name (e.g. "Mosel"), skip redundant generic river filter
      if (intent.waterbody && (key === 'river' || key === 'fluss' || key === 'waterfront')) {
        continue;
      }
      const filter = FEATURE_FILTERS[key];
      if (filter) {
        clauses.push(filter.sql);
        params.push(...filter.params);
      }
    }
  }

  if (intent.free) {
    clauses.push("(is_free = 1 OR price LIKE '%Kostenlos%' OR price LIKE '%Free%')");
  }

  if (typeof intent.max_price === 'number' && intent.max_price > 0) {
    clauses.push('(price_min <= ? OR price_max <= ?)');
    params.push(intent.max_price, intent.max_price);
  }

  if (intent.keywords && intent.keywords.length > 0) {
    const kw = intent.keywords.filter(k => String(k).trim().length >= 3);
    if (kw.length > 0) {
      const kwExpr = kw
        .map((k) => `(${['name', 'description', 'address'].map((c) => `${c}:${ftsSafeTerm(k)}`).join(' OR ')})`)
        .join(' OR ');
      clauses.push('EXISTS (SELECT 1 FROM places_fts WHERE rowid = places.rowid AND places_fts MATCH ?)');
      params.push(kwExpr);
    }
  }

  return { whereSql: clauses.length > 0 ? clauses.join(' AND ') : '1=1', params, distance, radius_km: intent.radius_km || null, target_count: intent.target_count || null };
}

/**
 * Return increasingly relaxed variants of the intent so a query with too many
 * strict filters can still produce results (never an empty page). Soft attribute
 * filters are dropped before structural ones (state), and meaningful keywords
 * (e.g. a place name like "Zugspitze") are kept as long as possible.
 */
export function relaxIntent(intent: SearchIntent): SearchIntent[] {
  const base: SearchIntent = {
    types: intent.types || null,
    country: intent.country || null,
    state: intent.state || null,
    region: intent.region || null,
    waterbody: intent.waterbody || null,
    valley: intent.valley || null,
    city: intent.city || null,
    city_lat: intent.city_lat || null,
    city_lon: intent.city_lon || null,
    target_count: intent.target_count || null,
    route: intent.route || null
  };
  const noAttrs: SearchIntent = {
    ...intent,
    features: null,
    amenities: null,
    max_price: null,
    free: null
  };
  const noState: SearchIntent = {
    ...noAttrs,
    state: null
  };
  const noKeywords: SearchIntent = {
    ...noState,
    keywords: null
  };
  return [intent, noAttrs, noState, noKeywords, base];
}

// German/English country name -> ISO code (code-level safety net).
const COUNTRY_NAME_TO_CODE: { [key: string]: string } = {
  deutschland: 'DE', germany: 'DE', österreich: 'AT', austria: 'AT', schweiz: 'CH', switzerland: 'CH',
  dänemark: 'DK', daenemark: 'DK', denmark: 'DK', norwegen: 'NO', norway: 'NO', schweden: 'SE',
  sweden: 'SE', frankreich: 'FR', france: 'FR', italien: 'IT', italy: 'IT', niederlande: 'NL',
  netherlands: 'NL', holland: 'NL', belgien: 'BE', belgium: 'BE', luxemburg: 'LU', luxembourg: 'LU',
  finnland: 'FI', finland: 'FI',
  spanien: 'ES', spain: 'ES', portugal: 'PT', kroatien: 'HR', croatia: 'HR', griechenland: 'GR',
  greece: 'GR', slowenien: 'SI', slovenia: 'SI', tschechien: 'CZ', 'tschechische republik': 'CZ',
  czechia: 'CZ', 'czech republic': 'CZ', czech: 'CZ', polen: 'PL', poland: 'PL', ungarn: 'HU',
  hungary: 'HU', großbritannien: 'GB', grossbritannien: 'GB', 'united kingdom': 'GB', uk: 'GB',
  england: 'GB', schottland: 'GB', wales: 'GB'
};

export function inferCountryFromQuery(query: string): string | null {
  const lower = ' ' + query.toLowerCase() + ' ';
  for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
    // match word boundaries
    const re = new RegExp(`(^|[^a-zäöüß])${name}([^a-zäöüß]|$)`);
    if (re.test(lower)) return code;
  }
  return null;
}

export function inferTypesFromQuery(query: string): string[] | null {
  const lower = query.toLowerCase();
  if (/(sehenswürdigkeit|sehenswuerdigkeit|attraktion|ausflugsziele|sehenswertes)/.test(lower)) {
    return ['attraction'];
  }
  if (/(camping|campingplatz|stellplatz|wohnmobil|glamping|zelten)/.test(lower)) {
    return ['campground', 'caravan', 'glamping'];
  }
  return null;
}

// German feature trigger words -> FEATURE_FILTERS keys (deterministic parsing).
const FEATURE_TRIGGERS: { key: string; re: RegExp }[] = [
  { key: 'quiet', re: /ruhig|ruhe|ruhige/ },
  { key: 'beach', re: /strand|strandnähe|strandnaehe|meer/ },
  { key: 'pool', re: /pool|schwimmbad|badesee/ },
  { key: 'pets', re: /hund|hunde|haustier/ },
  { key: 'sauna', re: /sauna/ },
  { key: 'spa', re: /\bspa\b|wellness/ },
  { key: 'hiking', re: /wandern|wander/ },
  { key: 'family', re: /familie|familien/ },
  { key: 'fishing', re: /angeln|fischen|angel/ }
];

// Words that are safe to ignore when scanning for a leftover location name.
const STOP_WORDS = new Set([
  'camping', 'campingplatz', 'campingplätze', 'stellplatz', 'stellplätze', 'wohnmobil', 'wohnmobile',
  'glamping', 'zelten', 'platz', 'plätze', 'sehenswürdigkeiten', 'sehenswuerdigkeiten', 'sehenswürdigkeit',
  'attraktionen', 'attraktion', 'ausflugsziele', 'ausflugsziel', 'sehenswertes',
  'in', 'im', 'am', 'an', 'auf', 'der', 'die', 'das', 'dem', 'den', 'mit', 'und', 'oder', 'bei', 'nahe',
  'von', 'zu', 'nach', 'für', 'fuer', 'über', 'ueber', 'direkt', 'ganz', 'ein', 'eine', 'einen', 'schöne',
  'schoene', 'schönen', 'ruhige', 'ruhiger', 'ruhigen', 'ruhig', 'kostenlos', 'kostenlose', 'kostenloser',
  'kostenlosen', 'kostenfreie', 'gratis', 'gebührenfrei',
  'max', 'km', 'kilometer', 'umkreis', 'entfernung', 'naechste', 'beste', 'besten', 'top',
  'strand', 'strandnähe', 'strandnaehe', 'meer', 'see', 'pool', 'schwimmbad', 'hund', 'hunde',
  'sauna', 'wellness', 'wandern', 'familie', 'familien', 'angeln', 'nähe', 'naehe'
]);

/**
 * Deterministically parse clearly structured queries into a SearchIntent,
 * WITHOUT any AI call. Returns null when the query looks ambiguous or involves a route.
 */
export function parseQueryIntent(queryStr: string): SearchIntent | null {
  const lower = queryStr.toLowerCase();

  // Route queries are handled by the AI intent parser for deep resolution
  if (/(?:zwischen|von)\s+.+?\s+(?:und|nach)\s+/i.test(queryStr)) {
    return null;
  }

  const intent: SearchIntent = {};

  // Popular region FIRST (e.g. "an der Ostsee", "Böhmische Schweiz"). The
  // region's own country takes precedence over a country name that happens to
  // be part of the region (e.g. "Schweiz" in "Böhmische Schweiz").
  for (const name of Object.keys(REGION_BBOXES)) {
    if (lower.includes(name.toLowerCase())) {
      intent.region = name;
      break;
    }
  }

  // Waterbodies (rivers, lakes)
  const WATERBODIES: { [key: string]: { name: string; country?: string } } = {
    'mosel': { name: 'Mosel', country: 'DE' },
    'rhein': { name: 'Rhein', country: 'DE' },
    'donau': { name: 'Donau', country: 'DE' },
    'elbe': { name: 'Elbe', country: 'DE' },
    'isar': { name: 'Isar', country: 'DE' },
    'neckar': { name: 'Neckar', country: 'DE' },
    'weser': { name: 'Weser', country: 'DE' },
    'main': { name: 'Main', country: 'DE' },
    'inn': { name: 'Inn', country: 'DE' },
    'spree': { name: 'Spree', country: 'DE' },
    'loire': { name: 'Loire', country: 'FR' },
    'dordogne': { name: 'Dordogne', country: 'FR' },
    'gardasee': { name: 'Gardasee', country: 'IT' },
    'chiemsee': { name: 'Chiemsee', country: 'DE' }
  };
  for (const [key, item] of Object.entries(WATERBODIES)) {
    if (lower.includes(key)) {
      intent.waterbody = item.name;
      if (!intent.country && item.country) intent.country = item.country;
      break;
    }
  }

  // Country
  if (intent.region && REGION_BBOXES[intent.region].country) {
    intent.country = REGION_BBOXES[intent.region].country;
  } else if (!intent.country) {
    const country = inferCountryFromQuery(queryStr);
    if (country) intent.country = country;
  }

  // Type
  if (/(glamping)/.test(lower)) {
    intent.types = ['glamping'];
  } else if (/(stellplatz|stellplätze|wohnmobil)/.test(lower)) {
    intent.types = ['caravan'];
  } else {
    intent.types = inferTypesFromQuery(queryStr) || undefined;
  }

  // Features / free / radius
  const features: string[] = [];
  for (const t of FEATURE_TRIGGERS) {
    if (t.re.test(lower) && !features.includes(t.key)) features.push(t.key);
  }
  // "am See" / "direkt am See" is a lake feature (careful: "Ostsee"/"Nordsee"
  // are handled as regions above).
  if (/(\bam see\b|\ban einem see\b)/.test(lower) || /seeblick/.test(lower)) {
    if (!features.includes('lake')) features.push('lake');
  }
  if (features.length) intent.features = features;

  if (/(kostenlos|gratis|gebührenfrei)/.test(lower)) intent.free = true;

  const kmMatch = queryStr.match(/(\d{1,3})\s*(?:km|kilometer)/i);
  if (kmMatch) {
    const km = parseInt(kmMatch[1], 10);
    if (km >= 1 && km <= 300) intent.radius_km = km;
  }

  // Target count (e.g. "5 Plätze", "4-5 Plätze")
  const countMatch = queryStr.match(/(?:schlage\s+(?:mir\s+)?|top\s+|die\s+)?(\d{1,2})\s*(?:-|bis\s*(\d{1,2})\s*)?(?:plätze|campingplätze|stellplätze|tipps|empfehlungen)/i);
  if (countMatch) {
    const num = parseInt(countMatch[2] || countMatch[1], 10);
    if (num >= 1 && num <= 30) intent.target_count = num;
  }

  // Only use the deterministic intent if we have something concrete to filter on
  const hasFilters = !!(intent.country || intent.region || intent.waterbody || (intent.types && intent.types.length) || intent.free || (intent.features && intent.features.length));
  if (!hasFilters) return null;

  // Guard: if there's a leftover word that is probably a location (city/town),
  // the deterministic parse is incomplete -> let the AI handle it. Words that
  // belong to a detected region are never treated as leftovers.
  const tokens = lower
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 4);
  for (const tok of tokens) {
    if (intent.region && intent.region.toLowerCase().includes(tok)) continue;
    if (intent.waterbody && intent.waterbody.toLowerCase().includes(tok)) continue;
    if (/^\d+(?:km|km\b)$/i.test(tok)) continue; // Radius-Angabe wie "10km"
    if (!STOP_WORDS.has(tok) && !COUNTRY_NAME_TO_CODE[tok] && !Object.keys(REGION_BBOXES).some(r => r.toLowerCase() === tok)) {
      return null;
    }
  }

  return intent;
}

// Common German state names -> the native names used in the database, so the
// model's German-language guesses still match our data (e.g. "Nordholland").
const STATE_NAME_FIXES: { [key: string]: { [key: string]: string } } = {
  NL: {
    'Nordholland': 'Noord-Holland',
    'Südholland': 'Zuid-Holland',
    'Suedholland': 'Zuid-Holland',
    'Nordbrabant': 'Noord-Brabant',
    'Nord-Brabant': 'Noord-Brabant'
  }
};

export function normalizeStateName(country: string | null | undefined, state: string | null | undefined): string | null {
  if (!state || !country) return state || null;
  const fixes = STATE_NAME_FIXES[country];
  if (fixes) {
    if (fixes[state]) return fixes[state];
    const lower = state.toLowerCase();
    for (const [k, v] of Object.entries(fixes)) {
      if (k.toLowerCase() === lower) return v;
    }
  }
  return state;
}

/**
 * Sanitize the raw JSON returned by the model into a valid SearchIntent.
 */
export function validateIntent(raw: any): SearchIntent {
  const intent: SearchIntent = {};
  if (Array.isArray(raw.types)) {
    const types = raw.types
      .filter((t: any) => TYPE_VALUES.includes(String(t).toLowerCase()))
      .map((t: any) => String(t).toLowerCase());
    if (types.length > 0) intent.types = types;
  }
  if (typeof raw.country === 'string' && TARGET_COUNTRIES.includes(raw.country.toUpperCase())) {
    intent.country = raw.country.toUpperCase();
  }
  if (typeof raw.state === 'string' && raw.state.trim()) intent.state = raw.state.trim();
  if (typeof raw.region === 'string' && REGION_BBOXES[raw.region]) intent.region = raw.region;
  if (typeof raw.waterbody === 'string' && raw.waterbody.trim()) intent.waterbody = raw.waterbody.trim();
  if (typeof raw.valley === 'string' && raw.valley.trim()) intent.valley = raw.valley.trim();
  if (typeof raw.landmark === 'string' && raw.landmark.trim()) intent.landmark = raw.landmark.trim();
  if (typeof raw.city === 'string' && raw.city.trim()) intent.city = raw.city.trim();
  if (typeof raw.city_lat === 'number' && Number.isFinite(raw.city_lat)) intent.city_lat = raw.city_lat;
  if (typeof raw.city_lon === 'number' && Number.isFinite(raw.city_lon)) intent.city_lon = raw.city_lon;
  if (typeof raw.radius_km === 'number' && raw.radius_km > 0 && raw.radius_km <= 300) intent.radius_km = raw.radius_km;
  if (typeof raw.target_count === 'number' && raw.target_count > 0 && raw.target_count <= 50) intent.target_count = Math.round(raw.target_count);
  if (Array.isArray(raw.amenities)) {
    intent.amenities = raw.amenities
      .filter((a: any) => typeof a === 'string' && a.trim())
      .map((a: any) => String(a).trim().toLowerCase());
  }
  if (Array.isArray(raw.features)) {
    intent.features = raw.features
      .filter((f: any) => typeof f === 'string' && f.trim())
      .map((f: any) => String(f).trim().toLowerCase());
  }
  if (raw.free === true) intent.free = true;
  if (typeof raw.max_price === 'number' && raw.max_price > 0) intent.max_price = raw.max_price;
  if (Array.isArray(raw.keywords)) {
    intent.keywords = raw.keywords
      .filter((k: any) => typeof k === 'string' && k.trim().length >= 3)
      .map((k: any) => String(k).trim());
  }
  if (raw.sort === 'distance' || raw.sort === 'rating' || raw.sort === 'relevance') {
    intent.sort = raw.sort;
  }

  // Route / Stopover intent
  if (raw.route && typeof raw.route.origin === 'string' && typeof raw.route.destination === 'string') {
    const r = raw.route;
    intent.route = {
      origin: String(r.origin).trim(),
      destination: String(r.destination).trim(),
      origin_lat: typeof r.origin_lat === 'number' && Number.isFinite(r.origin_lat) ? r.origin_lat : null,
      origin_lon: typeof r.origin_lon === 'number' && Number.isFinite(r.origin_lon) ? r.origin_lon : null,
      destination_lat: typeof r.destination_lat === 'number' && Number.isFinite(r.destination_lat) ? r.destination_lat : null,
      destination_lon: typeof r.destination_lon === 'number' && Number.isFinite(r.destination_lon) ? r.destination_lon : null,
      interval_km: typeof r.interval_km === 'number' && r.interval_km > 0 ? r.interval_km : null,
      interval_hours: typeof r.interval_hours === 'number' && r.interval_hours > 0 ? r.interval_hours : null,
      num_stops: typeof r.num_stops === 'number' && r.num_stops > 0 ? Math.round(r.num_stops) : null,
      corridor_width_km: typeof r.corridor_width_km === 'number' && r.corridor_width_km > 0 ? r.corridor_width_km : 35
    };
  }

  return intent;
}

export async function buildIntentPrompt(db: Database): Promise<string> {
  const stateRows = await db.all(`
    SELECT country, state FROM places
    WHERE state IS NOT NULL AND state != ''
    GROUP BY country, state
  `);
  const stateByCountry: { [key: string]: string[] } = {};
  for (const s of stateRows) {
    if (!stateByCountry[s.country]) stateByCountry[s.country] = [];
    if (stateByCountry[s.country].length < 40) stateByCountry[s.country].push(s.state);
  }
  const statesText = Object.entries(stateByCountry)
    .map(([c, list]) => `  - ${c}: ${list.join(', ')}`)
    .join('\n');

  const regionNames = Object.keys(REGION_BBOXES).join(', ');

  return `
You are a search intent parser for a European travel database (camping sites, caravan spots, glamping and attractions). Convert the user's German or English travel query into a structured JSON "intent". NEVER write SQL - the system builds the query itself.

Return ONLY a JSON object with these keys:
- "types": array of allowed types, or empty array if unclear. For camping-related words use ["campground","caravan","glamping"]. For sights use ["attraction"].
- "country": ISO 3166-1 alpha-2 code or null
- "state": exact state/region/canton name or null (only from the list below)
- "region": popular region name or null (only from the list below)
- "waterbody": specific river, lake, or water body name if mentioned (e.g. "Mosel", "Rhein", "Donau", "Elbe", "Isar", "Loire", "Dordogne", "Gardasee", "Chiemsee", "Bodensee", "Ostsee", "Nordsee") or null
- "valley": specific valley name if mentioned (e.g. "Zillertal", "Altmühltal", "Lauterbrunnental", "Ötztal") or null
- "landmark": specific POI, mountain, castle, or natural monument (e.g. "Zugspitze", "Burg Eltz", "Drei Zinnen", "Neuschwanstein") or null
- "city": town/city name or null
- "city_lat": approximate latitude of that town (if a town is named), else null
- "city_lon": approximate longitude of that town, else null
- "radius_km": the maximum distance from that town/landmark the user wants (e.g. "max 10 km", "innerhalb von 30 km", "Umkreis 15 km"), else null
- "target_count": integer if user explicitly asked for a certain number of recommendations (e.g. 5 for "4-5 Plätze", 3 for "die 3 besten"), else null
- "amenities": array of amenity tags or null (e.g. "wifi", "hookups", "showers", "toilets", "water")
- "features": array of feature words or null (e.g. "vollausstattung", "komfort", "pool", "sauna", "spa", "wellness", "pets", "beach", "sea", "lake", "river", "waterfront", "mountain", "hiking", "family", "quiet", "fishing", "wine", "free")
- "free": true if the user wants free places, false otherwise, null if unknown
- "max_price": maximum budget as a number (in EUR) or null
- "keywords": array of remaining meaningful words to match in names/descriptions (e.g. "ruhig", "familienfreundlich"), or null
- "sort": "distance" if a specific town/city is named (so we can rank by proximity), otherwise "rating"
- "route": object if user searches for stopovers/places along a route between two cities/regions or a journey, or null:
  {
    "origin": "name of start city/region",
    "destination": "name of destination city/region",
    "origin_lat": approximate latitude of start city or null,
    "origin_lon": approximate longitude of start city or null,
    "destination_lat": approximate latitude of destination city or null,
    "destination_lon": approximate longitude of destination city or null,
    "interval_km": distance interval in km if requested (e.g. 250 for "alle 250 km" or "Abstand ca. 250km") or null,
    "interval_hours": time interval in hours if requested (e.g. 2.5 for "2,5h" or "alle 2 Stunden") or null,
    "num_stops": desired number of stopovers (e.g. 2 or 3 for "2-3 Stellplätze") or null
  }

Allowed types: ${TYPE_VALUES.join(', ')}
Allowed countries: ${TARGET_COUNTRIES.join(', ')}
Known states/regions/cantons (use EXACT names, always together with the matching country):
${statesText}
Known popular regions: ${regionNames}
Amenity tags you may encounter: hookups, water, wifi, showers, toilets, free, glamping, pets-allowed, playground, sauna, pool, shop, restaurant, parking, restrooms, guided-tours

Examples:
- "Suche 2-3 Stellplätze zwischen Karlsruhe und Perleberg im Abstand von ca. 2,5h oder 250km" -> {"types":["caravan","campground"],"country":"DE","route":{"origin":"Karlsruhe","destination":"Perleberg","origin_lat":49.01,"origin_lon":8.40,"destination_lat":53.07,"destination_lon":11.86,"interval_km":250,"interval_hours":2.5,"num_stops":3},"sort":"rating"}
- "Campingplätze auf der Route von München nach Hamburg alle 300 km" -> {"types":["campground","caravan","glamping"],"country":"DE","route":{"origin":"München","destination":"Hamburg","origin_lat":48.14,"origin_lon":11.58,"destination_lat":53.55,"destination_lon":9.99,"interval_km":300},"sort":"rating"}
- "Ich suche einen wunderschönen Campingplatz an der Mosel mit Vollausstattung. Schlage mir 4-5 Plätze vor." -> {"types":["campground","caravan","glamping"],"country":"DE","waterbody":"Mosel","target_count":5,"features":["vollausstattung","river"],"sort":"rating"}
- "camping Alkmaar" -> {"types":["campground","caravan","glamping"],"country":"NL","city":"Alkmaar","city_lat":52.63,"city_lon":4.75,"sort":"distance"}
- "Stellplatz max 10 km von Bergen (Nordholland)" -> {"types":["campground","caravan","glamping"],"country":"NL","city":"Bergen","city_lat":52.67,"city_lon":4.70,"radius_km":10,"sort":"distance"}
- "Campingplätze in Bayern mit Pool und Hund" -> {"types":["campground","caravan","glamping"],"country":"DE","state":"Bayern","features":["pool","pets"],"sort":"rating"}
- "günstiger Stellplatz an der Ostsee, kostenlos" -> {"types":["campground","caravan","glamping"],"region":"Ostsee","waterbody":"Ostsee","free":true,"sort":"rating"}
- "Sehenswürdigkeiten in der Toskana" -> {"types":["attraction"],"country":"IT","region":"Toskana","sort":"rating"}
- "ruhige Campingplätze nahe Salzburg" -> {"types":["campground","caravan","glamping"],"country":"AT","city":"Salzburg","city_lat":47.8,"city_lon":13.05,"features":["quiet"],"sort":"distance"}

Now parse the query below and return ONLY the JSON object (no markdown, no explanation).
`;
}

/**
 * Resolve a named city to usable coordinates. Prefers places already in our own
 * database, but guards against ambiguous names: when the model also provided
 * coordinates, the DB candidate closest to them wins, and candidates further
 * than ~1 degree (~110 km) away are rejected (they are a different same-named
 * town, e.g. "Bergen" = North Holland vs. "Beekse Bergen" in Brabant).
 */
export async function resolveCityCoords(
  db: Database,
  city: string,
  country: string | null,
  modelLat?: number | null,
  modelLon?: number | null
): Promise<{ lat: number; lon: number; country: string | null } | null> {
  if (city) {
    const like = `%${city}%`;
    const baseWhere = `${country ? 'country = ? AND ' : ''}(city LIKE ? OR name LIKE ? OR address LIKE ?)`;
    const baseParams: any[] = country ? [country, like, like, like] : [like, like, like];

    let rows: any[];
    if (typeof modelLat === 'number' && typeof modelLon === 'number') {
      // Order by proximity to the model's coordinates so an ambiguous name
      // ("Bergen" = North Holland vs. "Beekse Bergen" in Brabant) resolves to
      // the right town instead of an arbitrary first match.
      const latCos = Math.cos((modelLat * Math.PI) / 180);
      const order = `(((latitude - ?) * (latitude - ?)) + ((longitude - ?) * (longitude - ?) * ${latCos} * ${latCos}))`;
      rows = await db.all(
        `SELECT latitude, longitude, country FROM places WHERE ${baseWhere} ORDER BY ${order} LIMIT 5`,
        [...baseParams, modelLat, modelLat, modelLon, modelLon]
      );
    } else {
      rows = await db.all(
        `SELECT latitude, longitude, country FROM places WHERE ${baseWhere} LIMIT 5`,
        baseParams
      );
    }

    if (rows.length > 0) {
      const best = rows[0];
      if (typeof modelLat === 'number' && typeof modelLon === 'number') {
        const d = Math.sqrt(Math.pow(best.latitude - modelLat, 2) + Math.pow(best.longitude - modelLon, 2));
        // Candidates further than ~1 degree away are a different same-named town.
        if (d <= 1.0) {
          return { lat: best.latitude, lon: best.longitude, country: best.country || null };
        }
        return { lat: modelLat, lon: modelLon, country };
      }
      return { lat: best.latitude, lon: best.longitude, country: best.country || null };
    }
  }
  if (typeof modelLat === 'number' && typeof modelLon === 'number') {
    return { lat: modelLat, lon: modelLon, country: null };
  }
  return null;
}

export { COUNTRY_NAMES };
