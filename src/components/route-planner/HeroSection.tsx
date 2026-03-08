import { MapPin, ChevronRight, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onStartPlanning?: () => void;
}

export function HeroSection({ onStartPlanning }: HeroSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background" id="home">
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/campingroute.webp"
          alt={t("hero.title")}
          className="hero-image w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-10 md:pt-24 md:pb-14 min-h-screen flex flex-col">
        <div className="flex justify-center mt-6 md:mt-8 lg:mt-10">
        <div className="hero-mobile-copy w-full max-w-3xl px-4 py-3 sm:px-8 sm:py-4 md:px-10 md:py-4 text-center rounded-[1.5rem] md:rounded-none">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md mb-8 reveal-once">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            <span className="text-primary font-black text-[10px] tracking-[0.3em]">
              {t("hero.badge")}
            </span>
          </div>

          <h1 className="hero-title text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-[3.75rem] 2xl:text-[5.5rem] font-black text-foreground dark:text-white mb-6 md:mb-8 lg:mb-10 tracking-[0.06em] leading-[0.9] w-full reveal-once delay-1">
            Camping<span className="text-primary">Route</span>
          </h1>

          <div className="max-w-xl sm:max-w-2xl mx-auto mb-2 md:mb-0 px-4 sm:px-6 md:px-0 reveal-once delay-2">
            <p className="hero-description text-xs sm:text-sm md:text-base lg:text-xl text-foreground dark:text-white/82 font-semibold tracking-tight leading-relaxed drop-shadow-sm">
              {t("hero.description")}
            </p>
          </div>
        </div>
        </div>

        <div className="w-full flex flex-col items-center gap-4 md:gap-6 mt-auto pb-20 md:pb-24 lg:pb-28">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 md:gap-4 justify-center items-center reveal-once delay-3 w-full">
            <Button
              size="sm"
              onClick={() => onStartPlanning?.()}
              className="group relative w-full sm:w-auto px-8 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-4 md:py-6 lg:py-8 rounded-xl sm:rounded-2xl text-white font-black text-base sm:text-sm md:text-base lg:text-lg shadow-xl sm:shadow-2xl shadow-primary/30 overflow-hidden transition-all hover:scale-105 border-2 border-primary/50"
              style={{
                background: "rgba(255, 128, 0, 0.78)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <span className="relative z-10 flex items-center gap-2 sm:gap-2 md:gap-2 lg:gap-3">
                <MapPin className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 lg:w-6 lg:h-6 group-hover:rotate-12 transition-transform" />
                {t("hero.planNow")}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full sm:w-auto px-8 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-4 md:py-6 lg:py-8 rounded-xl sm:rounded-2xl border-slate-900/10 bg-white/70 backdrop-blur-md text-foreground hover:bg-white hover:border-primary/40 hover:text-primary transition-all border-2 dark:border-white/25 dark:bg-black/35 dark:text-white dark:hover:bg-black/45 dark:hover:border-white/45 dark:hover:text-primary font-bold group/example text-base sm:text-sm md:text-base lg:text-lg"
            >
              <a href="#example-route">
                <Play className="w-5 h-5 sm:w-3 sm:h-3 md:w-4 lg:w-5 lg:h-5 mr-2 sm:mr-1 md:mr-2 lg:mr-3 fill-current group-hover/example:text-primary transition-colors" />
                {t("hero.viewExample")}
              </a>
            </Button>
          </div>

        <div className="inline-block mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl reveal-once delay-4">
          <div className="hero-stats-card px-4 py-4 sm:px-6 sm:py-6 md:px-12 md:py-8 lg:px-16 lg:py-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] border-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-16 shadow-xl sm:shadow-2xl">
            {[
              { value: t("hero.stats.rating.value"), label: t("hero.stats.rating.label") },
              { value: t("hero.stats.routes.value"), label: t("hero.stats.routes.label") },
              { value: t("hero.stats.price.value"), label: t("hero.stats.price.label") }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center w-1/3 sm:w-auto">
                <span className="text-foreground dark:text-white font-black text-base sm:text-lg md:text-xl lg:text-3xl xl:text-4xl tracking-tighter drop-shadow-md leading-none mb-1 md:mb-2">{stat.value}</span>
                <span className="text-foreground/60 dark:text-white/70 text-[6px] sm:text-[8px] md:text-[10px] lg:text-[11px] tracking-[0.3em] font-black drop-shadow-sm text-center">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-foreground/30 dark:text-white/30">
        <ChevronRight className="w-6 h-6 rotate-90" />
      </div>
    </section>
  );
}
