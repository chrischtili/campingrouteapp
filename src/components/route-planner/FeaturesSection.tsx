import { Compass, Zap, Filter, Shield, Github, Gift, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    { icon: Compass, title: t("features.promptGen.title"), description: t("features.promptGen.description"), accent: "text-primary" },
    { icon: Filter, title: t("features.smartFilters.title"), description: t("features.smartFilters.description"), accent: "text-primary md:text-secondary dark:text-[#4ade80]" },
    { icon: Zap, title: t("features.readyInstantly.title"), description: t("features.readyInstantly.description"), accent: "text-primary" },
    { icon: Shield, title: t("features.privacyFirst.title"), description: t("features.privacyFirst.description"), accent: "text-primary md:text-secondary dark:text-[#4ade80]" },
    { icon: Github, title: t("features.openSource.title"), description: t("features.openSource.description"), accent: "text-primary", link: "https://github.com/chrischtili/campingrouteapp" },
    { icon: Gift, title: t("features.freeAdFree.title"), description: t("features.freeAdFree.description"), accent: "text-primary md:text-secondary dark:text-[#4ade80]" },
  ];

  return (
    <section className="py-32 px-6 bg-background relative overflow-hidden" id="features">
      {/* 
          BACKGROUND BLOBS 
          Static for performance, still provide depth behind the glass cards.
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-background/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15 dark:from-black/20 dark:via-black/40 dark:to-black/60" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 sm:mb-32 space-y-4 sm:space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              {t("features.badge")}
            </span>
          </span>
          <h2 className="text-4xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tighter uppercase leading-[0.9]">
            {t("features.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          {features.map((f, i) => (
            <div
              key={i}
              className="relative group h-full"
            >
              {/* 
                  THE MASTER GLASS CARD
                  Exactly like the hero button: white/5 bg, white/20 border, heavy blur
              */}
              <div 
                className="absolute inset-0 rounded-3xl sm:rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-primary/10"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(25px) saturate(200%)",
                  WebkitBackdropFilter: "blur(25px) saturate(200%)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                }}
              />
              
              {/* Content */}
              <div className="relative z-10 p-8 sm:p-12 space-y-6 sm:space-y-8 flex flex-col items-start h-full">
                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center border-2 border-white/20 transition-all duration-700 group-hover:rotate-6 shadow-xl ${f.accent} bg-white/5`}>
                  <f.icon className="w-10 h-10" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-foreground tracking-tight uppercase leading-none group-hover:text-primary transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-foreground/70 text-lg font-bold leading-relaxed">
                    {f.description}
                  </p>
                </div>

                {f.link && (
                  <a 
                    href={f.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl border-2 border-white/20 bg-white/10 text-foreground font-black uppercase text-[10px] tracking-widest hover:border-primary hover:text-primary transition-all duration-500 mt-auto"
                  >
                    <Github className="w-4 h-4" />
                    <span>Open Source</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
