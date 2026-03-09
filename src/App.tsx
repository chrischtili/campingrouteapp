import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Dynamische Importe für nicht-kritische Seiten
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const AdminStats = lazy(() => import("./pages/AdminStats"));

// Dynamische Importe für UI-Komponenten
const Toaster = lazy(() => import("@/components/ui/toaster").then((module) => ({ default: module.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then((module) => ({ default: module.Toaster })));

const queryClient = new QueryClient();

// Polyfill for requestIdleCallback in Safari
if (typeof window !== 'undefined' && !('requestIdleCallback' in window)) {
  window.requestIdleCallback = function(callback, options) {
    const timeout = options?.timeout ?? 1000;
    const start = Date.now();
    return setTimeout(() => {
      callback({ didTimeout: false, timeRemaining: () => Math.max(0, 50 - (Date.now() - start)) });
    }, timeout);
  };
  window.cancelIdleCallback = function(id) {
    clearTimeout(id);
  };
}

const App = () => {
  const { t, i18n } = useTranslation();
  const [showWhatsNew, setShowWhatsNew] = React.useState(false);
  const [releaseVersion, setReleaseVersion] = React.useState<string | null>(null);
  const displayReleaseVersion = `v${(releaseVersion || "0.5.1").replace(/^v/i, "")}`;

  const openWhatsNew = React.useCallback(() => {
    setShowWhatsNew(true);
  }, []);

  React.useEffect(() => {
    const handleOpenWhatsNew = () => openWhatsNew();
    window.addEventListener("open-whats-new", handleOpenWhatsNew);
    return () => window.removeEventListener("open-whats-new", handleOpenWhatsNew);
  }, [openWhatsNew]);

  React.useEffect(() => {
    const key = "cr_chunk_reload";
    const noticeKey = "cr_chunk_reload_notice";
    const shouldReload = (message?: string) => {
      if (!message) return false;
      const msg = message.toLowerCase();
      return msg.includes("dynamically imported module") || msg.includes("importing a module script failed");
    };

    if (sessionStorage.getItem(noticeKey) === "1") {
      sessionStorage.removeItem(noticeKey);
      toast.info(t("app.reloadNotice"));
    }

    const handleError = (event: ErrorEvent) => {
      if (shouldReload(event.message)) {
        const already = sessionStorage.getItem(key);
        if (already !== "1") {
          sessionStorage.setItem(key, "1");
          sessionStorage.setItem(noticeKey, "1");
          window.location.reload();
        }
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const message = typeof reason === "string" ? reason : reason?.message;
      if (shouldReload(message)) {
        const already = sessionStorage.getItem(key);
        if (already !== "1") {
          sessionStorage.setItem(key, "1");
          sessionStorage.setItem(noticeKey, "1");
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [t]);

  React.useEffect(() => {
    let initialBuildId: string | null = null;
    let isMounted = true;
    let updateToastShown = false;
    const seenReleaseKey = "cr_seen_whats_new_version";

    const checkForUpdate = async () => {
      try {
        const response = await fetch(`/version.json?ts=${Date.now()}`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const versionInfo = await response.json();
        const nextBuildId =
          typeof versionInfo?.buildId === "string" ? versionInfo.buildId : null;
        const nextVersion =
          typeof versionInfo?.version === "string" ? versionInfo.version : null;

        if (!nextBuildId || !isMounted) return;

        if (nextVersion) {
          setReleaseVersion(nextVersion);
          const seenVersion = localStorage.getItem(seenReleaseKey);
          if (seenVersion !== nextVersion) {
            setShowWhatsNew(true);
          }
        }

        if (!initialBuildId) {
          initialBuildId = nextBuildId;
          return;
        }

        if (nextBuildId !== initialBuildId && !updateToastShown) {
          updateToastShown = true;
          toast.info(t("app.updateAvailable"), {
            duration: 120000,
            action: {
              label: t("app.reloadNow"),
              onClick: () => window.location.reload(),
            },
          });
        }
      } catch {
        // Ignore polling errors. The next interval will retry.
      }
    };

    checkForUpdate();
    const intervalId = window.setInterval(checkForUpdate, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [t]);

  const handleDismissWhatsNew = () => {
    if (releaseVersion) {
      localStorage.setItem("cr_seen_whats_new_version", releaseVersion);
    }
    setShowWhatsNew(false);
  };

  // Dynamically update SEO tags based on language
  React.useEffect(() => {
    document.title = t("seo.title");
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t("seo.description"));
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", t("seo.keywords"));
    }
    // Update lang attribute on html tag
    document.documentElement.lang = i18n.language;

    const languageMap: Record<string, string> = {
      de: 'de-DE',
      en: 'en-US',
      nl: 'nl-NL',
      fr: 'fr-FR',
      it: 'it-IT'
    };
    const supported = Object.keys(languageMap);

    const url = new URL(window.location.href);
    const baseUrl = `${url.origin}${url.pathname}`;

    const upsertLink = (hreflang: string, href: string) => {
      let link = document.head.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', hreflang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    supported.forEach((lng) => {
      const altUrl = new URL(baseUrl);
      altUrl.searchParams.set('lng', lng);
      upsertLink(lng, altUrl.toString());
    });
    upsertLink('x-default', baseUrl);

    const upsertMeta = (property: string, content: string) => {
      let meta = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const currentLocale = languageMap[i18n.language] || 'en-US';
    upsertMeta('og:locale', currentLocale);
    const alternates = supported.filter((lng) => lng !== i18n.language).map((lng) => languageMap[lng]);
    // Remove old alternate metas
    document.querySelectorAll('meta[property="og:locale:alternate"]').forEach((m) => m.remove());
    alternates.forEach((loc) => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:locale:alternate');
      meta.setAttribute('content', loc);
      document.head.appendChild(meta);
    });
  }, [t, i18n.language]);

  // Use requestIdleCallback for non-critical initialization
  React.useEffect(() => {
    const idleCallbackId = requestIdleCallback(() => {
      // This runs when browser has idle time
      console.log('Non-critical initialization completed');
    }, { timeout: 2000 });
    
    return () => cancelIdleCallback(idleCallbackId);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="theme-preference">
        <TooltipProvider>
          <ScrollToTop />
          <Suspense fallback={null}>
            <Toaster />
            <Sonner />
          </Suspense>
          <Dialog open={showWhatsNew} onOpenChange={(open) => !open && handleDismissWhatsNew()}>
            <DialogContent className="theme-popup-shell max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-xl overflow-y-auto border p-0 sm:w-full">
              <div className="p-6 sm:p-8">
                <DialogHeader className="space-y-3 text-left">
                  <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground dark:text-white">
                    {t("app.whatsNew.title", { version: displayReleaseVersion })}
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed text-muted-foreground dark:text-white/70">
                    {t("app.whatsNew.description")}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-3">
                  {[
                    t("app.whatsNew.items.savedPlans"),
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/85">
                      {item}
                    </div>
                  ))}
                </div>

                <DialogFooter className="mt-6 flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDismissWhatsNew}
                    className="border-border bg-white/70 text-foreground hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    {t("app.whatsNew.dismiss")}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      handleDismissWhatsNew();
                      if (releaseVersion) {
                        window.open(`https://github.com/chrischtili/campingrouteapp/releases/tag/v${releaseVersion}`, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    {t("app.whatsNew.release")}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
          {/* Skip link for accessibility */}
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Zum Hauptinhalt springen
          </a>
          <Suspense fallback={<div className="min-h-screen bg-gray-50"></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              {/* Admin-Seite (nicht verlinkt, nur per direkter URL aufrufbar) */}
              <Route path="/admin-stats" element={<AdminStats />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
