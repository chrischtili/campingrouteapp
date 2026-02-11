import { Compass, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Beispielroute", href: "#example-route" },
    { label: "Planer", href: "#planner" },
    { label: "FAQ", href: "#faq" },
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
        <a href="#home" className="flex items-center gap-2">
          <img src="/favicon-original-final.svg" alt="Camping Route Logo" className="w-10 h-10 transition-colors" style={{ filter: 'brightness(0) saturate(100%) invert(40%) sepia(95%) saturate(600%) hue-rotate(5deg) brightness(100%) contrast(120%)' }} />
          <span className={`font-bold text-xl transition-colors ${scrolled ? "text-foreground" : "text-white"}`}>
            Camping Route
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`font-medium text-sm transition-colors ${
                scrolled ? "text-foreground/70 hover:text-foreground" : "text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a
            href="#planner"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#F59B0A] to-[#E67E22] text-white font-semibold text-sm shadow-soft hover:scale-105 transition-transform md:ml-4"
          >
            Jetzt planen
          </a>
        </div>

        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className={`p-2 rounded-full transition-all ${scrolled ? "bg-white/20" : "bg-white/10"}`}
            aria-label="Menü öffnen"
          >
            {mobileMenuOpen ? (
              <X className={`w-6 h-6 transition-colors ${scrolled ? "text-foreground" : "text-white"}`} />
            ) : (
              <Menu className={`w-6 h-6 transition-colors ${scrolled ? "text-foreground" : "text-white"}`} />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-4 rounded-lg text-foreground font-medium hover:bg-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#planner"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-3 px-4 rounded-lg bg-gradient-to-r from-[#F59B0A] to-[#E67E22] text-white font-semibold text-center shadow-soft hover:scale-105 transition-transform"
            >
              Jetzt planen
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
