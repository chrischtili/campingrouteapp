const express = require('express');
const { incrementCounter, getCounter } = require('./counter');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// API-Route: Zähler erhöhen (für Frontend-Aufruf)
app.post('/api/count-visit', (req, res) => {
  const counter = incrementCounter();
  res.json({ success: true, visits: counter.visits });
});

// API-Route: Zähler abrufen (nur für Admin)
app.get('/api/admin/counter', (req, res) => {
  const counter = getCounter();
  res.json(counter);
});

// Statische Dateien ausgeben (für React-App)
app.use(express.static(path.join(__dirname, '../dist')));

// Alle anderen Routen auf React-App umleiten
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});