const fs = require('fs');

const dePath = 'src/i18n/locales/de.json';
const enPath = 'src/i18n/locales/en.json';

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Deutsch - Überarbeitete Kategorien
de.planner.accommodation.categories = {
  companions: {
    label: "Begleitung",
    options: {
      solo: "Alleinreisend",
      partner: "Paar",
      family: "Familie",
      friends: "Freunde",
      pets: "Mit Hund / Haustier",
      seniors: "Senioren"
    }
  },
  type: {
    label: "Art der Übernachtung",
    options: {
      camping: "Klassischer Campingplatz",
      pitch: "Wohnmobilstellplatz",
      farm: "Bauernhof & Weingut",
      small: "Kleine, naturnahe Plätze",
      wild: "Freistehen / Wildcampen",
      premium: "Premium & Glamping"
    }
  },
  facilities: {
    label: "Wichtige Ausstattung",
    options: {
      power: "Stromanschluss",
      water: "Ver- & Entsorgung",
      sanitary: "Sanitäranlagen",
      wifi: "WLAN",
      pool: "Pool & Wellness",
      restaurant: "Restaurant am Platz",
      dogs: "Hunde erlaubt",
      kids: "Kinderfreundlich & Spielplatz",
      accessible: "Barrierefrei",
      winter: "Wintercamping-tauglich"
    }
  }
};

// Englisch - Überarbeitete Kategorien
en.planner.accommodation.categories = {
  companions: {
    label: "Companions",
    options: {
      solo: "Solo traveler",
      partner: "Couple",
      family: "Family",
      friends: "Friends",
      pets: "With dog / pets",
      seniors: "Seniors"
    }
  },
  type: {
    label: "Accommodation Type",
    options: {
      camping: "Classic campsite",
      pitch: "RV park / Pitch",
      farm: "Farm & Winery",
      small: "Small, natural places",
      wild: "Wild camping",
      premium: "Premium & Glamping"
    }
  },
  facilities: {
    label: "Essential Facilities",
    options: {
      power: "Power connection",
      water: "Water & Disposal",
      sanitary: "Sanitary facilities",
      wifi: "WiFi",
      pool: "Pool & Wellness",
      restaurant: "Restaurant on site",
      dogs: "Dogs allowed",
      kids: "Kid-friendly & Playground",
      accessible: "Accessible",
      winter: "Winter camping ready"
    }
  }
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('Step 5 categories updated successfully.');
