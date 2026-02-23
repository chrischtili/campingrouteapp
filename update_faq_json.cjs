const fs = require('fs');

const dePath = 'src/i18n/locales/de.json';
const enPath = 'src/i18n/locales/en.json';

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// DE
de.faq.items = {
  whatIs: {
    q: "Was ist Camping Route?",
    title: "Ein intelligenter Assistent für deine Wohnmobil-Routen.",
    prec: "Warum ein Prompt-Generator?",
    prec1: "Künstliche Intelligenz (wie ChatGPT) ist großartig, aber sie braucht präzise Anweisungen (Prompts), um wirklich brauchbare Ergebnisse zu liefern.",
    prec2: "Camping Route nimmt dir diese Arbeit ab: Du wählst deine Wünsche über ein einfaches Formular aus.",
    prec3: "Wir wandeln deine Angaben in einen perfekt strukturierten Text um, den die KI optimal versteht.",
    ai: "Deine Vorteile",
    ai1: "Keine Standard-Routen mehr, sondern 100% individualisiert.",
    ai2: "Berücksichtigt Fahrzeugmaße, Budget und Vorlieben.",
    ai3: "Erspart dir mühsames Tippen und Nachfragen bei der KI."
  },
  diff: {
    q: "Prompt vs. KI Direkt – was ist der Unterschied?",
    title: "Du hast die Wahl: Kostenlos kopieren oder direkt in der App generieren.",
    gen: "Modus: Prompt Generieren (Kostenlos)",
    gen1: "Am Ende erhältst du einen fertigen Text-Prompt.",
    gen2: "Diesen kopierst du einfach und fügst ihn bei ChatGPT, Claude oder Gemini ein.",
    gen3: "Kostenlos und du nutzt deinen bestehenden KI-Account.",
    gen4: "Volle Kontrolle über den anschließenden Chat.",
    ai: "Modus: KI direkt nutzen (API-Key nötig)",
    ai1: "Die Route wird direkt in unserer App generiert und angezeigt.",
    ai2: "Kein Hin- und Herkopieren zwischen verschiedenen Tabs.",
    ai4: "Du benötigst einen eigenen API-Key deines KI-Anbieters."
  },
  howItWorks: {
    q: "Wie funktioniert die Planung genau?",
    title: "In wenigen Schritten zur perfekten Reiseroute.",
    step1: "1. Basisdaten",
    step1a: "Start, Ziel, Reisedauer und maximale Tageskilometer festlegen.",
    step2: "2. Dein Fahrzeug",
    step2a: "Fahrzeugmaße, Gewicht und Autarkie (Strom/Wasser) eintragen.",
    step3: "3. Wünsche & Generierung",
    step3a: "Interessen und Reisebegleitung wählen. Anschließend den Prompt kopieren oder die Route direkt erstellen lassen."
  },
  cost: {
    q: "Ist die Nutzung wirklich kostenlos?",
    title: "Ja, Camping Route ist ein kostenloses Open-Source Projekt.",
    free: "Die App",
    free1: "Die Nutzung des Formulars und die Prompt-Erstellung sind 100% kostenlos.",
    free2: "Keine versteckten Abos oder Registrierungszwang.",
    opt: "KI-API-Kosten",
    transDesc: "Nur wenn du den Modus 'KI direkt nutzen' wählst, fallen bei dem jeweiligen Anbieter (z.B. OpenAI) geringe Cent-Beträge für die API-Nutzung an, die über deinen eigenen API-Key abgerechnet werden."
  },
  privacy: {
    q: "Was passiert mit meinen eingegebenen Daten?",
    title: "Deine Daten bleiben auf deinem Gerät.",
    device: "Lokal & Sicher",
    device1: "Alle Eingaben (inkl. API-Keys) werden nur lokal in deinem Browser gespeichert (Local Storage). Wir betreiben keine Datenbank.",
    sec: "Keine Server-Übertragung",
    sec1: "Deine Daten verlassen dein Gerät nur, wenn du sie direkt an die API des gewählten KI-Anbieters sendest."
  },
  aiModel: {
    q: "Welches KI-Modell soll ich wählen?",
    title: "Jedes Modell hat seine eigenen Stärken bei der Routenplanung.",
    gemini: "Google Gemini (Empfehlung)",
    gemini1: "Extrem gut bei aktuellen Orten, Stellplätzen und POIs, da es Googles riesigen Datenbestand nutzt. Generiert oft die realistischsten und schönsten Routen für Europa.",
    gpt: "OpenAI ChatGPT (GPT-4o)",
    gpt1: "Logisch unschlagbar. Hält sich penibel an Vorgaben wie maximale Tageskilometer und Budgets. Die Textausgabe ist sehr strukturiert und extrem detailliert.",
    mistral: "Mistral AI",
    mistral1: "Ein starkes, europäisches Modell. Arbeitet sehr schnell und bietet eine hervorragende Preis-Leistung (die API ist oft günstiger als OpenAI).",
    recDesc: "Tipp: Für die besten Stellplatz-Empfehlungen und landschaftlichen Highlights empfehlen wir aktuell Google Gemini."
  }
};

