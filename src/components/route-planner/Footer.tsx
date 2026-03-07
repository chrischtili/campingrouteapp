import { Compass, Github, Shield, FileText, Heart, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { t } = useTranslation();
  const [releaseVersion, setReleaseVersion] = useState("0.4.8");
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
        // Keep fallback version in the label.
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

  const openWhatsNew = () => {
    window.dispatchEvent(new Event("open-whats-new"));
  };

  const openFeedback = () => {
    window.dispatchEvent(new Event("open-feedback"));
  };

  return (
    <footer className="relative bg-[#0a140f] text-white pt-32 pb-12 overflow-hidden border-t border-white/5">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/40 dark:from-black/30 dark:via-black/60 dark:to-black/80" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-8 text-left">
            <div className="flex items-center gap-4">
              <img
                src="/android-chrome-192x192.png"
                alt="Logo"
                className="w-10 h-10"
              />
              <span className="font-black text-3xl tracking-tighter">
                Camping<span className="text-primary">Route</span>
              </span>
            </div>
            <p className="text-white/80 max-w-sm leading-relaxed text-base italic font-serif">
              {t("footer.description")}
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 text-left">
            <div className="space-y-6">
              <h4 className="font-semibold text-xs tracking-[0.04em] text-primary">{t("footer.imprint")}</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/impressum" className="text-sm font-semibold text-white/70 hover:text-primary transition-colors flex items-center gap-3 group">
                    <FileText className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    {t("footer.imprint")}
                  </Link>
                </li>
                <li>
                  <Link to="/datenschutz" className="text-sm font-semibold text-white/70 hover:text-primary transition-colors flex items-center gap-3 group">
                    <Shield className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    {t("footer.privacy")}
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-semibold text-xs tracking-[0.04em] text-primary">{t("footer.openSource")}</h4>
              <ul className="space-y-4">
                <li>
                  <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" 
                     className="text-sm font-semibold text-white/70 hover:text-primary transition-colors flex items-center gap-3 group">
                    <Github className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    {t("footer.sourceCode")}
                  </a>
                </li>
                <li>
                  <a href="https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"
                     className="text-sm font-semibold text-white/70 hover:text-primary transition-colors flex items-center gap-3 group">
                    <div className="w-4 h-4 flex items-center justify-center text-[8px] font-black border-2 border-primary/40 rounded-sm text-primary opacity-60 group-hover:opacity-100 transition-opacity">MIT</div>
                    {t("footer.license")}
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openWhatsNew}
                    className="text-sm font-semibold text-white/70 hover:text-primary transition-colors flex items-center gap-3 group"
                  >
                    <Compass className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    {t("footer.whatsNew", { version: displayReleaseVersion })}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openFeedback}
                    className="text-sm font-semibold text-white/70 hover:text-primary transition-colors flex items-center gap-3 group"
                  >
                    <Heart className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    {t("footer.feedback")}
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-start md:items-end justify-start">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={scrollToTop}
                className="w-14 h-14 rounded-2xl border-2 border-white/20 bg-white/5 hover:bg-primary hover:border-primary hover:text-white transition-all duration-500 shadow-2xl"
              >
                <ArrowUp className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[11px] font-medium tracking-[0.03em] text-white/40">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 shadow-inner">
            <span className="text-[11px] font-medium tracking-[0.03em] text-white/60">{t("footer.madeWith")}</span>
            <Heart className="w-3 h-3 text-primary fill-primary" />
            <span className="text-[11px] font-medium tracking-[0.03em] text-white/60">{t("footer.forCommunity")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
