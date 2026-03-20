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
import { getFinderNavLabels } from "@/lib/finderPageContent";

interface NavbarProps {
  onStartPlanning?: () => void;
}

export function Navbar({ onStartPlanning }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [releaseVersion, setReleaseVersion] = useState("0.5.2");
  const { t, i18n } = useTranslation();
  const finderLabels = getFinderNavLabels(i18n.language);
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

  const handleFAQItemNavigation = (itemId: string) => {
    if (!isHomePage) {
      navigate(`/?faq=${itemId}`);
    } else {
      window.dispatchEvent(new CustomEvent("open-faq", { detail: itemId }));
    }
    setMobileMenuOpen(false);
  };

  const handlePlanNow = () => {
    if (!isHomePage) {
      navigate("/prompt-generator");
    } else if (onStartPlanning) {
      onStartPlanning();
    } else {
      navigate("/prompt-generator");
    }
    setMobileMenuOpen(false);
  };

  const handleOpenPlaceFinder = (path = "/campingplatz-finder") => {
    navigate(path);
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
    { name: t("navbar.exampleRoute"), faqItem: "exampleRoute" },
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
        <div className="hidden lg:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-2xl border border-foreground/12 bg-white/72 text-foreground hover:bg-white/88 dark:border-white/14 dark:bg-white/10 dark:text-white dark:hover:bg-white/14 shadow-[0_14px_34px_rgba(15,23,42,0.10)] backdrop-blur-2xl"
                aria-label={t("navbar.navigation")}
                title={t("navbar.navigation")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-[1.5rem] border border-border/80 bg-popover/95 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
              {navLinks.map((link) => (
                <DropdownMenuItem
                  key={link.name}
                  onClick={() => link.faqItem ? handleFAQItemNavigation(link.faqItem) : handleNavClick(link.href!)}
                  className="rounded-xl px-3 py-3 focus:bg-muted/80 dark:focus:bg-white/8"
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-sm font-black text-foreground dark:text-white">{link.name}</span>
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </div>
                </DropdownMenuItem>
              ))}

              <div className="my-2 h-px bg-foreground/8 dark:bg-white/10" />

              <DropdownMenuItem
                onClick={openWhatsNew}
                className="rounded-xl px-3 py-3 focus:bg-muted/80 dark:focus:bg-white/8"
              >
                <span className="text-sm font-semibold text-foreground/75 dark:text-white/78">
                  {t("navbar.whatsNew", { version: displayReleaseVersion })}
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setTheme(oppositeExplicitTheme)}
                className="rounded-xl px-3 py-3 focus:bg-muted/80 dark:focus:bg-white/8"
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground dark:text-white">{themeToggleLabel}</span>
                  <ThemeIcon className="h-4 w-4 text-primary" />
                </div>
              </DropdownMenuItem>

              <div className="mx-1 mt-2 rounded-2xl border border-border/70 bg-background/70 px-3 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-black tracking-[0.14em] text-foreground/55 dark:text-white/55">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  {i18n.language.toUpperCase()}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["de", "DE"],
                    ["en", "EN"],
                    ["nl", "NL"],
                    ["fr", "FR"],
                    ["it", "IT"],
                  ].map(([lng, label]) => (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => changeLanguage(lng)}
                      className={`inline-flex min-w-[44px] items-center justify-center rounded-xl border px-3 py-2 text-xs font-black tracking-[0.08em] transition-colors ${
                        i18n.language === lng
                          ? "border-primary/40 bg-primary/12 text-primary"
                          : "border-border/70 bg-background/80 text-foreground/65 hover:bg-muted/70 dark:border-white/10 dark:bg-white/6 dark:text-white/65 dark:hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full px-4 sm:px-6 h-10 sm:h-11 font-black text-[9px] sm:text-[11px] tracking-[0.08em] text-foreground/78 dark:text-white bg-white/72 hover:bg-white/82 dark:bg-white/10 dark:hover:bg-white/14 border border-white/70 dark:border-white/14 shadow-[0_18px_42px_rgba(15,23,42,0.10)] dark:shadow-[0_16px_34px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
                style={{
                  backgroundImage:
                    resolvedTheme === "dark"
                      ? "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))"
                      : "linear-gradient(135deg, rgba(255,255,255,0.84), rgba(255,255,255,0.62))",
                }}
              >
                {t("navbar.placeFinder")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-2xl border border-border/80 bg-popover/95 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
              <DropdownMenuItem asChild className="rounded-xl px-3 py-3 focus:bg-muted/80 dark:focus:bg-white/8">
                <Link to="/campingplatz-finder" className="flex w-full flex-col items-start gap-1">
                  <span className="text-sm font-black text-foreground dark:text-white">{finderLabels.camping}</span>
                  <span className="text-xs leading-relaxed text-foreground/60 dark:text-white/58">
                    {t("navbar.placeFinderDescriptions.camping")}
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl px-3 py-3 focus:bg-muted/80 dark:focus:bg-white/8">
                <Link to="/stellplatz-finder" className="flex w-full flex-col items-start gap-1">
                  <span className="text-sm font-black text-foreground dark:text-white">{finderLabels.stopover}</span>
                  <span className="text-xs leading-relaxed text-foreground/60 dark:text-white/58">
                    {t("navbar.placeFinderDescriptions.stopover")}
                  </span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handlePlanNow}
            className="rounded-full px-5 sm:px-7 h-10 sm:h-11 font-black text-[9px] sm:text-[11px] tracking-[0.1em] transition-all duration-300 text-white border border-primary/80 shadow-[0_16px_40px_rgba(255,128,0,0.3)] hover:scale-[1.02] hover:shadow-[0_20px_52px_rgba(255,128,0,0.4)]"
            style={{
              background: "linear-gradient(135deg, rgba(255, 145, 0, 0.98), rgba(255, 123, 0, 0.92))",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {t("navbar.planNow")}
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-black/45 flex items-center justify-center text-foreground dark:text-white border border-foreground/12 dark:border-white/18 shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
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
          className={`site-nav-menu lg:hidden fixed left-0 right-0 z-[60] border-b p-6 sm:p-8 shadow-xl backdrop-blur-2xl ${
            scrolled ? "top-[72px] sm:top-[84px]" : "top-[96px] sm:top-[112px]"
          }`}
        >
          <div className="flex flex-col gap-4 sm:gap-6">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => link.faqItem ? handleFAQItemNavigation(link.faqItem) : handleNavClick(link.href!)}
                className="text-xl sm:text-2xl font-black tracking-tighter text-foreground dark:text-white flex items-center justify-between group py-2"
              >
                {link.name}
                <ChevronRight className="text-primary opacity-0 group-hover:opacity-100 transition-all w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            ))}
            <div className="h-px bg-foreground/12 dark:bg-white/12 my-2" />
            <button
              type="button"
              onClick={() => handleOpenPlaceFinder("/campingplatz-finder")}
              className="text-xl sm:text-2xl font-black tracking-tighter text-foreground dark:text-white flex items-center justify-between group py-2"
            >
              {finderLabels.camping}
              <ChevronRight className="text-primary opacity-0 group-hover:opacity-100 transition-all w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={() => handleOpenPlaceFinder("/stellplatz-finder")}
              className="text-xl sm:text-2xl font-black tracking-tighter text-foreground dark:text-white flex items-center justify-between group py-2"
            >
              {finderLabels.stopover}
              <ChevronRight className="text-primary opacity-0 group-hover:opacity-100 transition-all w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={openWhatsNew}
              className="text-sm font-bold text-foreground/70 dark:text-white/78 hover:text-primary transition-colors text-left py-1"
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/15 bg-white/75 text-foreground hover:bg-white/90 dark:bg-white/10 dark:text-white dark:hover:bg-white/16 dark:border-white/18"
            >
              <ThemeIcon className="h-5 w-5 text-primary" />
            </button>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-3 sm:gap-4">
                  <button onClick={() => { changeLanguage('de'); setMobileMenuOpen(false); }} className={`text-xs sm:text-sm font-black ${i18n.language === 'de' ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}>DE</button>
                  <button onClick={() => { changeLanguage('en'); setMobileMenuOpen(false); }} className={`text-xs sm:text-sm font-black ${i18n.language === 'en' ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}>EN</button>
                  <button onClick={() => { changeLanguage('nl'); setMobileMenuOpen(false); }} className={`text-xs sm:text-sm font-black ${i18n.language === 'nl' ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}>NL</button>
                  <button onClick={() => { changeLanguage('fr'); setMobileMenuOpen(false); }} className={`text-xs sm:text-sm font-black ${i18n.language === 'fr' ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}>FR</button>
                  <button onClick={() => { changeLanguage('it'); setMobileMenuOpen(false); }} className={`text-xs sm:text-sm font-black ${i18n.language === 'it' ? 'text-primary' : 'text-foreground/40 dark:text-white/40'}`}>IT</button>
                </div>
              </div>
              <Button
                onClick={handlePlanNow}
                className="w-full rounded-2xl min-h-[54px] px-5 py-3 font-black text-[11px] sm:text-[12px] tracking-[0.12em] text-white border border-primary/80 shadow-[0_18px_42px_rgba(255,128,0,0.3)]"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 145, 0, 0.98), rgba(255, 123, 0, 0.92))",
                }}
              >
                {t("navbar.planNow")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
