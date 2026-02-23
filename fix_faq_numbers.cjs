const fs = require('fs');

const dePath = 'src/i18n/locales/de.json';
const enPath = 'src/i18n/locales/en.json';

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Entferne die Zahlen ("1. ", "2. ", "3. ") aus den Titeln, 
// da die React-Komponente (FAQSection) die Zahlen bereits visuell in einem Badge darstellt ({j+1}).

de.faq.items.howItWorks.step1 = "Basisdaten";
de.faq.items.howItWorks.step2 = "Dein Fahrzeug";
de.faq.items.howItWorks.step3 = "Wünsche & Generierung";

en.faq.items.howItWorks.step1 = "Basic Data";
en.faq.items.howItWorks.step2 = "Your Vehicle";
en.faq.items.howItWorks.step3 = "Preferences & Generation";

fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('Fixed double numbers in FAQ step titles.');
