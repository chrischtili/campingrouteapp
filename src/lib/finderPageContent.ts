import type { PlaceCategory } from "@/types/placeFinder";

export type FinderPageVariant = "camping" | "stopover";

type FinderPageCopy = {
  navLabel: string;
  badge: string;
  title: string;
  accent: string;
  lead: string;
  intro: string;
  chips: string[];
  quickFactsTitle: string;
  quickFacts: Array<{ title: string; description: string }>;
  searchBadge: string;
  searchTitle: string;
  searchLead: string;
  benefitsTitle: string;
  benefitsLead: string;
  benefits: Array<{ title: string; description: string }>;
  faqTitle: string;
  faqLead: string;
  faqs: Array<{ question: string; answer: string }>;
  plannerTitle: string;
  plannerLead: string;
  plannerCta: string;
  alternateLead: string;
  alternateCta: string;
  relatedTitle: string;
  homeCta: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
};

type FinderPageLocaleCopy = Record<FinderPageVariant, FinderPageCopy>;

const finderPageContent: Record<"de" | "en" | "fr" | "nl" | "it", FinderPageLocaleCopy> = {
  de: {
    camping: {
      navLabel: "Campingplatz-Finder",
      badge: "Campingplatzsuche",
      title: "Campingplätze finden",
      accent: "für entspannte Stopps",
      lead:
        "Für längere Aufenthalte, Familienstopps und klassische Campingplätze mit Infrastruktur. Direkt rund um deinen Zielort, klar gefiltert und schnell vergleichbar.",
      intro:
        "Ort eingeben, Treffer prüfen, Details öffnen und die passende Website direkt aufrufen. So findest du schneller den Platz, der wirklich zu deinem Trip passt.",
      chips: ["Wohnmobil", "Wohnwagen", "Zelt", "Familienplatz", "Dusche", "Strom"],
      quickFactsTitle: "Perfekt für",
      quickFacts: [
        {
          title: "Längere Stops",
          description: "Wenn du nicht nur übernachten, sondern vor Ort bleiben und Infrastruktur nutzen willst.",
        },
        {
          title: "Klassische Campingplätze",
          description: "Duschen, Toiletten, Strom und ein klarer Platzfokus statt gemischter Ergebnislisten.",
        },
        {
          title: "Schnelle Entscheidung",
          description: "Adresse, Telefon, Öffnungszeiten und Website direkt auf einer Seite vergleichen.",
        },
      ],
      searchBadge: "Campingplatzsuche",
      searchTitle: "Starte die Suche direkt im Ort, der dich wirklich interessiert.",
      searchLead:
        "Die Suche bleibt bewusst fokussiert auf Campingplätze. So bekommst du sauberere Treffer für Wochenenden, Urlaube und klassische Roadtrip-Übernachtungen.",
      benefitsTitle: "Warum diese Seite besser funktioniert",
      benefitsLead:
        "Die Suche ist bewusst auf klassische Campingplätze ausgerichtet, damit du schneller zu brauchbaren Treffern kommst.",
      benefits: [
        {
          title: "Klarere Treffer",
          description: "Du suchst direkt nach Campingplätzen und bekommst dadurch passendere Ergebnisse für Urlaub, Wochenende und Familienreise.",
        },
        {
          title: "Schneller vergleichen",
          description: "Adresse, Telefon, Öffnungszeiten und Website sind sofort sichtbar, ohne dass du dich durch mehrere Ebenen klicken musst.",
        },
        {
          title: "Weniger Suchstress",
          description: "Du kannst dich auf Platzwahl und Lage konzentrieren, statt erst Ergebnisse zu sortieren oder nachzufiltern.",
        },
      ],
      faqTitle: "Häufige Fragen zur Campingplatzsuche",
      faqLead: "Kurze Antworten für Leute, die einfach schnell zum passenden Platz kommen wollen.",
      faqs: [
        {
          question: "Für wen ist diese Seite gedacht?",
          answer:
            "Für alle, die zuerst einen konkreten Campingplatz rund um ihren Zielort suchen und dabei schnell gute Treffer mit echten Details sehen wollen.",
        },
        {
          question: "Sind hier nur klassische Campingplätze drin?",
          answer:
            "Ja, diese Seite startet bewusst nur mit Campingplätzen. Damit bleiben Treffer, Details und Websites deutlich konsistenter.",
        },
        {
          question: "Kann ich danach direkt weitermachen?",
          answer:
            "Ja. Wenn du deinen Zielort gefunden hast, kannst du im nächsten Schritt direkt in den Prompt-Assistenten wechseln.",
        },
      ],
      plannerTitle: "Nächster Schritt",
      plannerLead:
        "Wenn dein Zielort steht, geht es direkt weiter zum Prompt-Assistenten. Dort bereitest du deine Anfrage für Etappen, Fahrzeugdaten und Route in wenigen Klicks vor.",
      plannerCta: "Zum Prompt-Assistenten",
      alternateLead: "Du suchst eher flexible Wohnmobil-Übernachtungen für kurze Stopps?",
      alternateCta: "Zum Stellplatz-Finder",
      relatedTitle: "Campingplatzsuche und Routenplanung sauber verbinden",
      homeCta: "Camping Route Startseite",
      seo: {
        title: "Campingplatz Finder für Wohnmobil, Wohnwagen und Zelt | Camping Route",
        description:
          "Finde passende Campingplätze rund um deinen Zielort: mit Adresse, Website, Infrastruktur und direkter OSM-basierter Suche. Ideal für Wohnmobil-, Wohnwagen- und Zeltreisen.",
        keywords:
          "Campingplatz Finder, Campingplatzsuche, Campingplätze finden, Camping Route, Campingplatz Wohnmobil, Campingplatz Wohnwagen, Zeltplatz Suche",
      },
    },
    stopover: {
      navLabel: "Stellplatz-Finder",
      badge: "Stellplatzsuche",
      title: "Stellplätze finden",
      accent: "für schnelle Roadtrip-Stopps",
      lead:
        "Für flexible Übernachtungen mit dem Wohnmobil, kürzere Aufenthalte und pragmatische Etappenstopps. Schnell gefunden, klar dargestellt und direkt vergleichbar.",
      intro:
        "Ideal, wenn du nicht den großen Campingplatz suchst, sondern einen passenden Halt auf der Strecke. Ort eingeben, Treffer prüfen und direkt zur Website wechseln.",
      chips: ["Wohnmobil", "Kurzstopp", "Strom", "Transit", "Etappe", "Flexibel"],
      quickFactsTitle: "Perfekt für",
      quickFacts: [
        {
          title: "Etappen unterwegs",
          description: "Wenn du auf einer längeren Route einen vernünftigen Zwischenstopp suchst.",
        },
        {
          title: "Flexibles Reisen",
          description: "Weniger Campingplatz-Atmosphäre, mehr pragmatische Übernachtung für Wohnmobile.",
        },
        {
          title: "Schneller Vergleich",
          description: "Adresse, Strom, Öffnungszeiten und Website direkt sichtbar statt versteckt in Listen.",
        },
      ],
      searchBadge: "Stellplatzsuche",
      searchTitle: "Finde Wohnmobil-Stellplätze rund um deinen nächsten Halt.",
      searchLead:
        "Die Seite startet direkt mit Stellplätzen. So bekommst du schnellere Treffer für flexible Stops, Zwischennächte und Transit-Etappen.",
      benefitsTitle: "Warum diese Seite für Roadtrips Sinn macht",
      benefitsLead:
        "Die Suche ist auf spontane Etappen und flexible Wohnmobil-Übernachtungen ausgerichtet.",
      benefits: [
        {
          title: "Schneller zum Halt",
          description: "Du startest direkt mit Stellplätzen und sparst dir Umwege über weniger passende Platztypen.",
        },
        {
          title: "Besser für unterwegs",
          description: "Perfekt, wenn du heute noch einen sinnvollen Übernachtungsplatz brauchst und nicht lange suchen willst.",
        },
        {
          title: "Direkt vergleichbar",
          description: "Adresse, Strom, Öffnungszeiten und Website sind sofort sichtbar und helfen dir bei einer schnellen Entscheidung.",
        },
      ],
      faqTitle: "Häufige Fragen zur Stellplatzsuche",
      faqLead: "Die wichtigsten Antworten für unterwegs und für spontane Etappen.",
      faqs: [
        {
          question: "Wann nutze ich lieber den Stellplatz-Finder?",
          answer:
            "Wenn du eine flexible Wohnmobil-Übernachtung für eine Etappe suchst und kein klassisches Campingplatz-Setup brauchst.",
        },
        {
          question: "Ist das für Wohnwagen und Zelt auch sinnvoll?",
          answer:
            "Eher weniger. Diese Seite ist klar auf Wohnmobil-Stellplätze ausgerichtet. Für klassische Aufenthalte ist der Campingplatz-Finder besser.",
        },
        {
          question: "Wie geht es danach weiter?",
          answer:
            "Wenn dein Halt feststeht, kannst du direkt in den Prompt-Assistenten wechseln und dort deine weitere Reise vorbereiten.",
        },
      ],
      plannerTitle: "Nächster Schritt",
      plannerLead:
        "Sobald dein Halt steht, geht es direkt weiter zum Prompt-Assistenten. Dort formulierst du deine Touranfrage mit Fahrzeug, Etappen und Reisedaten.",
      plannerCta: "Zum Prompt-Assistenten",
      alternateLead: "Du willst lieber klassische Campingplätze mit mehr Infrastruktur sehen?",
      alternateCta: "Zum Campingplatz-Finder",
      relatedTitle: "Stellplatzsuche und Routenplanung sauber verbinden",
      homeCta: "Camping Route Startseite",
      seo: {
        title: "Stellplatz Finder für Wohnmobil-Roadtrips | Camping Route",
        description:
          "Finde Wohnmobil-Stellplätze für Zwischenstopps und flexible Übernachtungen: mit Adresse, Website, Öffnungszeiten und OSM-basierter Suche rund um deinen Zielort.",
        keywords:
          "Stellplatz Finder, Stellplatzsuche, Wohnmobil Stellplatz finden, Wohnmobil Stopover, Stellplätze Roadtrip, Camping Route Stellplatz",
      },
    },
  },
  en: {
    camping: {
      navLabel: "Camping Finder",
      badge: "Standalone search page",
      title: "Find campsites",
      accent: "without fighting the layout",
      lead:
        "Built for longer stays, family trips and classic campsites with proper infrastructure. Search around your actual destination without a slide-in panel breaking the mobile experience.",
      intro:
        "This page is tuned for real campsite discovery: enter a town, compare results, open the official website and move into route planning when you are ready.",
      chips: ["Motorhome", "Caravan", "Tent", "Family stay", "Showers", "Power"],
      quickFactsTitle: "Best for",
      quickFacts: [
        {
          title: "Longer stays",
          description: "When you want a proper campsite instead of a quick overnight stop.",
        },
        {
          title: "Classic camping infrastructure",
          description: "Showers, toilets, power and cleaner results focused on campsites.",
        },
        {
          title: "Faster decisions",
          description: "Address, website, opening times and contact details in one place.",
        },
      ],
      searchBadge: "Campsite search",
      searchTitle: "Search directly around the place that matters to your trip.",
      searchLead:
        "This page stays focused on campsites only, giving you cleaner results for holidays, weekends and classic roadtrip overnights.",
      benefitsTitle: "Why this page works better",
      benefitsLead:
        "Instead of a problematic overlay, you get a full landing page with stable scrolling, room for content and strong internal links.",
      benefits: [
        {
          title: "Calmer on mobile",
          description: "No iPhone Safari viewport chaos caused by slide-in panels and keyboard focus changes.",
        },
        {
          title: "Stronger for SEO",
          description: "A dedicated campsite URL is much more useful for search engines, internal links and your sitemap.",
        },
        {
          title: "Cleaner result intent",
          description: "The page starts with the right place type already selected, so users reach a useful list faster.",
        },
      ],
      faqTitle: "Campsite search FAQ",
      faqLead: "Short answers for people who want the right place fast.",
      faqs: [
        {
          question: "When should I use this page instead of the route planner?",
          answer:
            "Use it when your first goal is to find a campsite. Switch to the route planner when you want to build the whole trip afterwards.",
        },
        {
          question: "Does this page only show classic campsites?",
          answer:
            "Yes. It starts with campsites only, which keeps the search results and details much more consistent.",
        },
        {
          question: "Can I still continue into route planning afterwards?",
          answer:
            "Absolutely. This page is a fast entry point, while the full planner handles stages, vehicle details and AI prompts.",
        },
      ],
      plannerTitle: "Move from the place search straight into planning",
      plannerLead:
        "Once you know your target area, continue with full route planning, stage structure, vehicle setup and GPX-ready prompt generation.",
      plannerCta: "Open route planner",
      alternateLead: "Looking for flexible motorhome stopovers instead of classic campsites?",
      alternateCta: "Open stopover finder",
      relatedTitle: "Connect campsite search and route planning more cleanly",
      homeCta: "Camping Route homepage",
      seo: {
        title: "Camping Finder for motorhome, caravan and tent trips | Camping Route",
        description:
          "Find suitable campsites around your destination with address, website, infrastructure details and OSM-based search. Ideal for motorhome, caravan and tent travel.",
        keywords:
          "camping finder, campsite search, campsites near destination, motorhome campsite, caravan campsite, tent campsite, camping route",
      },
    },
    stopover: {
      navLabel: "Stopover Finder",
      badge: "Standalone search page",
      title: "Find stopovers",
      accent: "for fast roadtrip nights",
      lead:
        "Built for flexible motorhome overnights, short stays and practical route stops. No slide-in panel, no weird layout shifts, just a dedicated search page.",
      intro:
        "This page focuses on motorhome stopovers. It is the right place when you need a useful overnight location on the way, not a full campsite stay.",
      chips: ["Motorhome", "Short stay", "Power", "Transit", "Stage stop", "Flexible"],
      quickFactsTitle: "Best for",
      quickFacts: [
        {
          title: "Route stages",
          description: "When you need a useful overnight location during a longer drive.",
        },
        {
          title: "Flexible travel style",
          description: "Less campsite atmosphere, more pragmatic overnight options for motorhomes.",
        },
        {
          title: "Fast comparison",
          description: "Address, opening times, website and basic utilities are visible right away.",
        },
      ],
      searchBadge: "Stopover search",
      searchTitle: "Search motorhome stopovers around your next destination.",
      searchLead:
        "The page starts with stopovers only, so results are faster and more relevant for quick overnights and transit stages.",
      benefitsTitle: "Why this page fits roadtrip reality",
      benefitsLead:
        "It is not just another filter state. It is a dedicated search experience for a different type of travel decision: faster, leaner and more mobile-friendly.",
      benefits: [
        {
          title: "Reduced to the useful part",
          description: "Less result noise because the search starts directly with stopovers instead of mixed place types.",
        },
        {
          title: "Stable on iPhone",
          description: "No homepage overlay, just a normal page with normal browser behavior.",
        },
        {
          title: "Better for spontaneous routing",
          description: "Ideal when you want to decide quickly where you can stop tonight.",
        },
      ],
      faqTitle: "Stopover finder FAQ",
      faqLead: "Quick answers for people travelling stage by stage.",
      faqs: [
        {
          question: "When should I use the stopover finder?",
          answer:
            "Use it when you want a flexible motorhome overnight stay for a route stage instead of a full campsite experience.",
        },
        {
          question: "Is this also good for caravans or tents?",
          answer:
            "Usually not. This page is clearly tuned for motorhome stopovers. For classic camping stays, use the campsite finder.",
        },
        {
          question: "Can I continue into the full planner afterwards?",
          answer:
            "Yes. Start here to find the right overnight type, then continue with the full route planner for the rest of the trip.",
        },
      ],
      plannerTitle: "Go from a quick stop to the full trip plan",
      plannerLead:
        "Once your overnight style and stage goals are clear, continue in the planner for vehicle settings, route rules and prompt generation.",
      plannerCta: "Plan your route",
      alternateLead: "Prefer classic campsites with more infrastructure and a longer-stay feel?",
      alternateCta: "Open camping finder",
      relatedTitle: "Connect stopover search and route planning more cleanly",
      homeCta: "Camping Route homepage",
      seo: {
        title: "Stopover Finder for motorhome roadtrips | Camping Route",
        description:
          "Find motorhome stopovers for short stays and flexible overnights with address, website, opening times and OSM-based search around your destination.",
        keywords:
          "stopover finder, motorhome stopover, motorhome overnight search, roadtrip stopover, stellplatz finder, camping route stopover",
      },
    },
  },
  fr: {
    camping: {
      navLabel: "Recherche de campings",
      badge: "Recherche de campings",
      title: "Trouver des campings",
      accent: "pour des étapes détendues",
      lead:
        "Pour les séjours plus longs, les étapes en famille et les campings classiques avec infrastructure. Directement autour de ta destination, avec des résultats clairs et faciles à comparer.",
      intro:
        "Entre un lieu, vérifie les résultats, ouvre les détails et accède directement au bon site web. Tu trouves ainsi plus vite l’endroit qui correspond vraiment à ton voyage.",
      chips: ["Camping-car", "Caravane", "Tente", "Famille", "Douches", "Électricité"],
      quickFactsTitle: "Idéal pour",
      quickFacts: [
        {
          title: "Les séjours plus longs",
          description: "Quand tu veux rester sur place et profiter d’une vraie infrastructure.",
        },
        {
          title: "Les campings classiques",
          description: "Douches, toilettes, électricité et des résultats centrés sur les campings.",
        },
        {
          title: "Décider rapidement",
          description: "Comparer adresse, téléphone, horaires et site web directement sur une seule page.",
        },
      ],
      searchBadge: "Recherche de campings",
      searchTitle: "Lance la recherche directement autour du lieu qui compte vraiment.",
      searchLead:
        "La recherche reste volontairement centrée sur les campings. Tu obtiens ainsi des résultats plus propres pour les week-ends, les vacances et les nuitées classiques.",
      benefitsTitle: "Pourquoi cette page aide vraiment",
      benefitsLead:
        "La recherche est volontairement orientée vers les campings classiques pour que tu arrives plus vite à des résultats utiles.",
      benefits: [
        {
          title: "Des résultats plus clairs",
          description: "Tu recherches directement des campings et obtiens ainsi des résultats plus adaptés à tes vacances et séjours.",
        },
        {
          title: "Comparer plus vite",
          description: "Adresse, téléphone, horaires et site web sont visibles immédiatement.",
        },
        {
          title: "Moins de stress",
          description: "Tu peux te concentrer sur le choix du lieu au lieu de devoir trier les résultats.",
        },
      ],
      faqTitle: "Questions fréquentes sur la recherche de campings",
      faqLead: "Des réponses courtes pour aller rapidement au bon endroit.",
      faqs: [
        {
          question: "À qui s’adresse cette page ?",
          answer:
            "À toutes les personnes qui veulent d’abord trouver un camping concret autour de leur destination avec de vrais détails utiles.",
        },
        {
          question: "N’y a-t-il ici que des campings classiques ?",
          answer:
            "Oui. Cette page démarre volontairement uniquement avec des campings, ce qui rend les résultats plus cohérents.",
        },
        {
          question: "Puis-je continuer ensuite ?",
          answer:
            "Oui. Une fois ta destination trouvée, tu peux passer directement à l’assistant de prompt.",
        },
      ],
      plannerTitle: "Étape suivante",
      plannerLead:
        "Une fois ta destination définie, tu peux passer directement à l’assistant de prompt pour préparer ta demande avec étapes, véhicule et détails du voyage.",
      plannerCta: "Vers l’assistant de prompt",
      alternateLead: "Tu cherches plutôt des aires flexibles pour des arrêts courts ?",
      alternateCta: "Vers la recherche d’aires",
      relatedTitle: "Relier proprement la recherche de campings et la planification",
      homeCta: "Page d’accueil Camping Route",
      seo: {
        title: "Recherche de campings pour camping-car, caravane et tente | Camping Route",
        description:
          "Trouve des campings adaptés autour de ta destination avec adresse, site web, infrastructure et recherche OSM. Idéal pour camping-car, caravane et tente.",
        keywords:
          "recherche camping, trouver camping, camping-car camping, caravane camping, tente camping, Camping Route",
      },
    },
    stopover: {
      navLabel: "Recherche d’aires",
      badge: "Recherche d’aires",
      title: "Trouver des aires",
      accent: "pour des arrêts rapides",
      lead:
        "Pour les nuitées flexibles en camping-car, les haltes courtes et les étapes pragmatiques. Rapide à trouver, clair à lire et facile à comparer.",
      intro:
        "Idéal quand tu ne cherches pas un grand camping, mais un arrêt utile sur la route. Entre un lieu, vérifie les résultats et passe directement au site web.",
      chips: ["Camping-car", "Court arrêt", "Électricité", "Transit", "Étape", "Flexible"],
      quickFactsTitle: "Idéal pour",
      quickFacts: [
        {
          title: "Les étapes en route",
          description: "Quand tu cherches une halte raisonnable pendant un trajet plus long.",
        },
        {
          title: "Voyager de façon flexible",
          description: "Moins d’ambiance camping, plus de solutions pratiques pour la nuit.",
        },
        {
          title: "Comparer rapidement",
          description: "Adresse, électricité, horaires et site web sont visibles immédiatement.",
        },
      ],
      searchBadge: "Recherche d’aires",
      searchTitle: "Trouve des aires autour de ta prochaine étape.",
      searchLead:
        "La page démarre directement avec les aires. Tu obtiens ainsi plus vite des résultats pour les étapes, les nuits de transit et les arrêts spontanés.",
      benefitsTitle: "Pourquoi cette page est utile sur la route",
      benefitsLead:
        "La recherche est pensée pour les étapes spontanées et les nuitées flexibles en camping-car.",
      benefits: [
        {
          title: "Plus vite au bon arrêt",
          description: "Tu démarres directement avec les aires et évites les types de lieux moins pertinents.",
        },
        {
          title: "Mieux pour la route",
          description: "Parfait si tu veux savoir rapidement où t’arrêter ce soir.",
        },
        {
          title: "Comparaison directe",
          description: "Adresse, électricité, horaires et site web t’aident à décider rapidement.",
        },
      ],
      faqTitle: "Questions fréquentes sur la recherche d’aires",
      faqLead: "Les réponses essentielles pour voyager étape par étape.",
      faqs: [
        {
          question: "Quand utiliser plutôt la recherche d’aires ?",
          answer:
            "Quand tu veux une nuitée flexible en camping-car pour une étape et pas un camping classique.",
        },
        {
          question: "Est-ce aussi adapté aux caravanes ou aux tentes ?",
          answer:
            "Plutôt non. Cette page est clairement orientée vers les aires pour camping-cars. Pour un séjour classique, la recherche de campings est meilleure.",
        },
        {
          question: "Et après ?",
          answer:
            "Quand ton arrêt est choisi, tu peux passer directement à l’assistant de prompt.",
        },
      ],
      plannerTitle: "Étape suivante",
      plannerLead:
        "Quand ton arrêt est défini, tu peux passer directement à l’assistant de prompt pour préparer ta demande avec véhicule, étapes et dates.",
      plannerCta: "Vers l’assistant de prompt",
      alternateLead: "Tu préfères des campings classiques avec plus d’infrastructure ?",
      alternateCta: "Vers la recherche de campings",
      relatedTitle: "Relier proprement la recherche d’aires et la planification",
      homeCta: "Page d’accueil Camping Route",
      seo: {
        title: "Recherche d’aires pour road trips en camping-car | Camping Route",
        description:
          "Trouve des aires pour camping-car pour les étapes et les nuitées flexibles avec adresse, site web, horaires et recherche OSM.",
        keywords:
          "recherche aire camping-car, trouver aire, arrêt camping-car, aire road trip, Camping Route",
      },
    },
  },
  nl: {
    camping: {
      navLabel: "Campingzoeker",
      badge: "Campingzoeker",
      title: "Campings vinden",
      accent: "voor ontspannen stops",
      lead:
        "Voor langere verblijven, gezinsstops en klassieke campings met voorzieningen. Recht rond je bestemming, duidelijk gefilterd en snel te vergelijken.",
      intro:
        "Voer een plaats in, bekijk de resultaten, open de details en ga direct naar de juiste website. Zo vind je sneller de plek die echt bij je trip past.",
      chips: ["Camper", "Caravan", "Tent", "Gezin", "Douche", "Stroom"],
      quickFactsTitle: "Perfect voor",
      quickFacts: [
        { title: "Langere stops", description: "Als je niet alleen wilt overnachten, maar ook gebruik wilt maken van voorzieningen." },
        { title: "Klassieke campings", description: "Douches, toiletten, stroom en resultaten die echt op campings zijn gericht." },
        { title: "Snelle keuze", description: "Adres, telefoon, openingstijden en website direct op één plek vergelijken." },
      ],
      searchBadge: "Campingzoeker",
      searchTitle: "Start de zoekopdracht direct in de plaats die echt belangrijk is.",
      searchLead:
        "De zoekopdracht blijft bewust gericht op campings. Zo krijg je schonere resultaten voor weekends, vakanties en klassieke roadtrip-overnachtingen.",
      benefitsTitle: "Waarom deze pagina beter werkt",
      benefitsLead: "De zoekopdracht is bewust gericht op klassieke campings, zodat je sneller bruikbare resultaten krijgt.",
      benefits: [
        { title: "Duidelijkere resultaten", description: "Je zoekt direct naar campings en krijgt daardoor betere resultaten voor vakantie en weekendtrips." },
        { title: "Sneller vergelijken", description: "Adres, telefoon, openingstijden en website zijn direct zichtbaar." },
        { title: "Minder zoekstress", description: "Je kunt je richten op plek en ligging in plaats van eerst resultaten uit te filteren." },
      ],
      faqTitle: "Veelgestelde vragen over campings zoeken",
      faqLead: "Korte antwoorden voor mensen die snel de juiste plek willen vinden.",
      faqs: [
        { question: "Voor wie is deze pagina bedoeld?", answer: "Voor iedereen die eerst een concrete camping rond de bestemming wil vinden en daarbij snel echte details wil zien." },
        { question: "Staan hier alleen klassieke campings in?", answer: "Ja. Deze pagina start bewust alleen met campings, zodat resultaten en details consistenter blijven." },
        { question: "Kan ik daarna meteen verder?", answer: "Ja. Als je bestemming vaststaat, kun je direct doorgaan naar de prompt-assistent." },
      ],
      plannerTitle: "Volgende stap",
      plannerLead: "Als je bestemming vaststaat, ga je direct verder naar de prompt-assistent. Daar bereid je je aanvraag met etappes, voertuig en reisdetails voor.",
      plannerCta: "Naar de prompt-assistent",
      alternateLead: "Zoek je liever flexibele camperovernachtingen voor korte stops?",
      alternateCta: "Naar de camperplaatszoeker",
      relatedTitle: "Campingzoeker en routeplanning beter verbinden",
      homeCta: "Camping Route startpagina",
      seo: {
        title: "Campingzoeker voor camper, caravan en tent | Camping Route",
        description: "Vind passende campings rond je bestemming met adres, website, voorzieningen en OSM-zoekfunctie.",
        keywords: "campingzoeker, campings vinden, camper camping, caravan camping, tent camping, Camping Route",
      },
    },
    stopover: {
      navLabel: "Camperplaatszoeker",
      badge: "Camperplaatszoeker",
      title: "Camperplaatsen vinden",
      accent: "voor snelle roadtrip-stops",
      lead:
        "Voor flexibele overnachtingen met de camper, korte verblijven en pragmatische etappestops. Snel gevonden, duidelijk weergegeven en direct te vergelijken.",
      intro:
        "Ideaal als je geen grote camping zoekt, maar een praktische stop onderweg. Voer een plaats in, bekijk de resultaten en ga direct naar de website.",
      chips: ["Camper", "Korte stop", "Stroom", "Transit", "Etappe", "Flexibel"],
      quickFactsTitle: "Perfect voor",
      quickFacts: [
        { title: "Etappes onderweg", description: "Als je tijdens een langere route een zinvolle tussenstop zoekt." },
        { title: "Flexibel reizen", description: "Minder campinggevoel, meer pragmatische overnachtingsopties voor campers." },
        { title: "Snel vergelijken", description: "Adres, stroom, openingstijden en website direct zichtbaar." },
      ],
      searchBadge: "Camperplaatszoeker",
      searchTitle: "Vind camperplaatsen rond je volgende stop.",
      searchLead:
        "De pagina start direct met camperplaatsen. Zo krijg je sneller resultaten voor flexibele stops, tussenovernachtingen en transit-etappes.",
      benefitsTitle: "Waarom deze pagina handig is voor roadtrips",
      benefitsLead: "De zoekopdracht is gericht op spontane etappes en flexibele overnachtingen met de camper.",
      benefits: [
        { title: "Sneller naar de juiste stop", description: "Je start direct met camperplaatsen en bespaart omwegen via minder passende resultaten." },
        { title: "Beter voor onderweg", description: "Perfect als je snel wilt weten waar je vanavond zinvol kunt staan." },
        { title: "Direct vergelijkbaar", description: "Adres, stroom, openingstijden en website helpen je snel beslissen." },
      ],
      faqTitle: "Veelgestelde vragen over camperplaatsen zoeken",
      faqLead: "De belangrijkste antwoorden voor onderweg en spontane etappes.",
      faqs: [
        { question: "Wanneer gebruik ik liever de camperplaatszoeker?", answer: "Als je een flexibele camperovernachting voor een etappe zoekt en geen klassieke camping nodig hebt." },
        { question: "Is dit ook handig voor caravan of tent?", answer: "Meestal niet. Deze pagina is duidelijk gericht op camperplaatsen. Voor klassieke verblijven is de campingzoeker beter." },
        { question: "Hoe ga ik daarna verder?", answer: "Als je stop vaststaat, kun je direct doorgaan naar de prompt-assistent." },
      ],
      plannerTitle: "Volgende stap",
      plannerLead: "Zodra je stop vaststaat, ga je direct verder naar de prompt-assistent. Daar formuleer je je reisaanvraag met voertuig, etappes en data.",
      plannerCta: "Naar de prompt-assistent",
      alternateLead: "Wil je liever klassieke campings met meer voorzieningen zien?",
      alternateCta: "Naar de campingzoeker",
      relatedTitle: "Camperplaatszoeker en routeplanning beter verbinden",
      homeCta: "Camping Route startpagina",
      seo: {
        title: "Camperplaatszoeker voor roadtrips | Camping Route",
        description: "Vind camperplaatsen voor tussenstops en flexibele overnachtingen met adres, website, openingstijden en OSM-zoekfunctie.",
        keywords: "camperplaatszoeker, camperplaats vinden, camper stop, roadtrip camperplaats, Camping Route",
      },
    },
  },
  it: {
    camping: {
      navLabel: "Ricerca campeggi",
      badge: "Ricerca campeggi",
      title: "Trova campeggi",
      accent: "per soste rilassate",
      lead:
        "Per soggiorni più lunghi, tappe in famiglia e campeggi classici con servizi. Direttamente intorno alla tua destinazione, con risultati chiari e facili da confrontare.",
      intro:
        "Inserisci un luogo, controlla i risultati, apri i dettagli e visita subito il sito giusto. Così trovi più rapidamente il posto davvero adatto al tuo viaggio.",
      chips: ["Camper", "Caravan", "Tenda", "Famiglia", "Docce", "Elettricità"],
      quickFactsTitle: "Perfetto per",
      quickFacts: [
        { title: "Soste più lunghe", description: "Se non vuoi solo dormire, ma anche fermarti e usare i servizi." },
        { title: "Campeggi classici", description: "Docce, toilette, elettricità e risultati davvero centrati sui campeggi." },
        { title: "Decisioni rapide", description: "Confronta subito indirizzo, telefono, orari e sito web in un’unica pagina." },
      ],
      searchBadge: "Ricerca campeggi",
      searchTitle: "Avvia la ricerca direttamente nel luogo che ti interessa davvero.",
      searchLead:
        "La ricerca resta volutamente focalizzata sui campeggi. Così ottieni risultati più puliti per weekend, vacanze e soste classiche.",
      benefitsTitle: "Perché questa pagina funziona meglio",
      benefitsLead: "La ricerca è pensata apposta per i campeggi classici, così arrivi prima a risultati utili.",
      benefits: [
        { title: "Risultati più chiari", description: "Cerchi direttamente campeggi e ottieni risultati più adatti a vacanze e soggiorni." },
        { title: "Confronto più rapido", description: "Indirizzo, telefono, orari e sito web sono visibili subito." },
        { title: "Meno stress", description: "Puoi concentrarti sulla scelta del posto invece di filtrare prima i risultati." },
      ],
      faqTitle: "Domande frequenti sulla ricerca campeggi",
      faqLead: "Risposte brevi per arrivare subito al posto giusto.",
      faqs: [
        { question: "Per chi è pensata questa pagina?", answer: "Per chi vuole prima trovare un campeggio concreto intorno alla propria destinazione e vedere rapidamente dettagli utili." },
        { question: "Qui ci sono solo campeggi classici?", answer: "Sì. Questa pagina parte volutamente solo con campeggi, così risultati e dettagli restano più coerenti." },
        { question: "Posso continuare subito dopo?", answer: "Sì. Quando la destinazione è chiara, puoi passare direttamente all’assistente prompt." },
      ],
      plannerTitle: "Passo successivo",
      plannerLead: "Quando la destinazione è chiara, passi direttamente all’assistente prompt. Lì prepari la tua richiesta con tappe, veicolo e dettagli di viaggio.",
      plannerCta: "Vai all’assistente prompt",
      alternateLead: "Cerchi invece soste flessibili in camper per tappe brevi?",
      alternateCta: "Vai alla ricerca aree sosta",
      relatedTitle: "Collegare meglio la ricerca campeggi e la pianificazione",
      homeCta: "Homepage Camping Route",
      seo: {
        title: "Ricerca campeggi per camper, caravan e tenda | Camping Route",
        description: "Trova campeggi adatti vicino alla tua destinazione con indirizzo, sito web, servizi e ricerca OSM.",
        keywords: "ricerca campeggi, trova campeggi, camper campeggio, caravan campeggio, tenda campeggio, Camping Route",
      },
    },
    stopover: {
      navLabel: "Ricerca aree sosta",
      badge: "Ricerca aree sosta",
      title: "Trova aree sosta",
      accent: "per stop rapidi",
      lead:
        "Per pernottamenti flessibili in camper, soste brevi e tappe pratiche. Veloci da trovare, chiare da leggere e facili da confrontare.",
      intro:
        "Ideale se non cerchi un grande campeggio, ma una sosta utile lungo il percorso. Inserisci un luogo, controlla i risultati e vai subito al sito web.",
      chips: ["Camper", "Sosta breve", "Elettricità", "Transito", "Tappa", "Flessibile"],
      quickFactsTitle: "Perfetto per",
      quickFacts: [
        { title: "Tappe in viaggio", description: "Quando durante un tragitto più lungo ti serve una sosta sensata." },
        { title: "Viaggi flessibili", description: "Meno atmosfera da campeggio, più pernottamenti pratici per camper." },
        { title: "Confronto rapido", description: "Indirizzo, elettricità, orari e sito web sono visibili subito." },
      ],
      searchBadge: "Ricerca aree sosta",
      searchTitle: "Trova aree sosta intorno alla tua prossima tappa.",
      searchLead:
        "La pagina parte direttamente con le aree sosta. Così ottieni più velocemente risultati per soste flessibili, notti intermedie e tappe di transito.",
      benefitsTitle: "Perché questa pagina è utile nei road trip",
      benefitsLead: "La ricerca è orientata alle tappe spontanee e ai pernottamenti flessibili in camper.",
      benefits: [
        { title: "Più veloce verso la sosta giusta", description: "Parti subito con le aree sosta ed eviti risultati meno adatti." },
        { title: "Meglio per chi è in viaggio", description: "Perfetta se vuoi capire velocemente dove fermarti stanotte." },
        { title: "Confronto diretto", description: "Indirizzo, elettricità, orari e sito web ti aiutano a decidere rapidamente." },
      ],
      faqTitle: "Domande frequenti sulla ricerca aree sosta",
      faqLead: "Le risposte più importanti per chi viaggia tappa dopo tappa.",
      faqs: [
        { question: "Quando conviene usare la ricerca aree sosta?", answer: "Quando vuoi un pernottamento flessibile in camper per una tappa e non ti serve un campeggio classico." },
        { question: "È utile anche per caravan o tenda?", answer: "Di solito no. Questa pagina è chiaramente orientata alle aree sosta per camper. Per i soggiorni classici è meglio la ricerca campeggi." },
        { question: "Come continuo dopo?", answer: "Quando la sosta è definita, puoi passare direttamente all’assistente prompt." },
      ],
      plannerTitle: "Passo successivo",
      plannerLead: "Quando la sosta è definita, passi direttamente all’assistente prompt. Lì prepari la tua richiesta con veicolo, tappe e date.",
      plannerCta: "Vai all’assistente prompt",
      alternateLead: "Preferisci campeggi classici con più infrastruttura?",
      alternateCta: "Vai alla ricerca campeggi",
      relatedTitle: "Collegare meglio la ricerca aree sosta e la pianificazione",
      homeCta: "Homepage Camping Route",
      seo: {
        title: "Ricerca aree sosta per road trip in camper | Camping Route",
        description: "Trova aree sosta per camper per tappe e pernottamenti flessibili con indirizzo, sito web, orari e ricerca OSM.",
        keywords: "ricerca aree sosta, trova area sosta, stop camper, road trip area sosta, Camping Route",
      },
    },
  },
};

const getLocale = (language: string) => {
  if (language.startsWith("de")) return "de";
  if (language.startsWith("fr")) return "fr";
  if (language.startsWith("nl")) return "nl";
  if (language.startsWith("it")) return "it";
  return "en";
};

export function getFinderPageContent(language: string, variant: FinderPageVariant) {
  return finderPageContent[getLocale(language)][variant];
}

export function getFinderNavLabels(language: string) {
  const locale = getLocale(language);
  return {
    camping: finderPageContent[locale].camping.navLabel,
    stopover: finderPageContent[locale].stopover.navLabel,
  };
}

export function getFinderPageCategories(variant: FinderPageVariant): PlaceCategory[] {
  return variant === "camping" ? ["camp_site"] : ["caravan_site"];
}

export function getFinderSeo(pathname: string, language: string) {
  const locale = getLocale(language);

  if (pathname === "/campingplatz-finder") {
    return finderPageContent[locale].camping.seo;
  }

  if (pathname === "/stellplatz-finder") {
    return finderPageContent[locale].stopover.seo;
  }

  return null;
}
