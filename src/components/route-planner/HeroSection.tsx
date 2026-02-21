import { MapPin, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface HeroSectionProps {
  onStartPlanning?: () => void;
}

export function HeroSection({ onStartPlanning }: HeroSectionProps) {
  const { t, i18n } = useTranslation();
  // Typing Animation State
  const [displayedText, setDisplayedText] = useState({
    line1: "",
    line2: "",
    line3: ""
  });
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const fullText = {
      line1: t("hero.line1"),
      line2: t("hero.line2"),
      line3: t("hero.line3")
    };

    let isMounted = true;

    const typeText = async () => {
      setDisplayedText({ line1: "", line2: "", line3: "" });
      setShowCursor(true);

      // Line 1
      for (let i = 0; i <= fullText.line1.length; i++) {
        if (!isMounted) return;
        setDisplayedText(prev => ({
          ...prev,
          line1: fullText.line1.substring(0, i)
        }));
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Line 2
      for (let i = 0; i <= fullText.line2.length; i++) {
        if (!isMounted) return;
        setDisplayedText(prev => ({
          ...prev,
          line2: fullText.line2.substring(0, i)
        }));
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Line 3
      for (let i = 0; i <= fullText.line3.length; i++) {
        if (!isMounted) return;
        setDisplayedText(prev => ({
          ...prev,
          line3: fullText.line3.substring(0, i)
        }));
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      // Cursor entfernen, wenn Animation fertig ist
      if (isMounted) setShowCursor(false);
    };

    typeText();

    return () => {
      isMounted = false;
    };
  }, [t, i18n.language]);

  return (
    <section className="relative min-h-screen md:h-[90vh] flex items-center justify-center overflow-hidden pt-20" id="home">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/campingroute.webp"
          alt={t("hero.title")}
          className="w-full h-full object-cover"
          fetchpriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 dark:from-black/80 dark:to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-0.5 mb-0 md:mb-6 pt-20 md:pt-0 max-sm:pt-24"
        >
          <img 
            src="/favicon-original-final.svg" 
            alt="Logo" 
            className="w-12 h-12" 
            width="48" 
            height="48"
            style={{ filter: 'brightness(0) saturate(100%) invert(40%) sepia(95%) saturate(600%) hue-rotate(5deg) brightness(100%) contrast(120%)' }} 
          />
          <span className="text-[#F59B0A] font-medium tracking-wide uppercase">
            {t("hero.badge")}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] font-bold text-white dark:text-foreground mb-0 md:mb-6 leading-tight pt-6 md:pt-0"
        >
          {t("hero.title")}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-16 max-w-2xl mx-auto pt-10"
        >
          <div className="text-xl md:text-2xl text-white/80 dark:text-foreground/80 font-light mb-2 min-h-[4.5rem] sm:min-h-[3.5rem] flex items-center justify-center">
            <p>{displayedText.line1}{showCursor && <span className="blink-cursor">|</span>}</p>
          </div>
          <div className="text-lg md:text-xl text-white/70 dark:text-foreground/70 font-light mb-1 min-h-[3.5rem] sm:min-h-[2.5rem] flex items-center justify-center">
            <p>{displayedText.line2}</p>
          </div>
          <div className="text-base md:text-lg text-white/60 dark:text-foreground/60 font-light min-h-[3rem] sm:min-h-[2.5rem] flex items-center justify-center">
            <p>{displayedText.line3}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => onStartPlanning?.()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#F59B0A] to-[#E67E22] text-white dark:text-foreground font-semibold text-lg shadow-lg hover:scale-105 transition-transform duration-200"
          >
            <MapPin className="w-5 h-5" />
            {t("hero.planNow")}
          </button>
          <a
            href="#example-route"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-white/30 text-white dark:text-foreground font-medium text-lg hover:bg-white/10 dark:hover:bg-foreground/10 transition-colors duration-200"
          >
            {t("hero.viewExample")}
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4 text-white/60 dark:text-foreground/60 text-sm"
        >
          <span>{t("hero.rating")}</span>
          <span className="w-1 h-1 rounded-full bg-white/40 dark:bg-foreground/40 hidden sm:block" />
          <span>{t("hero.plannedCount")}</span>
          <span className="w-1 h-1 rounded-full bg-white/40 dark:bg-foreground/40 hidden sm:block" />
          <span>{t("hero.free")}</span>
        </motion.div>
      </div>
    </section>
  );
}
