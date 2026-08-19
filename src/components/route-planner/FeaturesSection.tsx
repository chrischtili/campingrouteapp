import { Compass, Zap, Filter, Shield, Github, Gift, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    { icon: Compass, title: t("features.promptGen.title"), description: t("features.promptGen.description") },
    { icon: Filter, title: t("features.smartFilters.title"), description: t("features.smartFilters.description") },
    { icon: Zap, title: t("features.readyInstantly.title"), description: t("features.readyInstantly.description") },
    { icon: Shield, title: t("features.privacyFirst.title"), description: t("features.privacyFirst.description") },
    { icon: Github, title: t("features.openSource.title"), description: t("features.openSource.description"), link: "https://github.com/chrischtili/campingrouteapp" },
    { icon: Gift, title: t("features.freeAdFree.title"), description: t("features.freeAdFree.description") },
  ];

  return (
    <section className="pt-8 sm:pt-12 pb-16 sm:pb-24 px-6 bg-background relative" id="features">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[11px] uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            {t("features.badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {t("features.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-3xl border border-gray-200/80 bg-white p-7 sm:p-8 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                  <f.icon className="w-6 h-6" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground dark:text-white tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-sm text-foreground/60 dark:text-white/60 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>

              {f.link && (
                <a 
                  href={f.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-sm hover:underline mt-5"
                >
                  <Github className="w-4 h-4" />
                  <span>Open Source</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
