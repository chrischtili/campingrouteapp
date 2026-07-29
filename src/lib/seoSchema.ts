export type SchemaLocale = "de" | "en" | "nl" | "fr" | "it";

export function getSchemaLocale(language: string): SchemaLocale {
  if (language.startsWith("de")) return "de";
  if (language.startsWith("fr")) return "fr";
  if (language.startsWith("nl")) return "nl";
  if (language.startsWith("it")) return "it";
  return "en";
}

export interface FAQItemSchema {
  question: string;
  answer: string;
}

export function generateFAQPageSchema(faqs: FAQItemSchema[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

export function generateHowToSchema(locale: SchemaLocale) {
  const titles: Record<SchemaLocale, { name: string; description: string }> = {
    de: {
      name: "Wohnmobil- & Camper-Route mit KI planen",
      description: "In 7 einfachen Schritten eine maßgeschneiderte Campingroute mit KI-Prompt, Stellplätzen und GPX-Export erstellen.",
    },
    en: {
      name: "Plan a Motorhome & Camper Route with AI",
      description: "Create a customized camping route in 7 simple steps with AI prompts, campsites, and GPX export.",
    },
    nl: {
      name: "Plan een camper- en caravanroute met AI",
      description: "Maak in 7 eenvoudige stappen een op maat gemaakte campingroute met AI-prompts, campingplaatsen en GPX-export.",
    },
    fr: {
      name: "Planifier un itinéraire en camping-car avec l'IA",
      description: "Créez un itinéraire de camping sur mesure en 7 étapes simples avec des prompts IA, des aires de stationnement et un export GPX.",
    },
    it: {
      name: "Pianifica un itinerario per camper con l'IA",
      description: "Crea un itinerario di campeggio su misura in 7 semplici passaggi con prompt IA, aree di sosta ed export GPX.",
    },
  };

  const stepsData: Record<SchemaLocale, Array<{ name: string; text: string }>> = {
    de: [
      { name: "Fahrzeugauswahl", text: "Wähle dein Fahrzeug (Wohnmobil, Wohnwagen, Zelt, Motorrad) und gib Maße sowie Gewicht an." },
      { name: "Reiseziel & Ankerziel", text: "Definiere Start- und Zielort sowie optionale fest gebuchte Ankerziele." },
      { name: "Reisedauer & Etappen", text: "Lege deine Reisedaten, gewünschte Tagesetappen und maximale Fahrzeiten fest." },
      { name: "Unterkunft & Stellplätze", text: "Bestimme deine Präferenzen für Campingplätze (camping.info) oder Stellplätze (stellplatz.info)." },
      { name: "Interessen & Aktivitäten", text: "Wähle Vorlieben wie Natur, Kultur, Kulinarik oder familienfreundliche Stopps." },
      { name: "KI-Modell & Prompt generieren", text: "Wähle dein bevorzugtes KI-Modell (ChatGPT, Claude, Gemini) und kopiere den optimierten Prompt." },
      { name: "Route erstellen & GPX exportieren", text: "Füge den Prompt in deine KI ein und lade die Route als GPX-Datei für dein Navi herunter." },
    ],
    en: [
      { name: "Vehicle Selection", text: "Select your vehicle type (motorhome, caravan, tent, motorcycle) and specify dimensions." },
      { name: "Destinations & Anchors", text: "Define start, end, and optional fixed booked anchor destinations." },
      { name: "Duration & Stages", text: "Set your travel dates, preferred daily stages, and maximum driving times." },
      { name: "Accommodation Preferences", text: "Choose your preferences for campsites (camping.info) or stopovers (stellplatz.info)." },
      { name: "Interests & Activities", text: "Select preferences like nature, culture, culinary highlights, or family stops." },
      { name: "Generate AI Prompt", text: "Select your AI model (ChatGPT, Claude, Gemini) and copy the optimized prompt." },
      { name: "Create Route & Export GPX", text: "Paste the prompt into your AI and download the route as a GPX file for your navigation device." },
    ],
    nl: [
      { name: "Voertuigselectie", text: "Kies je voertuig (camper, caravan, tent, motor) en vul afmetingen en gewicht in." },
      { name: "Bestemming & Ankerbestemming", text: "Bepaal je vertrek- en eindpunt en optionele vastgelegde ankerdoelen." },
      { name: "Reisduur & Etappes", text: "Stel reisdata, gewenste dagetappes en maximale rijtijden in." },
      { name: "Overnachtingsvoorkeuren", text: "Kies je voorkeuren voor campings (camping.info) of camperplaatsen (stellplatz.info)." },
      { name: "Interesses & Activiteiten", text: "Selecteer voorkeuren zoals natuur, cultuur, culinair of gezinsvriendelijke stops." },
      { name: "AI-prompt genereren", text: "Kies je AI-model (ChatGPT, Claude, Gemini) en kopieer de geoptimaliseerde prompt." },
      { name: "Route maken & GPX exporteren", text: "Plak de prompt in je AI en download de route als GPX-bestand voor je navigatiesysteem." },
    ],
    fr: [
      { name: "Sélection du véhicule", text: "Choisissez votre véhicule (camping-car, caravane, tente, moto) et indiquez dimensions et poids." },
      { name: "Destinations et points d'ancrage", text: "Définissez départ, arrivée et objectifs d'ancrage fixes optionnels." },
      { name: "Durée et étapes", text: "Définissez vos dates de voyage, vos étapes quotidiennes souhaitées et vos temps de conduite maximaux." },
      { name: "Préférences d'hébergement", text: "Choisissez vos préférences pour les campings (camping.info) ou aires de sosta (stellplatz.info)." },
      { name: "Intérêts et activités", text: "Sélectionnez vos préférences : nature, culture, gastronomie ou étapes familiales." },
      { name: "Générer le prompt IA", text: "Sélectionnez votre modèle d'IA (ChatGPT, Claude, Gemini) et copiez le prompt optimisé." },
      { name: "Créer l'itinéraire et exporter en GPX", text: "Collez le prompt dans votre IA et téléchargez l'itinéraire sous forme de fichier GPX pour votre GPS." },
    ],
    it: [
      { name: "Selezione veicolo", text: "Scegli il tuo veicolo (camper, caravan, tenda, moto) e inserisci dimensioni e peso." },
      { name: "Destinazioni e Punti di Ancoraggio", text: "Definisci partenza, arrivo ed eventuali mete fisse prenotate." },
      { name: "Durata e Tappe", text: "Imposta le date di viaggio, le tappe giornaliere desiderate e i tempi massimi di guida." },
      { name: "Preferenze alloggio", text: "Scegli le tue preferenze per campeggi (camping.info) o aree sosta (stellplatz.info)." },
      { name: "Interessi e Attività", text: "Seleziona preferenze come natura, cultura, gastronomia o tappe per famiglie." },
      { name: "Genera Prompt IA", text: "Scegli il tuo modello IA preferito (ChatGPT, Claude, Gemini) e copia il prompt ottimizzato." },
      { name: "Crea Itinerario ed Esporta GPX", text: "Incolla il prompt nella tua IA e scarica l'itinerario come file GPX per il tuo navigatore." },
    ],
  };

  const currentInfo = titles[locale];
  const currentSteps = stepsData[locale];

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": currentInfo.name,
    "description": currentInfo.description,
    "step": currentSteps.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "name": step.name,
      "text": step.text,
    })),
  };
}

