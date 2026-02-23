import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AnchorNavigation() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  const sections = [
    { id: "home", label: t("anchorNav.home") },
    { id: "features", label: t("anchorNav.features") },
    { id: "testimonials", label: t("anchorNav.testimonials") },
    { id: "example-route", label: t("anchorNav.exampleRoute") },
    { id: "main-content", label: t("anchorNav.mainContent") },
    { id: "faq", label: t("anchorNav.faq") }
  ];
  
  useEffect(() => {
    // Cache DOM elements and their positions to avoid repeated queries
    const sectionElements = sections.map(section => {
      const element = document.getElementById(section.id);
      return element ? {
        id: section.id,
        element,
        offsetTop: element.offsetTop,
        offsetHeight: element.offsetHeight
      } : null;
    }).filter(Boolean);
    
    // Use requestAnimationFrame to synchronize with browser repaints
    let lastScrollTime = 0;
    let lastScrollPosition = window.scrollY;
    let requestId: number | null = null;
    const debounceDelay = 100; // 100ms debounce delay
    
    const handleScroll = () => {
      const now = Date.now();
      const scrollPosition = window.scrollY;
      
      // Skip if scroll position hasn't changed significantly
      if (Math.abs(scrollPosition - lastScrollPosition) < 50) {
        return;
      }
      lastScrollPosition = scrollPosition;
      
      // Debounce the scroll handler to reduce the number of reflows
      if (now - lastScrollTime < debounceDelay) {
        if (requestId) {
          cancelAnimationFrame(requestId);
        }
        requestId = requestAnimationFrame(handleScroll);
        return;
      }
      lastScrollTime = now;
      
      // Use requestAnimationFrame to synchronize with browser repaints
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
      requestId = requestAnimationFrame(() => {
        const scrollPositionWithOffset = scrollPosition + 120; // 120px offset für Navbar
        
        // Find the current active section using cached values
        let currentSection = "";
        sectionElements.forEach(section => {
          if (section) {
            const { offsetTop, offsetHeight } = section;
            if (scrollPositionWithOffset >= offsetTop && scrollPositionWithOffset < offsetTop + offsetHeight) {
              currentSection = section.id;
            }
          }
        });
        
        // Batch state updates to reduce reflows
        if (currentSection !== activeSection || (scrollPosition > 400) !== isVisible) {
          setActiveSection(currentSection);
          setIsVisible(scrollPosition > 400);
        }
      });
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
    };
  }, [activeSection, isVisible]);
  
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
            {t("anchorNav.backToTop")}
          </Button>
        </div>
      </div>
    </div>
  );
}