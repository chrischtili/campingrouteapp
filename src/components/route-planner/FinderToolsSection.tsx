import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BusFront, Caravan, ArrowRight, Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFinderNavLabels } from "@/lib/finderPageContent";

export function FinderToolsSection() {
  const { t, i18n } = useTranslation();
  const finderLabels = getFinderNavLabels(i18n.language);

  const tools = [
    {
      id: "camping",
      title: finderLabels.camping,
      description: t("navbar.placeFinderDescriptions.camping"),
      icon: Caravan,
      href: "/campingplatz-finder",
      accent: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      id: "stopover",
      title: finderLabels.stopover,
      description: t("navbar.placeFinderDescriptions.stopover"),
      icon: BusFront,
      href: "/stellplatz-finder",
      accent: "text-primary",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <section className="py-20 sm:py-32 px-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 sm:mb-24">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15 bg-primary/[0.06]">
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary font-bold text-[10px] tracking-[0.08em] uppercase">
                {t("navbar.placeFinder")}
              </span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[0.95]">
              {t("hero.finders.title")}
            </h2>
            <p className="text-lg text-foreground/60 leading-relaxed">
              {t("hero.finders.description")}
            </p>
          </div>
          <div className="hidden md:block">
            <Button asChild variant="ghost" className="text-primary font-bold hover:bg-primary/5">
              <Link to="/prompt-generator" className="flex items-center gap-2">
                {t("navbar.planNow")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`group relative overflow-hidden rounded-[2.5rem] border ${tool.border} bg-white/5 p-8 sm:p-12 transition-all hover:shadow-[0_24px_64px_rgba(0,0,0,0.12)] dark:bg-white/[0.03]`}
            >
              <div className="relative z-10 space-y-8">
                <div className={`w-16 h-16 rounded-2xl ${tool.bg} flex items-center justify-center ${tool.accent} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <tool.icon className="w-8 h-8" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground dark:text-white">
                    {tool.title}
                  </h3>
                  <p className="text-base sm:text-lg leading-relaxed text-foreground/60 dark:text-white/60">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-4">
                  <Button asChild className="h-12 rounded-2xl px-6 font-bold shadow-lg shadow-primary/20">
                    <Link to={tool.href}>
                      <Search className="mr-2 h-4 w-4" />
                      {tool.id === "camping" ? t("hero.finders.campingCta") : t("hero.finders.stopoverCta")}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Decorative background icon */}
              <tool.icon className="absolute -bottom-8 -right-8 w-48 h-48 text-primary/5 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
