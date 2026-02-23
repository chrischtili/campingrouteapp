const fs = require('fs');

const dePath = 'src/i18n/locales/de.json';
const enPath = 'src/i18n/locales/en.json';

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Update planner AI labels in DE
de.planner.ai.mode.direct.desc = "Route direkt in der App generieren. Du nutzt deinen EIGENEN API-Key und zahlst direkt an deinen KI-Anbieter (z.B. OpenAI).";
de.planner.ai.apiKey.hint = "Dein Key bleibt nur lokal in deinem Browser.";
de.planner.ai.apiKey.security = "Camping Route ist <b>eine reine Frontend-App ohne Backend oder Datenbank!</b> Wir speichern oder sehen deinen API-Key niemals. Er wird ausschließlich lokal in deinem Browser gespeichert und verschlüsselt direkt an den KI-Anbieter gesendet.";

// Update FAQ items in DE
de.faq.items.cost.free2 = "Keine Anmeldung, keine Datenbank, kein Backend.";
de.faq.items.cost.transDesc = "Nur wenn du die 'KI direkt nutzen' willst, gibst du deinen EIGENEN API-Key ein. Du bezahlst die minimalen API-Nutzungsgebühren (meist im Cent-Bereich pro Route) direkt an deinen KI-Anbieter (OpenAI, Google, Mistral). Wir als App haben damit nichts zu tun, verdienen daran nichts und übernehmen keine API-Kosten!";
de.faq.items.whatIs.prec2 = "Camping Route ist ein reines Frontend-Tool, das komplett lokal in deinem Browser läuft. Du wählst deine Wünsche über ein einfaches Formular aus.";
de.faq.items.howItWorks.step3a = "Prompt kopieren (und manuell in ChatGPT & Co einfügen) ODER eigenen API-Key eintragen für die direkte Anzeige in der App.";
de.faq.items.privacy.device1 = "Wir betreiben kein Backend und keine Datenbank! Alle Eingaben (inkl. API-Keys) werden nur lokal auf deinem Gerät in deinem Browser gespeichert (Local Storage).";

// Update planner AI labels in EN
en.planner.ai.mode.direct.desc = "Generate route directly in the app. You use your OWN API key and pay directly to your AI provider (e.g. OpenAI).";
en.planner.ai.apiKey.hint = "Your key stays local in your browser only.";
en.planner.ai.apiKey.security = "Camping Route is <b>a pure frontend app with no backend or database!</b> We never store or see your API key. It is stored exclusively locally in your browser and sent encrypted directly to the AI provider.";

// Update FAQ items in EN
en.faq.items.cost.free2 = "No registration, no database, no backend.";
en.faq.items.cost.transDesc = "Only if you want to 'Use AI directly', you enter your OWN API key. You pay the minimal API usage fees (usually a few cents per route) directly to your AI provider (OpenAI, Google, Mistral). We as an app have nothing to do with this, earn nothing from it, and do not cover API costs!";
en.faq.items.whatIs.prec2 = "Camping Route is a pure frontend tool that runs completely locally in your browser. You select your preferences via a simple form.";
en.faq.items.howItWorks.step3a = "Copy prompt (and paste manually into ChatGPT etc) OR enter your own API key to show the route directly in the app.";
en.faq.items.privacy.device1 = "We have no backend and no database! All inputs (incl. API keys) are saved only locally on your device in your browser (Local Storage).";

fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('App architecture and cost logic fully clarified in texts.');
