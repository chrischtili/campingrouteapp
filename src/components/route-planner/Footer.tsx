import { Compass, Github, Shield, FileText, Heart, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { t } = useTranslation();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#0a140f] text-white pt-32 pb-12 overflow-hidden border-t border-white/5">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-8 text-left">
            <div className="flex items-center gap-4">
              <img 
                src="/favicon-original-final.svg" 
                alt="Logo" 
                className="w-10 h-10" 
                style={{ 
                  filter: 'brightness(0) saturate(100%) invert(60%) sepia(80%) saturate(2000%) hue-rotate(10deg) brightness(100%) contrast(105%)' 
                }}
              />
              <span className="font-black text-3xl tracking-tighter uppercase">
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
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-primary">{t("footer.imprint")}</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/impressum" className="text-sm font-bold text-white/70 hover:text-primary transition-colors flex items-center gap-3 group">
                    <FileText className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    {t("footer.imprint")}
                  </Link>
                </li>
                <li>
                  <Link to="/datenschutz" className="text-sm font-bold text-white/70 hover:text-primary transition-colors flex items-center gap-3 group">
                    <Shield className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    {t("footer.privacy")}
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-primary">{t("footer.openSource")}</h4>
              <ul className="space-y-4">
                <li>
                  <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" 
                     className="text-sm font-bold text-white/70 hover:text-primary transition-colors flex items-center gap-3 group">
                    <Github className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    {t("footer.sourceCode")}
                  </a>
                </li>
                <li>
                  <a href="https://github.com/chrischtili/campingrouteapp/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"
                     className="text-sm font-bold text-white/70 hover:text-primary transition-colors flex items-center gap-3 group">
                    <div className="w-4 h-4 flex items-center justify-center text-[8px] font-black border-2 border-primary/40 rounded-sm text-primary opacity-60 group-hover:opacity-100 transition-opacity">MIT</div>
                    {t("footer.license")}
                  </a>
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{t("footer.madeWith")}</span>
            <Heart className="w-3 h-3 text-primary fill-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{t("footer.forCommunity")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
