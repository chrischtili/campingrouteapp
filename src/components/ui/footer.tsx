import { Link } from "react-router-dom";

export function Footer() {
  return (
    <>
      {/* Fixed Logo in top-left corner - always visible, transparent on hero */}
      <div className="fixed top-4 left-4 z-50">
        <a href="#home" className="inline-block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900/50" aria-label="Zum Seitenanfang - Camping Route">
          <img 
            src="/favicon-original-final.svg" 
            alt="Camping Route Logo - Zum Seitenanfang"
            className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 transition-all duration-200 hover:scale-105 drop-shadow-lg"
            width="48"
            height="48"
          />
        </a>
      </div>
      
      {/* Main Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 text-center md:text-left">
              © {new Date().getFullYear()} Camping Route – KI-Routenplaner für Wohnmobile
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Link to="/impressum" className="hover:text-primary transition-colors">
                Impressum
              </Link>
              <Link to="/datenschutz" className="hover:text-primary transition-colors">
                Datenschutz
              </Link>
              <a href="https://github.com/chrischtili/route-planner-pro" target="_blank" 
                 rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                <img src="/GitHub_Invertocat_Black_Clearspace.webp" alt="GitHub" 
                     className="w-4 h-4" width="16" height="16" loading="lazy" />
                <span>Open Source</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
      <div className="text-xs text-gray-500 text-center py-2">
        <a href="https://github.com/chrischtili/route-planner-pro/blob/main/LICENSE" target="_blank" 
           rel="noopener noreferrer" className="hover:text-primary transition-colors">
          MIT Lizenz
        </a>
        <span> | </span>
        <a href="https://github.com/chrischtili/route-planner-pro" target="_blank" 
           rel="noopener noreferrer" className="hover:text-primary transition-colors">
          Quellcode auf GitHub
        </a>
      </div>
    </>
  );
}