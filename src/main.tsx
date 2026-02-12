import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialisiere das Theme vor dem Rendern, um FOUC zu vermeiden
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme-preference');
  const htmlElement = document.documentElement;
  
  if (savedTheme) {
    // Benutzer hat ein Theme gewählt
    if (savedTheme === 'dark') {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    } else {
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
    }
  } else {
    // Standardmäßig Systemeinstellung verwenden
  }
  
  // Zähler erhöhen (falls Backend verfügbar)
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/count-visit', { method: 'POST' })
      .catch(() => {}); // Fehler ignorieren, da nicht kritisch
  }
  
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (systemPrefersDark) {
    htmlElement.classList.add('dark');
    htmlElement.classList.remove('light');
  } else {
    htmlElement.classList.add('light');
    htmlElement.classList.remove('dark');
  }
}

createRoot(document.getElementById("root")!).render(<App />);
