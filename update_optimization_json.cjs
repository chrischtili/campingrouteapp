const fs = require('fs');

const dePath = 'src/i18n/locales/de.json';
const enPath = 'src/i18n/locales/en.json';

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Update titles
de.planner.optimization.title = "Routenoptimierung";
en.planner.optimization.title = "Route Optimization";

de.planner.steps.optimization.label = "Routenoptimierung";
en.planner.steps.optimization.label = "Route Optimization";

// Update categories
de.planner.optimization.categories = {
  roadType: {
    label: "Streckenprofil",
    options: {
      motorways: "Autobahnen bevorzugen",
      country: "Landstraßen bevorzugen",
      scenic: "Panoramarouten bevorzugen"
    }
  },
  avoidances: {
    label: "Ausschlüsse & Vermeidung",
    options: {
      toll: "Mautstraßen vermeiden",
      traffic: "Staus umfahren",
      construction: "Baustellen meiden",
      tunnels: "Tunnel meiden",
      night: "Nachtfahrten meiden"
    }
  },
  landscape: {
    label: "Landschaft & Umgebung",
    options: {
      mountains: "Berge & Pässe",
      coastal: "Küste & Meer",
      lakes: "Seen & Flüsse",
      forest: "Wälder & Natur"
    }
  },
  experiences: {
    label: "Erlebnisse auf der Strecke",
    options: {
      cities: "Städte & Kultur",
      rural: "Ländliche Idylle",
      unesco: "UNESCO Welterbe",
      farm: "Bauernhöfe & Hofläden",
      markets: "Lokale Märkte"
    }
  }
};

en.planner.optimization.categories = {
  roadType: {
    label: "Route Profile",
    options: {
      motorways: "Prefer motorways",
      country: "Prefer country roads",
      scenic: "Prefer scenic routes"
    }
  },
  avoidances: {
    label: "Avoidances",
    options: {
      toll: "Avoid toll roads",
      traffic: "Avoid traffic",
      construction: "Avoid roadworks",
      tunnels: "Avoid tunnels",
      night: "Avoid night driving"
    }
  },
  landscape: {
    label: "Landscape & Surroundings",
    options: {
      mountains: "Mountains & Passes",
      coastal: "Coast & Sea",
      lakes: "Lakes & Rivers",
      forest: "Forests & Nature"
    }
  },
  experiences: {
    label: "On-Route Experiences",
    options: {
      cities: "Cities & Culture",
      rural: "Rural Idyll",
      unesco: "UNESCO Heritage",
      farm: "Farms & Farm Shops",
      markets: "Local Markets"
    }
  }
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('Translations updated.');
