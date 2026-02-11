import { MapPin, Compass } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-screen md:h-[90vh] flex items-center justify-center overflow-hidden pt-20" id="home">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/campingroute.webp"
          alt="Wohnmobil auf malerischer Bergstraße bei Sonnenuntergang"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-0.5 mb-0 md:mb-6 pt-20 md:pt-0 max-sm:pt-24"
        >
          <img src="/favicon-original-final.svg" alt="KI-Routenplaner Logo" className="w-12 h-12" style={{ filter: 'brightness(0) saturate(100%) invert(40%) sepia(95%) saturate(600%) hue-rotate(5deg) brightness(100%) contrast(120%)' }} />
          <span className="text-[#F59B0A] font-medium tracking-wide uppercase">
            KI-Routenplaner
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] font-bold text-white mb-0 md:mb-6 leading-tight pt-6 md:pt-0"
        >
          Camping Route
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl md:text-2xl text-white/80 font-light mb-16 max-w-2xl mx-auto pt-10"
        >
          Plane deine perfekte Wohnmobil-Reise mit KI-gestützter Routenplanung
          und intelligenten Empfehlungen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#planner"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#F59B0A] to-[#E67E22] text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform duration-200"
          >
            <MapPin className="w-5 h-5" />
            Route jetzt planen
          </a>
          <a
            href="#example-route"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-white/30 text-white font-medium text-lg hover:bg-white/10 transition-colors duration-200"
          >
            Beispielroute ansehen
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4 text-white/60 text-sm"
        >
          <span>★★★★★ 4.7/5 Bewertung</span>
          <span className="w-1 h-1 rounded-full bg-white/40 hidden sm:block" />
          <span>1.000+ geplante Routen</span>
          <span className="w-1 h-1 rounded-full bg-white/40 hidden sm:block" />
          <span>100% kostenlos</span>
        </motion.div>
      </div>
    </section>
  );
}
