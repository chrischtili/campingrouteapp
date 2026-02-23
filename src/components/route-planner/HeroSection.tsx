import { MapPin, Compass, ChevronRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onStartPlanning?: () => void;
}

export function HeroSection({ onStartPlanning }: HeroSectionProps) {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] } 
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background" id="home">
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          src="/campingroute.webp"
          alt={t("hero.title")}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background dark:from-black/95 dark:via-black/70 dark:to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">
            {t("hero.badge")}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.21, 0.45, 0.32, 0.9] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[9rem] font-black text-white mb-6 md:mb-8 lg:mb-12 tracking-tighter leading-[0.9] drop-shadow-2xl text-center w-full"
        >
          Camping<span className="text-primary">Route</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-xl sm:max-w-2xl mx-auto mb-8 md:mb-12 lg:mb-16 px-4 sm:px-6 md:px-0"
        >
          <p className="text-xs sm:text-sm md:text-base lg:text-xl text-white/80 font-medium tracking-tight leading-relaxed drop-shadow-sm">
            {t("hero.description")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-col gap-2 sm:flex-row sm:gap-3 md:gap-4 justify-center items-center"
        >
          <Button
            size="sm"
            onClick={() => onStartPlanning?.()}
            className="group relative w-full sm:w-auto px-8 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-4 md:py-6 lg:py-8 rounded-xl sm:rounded-2xl text-white font-black text-base sm:text-sm md:text-base lg:text-lg shadow-xl sm:shadow-2xl shadow-primary/30 overflow-hidden transition-all hover:scale-105 border-2 border-primary/50"
            style={{
              background: "rgba(245, 155, 10, 0.3)",
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
            className="w-full sm:w-auto px-8 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-4 md:py-6 lg:py-8 rounded-xl sm:rounded-2xl border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 hover:border-white/40 hover:text-primary transition-all border-2 font-bold group/example text-base sm:text-sm md:text-base lg:text-lg"
          >
            <a href="#example-route">
              <Play className="w-5 h-5 sm:w-3 sm:h-3 md:w-4 lg:w-5 lg:h-5 mr-2 sm:mr-1 md:mr-2 lg:mr-3 fill-current group-hover/example:text-primary transition-colors" />
              {t("hero.viewExample")}
            </a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-8 md:mt-24 lg:mt-32 inline-block mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl"
        >
          <div className="px-4 py-4 sm:px-6 sm:py-6 md:px-12 md:py-8 lg:px-16 lg:py-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] border-white/20 bg-white/5 backdrop-blur-md border-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-16 shadow-xl sm:shadow-2xl shadow-black/10">
            {[
              { value: t("hero.stats.rating.value"), label: t("hero.stats.rating.label") },
              { value: t("hero.stats.routes.value"), label: t("hero.stats.routes.label") },
              { value: t("hero.stats.price.value"), label: t("hero.stats.price.label") }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center w-1/3 sm:w-auto">
                <span className="text-white font-black text-base sm:text-lg md:text-xl lg:text-3xl xl:text-4xl tracking-tighter drop-shadow-md leading-none mb-1 md:mb-2">{stat.value}</span>
                <span className="text-white/70 text-[6px] sm:text-[8px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.3em] font-black drop-shadow-sm text-center">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
      >
        <ChevronRight className="w-6 h-6 rotate-90" />
      </motion.div>
    </section>
  );
}
