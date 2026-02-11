import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <>
      {/* Main Footer - Design aus camping-route-plus mit dunkelgrünlicher Hintergrundfarbe */}
      <footer className="py-12 px-4 mt-16" style={{ backgroundColor: 'rgb(21, 40, 34)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-2">
              <img src="/favicon-original-final.svg" alt="Camping Route Logo" className="h-8 w-8" />
              <span className="font-bold text-xl text-primary-foreground">Camping Route</span>
            </div>
            <p className="text-sm text-white/70 text-center md:text-left">
              © {new Date().getFullYear()} Camping Route · KI-Routenplaner für Wohnmobile
            </p>
          </div>
          
          {/* Deine Links - Impressum und Datenschutz (zentriert) */}
          <div className="border-t border-green-800 pt-6">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
              <Link to="/impressum" className="hover:text-[#F59B0A] transition-colors">
                Impressum
              </Link>
              <Link to="/datenschutz" className="hover:text-[#F59B0A] transition-colors">
                Datenschutz
              </Link>
              <a href="https://github.com/chrischtili/route-planner-pro" target="_blank" 
                 rel="noopener noreferrer" className="hover:text-[#F59B0A] transition-colors flex items-center gap-1">
                <img src="/GitHub_Invertocat_Black_Clearspace.webp" alt="GitHub" 
                     className="w-4 h-4" width="16" height="16" loading="lazy" />
                <span>Open Source</span>
              </a>
            </div>
            {/* MIT Lizenz in den dunklen Footer verschoben */}
            <div className="text-xs text-primary-foreground/50 text-center mt-4">
              <a href="https://github.com/chrischtili/route-planner-pro/blob/main/LICENSE" target="_blank" 
                 rel="noopener noreferrer" className="hover:text-[#F59B0A] transition-colors">
                MIT Lizenz
              </a>
              <span> | </span>
              <a href="https://github.com/chrischtili/route-planner-pro" target="_blank" 
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
