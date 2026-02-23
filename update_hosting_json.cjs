const fs = require('fs');

const dePath = 'src/i18n/locales/de.json';
const enPath = 'src/i18n/locales/en.json';

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

de.privacy.hosting.description = "Diese Webseite wird auf einem Cloud-Server der Hetzner Online GmbH betrieben. Der Hostinganbieter erhebt beim Zugriff auf diese Seite systembedingt Zugriffsdaten (Server-Logfiles) wie IP-Adresse, verwendeter Browser und Zeitpunkt des Aufrufs. Diese Daten werden nur für den sicheren Betrieb der Server verwendet und nicht mit anderen Datenquellen zusammengeführt.";

en.privacy.hosting.description = "This website is hosted on a cloud server provided by Hetzner Online GmbH. When accessing this site, the hosting provider automatically collects access data (server log files) such as IP address, browser used, and time of access. This data is only used for the secure operation of the servers and is not merged with other data sources.";

fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('Hosting text updated to Hetzner.');
