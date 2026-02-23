const fs = require('fs');

const dePath = 'src/i18n/locales/de.json';
const enPath = 'src/i18n/locales/en.json';

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

de.planner.output.nextSteps.title = "Bereit?";
de.planner.output.nextSteps.description = "Kopiere den Text und füge ihn bei deiner bevorzugten KI (z.B. ChatGPT, Gemini oder Mistral) ein.";

en.planner.output.nextSteps.title = "Ready?";
en.planner.output.nextSteps.description = "Copy the text and paste it into your preferred AI (e.g. ChatGPT, Gemini or Mistral).";

fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('Next steps text updated.');
