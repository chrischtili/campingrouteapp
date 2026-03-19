import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BusFront, Caravan, CheckCircle2, Compass, MapPinned, Search, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Footer } from "@/components/route-planner/Footer";
import { Navbar } from "@/components/route-planner/Navbar";
import { PlaceFinderSection } from "@/components/route-planner/PlaceFinderSection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFinderPageCategories, getFinderPageContent, type FinderPageVariant } from "@/lib/finderPageContent";
import { buildPlaceTransferLabel, readPlannerDraft, storePlaceFinderTransfer, type PlaceTransferTarget } from "@/lib/placeFinderTransfer";
import { initialFormData } from "@/types/routePlanner";
import type { FormData } from "@/types/routePlanner";
import type { PlaceSearchResult } from "@/types/placeFinder";

interface PlaceFinderLandingProps {
  variant: FinderPageVariant;
}

const pageConfig = {
  camping: {
    icon: Caravan,
    alternateHref: "/stellplatz-finder",
    generatorHref: "/prompt-generator",
    shellClass:
      "border-primary/20 bg-[linear-gradient(180deg,rgba(255,251,245,0.95),rgba(248,240,225,0.92))] shadow-[0_28px_90px_rgba(255,128,0,0.12)] dark:bg-[linear-gradient(180deg,rgba(50,56,44,0.92),rgba(31,38,33,0.96))]",
    heroOrbClass: "bg-primary/18",
    accentClass: "text-primary",
  },
  stopover: {
    icon: BusFront,
    alternateHref: "/campingplatz-finder",
    generatorHref: "/prompt-generator",
    shellClass:
      "border-emerald-900/12 bg-[linear-gradient(180deg,rgba(244,250,247,0.95),rgba(231,241,237,0.92))] shadow-[0_28px_90px_rgba(16,72,58,0.12)] dark:bg-[linear-gradient(180deg,rgba(42,63,59,0.92),rgba(25,40,38,0.96))]",
    heroOrbClass: "bg-emerald-500/16",
    accentClass: "text-primary",
  },
} satisfies Record<FinderPageVariant, { icon: typeof Caravan; alternateHref: string; generatorHref: string; shellClass: string; heroOrbClass: string; accentClass: string }>;

