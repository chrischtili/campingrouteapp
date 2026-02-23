const fs = require('fs');

const de = JSON.parse(fs.readFileSync('src/i18n/locales/de.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], `${prefix}${key}.`));
    } else {
      keys.push(`${prefix}${key}`);
    }
  }
  return keys;
}

const deKeys = getKeys(de);
const enKeys = getKeys(en);

const missingInEn = deKeys.filter(k => !enKeys.includes(k));
const missingInDe = enKeys.filter(k => !deKeys.includes(k));

console.log('--- Missing in English (en.json) ---');
if (missingInEn.length === 0) console.log('None');
else missingInEn.forEach(k => console.log(k));

console.log('\n--- Missing in German (de.json) ---');
if (missingInDe.length === 0) console.log('None');
else missingInDe.forEach(k => console.log(k));

// Check for potentially untranslated strings (English values that look like German)
// This is harder automatically, but we can look for specific German characters or just report the key differences for now.
