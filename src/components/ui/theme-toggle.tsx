import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";

interface ThemeToggleProps {
  onClick?: () => void;
  forceLightIcon?: boolean;
}

export function ThemeToggle({ onClick, forceLightIcon = false }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  // Scroll-Verhalten wie in der Navbar
  useEffect(() => {
    const handleScroll = () => {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        const featuresTop = featuresSection.getBoundingClientRect().top;
        setScrolled(featuresTop <= 0);
      } else {
        // Auf Seiten ohne Features-Sektion (z.B. Impressum, Datenschutz) immer "gescrollt" anzeigen
        setScrolled(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getThemeIcon = () => {
    const iconColor = forceLightIcon ? "text-foreground" : (scrolled ? "text-foreground" : "text-white dark:text-foreground");
    
    // Zeige das Icon basierend auf dem aktuellen Theme (system wird als light/dark dargestellt)
    const currentTheme = theme === "system" ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light") : theme;
    
    // Umgekehrte Logik: Light-Modus zeigt Mond (für Dunkel), Dark-Modus zeigt Sonne (für Hell)
    switch (currentTheme) {
      case "dark":
        return <Sun className={`h-[1.2rem] w-[1.2rem] ${iconColor}`} />;
      case "light":
      default:
        return <Moon className={`h-[1.2rem] w-[1.2rem] ${iconColor}`} />;
    }
  };

  const handleThemeToggle = () => {
    // Zyklisch zwischen light und dark wechseln (system bleibt Standard aber wird nicht im Wechsel berücksichtigt)
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
    
    // Optional: onClick callback aufrufen
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button 
      size="icon" 
      onClick={handleThemeToggle}
      className={`rounded-full w-10 h-10 ${scrolled ? "bg-secondary hover:bg-accent text-foreground" : "bg-foreground/20 hover:bg-foreground/30 dark:bg-background dark:hover:bg-accent"}`}
    >
      {getThemeIcon()}
      <span className="sr-only">Theme-Toggle</span>
    </Button>
  );
}