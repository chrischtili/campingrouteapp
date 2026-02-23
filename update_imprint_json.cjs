const fs = require('fs');

const dePath = 'src/i18n/locales/de.json';
const enPath = 'src/i18n/locales/en.json';

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

de.imprint = {
  badge: "Anbieterkennzeichnung",
  title: "Impressum",
  project: {
    title: "Angaben gemäß § 5 TMG"
  },
  contact: {
    title: "Kontakt",
    name: "Christian Kopmann",
    email: "info@campingroute.app"
  },
  disclaimer: {
    title: "Haftung für Inhalte und Links",
    description1: "Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Die generierten Wohnmobil-Routen werden durch externe Künstliche Intelligenz (wie OpenAI oder Gemini) erzeugt. Wir übernehmen keine Gewähr für die Richtigkeit, Durchführbarkeit oder Sicherheit der vorgeschlagenen Strecken und Übernachtungsplätze. Die Nutzung der Routen erfolgt stets auf eigene Gefahr und Verantwortung des Fahrers.",
    description2: "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen."
  },
  openSource: {
    title: "Urheberrecht & Open Source",
    description1: "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen der MIT-Lizenz. Das Projekt ist Open-Source. Du kannst den Quellcode auf GitHub einsehen, modifizieren und nutzen.",
    link: "Zum GitHub Repository"
  },
  backToHome: "Zur Startseite"
};

en.imprint = {
  badge: "Provider Identification",
  title: "Imprint",
  project: {
    title: "Information according to § 5 TMG"
  },
  contact: {
    title: "Contact",
    name: "Christian Kopmann",
    email: "info@campingroute.app"
  },
  disclaimer: {
    title: "Liability for Content and Links",
    description1: "As a service provider, we are responsible for our own content on these pages according to § 7 Abs.1 TMG. The generated motorhome routes are created by external Artificial Intelligence (such as OpenAI or Gemini). We assume no liability or guarantee for the accuracy, feasibility, or safety of the suggested routes and overnight stops. Using these routes is strictly at the driver's own risk and responsibility.",
    description2: "Our service contains links to external third-party websites. We have no influence on their content and therefore cannot assume any liability for these external contents."
  },
  openSource: {
    title: "Copyright & Open Source",
    description1: "The content and works created by the site operators on these pages are subject to the MIT License. The project is open-source. You can view, modify, and use the source code on GitHub.",
    link: "View GitHub Repository"
  },
  backToHome: "Back to Home"
};

fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('Imprint updated.');
