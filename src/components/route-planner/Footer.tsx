import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <>
      {/* Main Footer - Design aus camping-route-plus mit dunkelgrünlicher Hintergrundfarbe */}
      <footer className="py-12 px-4 bg-[rgb(50,110,89)] dark:bg-[rgb(31,41,55)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
            <p className="text-sm text-white dark:text-foreground/70 text-center">
              © {new Date().getFullYear()} Camping Route · KI-Routenplaner für Wohnmobile
            </p>
          </div>
          
          {/* Deine Links - Impressum und Datenschutz (zentriert) */}
          <div className="border-t border-white dark:border-white/20 pt-6">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white dark:text-foreground/80">
              <Link to="/impressum" className="hover:text-[#F59B0A] transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Impressum
              </Link>
              <Link to="/datenschutz" className="hover:text-[#F59B0A] transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Datenschutz
              </Link>
              <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" 
                 rel="noopener noreferrer" className="hover:text-[#F59B0A] transition-colors flex items-center gap-1">
                <img src="/GitHub_Invertocat_White_Clearspace.png" alt="GitHub" 
                     className="w-4 h-4" width="16" height="16" loading="lazy" />
                <span>Open Source</span>
              </a>
            </div>
            {/* MIT Lizenz in den dunklen Footer verschoben */}
            <div className="text-xs text-foreground/80 text-center mt-4">
              <a href="https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE" target="_blank" 
                 rel="noopener noreferrer" className="hover:text-[#F59B0A] transition-colors">
                MIT Lizenz
              </a>
              <span> | </span>
              <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" 
                 rel="noopener noreferrer" className="hover:text-[#F59B0A] transition-colors">
                Quellcode auf GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
      
    </>
  );
}
