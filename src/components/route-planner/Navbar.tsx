import { Compass, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface NavbarProps {
  onStartPlanning?: () => void;
}

export function Navbar({ onStartPlanning }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const featuresSectionRef = useRef(null);

  const toggleLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

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

  const navigate = useNavigate();

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    // Extrahiere den Hash-Teil (z.B. "/#features" -> "features")
    const hash = href.split('#')[1];
    
    // Navigiere zur Startseite
    navigate('/');
    
    // Scrolle nach kurzer Verzögerung zum Abschnitt
    setTimeout(() => {
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const navLinks = [
    { label: t("navbar.features"), href: "/#features" },
    { label: t("navbar.exampleRoute"), href: "/#example-route" },
    { label: t("navbar.faq"), href: "/#faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-soft py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <a href="/#" onClick={(e) => {
          e.preventDefault();
          
          // Auf Impressum/Datenschutz-Seiten zur Hauptseite navigieren
          if (window.location.pathname === '/impressum' || window.location.pathname === '/datenschutz') {
            navigate('/');
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          } else {
            // Auf anderen Seiten einfach nach oben scrollen
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }} className="flex items-center gap-2 cursor-pointer">
          <img src="/favicon-original-final.svg" alt="Logo" className="w-10 h-10 transition-colors dark:invert" />
          <span className={`font-bold text-xl transition-colors ${scrolled ? "text-foreground" : "text-white dark:text-foreground"}`}>
            Camping Route
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavLinkClick(e, link.href)}
              className={`font-medium text-sm transition-colors ${
                scrolled ? "text-foreground/70 hover:text-foreground" : "text-white/70 hover:text-white dark:text-foreground/70 dark:hover:text-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center mr-2">
            <button 
              onClick={() => toggleLanguage(i18n.language === 'de' ? 'en' : 'de')}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={i18n.language === 'de' ? "Switch to English" : "Auf Deutsch umstellen"}
            >
              <span className="text-2xl leading-none">
                {i18n.language === 'de' ? '🇬🇧' : '🇩🇪'}
              </span>
            </button>
          </div>
          <button
            onClick={() => onStartPlanning?.()}
            className={`px-5 py-2 rounded-full ${scrolled ? "bg-gradient-to-r from-[#F59B0A] to-[#E67E22] text-white" : "bg-white text-foreground border border-foreground/20 dark:bg-foreground dark:text-background dark:border-background/20"} font-semibold text-sm shadow-soft hover:scale-105 transition-transform md:ml-4`}
          >
            {t("navbar.planNow")}
          </button>
          <ThemeToggle />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button 
            onClick={() => toggleLanguage(i18n.language === 'de' ? 'en' : 'de')}
            className="w-8 h-8 flex items-center justify-center"
          >
            <span className="text-2xl leading-none">
              {i18n.language === 'de' ? '🇬🇧' : '🇩🇪'}
            </span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
