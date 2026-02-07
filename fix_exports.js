// Korrigierte Export-Funktionen

// 1. HTML Export - Fix für sichere Verbindung
const exportAsHTML = (text) => {
  const htmlContent = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/# (.*?)/g, '<h1>$1</h1>')
    .replace(/## (.*?)/g, '<h2>$1</h2>')
    .replace(/### (.*?)/g, '<h3>$1</h3>');

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wohnmobil-route.html';
  a.click();
  URL.revokeObjectURL(url);
};

// 2. Markdown Export - Fix
const exportAsMarkdown = (text) => {
  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wohnmobil-route.md';
  a.click();
  URL.revokeObjectURL(url);
};

// 3. PDF Export - Vereinheitlicht
const exportAsPDF = async (text) => {
  console.log('PDF Export wird in Zukunft implementiert');
};

// UI-Buttons bereinigen
// Nur die funktionierenden Buttons behalten
