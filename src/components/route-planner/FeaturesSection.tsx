import { Compass, Zap, Filter, Shield, Github, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Compass,
      title: t("features.promptGen.title"),
      description: t("features.promptGen.description"),
    },
    {
      icon: Filter,
      title: t("features.smartFilters.title"),
      description: t("features.smartFilters.description"),
    },
    {
      icon: Zap,
      title: t("features.readyInstantly.title"),
      description: t("features.readyInstantly.description"),
    },
    {
      icon: Shield,
      title: t("features.privacyFirst.title"),
      description: t("features.privacyFirst.description"),
    },
    {
      icon: Github,
      title: t("features.openSource.title"),
      description: t("features.openSource.description"),
    },
    {
      icon: Gift,
      title: t("features.freeAdFree.title"),
      description: t("features.freeAdFree.description"),
    },
  ];

  return (
    <section className="py-24 px-4 bg-[rgb(230,225,215)] dark:bg-gray-700" id="features">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">
            {t("features.badge")}
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mt-3">
            {t("features.title")}
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
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 bg-[rgb(50,110,89)] dark:bg-[rgb(80,140,119)]">
                  <Icon className="w-6 h-6 text-white dark:text-foreground" />
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
