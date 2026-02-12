import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export function AnchorNavigation() {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  const sections = [
    { id: "home", label: "Start" },
    { id: "features", label: "Features" },
    { id: "testimonials", label: "Erfahrungen" },
    { id: "example-route", label: "Beispielroute" },
    { id: "main-content", label: "Routenplaner" },
    { id: "faq", label: "FAQ" }
  ];
  
  useEffect(() => {
    // Cache DOM elements to avoid repeated queries
    const sectionElements = sections.map(section => {
      const element = document.getElementById(section.id);
      return element ? {
        id: section.id,
        element,
        offsetTop: element.offsetTop,
        offsetHeight: element.offsetHeight
      } : null;
    }).filter(Boolean);
    
    // Debounce the scroll handler to reduce the number of reflows
    let lastScrollTime = 0;
    const debounceDelay = 100; // 100ms debounce delay
    
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime < debounceDelay) {
        return; // Skip this scroll event
      }
      lastScrollTime = now;
      
      const scrollPosition = window.scrollY + 120; // 120px offset für Navbar
      
      // Find the current active section using cached values
      let currentSection = "";
      sectionElements.forEach(section => {
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = section.id;
          }
        }
      });
      
      setActiveSection(currentSection);
      
      // Show/hide navigation based on scroll position
      setIsVisible(window.scrollY > 400);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Berücksichtige die Höhe der Navbar (ca. 80px)
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navbarHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };
  
  return (
    <div className={`fixed bottom-32 right-4 z-50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="bg-background/90 backdrop-blur-lg rounded-lg shadow-lg border border-primary/20 overflow-hidden">
        <div className="p-2 space-y-1">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              size="sm"
              className={`w-full justify-start gap-2 text-xs ${activeSection === section.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-primary/5"}`}
              onClick={() => scrollToSection(section.id)}
            >
              <span className="w-2 h-2 rounded-full bg-current opacity-50"></span>
              {section.label}
            </Button>
          ))}
        </div>
        
        {/* Scroll to top button */}
        <div className="border-t border-primary/10 p-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2 text-xs text-muted-foreground hover:bg-primary/5"
            onClick={() => scrollToSection("home")}
          >
            <ArrowUp className="h-3 w-3" />
            Nach oben
          </Button>
        </div>
      </div>
    </div>
  );
}