import { Github, ArrowUp, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getFinderNavLabels } from "@/lib/finderPageContent";

export function Footer() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const finderLabels = getFinderNavLabels(i18n.language);
  const [releaseVersion, setReleaseVersion] = useState("0.6.1");
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
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
              CampingRoute — Finde deine perfekte Campingtour mit smarter künstlicher Intelligenz. Entdecke tolle Stellplätze und Campingplätze in Europa.
            </p>
          </div>

          {/* Beliebte Reiseländer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-white">
              Beliebte Reiseländer
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs font-medium text-foreground/70 dark:text-white/70">
              {[
                ["DE", "🇩🇪 Deutschland"],
                ["AT", "🇦🇹 Österreich"],
                ["CH", "🇨🇭 Schweiz"],
                ["IT", "🇮🇹 Italien"],
                ["FR", "🇫🇷 Frankreich"],
                ["SE", "🇸🇪 Schweden"],
                ["NL", "🇳🇱 Niederlande"],
                ["DK", "🇩🇰 Dänemark"],
              ].map(([code, label]) => (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("campingroute:open-country", { detail: { code } }));
                      navigate("/entdecken");
                    }}
                    className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Column 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-white">
              Features & Info
            </h4>
            <ul className="space-y-2 text-xs font-medium text-foreground/70 dark:text-white/70">
              <li>
                <a href="#features" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                  {t("navbar.features")}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                  {t("navbar.faq")}
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
              <li>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("campingroute:open-mcp"));
                    navigate("/entdecken");
                  }}
                  className="inline-flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>MCP-Server für KI-Assistenten</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Column 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-white">
              Rechtliches
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
                Version {displayReleaseVersion}
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/50 dark:text-white/40">
          <div className="space-y-1">
            <p>© 2026 CampingRoute.app. Alle Rechte vorbehalten.</p>
            <p>
              Kartendaten &amp; Orte ©{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                OpenStreetMap
              </a>
              -Mitwirkende (ODbL). Sehenswürdigkeiten &amp; Bilder bereitgestellt durch{" "}
              <a
                href="https://www.wikidata.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                Wikidata
              </a>
              . Camping- &amp; Stellplätze aus OpenStreetMap (nur mit verifizierter Website), Sehenswürdigkeiten aus Wikidata.
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors shrink-0"
          >
            <span>Nach oben</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