// EN
en.faq.items = {
  whatIs: {
    q: "What is Camping Route?",
    title: "An intelligent assistant for your motorhome routes.",
    prec: "Why a prompt generator?",
    prec1: "Artificial Intelligence (like ChatGPT) is great, but it needs precise instructions (prompts) to deliver truly usable results.",
    prec2: "Camping Route does this work for you: You simply select your preferences via a form.",
    prec3: "We convert your input into a perfectly structured text that the AI understands optimally.",
    ai: "Your Benefits",
    ai1: "No more standard routes, but 100% individualized.",
    ai2: "Takes vehicle dimensions, budget, and preferences into account.",
    ai3: "Saves you from tedious typing and clarifying with the AI."
  },
  diff: {
    q: "Prompt vs. Direct AI – what's the difference?",
    title: "The choice is yours: copy for free or generate directly in the app.",
    gen: "Mode: Generate Prompt (Free)",
    gen1: "At the end you receive a finished text prompt.",
    gen2: "Simply copy it and paste it into ChatGPT, Claude or Gemini.",
    gen3: "Free of charge and you use your existing AI account.",
    gen4: "Full control over the subsequent chat.",
    ai: "Mode: Use AI Directly (API Key needed)",
    ai1: "The route is generated and displayed directly in our app.",
    ai2: "No copying back and forth between different tabs.",
    ai4: "You need your own API key from your AI provider."
  },
  howItWorks: {
    q: "How exactly does the planning work?",
    title: "To your perfect itinerary in just a few steps.",
    step1: "1. Basic Data",
    step1a: "Set start, destination, duration and max daily kilometers.",
    step2: "2. Your Vehicle",
    step2a: "Enter vehicle dimensions, weight and self-sufficiency (power/water).",
    step3: "3. Preferences & Generation",
    step3a: "Select interests and travel companions. Then copy the prompt or let the AI generate the route directly."
  },
  cost: {
    q: "Is it really free to use?",
    title: "Yes, Camping Route is a free open-source project.",
    free: "The App",
    free1: "Using the form and prompt generation is 100% free.",
    free2: "No hidden subscriptions or mandatory registration.",
    opt: "AI API Costs",
    transDesc: "Only if you choose the 'Use AI directly' mode, minor cent amounts for API usage will be billed by the respective provider (e.g. OpenAI) via your own API key."
  },
  privacy: {
    q: "What happens to my entered data?",
    title: "Your data stays on your device.",
    device: "Local & Secure",
    device1: "All inputs (incl. API keys) are saved only locally in your browser (Local Storage). We do not operate a database.",
    sec: "No Server Transmission",
    sec1: "Your data only leaves your device if you send it directly to the API of the chosen AI provider."
  },
  aiModel: {
    q: "Which AI model should I choose?",
    title: "Each model has its own strengths in route planning.",
    gemini: "Google Gemini (Recommended)",
    gemini1: "Extremely good with current places, pitches, and POIs as it uses Google's massive database. Often generates the most realistic and beautiful routes for Europe.",
    gpt: "OpenAI ChatGPT (GPT-4o)",
    gpt1: "Logically unbeatable. Strictly adheres to constraints like max daily kilometers and budgets. The text output is highly structured and extremely detailed.",
    mistral: "Mistral AI",
    mistral1: "A strong European model. Works very fast and offers excellent value for money (the API is often cheaper than OpenAI).",
    recDesc: "Tip: For the best campsite recommendations and scenic highlights, we currently recommend Google Gemini."
  }
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('FAQ texts completely updated.');
