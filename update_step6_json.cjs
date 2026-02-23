const fs = require('fs');

const dePath = 'src/i18n/locales/de.json';
const enPath = 'src/i18n/locales/en.json';

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Deutsch - Step 6
de.planner.interests.categories = {
  active: "Aktiv & Sport",
  nature: "Natur & Landschaft",
  culture: "Kultur & Kulinarik",
  lifestyle: "Entspannung & Lifestyle"
};

de.planner.interests.options = {
  // active
  hiking: "Wandern & Trekking",
  cycling: "Fahrrad & E-Bike",
  mtb: "Mountainbike",
  watersports: "Wassersport & Kanu",
  wintersports: "Wintersport",
  // nature
  wildlife: "Tierbeobachtung",
  photography: "Fotografie-Spots",
  beach: "Strand & Meer",
  astronomy: "Sternenbeobachtung",
  lakes: "Seen & Flüsse",
  // culture
  cityStroll: "Städtetrips",
  history: "Geschichte & Architektur",
  museums: "Museen & Kunst",
  gastronomy: "Regionale Kulinarik",
  events: "Lokale Feste & Events",
  // lifestyle
  wellness: "Wellness & Spa",
  slowTravel: "Slow Travel",
  shopping: "Shopping & Boutiquen",
  badWeather: "Schlechtwetter-Alternativen",
  campfire: "Geselligkeit & Lagerfeuer"
};

// Englisch - Step 6
en.planner.interests.categories = {
  active: "Active & Sports",
  nature: "Nature & Landscape",
  culture: "Culture & Culinary",
  lifestyle: "Relaxation & Lifestyle"
};

en.planner.interests.options = {
  // active
  hiking: "Hiking & Trekking",
  cycling: "Cycling & E-Bike",
  mtb: "Mountain Biking",
  watersports: "Water Sports & Canoe",
  wintersports: "Winter Sports",
  // nature
  wildlife: "Wildlife Watching",
  photography: "Photography Spots",
  beach: "Beach & Sea",
  astronomy: "Stargazing",
  lakes: "Lakes & Rivers",
  // culture
  cityStroll: "City Trips",
  history: "History & Architecture",
  museums: "Museums & Art",
  gastronomy: "Regional Culinary",
  events: "Local Festivals & Events",
  // lifestyle
  wellness: "Wellness & Spa",
  slowTravel: "Slow Travel",
  shopping: "Shopping & Boutiques",
  badWeather: "Bad Weather Alternatives",
  campfire: "Socializing & Campfire"
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('Step 6 json updated successfully.');
