import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  toggleTheme: () => null,
  isDark: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme-preference",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [hasUserSelectedTheme, setHasUserSelectedTheme] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Theme initialisieren
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      setHasUserSelectedTheme(true);
    } else {
      setThemeState("system");
    }
  }, [storageKey]);

  // Theme auf HTML-Element anwenden
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (theme === "system") {
      // Systemeinstellungen verwenden
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
      if (systemPrefersDark) {
        htmlElement.classList.add("dark");
        htmlElement.classList.remove("light");
      } else {
        htmlElement.classList.add("light");
        htmlElement.classList.remove("dark");
      }
    } else {
      // Benutzerauswahl verwenden
      const darkMode = theme === "dark";
      setIsDark(darkMode);
      if (darkMode) {
        htmlElement.classList.add("dark");
        htmlElement.classList.remove("light");
      } else {
        htmlElement.classList.add("light");
        htmlElement.classList.remove("dark");
      }
    }
  }, [theme]);

  // Systemeinstellungen beobachten
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const htmlElement = document.documentElement;
        if (e.matches) {
          htmlElement.classList.add("dark");
          htmlElement.classList.remove("light");
          setIsDark(true);
        } else {
          htmlElement.classList.add("light");
          htmlElement.classList.remove("dark");
          setIsDark(false);
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (newTheme !== "system") {
      setHasUserSelectedTheme(true);
      localStorage.setItem(storageKey, newTheme);
    } else {
      // Bei Systemeinstellung Speicherung löschen (DSGVO-konform)
      localStorage.removeItem(storageKey);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};