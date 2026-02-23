import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";

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

  // Dynamically update SEO tags based on language
  React.useEffect(() => {
    document.title = t("seo.title");
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t("seo.description"));
    }
    // Update lang attribute on html tag
    document.documentElement.lang = i18n.language;
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
