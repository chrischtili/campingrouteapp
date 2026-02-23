const fs = require('fs');

const dePath = 'src/i18n/locales/de.json';
const enPath = 'src/i18n/locales/en.json';

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

de.faq.items.aiModel.gemini = "Google Gemini 3.1 (Empfehlung)";
de.faq.items.aiModel.gpt = "OpenAI ChatGPT 5.2";
de.faq.items.aiModel.mistral = "Mistral Large";
de.faq.items.aiModel.gpt1 = "Logisch unschlagbar. Hält sich penibel an Vorgaben wie maximale Tageskilometer und Budgets. Die Textausgabe der Version 5.2 ist sehr strukturiert und extrem detailliert.";

en.faq.items.aiModel.gemini = "Google Gemini 3.1 (Recommended)";
en.faq.items.aiModel.gpt = "OpenAI ChatGPT 5.2";
en.faq.items.aiModel.mistral = "Mistral Large";
en.faq.items.aiModel.gpt1 = "Logically unbeatable. Strictly adheres to constraints like max daily kilometers and budgets. The text output of version 5.2 is highly structured and extremely detailed.";

fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('FAQ models updated.');
