import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X, Moon, Sun } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ui/theme-provider";
import { getFinderNavLabels } from "@/lib/finderPageContent";

interface NavbarProps {
  onStartPlanning?: () => void;
}

export function Navbar({ onStartPlanning }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const { t, i18n } = useTranslation();
  const finderLabels = getFinderNavLabels(i18n.language);
  const { setTheme, resolvedTheme } = useTheme();
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

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("#")) {
      if (!isHomePage) {
        navigate(`/${href}`);
      } else {
        const element = document.querySelector(href);
        if (element) {
          const yOffset = -70;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    } else {
      navigate(href);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: t("navbar.planNow"), path: "/prompt-generator", isAnchor: false },
    { name: finderLabels.camping, path: "/campingplatz-finder", isAnchor: false },
    { name: finderLabels.stopover, path: "/stellplatz-finder", isAnchor: false },
    { name: t("navbar.features"), path: "#features", isAnchor: true },
    { name: t("navbar.faq"), path: "#faq", isAnchor: true },
  ];

  const languages = [
    { code: "de", label: "Deutsch (DE)" },
    { code: "en", label: "English (EN)" },
    { code: "nl", label: "Nederlands (NL)" },
    { code: "fr", label: "Français (FR)" },
    { code: "it", label: "Italiano (IT)" },
  ];

  return (
    <header 
      id="main-nav"
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2.5 group"
            >
              <img
                src="/android-chrome-192x192.png"
                alt="CampingRoute Logo"
                className="w-8 h-8 transition-transform duration-300 group-hover:scale-105"
              />
              <span 
                className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#166534] dark:text-emerald-400"
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800 }}
              >
                CampingRoute
              </span>
            </Link>

            {/* Desktop Sightseer-Style Tab Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = item.isAnchor 
                  ? isHomePage && location.hash === item.path
                  : location.pathname === item.path;

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className={`relative pt-2 pb-1.5 text-sm font-bold transition-colors ${
                      isActive 
                        ? "text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400" 
                        : "text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white font-semibold"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Theme Toggle, Language & Mobile Burger Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-9 px-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg gap-1.5"
                >
                  <Globe className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="uppercase">{i18n.language.slice(0, 2)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`rounded-lg text-xs font-semibold px-3 py-2 cursor-pointer ${
                      i18n.language.startsWith(lang.code) 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold" 
                        : "text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Light / Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="h-9 w-9 text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg"
              title="Theme umschalten"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-yellow-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-slate-700" />
              )}
            </Button>

            {/* Mobile Burger Menu Button */}
            <Button
              ref={mobileMenuButtonRef}
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-9 w-9 text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Menü öffnen"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNavClick(item.path)}
              className="block w-full text-left rounded-xl px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
