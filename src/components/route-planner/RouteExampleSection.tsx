import { MapPin, Clock, Euro, Wine, Landmark, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const stages = [
  {
    from: "Karlsruhe",
    to: "Volkach",
    distance: "180 km",
    duration: "3h",
    highlight: "Fränkisches Weinland",
    icon: Wine,
    details: "Weinproben & historische Altstadt",
    tips: "Achtung: Fronleichnam (Feiertag) - früher starten oder später losfahren",
    overnight: "Campingplatz Ankergrund (35-45€, Hunde willkommen)",
  },
  {
    from: "Volkach",
    to: "Naumburg",
    distance: "210 km",
    duration: "3h",
    highlight: "Thüringer Wald & Saale-Unstrut",
    icon: Landmark,
    details: "UNESCO-Dom Naumburg & Weinwanderungen",
    tips: "A71 oft entspannter als A7 - moderne Autobahn mit Tunneln",
    overnight: "Campingplatz Blütengrund (30-40€, direkt an Saale)",
  },
  {
    from: "Naumburg",
    to: "Perleberg",
    distance: "230 km",
    duration: "3h",
    highlight: "Brandenburg erleben",
    icon: MapPin,
    details: "Historische Altstadt & Wasserstraßenkreuz Magdeburg",
    tips: "B189 gut ausgebaut, aber Achtung Wildwechsel",
    overnight: "Stellplatz Perleberg (15€, zentral)",
  },
];

export function RouteExampleSection() {
  return (
    <section id="example-route" className="py-24 px-4 bg-[rgb(250,244,235)] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">
            KI-Beispielroute
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-3">
            Karlsruhe → Perleberg
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            3 Tage • 620 km • Slow Travel mit Wein & Geschichte
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
                      Etappe {i + 1}
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
            { label: "Gesamtstrecke", value: "620 km" },
            { label: "Reisedauer", value: "3 Tage" },
            { label: "Budget", value: "350–400€" },
            { label: "Stil", value: "Slow Travel" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {item.label}
              </p>
            </div>
          ))}
        </motion.div>
        
        {/* Practical Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-[#F59B0A] dark:text-[#F59B0A]">●</span>
            Praktische Tipps für deine Reise
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-[#F59B0A] dark:text-[#F59B0A] mt-1">●</span>
              <span className="text-muted-foreground">
                Navigation: Nutze Sygic Truck oder Garmin Camper Navi für 5,5t/3,3m Höhe
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F59B0A] dark:text-[#F59B0A] mt-1">●</span>
              <span className="text-muted-foreground">
                Tankstellen: Günstigere Preise in Thüringen (A71)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F59B0A] dark:text-[#F59B0A] mt-1">●</span>
              <span className="text-muted-foreground">
                Geschwindigkeitsbegrenzung: 80-100 km/h für Fahrzeuge über 3,5t
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F59B0A] dark:text-[#F59B0A] mt-1">●</span>
              <span className="text-muted-foreground">
                Apps: Park4Night & Promobil Stellplatz-Radar
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
