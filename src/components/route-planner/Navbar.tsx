import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X, ChevronRight } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface NavbarProps {
  onStartPlanning?: () => void;
}

export function Navbar({ onStartPlanning }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const navLinks = [
    { name: t("navbar.features"), href: "#features" },
    { name: t("navbar.exampleRoute"), href: "#example-route" },
    { name: t("navbar.faq"), href: "#faq" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "py-4 bg-[#0a140f]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl" 
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
            src="/favicon-original-final.svg" 
            alt="Logo" 
            className="w-8 h-8 transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110" 
            style={{ 
              filter: 'brightness(0) saturate(100%) invert(60%) sepia(80%) saturate(2000%) hue-rotate(10deg) brightness(100%) contrast(105%)' 
            }}
          />
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-white uppercase leading-none">
              Camping<span className="text-primary">Route</span>
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 leading-none mt-1">
              {t("navbar.subtitle")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-black uppercase tracking-widest text-white/60 hover:text-primary transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/10 mx-2" />

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/5 gap-2 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/5"
              >
                <Globe className="w-4 h-4 text-primary" />
                {i18n.language.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0a140f] border-white/10 rounded-2xl shadow-2xl">
              <DropdownMenuItem onClick={() => changeLanguage('de')} className="text-white hover:bg-primary hover:text-white font-bold cursor-pointer rounded-lg m-1">DEUTSCH</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('en')} className="text-white hover:bg-primary hover:text-white font-bold cursor-pointer rounded-lg m-1">ENGLISH</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handlePlanNow}
            className="rounded-full px-6 h-10 font-black uppercase text-[10px] tracking-widest transition-all duration-500 shadow-lg border-2 border-primary/40 text-white"
            style={{
              background: "rgba(245, 155, 10, 0.25)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {t("navbar.planNow")}
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden absolute top-full left-0 right-0 bg-[#0a140f] border-b border-white/10 p-8 shadow-2xl"
        >
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-2xl font-black uppercase tracking-tighter text-white flex items-center justify-between group"
              >
                {link.name}
                <ChevronRight className="text-primary opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            ))}
            <div className="h-px bg-white/5 my-2" />
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <button onClick={() => changeLanguage('de')} className={`text-sm font-black ${i18n.language === 'de' ? 'text-primary' : 'text-white/40'}`}>DE</button>
                <button onClick={() => changeLanguage('en')} className={`text-sm font-black ${i18n.language === 'en' ? 'text-primary' : 'text-white/40'}`}>EN</button>
              </div>
              <Button onClick={handlePlanNow} className="bg-primary text-white rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">
                {t("navbar.planNow")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
