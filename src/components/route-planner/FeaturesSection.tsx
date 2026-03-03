import { Compass, Zap, Filter, Shield, Github, Gift, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    { icon: Compass, title: t("features.promptGen.title"), description: t("features.promptGen.description"), accent: "text-indigo-400" },
    { icon: Filter, title: t("features.smartFilters.title"), description: t("features.smartFilters.description"), accent: "text-sky-400" },
    { icon: Zap, title: t("features.readyInstantly.title"), description: t("features.readyInstantly.description"), accent: "text-amber-400" },
    { icon: Shield, title: t("features.privacyFirst.title"), description: t("features.privacyFirst.description"), accent: "text-emerald-400" },
    { icon: Github, title: t("features.openSource.title"), description: t("features.openSource.description"), accent: "text-violet-400", link: "https://github.com/chrischtili/campingrouteapp" },
    { icon: Gift, title: t("features.freeAdFree.title"), description: t("features.freeAdFree.description"), accent: "text-rose-400" },
  ];

  return (
    <section className="pt-20 pb-16 sm:py-32 px-6 bg-background relative overflow-hidden" id="features">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,128,0,0.10),transparent_38%),linear-gradient(180deg,rgba(7,10,11,0.98),rgba(9,11,12,0.98))]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/30" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 sm:mb-32 space-y-4 sm:space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15 bg-primary/[0.06] reveal-once">
            <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              {t("features.badge")}
            </span>
          </span>
            <h2 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tight leading-[0.95] reveal-once delay-1">
              {t("features.title")}
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          {features.map((f, i) => (
            <div
              key={i}
              className="relative group h-full reveal-once"
              style={{ animationDelay: `${Math.min(i, 4) * 0.08}s` }}
            >
              <div
                className="absolute inset-0 rounded-3xl sm:rounded-[2rem] shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-all duration-500 group-hover:scale-[1.015] group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_rgba(255,128,0,0.16)]"
                style={{
                  background: "linear-gradient(180deg, rgba(30,32,36,0.94), rgba(24,26,30,0.97))",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              />
              <div className="absolute inset-0 rounded-3xl sm:rounded-[2rem] border border-primary/0 opacity-0 transition-all duration-500 group-hover:border-primary/25 group-hover:opacity-100" />
              
              {/* Content */}
              <div className="relative z-10 p-8 sm:p-8 space-y-6 flex flex-col items-start h-full min-h-[235px]">
                <div className="w-14 h-14 rounded-[1rem] flex items-center justify-center bg-primary/15 text-primary transition-all duration-500 group-hover:bg-primary/20 group-hover:rotate-3">
                  <f.icon className="w-7 h-7" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-[0.95rem] sm:text-[1.28rem] font-black text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-foreground/45 text-sm sm:text-[0.94rem] font-medium leading-7">
                    {f.description}
                  </p>
                </div>

                {f.link && (
                  <a 
                    href={f.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary font-bold text-sm hover:text-primary/80 transition-colors mt-auto"
                  >
                    <Github className="w-4 h-4" />
                    <span>Open Source</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
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
