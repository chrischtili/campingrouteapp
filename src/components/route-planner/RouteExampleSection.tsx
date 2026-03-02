import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Route,
  ShieldAlert,
  Sparkles,
  Wallet,
  Wrench,
  Leaf,
  HeartPulse,
  Navigation,
  Fuel,
  Car,
  Sun,
  Compass,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type StageItem = {
  title: string;
  date: string;
  distance: string;
  duration: string;
  route: string;
  pause: string;
  note?: string;
};

type SimpleItem = {
  label: string;
  value: string;
};

type OvernightItem = {
  title: string;
  name: string;
  price: string;
  details: string[];
};

type HighlightGroup = {
  title: string;
  items: string[];
};

export function RouteExampleSection() {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const keyFacts = t("exampleRoute.keyFacts", { returnObjects: true }) as Array<{
    label: string;
    value: string;
  }>;

  const outwardStages = t("exampleRoute.stages.outward.items", { returnObjects: true }) as StageItem[];
  const returnStages = t("exampleRoute.stages.return.items", { returnObjects: true }) as StageItem[];
  const overnights = t("exampleRoute.overnights.items", { returnObjects: true }) as OvernightItem[];
  const tips = t("exampleRoute.tips.items", { returnObjects: true }) as SimpleItem[];
  const service = t("exampleRoute.service.items", { returnObjects: true }) as SimpleItem[];
  const extras = t("exampleRoute.extras.items", { returnObjects: true }) as SimpleItem[];
  const tech = t("exampleRoute.tech.items", { returnObjects: true }) as SimpleItem[];
  const flexibility = t("exampleRoute.flexibility.items", { returnObjects: true }) as SimpleItem[];
  const alternatives = t("exampleRoute.alternatives.items", { returnObjects: true }) as SimpleItem[];
  const highlightGroups = t("exampleRoute.highlights.groups", { returnObjects: true }) as Record<string, HighlightGroup>;

  const keyFactIcons = [Calendar, Route, Clock, Car, Wallet];

  return (
    <section id="example-route" className="py-32 px-6 bg-secondary relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/30 dark:from-black/30 dark:via-black/50 dark:to-black/70" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                {t("exampleRoute.badge")}
              </span>
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
              {t("exampleRoute.title")}
            </h2>
            <p className="text-lg text-muted-foreground">{t("exampleRoute.subtitle")}</p>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
              {t("exampleRoute.lead")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {keyFacts.map((fact, index) => {
              const Icon = keyFactIcons[index] ?? Calendar;
              return (
                <div
                  key={fact.label}
                  className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4 shadow-sm"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {fact.label}
                    </div>
                    <div className="text-base font-semibold text-foreground">{fact.value}</div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-2xl border border-border bg-primary/5 p-6 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4"
        >
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {t("exampleRoute.ruleNotice.title")}
            </div>
            <ul className="space-y-2 text-foreground/80">
              {(t("exampleRoute.ruleNotice.items", { returnObjects: true }) as string[]).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md text-primary hover:text-primary hover:border-primary/50 transition text-base"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            <span className="font-black uppercase tracking-[0.3em]">
              {showDetails ? t("exampleRoute.details.hide") : t("exampleRoute.details.show")}
            </span>
          </button>
        </div>

        {showDetails && (
          <div className="mt-10 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Navigation className="h-6 w-6 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                {t("exampleRoute.stages.title")}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {t("exampleRoute.stages.outward.title")}
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {t("exampleRoute.stages.outward.range")}
                  </div>
                </div>
                <div className="space-y-5">
                  {outwardStages.map((stage) => (
                    <div key={stage.title} className="rounded-xl border border-border/60 bg-background p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="font-semibold text-foreground">{stage.title}</div>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {stage.date}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-foreground/80">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          {stage.distance}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          {stage.duration}
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-foreground/75">{stage.route}</div>
                      <div className="mt-2 text-sm text-foreground/70">{stage.pause}</div>
                      {stage.note && (
                        <div className="mt-2 text-sm text-primary flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          {stage.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {t("exampleRoute.stages.return.title")}
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {t("exampleRoute.stages.return.range")}
                  </div>
                </div>
                <div className="space-y-5">
                  {returnStages.map((stage) => (
                    <div key={stage.title} className="rounded-xl border border-border/60 bg-background p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="font-semibold text-foreground">{stage.title}</div>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {stage.date}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-foreground/80">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          {stage.distance}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          {stage.duration}
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-foreground/75">{stage.route}</div>
                      <div className="mt-2 text-sm text-foreground/70">{stage.pause}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("exampleRoute.stages.stay.title")}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {t("exampleRoute.stages.stay.range")}
                </div>
              </div>
              <div className="text-sm text-foreground/75 md:text-right">
                {t("exampleRoute.stages.stay.note")}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                {t("exampleRoute.overnights.title")}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">{t("exampleRoute.overnights.note")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {overnights.map((stay) => (
                <div key={stay.name} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {stay.title}
                  </div>
                  <div className="text-lg font-semibold text-foreground">{stay.name}</div>
                  <div className="text-sm text-primary font-semibold">{stay.price}</div>
                  <ul className="space-y-2 text-sm text-foreground/75">
                    {stay.details.map((detail) => (
                      <li key={detail} className="flex gap-2">
                        <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Compass className="h-6 w-6 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                {t("exampleRoute.highlights.title")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {Object.values(highlightGroups).map((group) => (
                <div key={group.title} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {group.title}
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Navigation className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{t("exampleRoute.tips.title")}</h3>
              </div>
              <div className="space-y-3 text-sm text-foreground/80">
                {tips.map((item) => (
                  <div key={item.label}>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Fuel className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{t("exampleRoute.service.title")}</h3>
              </div>
              <div className="space-y-3 text-sm text-foreground/80">
                {service.map((item) => (
                  <div key={item.label}>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Leaf className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{t("exampleRoute.extras.title")}</h3>
              </div>
              <div className="space-y-3 text-sm text-foreground/80">
                {extras.map((item) => (
                  <div key={item.label}>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{t("exampleRoute.tech.title")}</h3>
              </div>
              <div className="space-y-3 text-sm text-foreground/80">
                {tech.map((item) => (
                  <div key={item.label}>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <HeartPulse className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{t("exampleRoute.flexibility.title")}</h3>
              </div>
              <div className="space-y-3 text-sm text-foreground/80">
                {flexibility.map((item) => (
                  <div key={item.label}>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{t("exampleRoute.alternatives.title")}</h3>
              </div>
              <div className="space-y-3 text-sm text-foreground/80">
                {alternatives.map((item) => (
                  <div key={item.label}>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </section>
  );
}
