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
      "border border-gray-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 rounded-3xl",
    heroOrbClass: "bg-primary/10",
    accentClass: "text-primary",
  },
  stopover: {
    icon: BusFront,
    alternateHref: "/campingplatz-finder",
    generatorHref: "/prompt-generator",
    shellClass:
      "border border-gray-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 rounded-3xl",
    heroOrbClass: "bg-primary/10",
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
  const pagePath = variant === "camping" ? "/campingplatz-finder" : "/stellplatz-finder";
  const [plannerDraftFormData, setPlannerDraftFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    const draft = readPlannerDraft();
    if (draft?.formData) {
      setPlannerDraftFormData({ ...initialFormData, ...draft.formData });
    }
  }, []);

  useEffect(() => {
    const pageUrl = new URL(pagePath, window.location.origin).toString();
    const homeUrl = new URL("/", window.location.origin).toString();
    const promptUrl = new URL(config.generatorHref, window.location.origin).toString();
    const alternateUrl = new URL(config.alternateHref, window.location.origin).toString();
    const language = i18n.language || "de";

    const pageScriptId = `place-finder-page-schema-${variant}`;
    const faqScriptId = `place-finder-faq-schema-${variant}`;

    const upsertJsonLdScript = (id: string, payload: unknown) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = id;
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(payload);
    };

    upsertJsonLdScript(pageScriptId, {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: copy.seo.title,
          description: copy.seo.description,
          url: pageUrl,
          inLanguage: language,
          isPartOf: {
            "@type": "WebSite",
            name: "Camping Route",
            url: homeUrl,
          },
          about: [
            {
              "@type": "Thing",
              name: variant === "camping" ? "Campingplatzsuche" : "Stellplatzsuche",
            },
            {
              "@type": "Thing",
              name: "Europa",
            },
          ],
          keywords: copy.seo.keywords,
          relatedLink: [promptUrl, alternateUrl],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Camping Route",
              item: homeUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: copy.navLabel,
              item: pageUrl,
            },
          ],
        },
      ],
    });

    upsertJsonLdScript(faqScriptId, {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: copy.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });

    return () => {
      document.getElementById(pageScriptId)?.remove();
      document.getElementById(faqScriptId)?.remove();
    };
  }, [config.alternateHref, config.generatorHref, copy.faqs, copy.navLabel, copy.seo.description, copy.seo.keywords, copy.seo.title, i18n.language, pagePath, variant]);

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
                    <h1 className="max-w-none text-3xl font-extrabold tracking-tight text-foreground dark:text-white sm:text-4xl lg:max-w-4xl lg:text-5xl">
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
                    <Button asChild className="h-12 rounded-xl bg-primary hover:bg-primary/90 px-6 font-semibold text-white shadow-sm transition-all">
                      <Link to={config.generatorHref}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {copy.plannerCta}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-12 rounded-xl border border-gray-200 bg-white px-6 font-semibold text-gray-800 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-gray-200 shadow-sm transition-all">
                      <Link
                        to={config.alternateHref}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-foreground dark:text-white"
                      >
                        <Compass className="h-4 w-4 shrink-0 text-primary" />
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
          <div className="mx-auto max-w-7xl">
            <PlaceFinderSection
              formData={plannerDraftFormData}
              standalone
              initialCategories={categories}
              hideCategoryFilters
              onTransferToPrompt={handleTransferToPrompt}
            />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
