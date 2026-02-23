const fs = require('fs');

const dePath = 'src/i18n/locales/de.json';
const enPath = 'src/i18n/locales/en.json';

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

de.privacy = {
  badge: "Datenschutzerklärung",
  title: "Datenschutz",
  general: {
    title: "Grundsätzliches zur Datenverarbeitung",
    description: "Der Schutz deiner Daten ist uns ein wichtiges Anliegen. CampingRoute.app ist als reine Client-Side-Anwendung konzipiert. Das bedeutet, dass wir keine Datenbanken betreiben und keine Nutzerkonten anlegen. Alle von dir eingegebenen Daten verbleiben primär in deinem Browser."
  },
  dataProcessing: {
    title: "Datenverarbeitung & KI",
    local: {
      title: "Lokale Speicherung (Local Storage)",
      description: "Um dir die Nutzung so angenehm wie möglich zu machen, speichern wir deine Formulareingaben und Einstellungen (wie z.B. gewählte Sprache oder eingegebene API-Schlüssel) ausschließlich lokal in deinem Browser (Local Storage). Diese Daten werden nicht an unsere Server übertragen."
    },
    ai: {
      title: "KI-Integration (OpenAI, Gemini, Mistral)",
      description: "Wenn du die direkte KI-Generierung nutzt, werden deine Formulardaten (Start, Ziel, Fahrzeug, Vorlieben) in einen Text umgewandelt (Prompt) und über deinen eigenen API-Key direkt an den von dir gewählten KI-Anbieter (OpenAI, Google Gemini oder Mistral AI) gesendet. Wir speichern diesen Traffic nicht und loggen keine API-Schlüssel. Es gelten die Datenschutzbestimmungen des jeweils von dir genutzten KI-Anbieters."
    }
  },
  cookies: {
    title: "Cookies & Tracking",
    sidebar: {
      description: "CampingRoute.app verwendet keine einwilligungspflichtigen Tracking-Cookies (wie Google Analytics, Meta Pixel etc.). Wir setzen keine Mechanismen zur Analyse deines Nutzerverhaltens ein."
    },
    noTracking: {
      description: "Lediglich essenzielle, technisch notwendige Informationen für das Funktionieren der React-App (z.B. für die Mehrsprachigkeit über i18next) werden lokal im Browser vorgehalten."
    }
  },
  rights: {
    title: "Deine Rechte",
    description: "Da wir keine personenbezogenen Daten auf unseren Servern speichern, entfällt das klassische Recht auf Löschung oder Auskunft durch uns. Du hast jederzeit die volle Kontrolle über deine Daten: Um alle von CampingRoute.app gespeicherten Einstellungen zu entfernen, musst du lediglich die Browser-Daten (Local Storage) für diese Webseite in deinem Browser löschen."
  },
  hosting: {
    title: "Hosting",
    description: "Diese Webseite wird als statische Seite betrieben. Der Hostinganbieter (z.B. Vercel/Netlify/GitHub Pages) erhebt beim Zugriff auf diese Seite systembedingt Zugriffsdaten (Server-Logfiles) wie IP-Adresse, verwendeter Browser, Zeitpunkt des Aufrufs. Diese Daten werden nur für den sicheren Betrieb der Server verwendet und nicht mit anderen Datenquellen zusammengeführt."
  },
  backToHome: "Zurück zur Startseite"
};

en.privacy = {
  badge: "Privacy Policy",
  title: "Privacy",
  general: {
    title: "General Data Processing",
    description: "Protecting your data is very important to us. CampingRoute.app is designed as a pure client-side application. This means we do not operate databases or create user accounts. All data you enter remains primarily in your browser."
  },
  dataProcessing: {
    title: "Data Processing & AI",
    local: {
      title: "Local Storage",
      description: "To make your experience as smooth as possible, we save your form inputs and settings (such as chosen language or entered API keys) exclusively locally in your browser (Local Storage). This data is never transmitted to our servers."
    },
    ai: {
      title: "AI Integration (OpenAI, Gemini, Mistral)",
      description: "If you use direct AI generation, your form data (start, destination, vehicle, preferences) is converted into text (prompt) and sent directly to your chosen AI provider (OpenAI, Google Gemini, or Mistral AI) using your own API key. We do not store this traffic or log API keys. The privacy policies of the AI provider you use apply."
    }
  },
  cookies: {
    title: "Cookies & Tracking",
    sidebar: {
      description: "CampingRoute.app does not use tracking cookies that require consent (like Google Analytics, Meta Pixel, etc.). We do not use any mechanisms to analyze your user behavior."
    },
    noTracking: {
      description: "Only essential, technically necessary information for the React app to function (e.g. for multi-language support via i18next) is kept locally in the browser."
    }
  },
  rights: {
    title: "Your Rights",
    description: "Since we do not store personal data on our servers, the traditional right to deletion or information requests from us does not apply. You have full control over your data at all times: to remove all settings saved by CampingRoute.app, simply clear your browser data (Local Storage) for this website."
  },
  hosting: {
    title: "Hosting",
    description: "This website is operated as a static page. When accessing this site, the hosting provider (e.g. Vercel/Netlify/GitHub Pages) automatically collects access data (server log files) such as IP address, browser used, and time of access. This data is only used for the secure operation of the servers and is not merged with other data sources."
  },
  backToHome: "Back to Home"
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('Privacy texts updated.');