export function PlaceFinderLanding({ variant }: PlaceFinderLandingProps) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const copy = getFinderPageContent(i18n.language, variant);
  const config = pageConfig[variant];
  const Icon = config.icon;
  const categories = useMemo(() => getFinderPageCategories(variant), [variant]);
  const [plannerDraftFormData, setPlannerDraftFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    const draft = readPlannerDraft();
    if (draft?.formData) {
      setPlannerDraftFormData({ ...initialFormData, ...draft.formData });
    }
  }, []);

  const handleTransferToPrompt = (
    place: PlaceSearchResult,
    target: PlaceTransferTarget,
    stageIndex?: number,
  ) => {
    storePlaceFinderTransfer({
      placeName: buildPlaceTransferLabel({
        placeName: place.name,
        locality: place.locality,
      }),
      locality: place.locality,
      category: place.category,
      target,
      stageIndex,
    });

    navigate(config.generatorHref);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground dark:text-white">
      <Navbar />

      <main className="overflow-x-hidden overflow-y-hidden pt-28 sm:pt-32">
        <section className="relative px-3 pb-12 sm:px-6 lg:px-8">
          <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-[32rem] blur-3xl", config.heroOrbClass)} />

          <div className="relative mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={cn("overflow-hidden rounded-[2.25rem] border px-5 py-7 sm:rounded-[2.75rem] sm:px-8 sm:py-10 lg:px-12 lg:py-14", config.shellClass)}
            >
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/65 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-primary shadow-sm dark:bg-white/8">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {copy.badge}
                  </div>

                  <div className="space-y-4">
                    <h1 className="max-w-none text-[2.65rem] font-black leading-[0.94] tracking-tight text-foreground dark:text-white sm:text-5xl lg:max-w-4xl lg:text-6xl">
                      {copy.title} <span className={config.accentClass}>{copy.accent}</span>
                    </h1>
                    <p className="max-w-3xl text-base leading-relaxed text-foreground/76 dark:text-white/72 sm:text-lg">
                      {copy.lead}
                    </p>
                    <p className="max-w-2xl text-sm leading-7 text-foreground/62 dark:text-white/62 sm:text-base">
                      {copy.intro}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {copy.chips.map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/72 px-4 py-2 text-xs font-semibold text-foreground/80 shadow-sm dark:border-white/12 dark:bg-white/8 dark:text-white/78"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        {chip}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="planner-primary-button h-12 rounded-2xl px-6 font-semibold">
                      <Link to={config.generatorHref}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {copy.plannerCta}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-12 rounded-2xl border border-border/80 bg-white/70 px-6 font-semibold text-foreground hover:bg-white dark:border-white/12 dark:bg-white/8 dark:text-white dark:hover:bg-white/12">
                      <Link to={config.alternateHref}>
                        <Compass className="mr-2 h-4 w-4 text-primary" />
                        {copy.alternateCta}
                      </Link>
                    </Button>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
                  className="rounded-[2rem] border border-white/60 bg-white/72 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:rounded-[2.25rem] sm:p-6 dark:border-white/10 dark:bg-white/6"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-black uppercase tracking-[0.22em] text-primary">{copy.searchBadge}</div>
                      <div className="text-2xl font-black tracking-tight text-foreground dark:text-white">{copy.quickFactsTitle}</div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {copy.quickFacts.map((fact) => (
                      <div
                        key={fact.title}
                        className="rounded-[1.5rem] border border-border/70 bg-background/78 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                            <MapPinned className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-base font-bold text-foreground dark:text-white">{fact.title}</div>
                            <p className="mt-1 text-sm leading-6 text-foreground/66 dark:text-white/62">{fact.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[0.82fr_1.18fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              className="space-y-5"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                  <Search className="h-3.5 w-3.5" />
                  {copy.searchBadge}
                </div>
                <h2 className="text-3xl font-black tracking-tight text-foreground dark:text-white sm:text-4xl">{copy.searchTitle}</h2>
                <p className="max-w-xl text-base leading-8 text-foreground/66 dark:text-white/64">{copy.searchLead}</p>
              </div>

              <div className="space-y-4 rounded-[2rem] border border-border/70 bg-white/72 p-5 shadow-[0_20px_44px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/6">
                <div className="text-sm font-black uppercase tracking-[0.2em] text-primary">{copy.benefitsTitle}</div>
                <p className="text-sm leading-7 text-foreground/66 dark:text-white/64">{copy.benefitsLead}</p>
                <div className="space-y-3">
                  {copy.benefits.map((benefit) => (
                    <div key={benefit.title} className="rounded-[1.4rem] border border-border/70 bg-background/78 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="text-base font-bold text-foreground dark:text-white">{benefit.title}</div>
                      <p className="mt-2 text-sm leading-6 text-foreground/64 dark:text-white/60">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-4"
            >
              <PlaceFinderSection
                formData={plannerDraftFormData}
                standalone
                initialCategories={categories}
                hideCategoryFilters
                onTransferToPrompt={handleTransferToPrompt}
              />
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-primary shadow-sm dark:border-white/10 dark:bg-white/8">
                <Compass className="h-3.5 w-3.5" />
                {t("navbar.faq")}
              </div>
              <h2 className="text-3xl font-black tracking-tight text-foreground dark:text-white sm:text-4xl">{copy.faqTitle}</h2>
              <p className="max-w-3xl text-base leading-8 text-foreground/64 dark:text-white/62">{copy.faqLead}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {copy.faqs.map((faq) => (
                <motion.article
                  key={faq.question}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  className="rounded-[2rem] border border-border/70 bg-white/76 p-6 shadow-[0_20px_42px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/6"
                >
                  <h3 className="text-xl font-black tracking-tight text-foreground dark:text-white">{faq.question}</h3>
                  <p className="mt-4 text-sm leading-7 text-foreground/64 dark:text-white/60">{faq.answer}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-[2.5rem] border border-primary/20 bg-[linear-gradient(180deg,rgba(255,250,242,0.96),rgba(247,243,236,0.94))] px-6 py-8 shadow-[0_24px_70px_rgba(255,128,0,0.12)] dark:border-primary/25 dark:bg-[linear-gradient(180deg,rgba(54,58,48,0.96),rgba(31,36,33,0.96))] sm:px-8 sm:py-10"
            >
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="space-y-3">
                  <div className="text-sm font-black uppercase tracking-[0.2em] text-primary">{copy.plannerTitle}</div>
                  <h2 className="text-3xl font-black tracking-tight text-foreground dark:text-white sm:text-4xl">{copy.alternateLead}</h2>
                  <p className="max-w-3xl text-base leading-8 text-foreground/68 dark:text-white/64">{copy.plannerLead}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                  <Button asChild className="planner-primary-button h-12 rounded-2xl px-6 font-semibold">
                    <Link to={config.generatorHref}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {copy.plannerCta}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-12 rounded-2xl border border-border/80 bg-white/75 px-6 font-semibold text-foreground hover:bg-white dark:border-white/12 dark:bg-white/8 dark:text-white dark:hover:bg-white/12">
                    <Link to={config.alternateHref}>
                      {copy.alternateCta}
                      <ArrowRight className="ml-2 h-4 w-4 text-primary" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