export function generateWebApplicationSchema(locale: SchemaLocale) {
  const descriptions: Record<SchemaLocale, string> = {
    de: "Der spezialisierte KI-Prompt-Assistent für Wohnmobil-, Wohnwagen- und Campingreisen in Europa. Mit Stellplatz- & Campingplatzsuche und GPX-Export.",
    en: "The specialized AI prompt assistant for motorhome, caravan, and camping trips in Europe. Featuring campsite & stopover search and GPX export.",
    nl: "De gespecialiseerde AI-prompt-assistent voor camper-, caravan- en campingreizen in Europa. Met camping- & camperplaatszoeker en GPX-export.",
    fr: "L'assistant de prompt IA spécialisé pour les voyages en camping-car, caravane et camping en Europe. Avec recherche de campings & d'aires et export GPX.",
    it: "L'assistente prompt IA specializzato per viaggi in camper, caravan e campeggio in Europa. Con ricerca campeggi & aree sosta ed export GPX.",
  };

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Camping Route",
    "alternateName": ["CampingRoute", "CampingRoute.app"],
    "applicationCategory": "TravelApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript",
    "url": "https://campingroute.app/",
    "description": descriptions[locale],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
    },
    "featureList": [
      "KI-Prompt-Assistent für Camper & Wohnmobile",
      "Garantierte Direktlinks zu camping.info & stellplatz.info",
      "Live-Prüfung auf geöffnete Plätze zur Reisezeit",
      "Anker-Planung für fest gebuchte Hauptziele",
      "GPX-Export für Garmin & Navigationsgeräte",
      "100% Kostenlos und ohne Registrierung",
    ],
  };
}
