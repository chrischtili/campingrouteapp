const fs = require('fs');

const files = ['de.json', 'en.json'];
const basePath = 'src/i18n/locales/';

files.forEach(file => {
  const path = basePath + file;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  
  if (!data.anchorNav) data.anchorNav = {};
  
  if (file === 'de.json') {
    data.anchorNav.home = "Start";
    data.anchorNav.features = "Features";
    data.anchorNav.testimonials = "Erfahrungen";
    data.anchorNav.exampleRoute = "Beispielroute";
    data.anchorNav.mainContent = "Routenplaner";
    data.anchorNav.faq = "FAQ";
    data.anchorNav.backToTop = "Nach oben";
    
    if(!data.buttons) data.buttons = {};
    data.buttons.copy = "Kopieren";
    data.buttons.print = "Drucken";
  } else {
    data.anchorNav.home = "Home";
    data.anchorNav.features = "Features";
    data.anchorNav.testimonials = "Testimonials";
    data.anchorNav.exampleRoute = "Example Route";
    data.anchorNav.mainContent = "Route Planner";
    data.anchorNav.faq = "FAQ";
    data.anchorNav.backToTop = "Back to top";
    
    if(!data.buttons) data.buttons = {};
    data.buttons.copy = "Copy";
    data.buttons.print = "Print";
  }
  
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${file}`);
});
