import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Route,
  Sparkles,
  Navigation,
  Car,
  Compass,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

type StageItem = {
  title: string;
  date: string;
  distance: string;
  duration: string;
  route: string;
  pause: string;
  note?: string;
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

type RouteExampleSectionProps = {
  onStartPlanning?: () => void;
};

export function RouteExampleSection({ onStartPlanning }: RouteExampleSectionProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const renderTextWithLinks = (text: string) => {
    const urlPattern = /https?:\/\/[^\s]+/g;
    const elements: ReactNode[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(urlPattern)) {
      const rawUrl = match[0];
      const start = match.index ?? 0;
      let cleanUrl = rawUrl;

      while (/[),.;]$/.test(cleanUrl)) {
        cleanUrl = cleanUrl.slice(0, -1);
      }

      if (start > lastIndex) {
        elements.push(text.slice(lastIndex, start));
      }

      elements.push(
        <a
          key={`${cleanUrl}-${start}`}
          href={cleanUrl}
          target="_blank"
          rel="noreferrer"
          className="break-all text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary/80"
        >
          {cleanUrl}
        </a>,
      );

      lastIndex = start + rawUrl.length;
    }

    if (lastIndex === 0) {
      return text;
    }

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements;
  };

  const keyFacts = t("exampleRoute.keyFacts", { returnObjects: true }) as Array<{
    label: string;
    value: string;
  }>;

  const outwardStages = (t("exampleRoute.stages.outward.items", { returnObjects: true }) as StageItem[]).slice(0, 2);
  const returnStages = (t("exampleRoute.stages.return.items", { returnObjects: true }) as StageItem[]).slice(0, 1);
  const overnights = (t("exampleRoute.overnights.items", { returnObjects: true }) as OvernightItem[]).slice(0, 3);
  const highlightGroups = t("exampleRoute.highlights.groups", { returnObjects: true }) as Record<string, HighlightGroup>;
  const compactHighlightGroups = Object.values(highlightGroups).map((group) => ({
    ...group,
    items: group.items.slice(0, 1),
  }));

  const keyFactIcons = [Calendar, MapPin, Route, Car];

  return (
    <section id="example-route" className="pt-20 pb-16 sm:py-32 px-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 content-section-dark content-section-example pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] bg-primary/8 rounded-full blur-[140px] pointer-events-none opacity-70" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/5 via-transparent to-black/10 dark:from-white/[0.03] dark:via-transparent dark:to-black/0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            <span className="text-primary font-semibold text-[10px] tracking-[0.08em]">
              {t("exampleRoute.badge")}
            </span>
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground leading-[0.95]">
            {t("exampleRoute.title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("exampleRoute.subtitle")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="example-card mt-14 mx-auto max-w-5xl rounded-[2rem] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.18)] sm:p-10"
        >
          <p className="text-base text-foreground/78 leading-relaxed mb-8">
            {t("exampleRoute.lead")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-7 mb-8">
            {keyFacts.slice(0, 4).map((fact, index) => {
              const Icon = keyFactIcons[index] ?? Calendar;
              return (
                <div key={fact.label} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-primary/12 text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] tracking-[0.18em] text-muted-foreground">
                      {fact.label}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">{fact.value}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[1.4rem] border border-primary/25 bg-primary/[0.08] p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  {t("exampleRoute.ruleNotice.title")}
                </h3>
                <ul className="space-y-2 text-sm text-foreground/70 leading-relaxed">
                  {(t("exampleRoute.ruleNotice.items", { returnObjects: true }) as string[]).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-primary/80">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button onClick={() => onStartPlanning?.()} className="flex-1 rounded-full h-12 text-base font-semibold text-white">
              {t("hero.planNow")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDetails((prev) => !prev)}
              className="flex-1 rounded-full h-12 text-base font-semibold border-slate-900/10 bg-white/70 text-foreground hover:bg-white dark:border-white/15 dark:bg-black/40 dark:text-white dark:hover:bg-black/60"
            >
              {showDetails ? t("exampleRoute.details.hide") : t("exampleRoute.details.show")}
            </Button>
          </div>
        </motion.div>

        {showDetails && (
          <div className="mt-10 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Navigation className="h-6 w-6 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                {t("exampleRoute.stages.title")}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
                <div>
                  <div className="text-xs tracking-[0.2em] text-muted-foreground">
                    {t("exampleRoute.stages.outward.title")}
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {t("exampleRoute.stages.outward.range")}
                  </div>
                </div>
                <div className="space-y-4">
                  {outwardStages.map((stage) => (
                    <div key={stage.title} className="rounded-xl border border-border/60 bg-background p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="font-semibold text-foreground">{stage.title}</div>
                        <div className="text-xs tracking-[0.2em] text-muted-foreground">
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
                      <div className="mt-3 text-sm text-foreground/75">{renderTextWithLinks(stage.route)}</div>
                      <div className="mt-2 text-sm text-foreground/70">{renderTextWithLinks(stage.pause)}</div>
                      {stage.note && (
                        <div className="mt-2 text-sm text-primary flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{renderTextWithLinks(stage.note)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
                <div>
                  <div className="text-xs tracking-[0.2em] text-muted-foreground">
                    {t("exampleRoute.stages.return.title")}
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {t("exampleRoute.stages.return.range")}
                  </div>
                </div>
                <div className="space-y-4">
                  {returnStages.map((stage) => (
                    <div key={stage.title} className="rounded-xl border border-border/60 bg-background p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="font-semibold text-foreground">{stage.title}</div>
                        <div className="text-xs tracking-[0.2em] text-muted-foreground">
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
                      <div className="mt-3 text-sm text-foreground/75">{renderTextWithLinks(stage.route)}</div>
                      <div className="mt-2 text-sm text-foreground/70">{renderTextWithLinks(stage.pause)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.2em] text-muted-foreground">
                  {t("exampleRoute.stages.stay.title")}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {t("exampleRoute.stages.stay.range")}
                </div>
              </div>
              <div className="text-sm text-foreground/75 md:text-right">
                {renderTextWithLinks(t("exampleRoute.stages.stay.note"))}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {overnights.map((stay) => (
                <div key={stay.name} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <div className="text-xs tracking-[0.2em] text-muted-foreground">
                    {stay.title}
                  </div>
                  <div className="text-lg font-semibold text-foreground">{stay.name}</div>
                  <div className="text-sm text-primary font-semibold">{stay.price}</div>
                  <ul className="space-y-2 text-sm text-foreground/75">
                    {stay.details.map((detail, index) => (
                      <li key={`${stay.name}-${index}`} className="flex gap-2">
                        <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                        <span>{renderTextWithLinks(detail)}</span>
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
              {compactHighlightGroups.map((group) => (
                <div key={group.title} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <div className="text-xs tracking-[0.2em] text-muted-foreground">
                    {group.title}
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    {group.items.map((item, index) => (
                      <li key={`${group.title}-${index}`} className="flex gap-2">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                        <span>{renderTextWithLinks(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <Button onClick={() => onStartPlanning?.()} className="rounded-full px-10 h-12 text-base font-semibold text-white">
              {t("hero.planNow")}
            </Button>
          </div>
          </div>
        )}
      </div>
    </section>
  );
}
