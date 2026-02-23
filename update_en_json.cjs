const fs = require('fs');

const enPath = 'src/i18n/locales/en.json';
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

if (!en.exampleRoute.stages.highlights) en.exampleRoute.stages.highlights = {};
en.exampleRoute.stages.highlights.fulda = "Rhön & Fulda";
en.exampleRoute.stages.highlights.magdeburg = "Waterway Intersection";
en.exampleRoute.stages.highlights.perleberg = "Pure Nature";
en.exampleRoute.stages.highlights.wismar = "Baltic Sea Flair";

if (!en.exampleRoute.stages.details) en.exampleRoute.stages.details = {};
en.exampleRoute.stages.details.fulda = "Fulda Cathedral & Wasserkuppe with panoramic views over the entire Rhön.";
en.exampleRoute.stages.details.magdeburg = "Visit the UNESCO World Heritage Site: The impressive trough bridge over the Elbe.";
en.exampleRoute.stages.details.perleberg = "Experience the untouched nature of Brandenburg on the B189.";
en.exampleRoute.stages.details.wismar = "Short stage - early check-in possible. Enjoy the old harbor.";

if (!en.exampleRoute.stages.overnight) en.exampleRoute.stages.overnight = {};
en.exampleRoute.stages.overnight.fulda = "Knaus Campingpark Hünfeld";
en.exampleRoute.stages.overnight.magdeburg = "Schachtsee Wolmirsleben";
en.exampleRoute.stages.overnight.perleberg = "Campingplatz Friedensteich";
en.exampleRoute.stages.overnight.wismar = "Ostsee-Camping Zierow";

if (!en.exampleRoute.stages.times) en.exampleRoute.stages.times = {};
en.exampleRoute.stages.times.karlsruhe_fulda = "2:30–3:00 h";
en.exampleRoute.stages.times.fulda_magdeburg = "3:00–3:30 h";
en.exampleRoute.stages.times.magdeburg_perleberg = "1:45–2:15 h";
en.exampleRoute.stages.times.perleberg_wismar = "1:15–1:30 h";

if (!en.exampleRoute.stages.distances) en.exampleRoute.stages.distances = {};
en.exampleRoute.stages.distances.karlsruhe_fulda = "210 km";
en.exampleRoute.stages.distances.fulda_magdeburg = "240 km";
en.exampleRoute.stages.distances.magdeburg_perleberg = "130 km";
en.exampleRoute.stages.distances.perleberg_wismar = "95 km";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('en.json updated.');
