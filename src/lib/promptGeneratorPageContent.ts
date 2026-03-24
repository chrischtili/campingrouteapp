type PromptGeneratorPageCopy = {
  badge: string;
  title: string;
  accent: string;
  lead: string;
  intro: string;
  chips: string[];
  primaryCta: string;
  secondaryCta: string;
  tertiaryCta: string;
  quickFactsTitle: string;
  quickFacts: Array<{ title: string; description: string }>;
  stepsTitle: string;
  stepsLead: string;
  steps: Array<{ title: string; description: string }>;
  plannerBadge: string;
  plannerTitle: string;
  plannerLead: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
};

const promptGeneratorPageContent: Record<"de" | "en" | "fr" | "nl" | "it", PromptGeneratorPageCopy> = {
  de: {
    badge: "KI-Prompt-Assistent",
    title: "Plane deine Route",
    accent: "mit einem Prompt, der wirklich hilft",
    lead:
      "Von der ersten Idee bis zum kopierfertigen Prompt: mit Platzsuche, Fahrzeugdaten, Etappen, GPX-Wunsch und allen Details, die deine KI wirklich braucht.",
    intro:
      "Hier stellst du deine Anfrage Schritt für Schritt klar zusammen. So erhältst du am Ende einen Prompt, der zu Fahrzeug, Reiseziel und Fahrstil passt.",
    chips: ["Wohnmobil", "Wohnwagen", "Zelt", "Motorrad", "Etappen", "GPX"],
    primaryCta: "Jetzt Prompt erstellen",
    secondaryCta: "Campingplätze suchen",
    tertiaryCta: "Stellplätze suchen",
    quickFactsTitle: "Was du hier bekommst",
    quickFacts: [
      {
        title: "Ein sauberer Flow",
        description: "Alle wichtigen Angaben an einem Ort, damit du nichts vergisst und schneller zu einem brauchbaren Ergebnis kommst.",
      },
      {
        title: "Platzsuche direkt dabei",
        description: "Suche passende Camping- oder Stellplätze, ohne den Assistenten zu verlassen.",
      },
      {
        title: "Direkt nutzbar",
        description: "Am Ende erhältst du einen klaren Prompt zum Kopieren und Weiterverwenden in deiner bevorzugten KI.",
      },
    ],
    stepsTitle: "So funktioniert der Assistent",
    stepsLead: "Klar, schnell und ohne unnötigen Ballast.",
    steps: [
      {
        title: "Route festlegen",
        description: "Start, Ziel, Stopps und Reisedaten eintragen, damit der Rahmen deiner Tour steht.",
      },
      {
        title: "Fahrzeug und Plätze anpassen",
        description: "Fahrzeugtyp, Anforderungen, Infrastruktur und optionale Platzsuche auf deinen Stil abstimmen.",
      },
      {
        title: "Prompt erstellen",
        description: "Den fertigen Prompt kopieren und direkt in deiner bevorzugten KI verwenden.",
      },
    ],
    plannerBadge: "Assistent",
    plannerTitle: "Erstelle jetzt deinen Prompt",
    plannerLead:
      "Mit dem Prompt-Assistenten gibst du deiner KI genau die richtigen Infos. So entstehen deutlich stärkere, passendere und besser nutzbare Routenvorschläge für deinen Trip.",
    seo: {
      title: "KI-Prompt-Assistent für Camping- und Roadtrips | Camping Route",
      description:
        "Erstelle starke Prompts für Camping- und Roadtrip-Routen mit dem KI-Prompt-Assistenten für Wohnmobil, Wohnwagen, Zelt oder Motorrad. Inklusive Platzsuche, Etappenplanung und GPX-Wunsch.",
      keywords:
        "Prompt Assistent Camping, KI Prompt Assistent Roadtrip, Camping Route Prompt, Wohnmobil Prompt, Camping Route Assistent, KI Camping Planung",
    },
  },
  en: {
    badge: "AI Prompt Assistant",
    title: "Plan your route",
    accent: "with a prompt that actually helps",
    lead:
      "From the first idea to a copy-ready prompt: with place search, vehicle details, stages, GPX preferences and the trip context your AI actually needs.",
    intro:
      "Build your request step by step and end up with a prompt that fits your vehicle, destination and travel style.",
    chips: ["Motorhome", "Caravan", "Tent", "Motorcycle", "Stages", "GPX"],
    primaryCta: "Create prompt now",
    secondaryCta: "Find campsites",
    tertiaryCta: "Find stopovers",
    quickFactsTitle: "What you get here",
    quickFacts: [
      {
        title: "A clean flow",
        description: "All important trip details in one place so you can create a useful route prompt faster.",
      },
      {
        title: "Built-in place search",
        description: "Search campsites or stopovers without leaving the assistant.",
      },
      {
        title: "Ready to use",
        description: "End with a clear prompt you can copy and use in your preferred AI.",
      },
    ],
    stepsTitle: "How the assistant works",
    stepsLead: "Straightforward, fast and focused.",
    steps: [
      {
        title: "Set the route",
        description: "Add start, destination, stages and dates so your trip framework is clear.",
      },
      {
        title: "Adjust vehicle and places",
        description: "Tune vehicle type, requirements, infrastructure and optional place search to your style.",
      },
      {
        title: "Generate the prompt",
        description: "Copy the finished prompt and use it directly in your preferred AI.",
      },
    ],
    plannerBadge: "Assistant",
    plannerTitle: "Create your prompt now",
    plannerLead:
      "The prompt assistant gives your AI the right context from the start, so it can create stronger, more relevant and more usable route suggestions for your trip.",
    seo: {
      title: "AI Prompt Assistant for Camping and Road Trips | Camping Route",
      description:
        "Create stronger AI prompts for camping and road-trip routes with the AI prompt assistant for motorhome, caravan, tent or motorcycle. Includes place search, stages and GPX preferences.",
      keywords:
        "AI prompt assistant camping, road trip prompt assistant, camping route prompt, motorhome prompt, camping route assistant",
    },
  },
  fr: {
    badge: "Assistant de prompt IA",
    title: "Planifie ton itinéraire",
    accent: "avec un prompt vraiment utile",
    lead:
      "De la première idée jusqu’au prompt prêt à copier : avec recherche d’emplacements, données du véhicule, étapes, souhait GPX et tous les détails dont ton IA a réellement besoin.",
    intro:
      "Ici, tu construis ta demande étape par étape de manière claire. Au final, tu obtiens un prompt adapté à ton véhicule, à ta destination et à ton style de voyage.",
    chips: ["Camping-car", "Caravane", "Tente", "Moto", "Étapes", "GPX"],
    primaryCta: "Créer le prompt maintenant",
    secondaryCta: "Chercher des campings",
    tertiaryCta: "Chercher des aires",
    quickFactsTitle: "Ce que tu obtiens ici",
    quickFacts: [
      {
        title: "Un flux clair",
        description: "Toutes les informations importantes au même endroit pour arriver plus vite à un prompt vraiment exploitable.",
      },
      {
        title: "Recherche de places intégrée",
        description: "Cherche des campings ou des aires sans quitter l’assistant.",
      },
      {
        title: "Prêt à l’emploi",
        description: "À la fin, tu obtiens un prompt clair à copier et à utiliser dans l’IA de ton choix.",
      },
    ],
    stepsTitle: "Comment fonctionne l’assistant",
    stepsLead: "Clair, rapide et sans surcharge inutile.",
    steps: [
      {
        title: "Définir l’itinéraire",
        description: "Renseigne le départ, la destination, les étapes et les dates pour poser le cadre du voyage.",
      },
      {
        title: "Ajuster le véhicule et les places",
        description: "Adapte le type de véhicule, les besoins, l’infrastructure et la recherche de places à ton style de voyage.",
      },
      {
        title: "Générer le prompt",
        description: "Copie le prompt final et utilise-le directement dans l’IA de ton choix.",
      },
    ],
    plannerBadge: "Assistant",
    plannerTitle: "Crée maintenant ton prompt",
    plannerLead:
      "L’assistant de prompt donne à ton IA les bonnes informations dès le départ, pour obtenir des suggestions d’itinéraire plus fortes, plus pertinentes et plus utiles.",
    seo: {
      title: "Assistant de prompt IA pour camping et road trips | Camping Route",
      description:
        "Crée des prompts puissants pour des itinéraires en camping-car, caravane, tente ou moto avec l’assistant de prompt IA. Avec recherche de places, planification des étapes et préférence GPX.",
      keywords:
        "assistant de prompt camping, assistant de prompt road trip, prompt camping-car, prompt itinéraire camping, Camping Route",
    },
  },
  nl: {
    badge: "AI-prompt-assistent",
    title: "Plan je route",
    accent: "met een prompt die echt helpt",
    lead:
      "Van het eerste idee tot een prompt die je direct kunt kopiëren: met plaatszoeker, voertuiggegevens, etappes, GPX-voorkeur en alle context die je AI echt nodig heeft.",
    intro:
      "Hier stel je je aanvraag stap voor stap helder samen. Zo krijg je uiteindelijk een prompt die past bij voertuig, bestemming en reisstijl.",
    chips: ["Camper", "Caravan", "Tent", "Motor", "Etappes", "GPX"],
    primaryCta: "Nu prompt maken",
    secondaryCta: "Campings zoeken",
    tertiaryCta: "Camperplaatsen zoeken",
    quickFactsTitle: "Wat je hier krijgt",
    quickFacts: [
      {
        title: "Een heldere flow",
        description: "Alle belangrijke gegevens op één plek, zodat je sneller een echt bruikbare prompt maakt.",
      },
      {
        title: "Plaatszoeker inbegrepen",
        description: "Zoek campings of camperplaatsen zonder de assistent te verlaten.",
      },
      {
        title: "Direct bruikbaar",
        description: "Aan het einde krijg je een duidelijke prompt om te kopiëren en te gebruiken in je favoriete AI.",
      },
    ],
    stepsTitle: "Zo werkt de assistent",
    stepsLead: "Duidelijk, snel en zonder overbodige ballast.",
    steps: [
      {
        title: "Route bepalen",
        description: "Vul start, bestemming, tussenstops en data in zodat het kader van je reis klopt.",
      },
      {
        title: "Voertuig en plaatsen afstemmen",
        description: "Stem voertuigtype, wensen, infrastructuur en optionele plaatszoeker af op jouw reisstijl.",
      },
      {
        title: "Prompt genereren",
        description: "Kopieer de uiteindelijke prompt en gebruik die direct in je favoriete AI.",
      },
    ],
    plannerBadge: "Assistent",
    plannerTitle: "Maak nu je prompt",
    plannerLead:
      "Met de prompt-assistent geef je je AI meteen de juiste context, zodat die sterkere, relevantere en beter bruikbare routesuggesties kan maken.",
    seo: {
      title: "AI-prompt-assistent voor camping- en roadtrips | Camping Route",
      description:
        "Maak sterke prompts voor routes met camper, caravan, tent of motor met de AI-prompt-assistent. Inclusief plaatszoeker, etappeplanning en GPX-voorkeur.",
      keywords:
        "ai prompt-assistent camping, prompt-assistent roadtrip, camper prompt, camping route prompt, Camping Route",
    },
  },
  it: {
    badge: "Assistente prompt IA",
    title: "Pianifica il tuo itinerario",
    accent: "con un prompt che aiuta davvero",
    lead:
      "Dalla prima idea fino al prompt pronto da copiare: con ricerca aree, dati del veicolo, tappe, preferenze GPX e tutti i dettagli di cui la tua IA ha davvero bisogno.",
    intro:
      "Qui componi la tua richiesta passo dopo passo in modo chiaro. Alla fine ottieni un prompt adatto a veicolo, destinazione e stile di viaggio.",
    chips: ["Camper", "Caravan", "Tenda", "Moto", "Tappe", "GPX"],
    primaryCta: "Crea ora il prompt",
    secondaryCta: "Cerca campeggi",
    tertiaryCta: "Cerca aree sosta",
    quickFactsTitle: "Cosa ottieni qui",
    quickFacts: [
      {
        title: "Un flusso chiaro",
        description: "Tutte le informazioni importanti in un solo posto, per arrivare più in fretta a un prompt davvero utile.",
      },
      {
        title: "Ricerca aree integrata",
        description: "Cerca campeggi o aree sosta senza uscire dall’assistente.",
      },
      {
        title: "Pronto all’uso",
        description: "Alla fine ottieni un prompt chiaro da copiare e usare nella tua IA preferita.",
      },
    ],
    stepsTitle: "Come funziona l’assistente",
    stepsLead: "Chiaro, rapido e senza zavorra inutile.",
    steps: [
      {
        title: "Definisci il percorso",
        description: "Inserisci partenza, destinazione, tappe e date per dare una struttura chiara al viaggio.",
      },
      {
        title: "Adatta veicolo e soste",
        description: "Adatta tipo di veicolo, esigenze, infrastrutture e ricerca aree al tuo stile di viaggio.",
      },
      {
        title: "Genera il prompt",
        description: "Copia il prompt finale e usalo direttamente nella tua IA preferita.",
      },
    ],
    plannerBadge: "Assistente",
    plannerTitle: "Crea ora il tuo prompt",
    plannerLead:
      "Con l’assistente prompt dai subito alla tua IA le informazioni giuste, così ottieni suggerimenti di itinerario più forti, più pertinenti e più utili.",
    seo: {
      title: "Assistente prompt IA per camping e road trip | Camping Route",
      description:
        "Crea prompt efficaci per itinerari in camper, caravan, tenda o moto con l’assistente prompt IA. Con ricerca aree, pianificazione delle tappe e preferenze GPX.",
      keywords:
        "assistente prompt camping, assistente prompt road trip, prompt camper, prompt itinerario camping, Camping Route",
    },
  },
};

const resolveLanguage = (language: string) => {
  if (language.startsWith("de")) return "de";
  if (language.startsWith("fr")) return "fr";
  if (language.startsWith("nl")) return "nl";
  if (language.startsWith("it")) return "it";
  return "en";
};

export const getPromptGeneratorPageContent = (language: string) =>
  promptGeneratorPageContent[resolveLanguage(language)];

export const getPromptGeneratorSeo = (pathname: string, language: string) => {
  if (pathname !== "/prompt-generator") {
    return null;
  }

  return getPromptGeneratorPageContent(language).seo;
};
