import React, { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getThemeIcon = () => {
    const iconColor = forceLightIcon ? "text-foreground" : (scrolled ? "text-foreground" : "text-white");
    
    switch (theme) {
      case "dark":
        return <Moon className={`h-[1.2rem] w-[1.2rem] ${iconColor}`} />;
      case "light":
        return <Sun className={`h-[1.2rem] w-[1.2rem] ${iconColor}`} />;
      default:
        return <Monitor className={`h-[1.2rem] w-[1.2rem] ${iconColor}`} />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "dark":
        return "Dunkelmodus";
      case "light":
        return "Hellmodus";
      default:
        return "System";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
          {getThemeIcon()}
          <span className="sr-only">Theme-Toggle</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4 text-foreground" />
          <span>Hell</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4 text-foreground" />
          <span>Dunkel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4 text-foreground" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}