import { MapPin, Clock, Euro, Wine, Landmark, ChevronRight, Info, PlusCircle, ChevronDown, ChevronUp, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "../../ui/button";
import { useTranslation } from "react-i18next";

export function RouteExampleSection() {
  const { t, i18n } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const stages = [
    {
      from: t("exampleRoute.stages.karlsruhe"),
      to: t("exampleRoute.stages.fulda"),
      distance: "210 km",
      duration: "2:30–3:00 h",
      highlight: t("exampleRoute.stages.highlights.fulda"),
      icon: Landmark,
      details: t("exampleRoute.stages.details.fulda"),
      tips: t("exampleRoute.stages.tips.fulda"),
      overnight: t("exampleRoute.stages.overnight.fulda"),
    },
    {
      from: t("exampleRoute.stages.fulda"),
      to: t("exampleRoute.stages.magdeburg"),
      distance: "240 km",
      duration: "3:00–3:30 h",
      highlight: t("exampleRoute.stages.highlights.magdeburg"),
      icon: MapPin,
      details: t("exampleRoute.stages.details.magdeburg"),
      tips: t("exampleRoute.stages.tips.magdeburg"),
      overnight: t("exampleRoute.stages.overnight.magdeburg"),
    },
    {
      from: t("exampleRoute.stages.magdeburg"),
      to: t("exampleRoute.stages.perleberg"),
      distance: "130 km",
      duration: "1:45–2:15 h",
      highlight: t("exampleRoute.stages.highlights.perleberg"),
      icon: Wine,
      details: t("exampleRoute.stages.details.perleberg"),
      tips: t("exampleRoute.stages.tips.perleberg"),
      overnight: t("exampleRoute.stages.overnight.perleberg"),
    },
    {
      from: t("exampleRoute.stages.perleberg"),
      to: t("exampleRoute.stages.wismar"),
      distance: "95 km",
      duration: "1:15–1:30 h",
      highlight: t("exampleRoute.stages.highlights.wismar"),
      icon: MapPin,
      details: t("exampleRoute.stages.details.wismar"),
      tips: t("exampleRoute.stages.tips.wismar"),
      overnight: t("exampleRoute.stages.overnight.wismar"),
    },
    {
      from: t("exampleRoute.stages.wismar"),
      to: t("exampleRoute.stages.karlsruhe"),
      distance: "-",
      duration: i18n.language === 'en' ? "10 days" : "10 Tage",
      highlight: t("exampleRoute.stages.highlights.return"),
      icon: Info,
      details: t("exampleRoute.stages.details.return"),
      tips: t("exampleRoute.stages.tips.return"),
      overnight: t("exampleRoute.stages.overnight.return"),
    },
  ];

  return (
    <section id="example-route" className="py-24 px-4 bg-[rgb(230,225,215)] dark:bg-gray-700">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">
            {t("exampleRoute.badge")}
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mt-3">
            {t("exampleRoute.title")}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            {t("exampleRoute.subtitle")}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 md:-translate-x-px" />

          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const isRight = i % 2 === 1;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isRight ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className={`relative flex items-start mb-12 last:mb-0 ${
                  isRight ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-[#F59B0A] border-4 border-background -translate-x-1.5 mt-6 z-10" />

                {/* Card */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${isRight ? "md:mr-auto md:ml-8" : "md:ml-auto md:mr-8"}`}>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-2 text-[#F59B0A] dark:text-[#F59B0A] font-semibold text-xs uppercase tracking-wider mb-2">
                      <Icon className="w-4 h-4" />
                      {i === 4 ? t("exampleRoute.stages.stage5to8") : `${t("exampleRoute.stages.stage")} ${i + 1}`}
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-1">
                      {stage.from} <ChevronRight className="inline w-4 h-4 text-muted-foreground" /> {stage.to}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">{stage.highlight}</p>
                    <div className="flex gap-4 text-sm text-foreground/70">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {stage.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {stage.duration}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground italic">
                      {stage.details}
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-[#F59B0A] mt-0.5">●</span>
                        <span className="text-muted-foreground">{stage.tips}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-[#F59B0A] mt-0.5">●</span>
                        <span className="text-muted-foreground">{stage.overnight}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-center gap-8 text-center"
        >
          {[
            { label: t("exampleRoute.summary.distance"), value: "1.325 km" },
            { label: t("exampleRoute.summary.duration"), value: i18n.language === 'en' ? "14 days" : "14 Tage" },
            { label: t("exampleRoute.summary.budget"), value: "900–1000€" },
            { label: t("exampleRoute.summary.style"), value: t("exampleRoute.summary.styleValue") },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {item.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Detailed Route Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8"
        >
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-4 text-[#F59B0A] hover:bg-[#F59B0A]/10 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <Info className="w-4 h-4" />
                {showDetails ? t("exampleRoute.details.hide") : t("exampleRoute.details.show")}
              </span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Route Header */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#F59B0A]" />
                      {t("exampleRoute.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">{t("exampleRoute.details.generatedAt")}:</span> 14.2.2026 17:13:21 • <span className="font-semibold">{t("exampleRoute.details.aiModel")}:</span> GOOGLE
                    </p>
                  </div>

                  {/* Etappen */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#F59B0A]" />
                      {t("exampleRoute.details.planning")}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("exampleRoute.details.planningDesc")}
                    </p>

                    {/* Hinfahrt */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                      <h5 className="font-semibold text-[#F59B0A] mb-3">{t("exampleRoute.details.outward")}</h5>
                      <div className="space-y-3 text-sm">
                        {[
                          `${t("exampleRoute.stages.karlsruhe")} → ${t("exampleRoute.stages.fulda")} (210 km, 2:30–3:00 h)`,
                          `${t("exampleRoute.stages.fulda")} → ${t("exampleRoute.stages.magdeburg")} (240 km, 3:00–3:30 h)`,
                          `${t("exampleRoute.stages.magdeburg")} → ${t("exampleRoute.stages.perleberg")} (130 km, 1:45–2:15 h)`,
                          `${t("exampleRoute.stages.perleberg")} → ${t("exampleRoute.stages.wismar")} (95 km, 1:15–1:30 h)`
                        ].map((stage, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-[#F59B0A] font-medium">{i18n.language === 'en' ? 'Day' : 'Tag'} {i+1}:</span>
                            <span className="text-muted-foreground">{stage}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rückfahrt */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                      <h5 className="font-semibold text-[#F59B0A] mb-3">{t("exampleRoute.details.return")}</h5>
                      <div className="space-y-3 text-sm">
                        {[
                          `${t("exampleRoute.stages.wismar")} → Lüneburger Heide (160 km, 2:00–2:30 h)`,
                          `Lüneburger Heide → Region Edersee (230 km, 3:00–3:30 h)`,
                          `Region Edersee → Bergstraße (190 km, 2:30–3:00 h)`,
                          `Bergstraße → ${t("exampleRoute.stages.karlsruhe")} (70 km, 1:00 h)`
                        ].map((stage, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-[#F59B0A] font-medium">{i18n.language === 'en' ? 'Day' : 'Tag'} {i+11}:</span>
                            <span className="text-muted-foreground">{stage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Übernachtungen */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Euro className="w-4 h-4 text-[#F59B0A]" />
                      {t("exampleRoute.details.overnight")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {day: i18n.language === 'en' ? 'Day 1' : 'Tag 1', place: 'Knaus Campingpark Hünfeld', price: '35–45 €', highlight: t("exampleRoute.details.overnightHighlights.fulda")},
                        {day: i18n.language === 'en' ? 'Day 2' : 'Tag 2', place: 'Schachtsee Wolmirsleben', price: '30–40 €', highlight: t("exampleRoute.details.overnightHighlights.magdeburg")},
                        {day: i18n.language === 'en' ? 'Day 3' : 'Tag 3', place: 'Campingplatz Friedensteich', price: '25–35 €', highlight: t("exampleRoute.details.overnightHighlights.perleberg")},
                        {day: i18n.language === 'en' ? 'Day 4–11' : 'Tag 4–11', place: 'Ostsee-Camping Zierow', price: '50–65 €', highlight: t("exampleRoute.details.overnightHighlights.wismar")},
                        {day: i18n.language === 'en' ? 'Day 11' : 'Tag 11', place: 'Auf dem Simpel', price: '40–50 €', highlight: t("exampleRoute.details.overnightHighlights.heath")},
                        {day: i18n.language === 'en' ? 'Day 12' : 'Tag 12', place: 'Ferienpark Teichmann', price: '35–50 €', highlight: t("exampleRoute.details.overnightHighlights.edersee")},
                        {day: i18n.language === 'en' ? 'Day 13' : 'Tag 13', place: 'Nibelungen-Camping', price: '25–35 €', highlight: t("exampleRoute.details.overnightHighlights.lorsch")},
                      ].map((stay, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-[#F59B0A] text-sm">{stay.day}</p>
                              <p className="font-semibold text-foreground mt-1">{stay.place}</p>
                              <p className="text-xs text-muted-foreground mt-1">{stay.highlight}</p>
                            </div>
                            <span className="font-bold text-foreground">{stay.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-[#F59B0A]" />
                      {t("exampleRoute.details.highlights")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {region: t("exampleRoute.stages.fulda"), attractions: [t("exampleRoute.stages.details.fulda").split("&")[0].trim(), t("exampleRoute.details.attractions.waterkuppe")]},
                        {region: 'Magdeburg/Perleberg', attractions: [t("exampleRoute.details.attractions.waterJunction"), t("exampleRoute.details.attractions.zooPerleberg")]},
                        {region: t("exampleRoute.stages.wismar").split(" ")[0], attractions: [t("exampleRoute.details.attractions.harbor"), t("exampleRoute.details.attractions.poel"), t("exampleRoute.details.attractions.bothmer")]},
                        {region: t("exampleRoute.details.return").split(":")[0], attractions: [t("exampleRoute.details.attractions.heath"), t("exampleRoute.details.attractions.edersee"), t("exampleRoute.details.attractions.lorsch")]},
                      ].map((area, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                          <h5 className="font-semibold text-[#F59B0A] mb-2">{area.region}</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {area.attractions.map((attr, j) => (
                              <li key={j} className="flex items-start gap-2">
                                <span className="text-[#F59B0A] text-xs mt-1">•</span>
                                <span>{attr}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Praktische Tipps */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4 text-[#F59B0A]" />
                      {t("exampleRoute.details.practicalTips")}
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      {[
                        t("exampleRoute.details.tipsList.clesana"),
                        t("exampleRoute.details.tipsList.dogs"),
                        t("exampleRoute.details.tipsList.nav"),
                        `${t("exampleRoute.summary.budget")}: Ca. 900–1000 €`,
                        t("exampleRoute.details.tipsList.solar")
                      ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#F59B0A] text-xs mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Zusammenfassung */}
                  <div className="bg-[#F59B0A]/10 border border-[#F59B0A]/20 rounded-xl p-4">
                    <h4 className="font-semibold text-[#F59B0A] flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4" />
                      {t("exampleRoute.details.summary")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("exampleRoute.details.summaryDesc")}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
