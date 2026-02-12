const fs = require('fs');
const path = require('path');

// Pfad zur Zähler-Datei (wird nicht in GitHub hochgeladen)
const counterFilePath = path.join(__dirname, '../counter.json');

// Zähler initialisieren, falls nicht vorhanden
if (!fs.existsSync(counterFilePath)) {
  fs.writeFileSync(counterFilePath, JSON.stringify({ visits: 0 }, null, 2));
}

// Zähler erhöhen
function incrementCounter() {
  const counter = JSON.parse(fs.readFileSync(counterFilePath));
  counter.visits++;
  fs.writeFileSync(counterFilePath, JSON.stringify(counter, null, 2));
  return counter;
}

// Zähler abrufen
function getCounter() {
  return JSON.parse(fs.readFileSync(counterFilePath));
}

module.exports = { incrementCounter, getCounter };