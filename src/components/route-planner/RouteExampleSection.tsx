import { MapPin, Clock, Euro, Wine, Landmark, ChevronRight, Info, PlusCircle, ChevronDown, ChevronUp, Compass, Map, Route, Star, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function RouteExampleSection() {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const stages = [
    {
      from: t("exampleRoute.stages.karlsruhe"),
      to: t("exampleRoute.stages.fulda"),
      distance: t("exampleRoute.stages.distances.karlsruhe_fulda"),
      duration: t("exampleRoute.stages.times.karlsruhe_fulda"),
      highlight: t("exampleRoute.stages.highlights.fulda"),
      icon: Landmark,
      details: t("exampleRoute.stages.details.fulda"),
      overnight: t("exampleRoute.stages.overnight.fulda"),
    },
    {
      from: t("exampleRoute.stages.fulda"),
      to: t("exampleRoute.stages.magdeburg"),
      distance: t("exampleRoute.stages.distances.fulda_magdeburg"),
      duration: t("exampleRoute.stages.times.fulda_magdeburg"),
      highlight: t("exampleRoute.stages.highlights.magdeburg"),
      icon: MapPin,
      details: t("exampleRoute.stages.details.magdeburg"),
      overnight: t("exampleRoute.stages.overnight.magdeburg"),
    },
    {
      from: t("exampleRoute.stages.magdeburg"),
      to: t("exampleRoute.stages.perleberg"),
      distance: t("exampleRoute.stages.distances.magdeburg_perleberg"),
      duration: t("exampleRoute.stages.times.magdeburg_perleberg"),
      highlight: t("exampleRoute.stages.highlights.perleberg"),
      icon: Wine,
      details: t("exampleRoute.stages.details.perleberg"),
      overnight: t("exampleRoute.stages.overnight.perleberg"),
    },
    {
      from: t("exampleRoute.stages.perleberg"),
      to: t("exampleRoute.stages.wismar"),
      distance: t("exampleRoute.stages.distances.perleberg_wismar"),
      duration: t("exampleRoute.stages.times.perleberg_wismar"),
      highlight: t("exampleRoute.stages.highlights.wismar"),
      icon: MapPin,
      details: t("exampleRoute.stages.details.wismar"),
      overnight: t("exampleRoute.stages.overnight.wismar"),
    },
  ];

  const overnights = [
    { day: '1', place: t("exampleRoute.stages.overnight.fulda"), price: '35–45 €' },
    { day: '2', place: t("exampleRoute.stages.overnight.magdeburg"), price: '25–35 €' },
    { day: '3', place: t("exampleRoute.stages.overnight.perleberg"), price: '15–20 €' },
    { day: '4–11', place: t("exampleRoute.stages.overnight.wismar"), price: '50–65 €' },
    { day: '12', place: t("exampleRoute.stages.overnight.uelzen"), price: '30–40 €' },
    { day: '13', place: t("exampleRoute.stages.overnight.harz"), price: '35–45 €' },
    { day: '14', place: t("exampleRoute.stages.overnight.spessart"), price: '30–40 €' },
  ];

  return (
    <section id="example-route" className="py-32 px-6 bg-background relative overflow-hidden">
      {/* Abstract Map Background Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none dark:opacity-[0.08]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-12 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="inline-block px-6 py-2 rounded-full border-2 border-primary/20 bg-primary/10 text-primary font-black uppercase text-[10px] tracking-[0.4em] mb-8">
              {t("exampleRoute.badge")}
            </span>
            <h2 className="text-3xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter leading-[0.9] mb-8 uppercase">
              {t("exampleRoute.title")}
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed italic font-serif">
              {t("exampleRoute.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] grid grid-cols-2 gap-6 sm:gap-8 w-full md:w-auto md:min-w-[320px] shadow-2xl shadow-black/5"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "2px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            {[
              { label: t("exampleRoute.summary.distance"), value: t("exampleRoute.summary.distanceValue"), icon: Route },
              { label: t("exampleRoute.summary.duration"), value: t("exampleRoute.summary.durationValue"), icon: Clock },
              { label: t("exampleRoute.summary.budget"), value: t("exampleRoute.summary.budgetValue"), icon: Euro },
              { label: t("exampleRoute.summary.style"), value: t("exampleRoute.summary.styleValue"), icon: Star },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <item.icon className="w-5 h-5 text-primary mb-2" />
                <span className="text-2xl font-black text-foreground">{item.value}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Modern Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 items-stretch">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative flex flex-col h-full"
              >
                <div 
                  className="relative z-10 p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] flex-1 flex flex-col transition-all duration-500 hover:scale-[1.02] shadow-2xl border-2"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg shrink-0">
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 shrink-0">
                    {t("exampleRoute.stages.stageLabel")} {i + 1}
                  </div>
                  
                  <h3 className="font-black text-xl text-white mb-6 leading-tight uppercase tracking-tight shrink-0">
                    {stage.from} <ChevronRight className="inline w-4 h-4 text-primary" /> {stage.to}
                  </h3>
                  
                  <div className="flex-1">
                    <p className="text-base text-white/70 mb-8 font-medium leading-relaxed">
                      {stage.details}
                    </p>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/10 shrink-0">
                    <div className="flex items-center gap-3 text-sm font-black text-white uppercase tracking-wider">
                      <Clock className="w-4 h-4 text-primary" />
                      {stage.duration}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-black text-white uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-primary" />
                      {stage.distance}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed View Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowDetails(!showDetails)}
            className="group rounded-2xl border-white/20 bg-white/5 backdrop-blur-md px-12 py-8 hover:bg-white/10 hover:border-white/40 hover:text-primary transition-all duration-300 border-2 font-black uppercase text-lg shadow-xl"
          >
            <span className="flex items-center gap-4">
              {showDetails ? t("exampleRoute.details.hide") : t("exampleRoute.details.show")}
              {showDetails ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6 transition-transform group-hover:translate-y-1" />}
            </span>
          </Button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mt-16 overflow-hidden text-left"
              >
                <div className="p-6 sm:p-10 md:p-16 rounded-3xl sm:rounded-[4rem] border-2 border-white/20 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16"
                     style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(24px)" }}>
                  
                  {/* 1. Etappenplanung - Full width on all */}
                  <div className="lg:col-span-2">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black mb-6 flex items-center gap-4 uppercase tracking-tighter">
                        <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        {t("exampleRoute.details.planning")}
                      </h4>
                      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed italic font-serif">
                        {t("exampleRoute.details.planningDesc")}
                      </p>
                    </div>

                     <div className="p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border-2 border-white/10" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                       <h5 className="font-black text-primary uppercase tracking-[0.2em] text-xs mb-8">{t("exampleRoute.details.outward")}</h5>
                       <div className="space-y-6 mb-8">
                         {[
                           `${t("exampleRoute.stages.karlsruhe")} → ${t("exampleRoute.stages.fulda")}`,
                           `${t("exampleRoute.stages.fulda")} → ${t("exampleRoute.stages.magdeburg")}`,
                           `${t("exampleRoute.stages.magdeburg")} → ${t("exampleRoute.stages.perleberg")}`,
                           `${t("exampleRoute.stages.perleberg")} → ${t("exampleRoute.stages.wismar")}`
                         ].map((stage, i) => (
                           <div key={i} className="flex gap-4 sm:gap-6 items-center group">
                             <span className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-primary border-2 border-white/10 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">{i + 1}</span>
                             <span className="text-foreground font-black uppercase text-sm tracking-tight">{stage}</span>
                           </div>
                         ))}
                       </div>
                       <h5 className="font-black text-primary uppercase tracking-[0.2em] text-xs mb-8">{t("exampleRoute.details.return")}</h5>
                       <div className="space-y-6">
                         {[
                           `${t("exampleRoute.stages.wismar")} → Uelzen`,
                           `Uelzen → Harz`,
                           `Harz → Spessart`,
                           `Spessart → ${t("exampleRoute.stages.karlsruhe")}`
                         ].map((stage, i) => (
                           <div key={i} className="flex gap-4 sm:gap-6 items-center group">
                             <span className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-primary border-2 border-white/10 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">{i + 5}</span>
                             <span className="text-foreground font-black uppercase text-sm tracking-tight">{stage}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                  </div>

                  {/* 2. Übernachtungen - Left column on desktop */}
                  <div>
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black mb-6 flex items-center gap-4 uppercase tracking-tighter">
                        <Euro className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        {t("exampleRoute.details.overnight")}
                      </h4>
                      <div className="grid gap-4">
                        {overnights.map((stay, i) => (
                          <div key={i} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex justify-between items-center border-2 border-white/10 hover:border-white/20 transition-all group" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                            <div className="flex gap-4 sm:gap-6 items-center">
                              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{t("exampleRoute.summary.dayLabel")} {stay.day}</span>
                              <span className="text-foreground font-black uppercase text-sm">{stay.place}</span>
                            </div>
                            <span className="font-black text-primary text-lg tracking-tighter">{stay.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                     <div className="p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border-2 border-primary/20 bg-primary/5">
                       <h4 className="font-black text-primary flex items-center gap-3 mb-4 uppercase text-sm tracking-widest">
                         <Info className="w-5 h-5" />
                         {t("exampleRoute.details.summary")}
                       </h4>
                       <p className="text-base text-muted-foreground leading-relaxed italic font-serif">
                         {t("exampleRoute.details.summaryDesc")}
                       </p>
                     </div>
                  </div>

                  {/* 3. Highlights - Right column on desktop */}
                  <div>
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black mb-6 flex items-center gap-4 uppercase tracking-tighter">
                        <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        {t("exampleRoute.details.highlights")}
                      </h4>
                      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed italic font-serif mb-6">
                        {t("exampleRoute.details.highlightsDesc")}
                      </p>
                      <div className="space-y-4">
                        {Object.values(t("exampleRoute.details.highlightsList", { returnObjects: true })).map((highlight, i) => (
                          <div key={i} className="p-4 sm:p-6 rounded-2xl flex items-center gap-4 border-2 border-white/10 hover:border-white/20 transition-all" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                            <Compass className="w-5 h-5 text-primary shrink-0" />
                            <span className="text-foreground font-black uppercase text-sm">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. Praktische Tipps - Full width on all */}
                  <div className="lg:col-span-2">
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-black mb-6 flex items-center gap-4 uppercase tracking-tighter">
                        <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        {t("exampleRoute.details.practical")}
                      </h4>
                      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed italic font-serif mb-6">
                        {t("exampleRoute.details.practicalDesc")}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.keys(t("exampleRoute.details.practicalItems", { returnObjects: true })).map((key, i) => (
                          <div key={i} className="p-4 sm:p-6 rounded-2xl border-2 border-white/10 hover:border-white/20 transition-all" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{t(`exampleRoute.details.practicalItems.${key}`)}</span>
                            <span className="block text-foreground font-black uppercase text-base mt-2">{t(`exampleRoute.details.practicalValues.${key}`)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
