import { Compass, Zap, Filter, Shield, Github, Gift } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Compass,
    title: "KI-Routenplanung",
    description: "Intelligente Routen, die Staus vermeiden und Wohnmobil-Beschränkungen berücksichtigen.",
  },
  {
    icon: Filter,
    title: "Smarte Filter",
    description: "Filtere nach Budget, Fahrzeuggröße, Interessen und Stellplatz-Ausstattung.",
  },
  {
    icon: Zap,
    title: "Sofort startklar",
    description: "Keine Registrierung nötig. In unter 3 Minuten zur fertigen Route.",
  },
  {
    icon: Shield,
    title: "Datenschutz first",
    description: "Keine Datenspeicherung. Alles bleibt lokal in deinem Browser.",
  },
  {
    icon: Github,
    title: "Open Source",
    description: "Vollständig transparent. Code auf GitHub einsehbar und mitwirkbar.",
  },
  {
    icon: Gift,
    title: "Kostenlos & Werbefrei",
    description: "Keine versteckten Kosten. Keine Werbung. Vollständig kostenlose Nutzung.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4" style={{ backgroundColor: 'rgb(250 244 235)' }} id="features">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-3">
            Warum Camping Route?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'rgb(50, 110, 89)' }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
