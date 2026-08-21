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

  const langKey = (i18n.language || "de").slice(0, 2).toLowerCase();

  const popularCountries = [
    { code: "DE", flag: "🇩🇪", name: { de: "Deutschland", en: "Germany", fr: "Allemagne", it: "Germania", nl: "Duitsland" } },
    { code: "AT", flag: "🇦🇹", name: { de: "Österreich", en: "Austria", fr: "Autriche", it: "Austria", nl: "Oostenrijk" } },
    { code: "CH", flag: "🇨🇭", name: { de: "Schweiz", en: "Switzerland", fr: "Suisse", it: "Svizzera", nl: "Zwitserland" } },
    { code: "IT", flag: "🇮🇹", name: { de: "Italien", en: "Italy", fr: "Italie", it: "Italia", nl: "Italië" } },
    { code: "FR", flag: "🇫🇷", name: { de: "Frankreich", en: "France", fr: "France", it: "Francia", nl: "Frankrijk" } },
    { code: "SE", flag: "🇸🇪", name: { de: "Schweden", en: "Sweden", fr: "Suède", it: "Svezia", nl: "Zweden" } },
    { code: "NL", flag: "🇳🇱", name: { de: "Niederlande", en: "Netherlands", fr: "Pays-Bas", it: "Paesi Bassi", nl: "Nederland" } },
    { code: "DK", flag: "🇩🇰", name: { de: "Dänemark", en: "Denmark", fr: "Danemark", it: "Danimarca", nl: "Denemarken" } },
  ];

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
              {t("footer.brandDescription", "CampingRoute — Finde deine perfekte Campingtour mit smarter künstlicher Intelligenz. Entdecke tolle Stellplätze und Campingplätze in Europa.")}
            </p>
          </div>

          {/* Beliebte Reiseländer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-white">
              {t("footer.popularCountries", "Beliebte Reiseländer")}
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs font-medium text-foreground/70 dark:text-white/70">
              {popularCountries.map(({ code, flag, name }) => {
                const label = `${flag} ${(name as any)[langKey] || name.de}`;
                return (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("campingroute:open-country", { detail: { code } }));
                        navigate("/discover");
                      }}
                      className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Features Column 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-white">
              {t("footer.featuresHeading", "Features & Info")}
            </h4>
            <ul className="space-y-2 text-xs font-medium text-foreground/70 dark:text-white/70">
              <li>
                <a href="#features" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                  {t("navbar.features", "Features")}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                  {t("navbar.faq", "FAQ")}
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
                    navigate("/discover");
                  }}
                  className="inline-flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{t("footer.mcpServerLink", "MCP-Server für KI-Assistenten")}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Column 3 */}
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
          <div className="space-y-1">
            <p>{t("footer.copyrightText", "© 2026 CampingRoute.app. Alle Rechte vorbehalten.")}</p>
            <p>
              {t("footer.attributionText", "Kartendaten & Orte © OpenStreetMap-Mitwirkende (ODbL). Sehenswürdigkeiten & Bilder bereitgestellt durch Wikidata. Camping- & Stellplätze aus OpenStreetMap (nur mit verifizierter Website), Sehenswürdigkeiten aus Wikidata.")}
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors shrink-0"
          >
            <span>{t("footer.scrollToTop", "Nach oben")}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
