const fs = require('fs');
const path = require('path');

function walk(dir, exts, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'dist') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, exts, out);
    else if (exts.includes(path.extname(ent.name))) out.push(p);
  }
  return out;
}

function flatten(obj, prefix = '') {
  let out = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out = out.concat(flatten(v, key));
    } else {
      out.push(key);
    }
  }
  return out;
}

const localePaths = walk('src/i18n/locales', ['.json']);
const srcFiles = walk('src', ['.ts', '.tsx', '.js', '.jsx']);
const srcText = srcFiles.map(p => fs.readFileSync(p, 'utf8')).join('\n');

// Capture t('...'), t("..."), i18next.t('...'), i18n.t('...'), and t(`...`) without ${}
const keySet = new Set();
const patterns = [
  /\b(?:i18n|i18next)?\.??t\(\s*'([^']+)'\s*[),]/g,
  /\b(?:i18n|i18next)?\.??t\(\s*"([^"]+)"\s*[),]/g,
  /\b(?:i18n|i18next)?\.??t\(\s*`([^`$]+)`\s*[),]/g,
];
for (const re of patterns) {
  let m;
  while ((m = re.exec(srcText))) {
    if (m[1]) keySet.add(m[1]);
  }
}

// Also scan for useTranslation() destructured t and then t("...") inside JSX props (already covered above)
// but we keep it simple and static.

for (const lp of localePaths) {
  const json = JSON.parse(fs.readFileSync(lp, 'utf8'));
  const keys = flatten(json);
  const unused = keys.filter(k => !keySet.has(k));
  console.log(`\n${lp}: ${unused.length} unused keys`);
  console.log(unused.slice(0, 200).join('\n'));
  if (unused.length > 200) console.log('...');
}
