const fs = require('fs');

const enPath = 'src/i18n/locales/en.json';
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function findGermanWords(obj, prefix = '') {
  let issues = [];
  const germanWords = ['und', 'oder', 'ist', 'das', 'der', 'die', 'nicht', 'mit', 'zu', 'von', 'für', 'auf', 'sich', 'ein', 'eine'];
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      issues = issues.concat(findGermanWords(obj[key], `${prefix}${key}.`));
    } else if (typeof obj[key] === 'string') {
      const words = obj[key].toLowerCase().split(/[\s,.-]+/);
      const containsGerman = words.some(w => germanWords.includes(w) && w.length > 2);
      const containsUmlaut = /[äöüß]/.test(obj[key].toLowerCase());
      
      // Filter out known exceptions like names, places
      const isException = false; 

      if ((containsGerman || containsUmlaut) && !isException) {
        issues.push({ key: `${prefix}${key}`, val: obj[key] });
      }
    }
  }
  return issues;
}

const potentialIssues = findGermanWords(en);
console.log('--- Potential German texts in en.json ---');
potentialIssues.forEach(i => console.log(`${i.key}: "${i.val}"`));
