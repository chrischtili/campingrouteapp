import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X, ChevronRight, Moon, Sun } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ui/theme-provider";

interface NavbarProps {
  onStartPlanning?: () => void;
}

export function Navbar({ onStartPlanning }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [releaseVersion, setReleaseVersion] = useState("0.5.3");
  const { t, i18n } = useTranslation();
  const { setTheme, resolvedTheme } = useTheme();
  const displayReleaseVersion = `v${releaseVersion.replace(/^v/i, "")}`;
  const location = useLocation();
  const navigate = useNavigate();
  
  const isHomePage = location.pathname === "/";

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const navElement = document.getElementById('main-nav');
      if (mobileMenuOpen && navElement && !navElement.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadVersion = async () => {
      try {
        const response = await fetch(`/version.json?ts=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (isMounted && typeof data?.version === "string") {
          setReleaseVersion(data.version);
        }
      } catch {
        // Keep fallback version in the label.
      }
    };
    loadVersion();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavClick = (anchor: string) => {
    if (!isHomePage) {
      navigate(`/${anchor}`);
    } else {
      const element = document.querySelector(anchor);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handlePlanNow = () => {
    if (!isHomePage) {
      navigate("/?plan=true");
    } else if (onStartPlanning) {
      onStartPlanning();
    }
    setMobileMenuOpen(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const openWhatsNew = () => {
    window.dispatchEvent(new Event("open-whats-new"));
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: t("navbar.features"), href: "#features" },
    { name: t("navbar.exampleRoute"), href: "#example-route" },
    { name: t("navbar.faq"), href: "#faq" },
  ];

  const oppositeExplicitTheme = resolvedTheme === "dark" ? "light" : "dark";
  const ThemeIcon = resolvedTheme === "dark" ? Sun : Moon;
  const themeToggleLabel = resolvedTheme === "dark" ? t("navbar.theme.activateLight") : t("navbar.theme.activateDark");

  return (
    <nav 
      id="main-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "site-nav py-4 backdrop-blur-xl border-b shadow-2xl" 
          : "py-8 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo Area */}
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 group"
        >
          <img
            src="/android-chrome-192x192.png"
            alt="Logo"
            className="w-8 h-8 transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110"
          />
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-foreground dark:text-white leading-none">
              Camping<span className="text-primary">Route</span>
            </span>
            <span className="mt-1 text-[8px] font-semibold tracking-[0.12em] text-foreground/45 dark:text-white/40 leading-none">
              {t("navbar.subtitle")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-foreground/65 hover:text-primary transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={openWhatsNew}
            className="hidden xl:inline-flex text-xs font-semibold tracking-[0.02em] text-foreground/55 hover:text-primary transition-colors"
          >
            {t("navbar.whatsNew", { version: displayReleaseVersion })}
          </button>

          <div className="h-4 w-px bg-foreground/10 mx-2 hidden sm:block" />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={themeToggleLabel}
            title={themeToggleLabel}
            onClick={() => setTheme(oppositeExplicitTheme)}
            className="rounded-xl border border-foreground/15 bg-white/70 text-foreground hover:bg-white/90 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <ThemeIcon className="w-4 h-4 text-primary" />
          </Button>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-foreground hover:bg-black/5 dark:text-white dark:hover:bg-white/5 gap-1 rounded-lg font-semibold text-[8px] sm:text-[10px] tracking-[0.08em] border border-foreground/5 dark:border-white/5 px-2 py-1"
              >
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                {i18n.language.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
              <DropdownMenuItem onClick={() => { changeLanguage('de'); setMobileMenuOpen(false); }} className="hover:bg-primary hover:text-white font-bold cursor-pointer rounded-lg m-1 text-sm">DEUTSCH</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { changeLanguage('en'); setMobileMenuOpen(false); }} className="hover:bg-primary hover:text-white font-bold cursor-pointer rounded-lg m-1 text-sm">ENGLISH</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { changeLanguage('nl'); setMobileMenuOpen(false); }} className="hover:bg-primary hover:text-white font-bold cursor-pointer rounded-lg m-1 text-sm">NEDERLANDS</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { changeLanguage('fr'); setMobileMenuOpen(false); }} className="hover:bg-primary hover:text-white font-bold cursor-pointer rounded-lg m-1 text-sm">FRANÇAIS</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { changeLanguage('it'); setMobileMenuOpen(false); }} className="hover:bg-primary hover:text-white font-bold cursor-pointer rounded-lg m-1 text-sm">ITALIANO</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handlePlanNow}
            className="rounded-full px-4 sm:px-6 h-8 sm:h-10 font-semibold text-[8px] sm:text-[10px] tracking-[0.08em] transition-all duration-500 shadow-lg border-2 border-primary/40 text-white"
            style={{
              background: "rgba(255, 128, 0, 0.25)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {t("navbar.planNow")}
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-white/5 flex items-center justify-center text-foreground dark:text-white border border-foreground/10 dark:border-white/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="site-nav-menu lg:hidden absolute top-full left-0 right-0 border-b p-6 sm:p-8 shadow-xl"
        >
          <div className="flex flex-col gap-4 sm:gap-6">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-xl sm:text-2xl font-black tracking-tighter text-foreground dark:text-white flex items-center justify-between group py-2"
              >
                {link.name}
                <ChevronRight className="text-primary opacity-0 group-hover:opacity-100 transition-all w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            ))}
            <div className="h-px bg-foreground/10 dark:bg-white/5 my-2" />
            <button
              type="button"
              onClick={openWhatsNew}
              className="text-sm font-bold text-foreground/60 dark:text-white/60 hover:text-primary transition-colors text-left py-1"
            >
              {t("navbar.whatsNew", { version: displayReleaseVersion })}
            </button>
            <button
              type="button"
              onClick={() => {
                setTheme(oppositeExplicitTheme);
                setMobileMenuOpen(false);
              }}
              aria-label={themeToggleLabel}
              title={themeToggleLabel}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/15 bg-white/70 text-foreground hover:bg-white/90 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <ThemeIcon className="h-5 w-5 text-primary" />
            </button>
            <div className="flex items-center justify-between">
                <div className="flex gap-3 sm:gap-4">
                  <button onClick={() => { changeLanguage('de'); setMobileMenuOpen(false); }} className={`text-xs sm:text-sm font-black ${i18n.language === 'de' ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}>DE</button>
                  <button onClick={() => { changeLanguage('en'); setMobileMenuOpen(false); }} className={`text-xs sm:text-sm font-black ${i18n.language === 'en' ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}>EN</button>
                  <button onClick={() => { changeLanguage('nl'); setMobileMenuOpen(false); }} className={`text-xs sm:text-sm font-black ${i18n.language === 'nl' ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}>NL</button>
                  <button onClick={() => { changeLanguage('fr'); setMobileMenuOpen(false); }} className={`text-xs sm:text-sm font-black ${i18n.language === 'fr' ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}>FR</button>
                  <button onClick={() => { changeLanguage('it'); setMobileMenuOpen(false); }} className={`text-xs sm:text-sm font-black ${i18n.language === 'it' ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}>IT</button>
                </div>
              <Button onClick={handlePlanNow} className="bg-primary text-white rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-semibold text-[8px] sm:text-[10px] tracking-[0.08em]">
                {t("navbar.planNow")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
