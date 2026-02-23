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

  // Synchronisierte Scroll-Logik (exakt wie in Navbar.tsx)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

    const getThemeIcon = () => {
      // Dynamische Farbe basierend auf Scroll-Zustand
      const iconColor = scrolled ? "text-foreground" : "text-white dark:text-foreground";
      
      const currentTheme = theme === "system" ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light") : theme;
      
      switch (currentTheme) {
        case "dark":
          return <Sun className={`h-[1.2rem] w-[1.2rem] ${iconColor}`} />;
        case "light":
        default:
          return <Moon className={`h-[1.2rem] w-[1.2rem] ${iconColor}`} />;
      }
    };
  
    const handleThemeToggle = () => {
      setTheme(theme === "light" ? "dark" : "light");
      if (onClick) onClick();
    };
  
    return (
      <Button 
        variant="ghost"
        size="icon" 
        onClick={handleThemeToggle}
        className={`rounded-xl w-10 h-10 transition-all duration-300 ${
          scrolled 
            ? "bg-muted/50 hover:bg-muted text-foreground border border-border/50" 
            : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
        }`}
      >
        {getThemeIcon()}
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }
  