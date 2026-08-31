import { Github, ArrowUp, Cpu, Sparkles, Coffee } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { McpServerModal } from "@/components/mcp/McpServerModal";

export function Footer() {
  const { t } = useTranslation();
  const [releaseVersion, setReleaseVersion] = useState("0.8.0");
  const [showMcpModal, setShowMcpModal] = useState(false);
  const displayReleaseVersion = `v${releaseVersion.replace(/^v/i, "")}`;
  
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
        // Fallback version
      }
    };
    loadVersion();
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full border-t border-gray-200/80 bg-white py-12 dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/android-chrome-192x192.png"
                alt="CampingRoute Logo"
                className="w-7 h-7"
              />
              <span className="font-extrabold text-xl tracking-tight text-emerald-700 dark:text-emerald-400">
                CampingRoute
              </span>
            </div>
            <p className="text-xs text-foreground/60 dark:text-white/60 leading-relaxed">
              {t("footer.brandDescription", "CampingRoute — Finde deine perfekte Campingtour mit smarter künstlicher Intelligenz. Erstelle maßgeschneiderte Prompts für ChatGPT, Claude & Gemini.")}
            </p>
          </div>

          {/* Navigation & Tools Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-white">
              Navigation & KI-Tools
            </h4>
            <ul className="space-y-2 text-xs font-medium text-foreground/70 dark:text-white/70">
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("navbar.planNow", "Prompt-Assistent")}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/mcp"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("footer.mcpServerLink", "MCP-Server für KI-Assistenten")}</span>
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.buymeacoffee.com/campingroute" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  <Coffee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("planner.summary.save.coffee", "Kaffee spendieren")}</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/chrischtili/campingrouteapp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-white">
              {t("footer.legalHeading", "Rechtliches")}
            </h4>
            <ul className="space-y-2 text-xs font-medium text-foreground/70 dark:text-white/70">
              <li>
                <Link to="/impressum" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                  {t("footer.impressum", "Impressum")}
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                  {t("footer.datenschutz", "Datenschutz")}
                </Link>
              </li>
              <li className="pt-2 text-[10px] text-foreground/50 dark:text-white/40">
                {t("footer.version", "Version")} {displayReleaseVersion}
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/50 dark:text-white/40">
          <div className="space-y-1 text-center sm:text-left">
            <p>{t("footer.copyrightText", "© 2026 CampingRoute.app. Alle Rechte vorbehalten.")}</p>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
          >
            <span>{t("footer.scrollToTop", "Nach oben")}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <McpServerModal open={showMcpModal} onClose={() => setShowMcpModal(false)} />
    </footer>
  );
}
