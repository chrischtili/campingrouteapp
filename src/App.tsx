import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";

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
          <Toaster />
          <Sonner />
          {/* Skip link for accessibility */}
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Zum Hauptinhalt springen
          </a>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              {/* Admin-Seite (nicht verlinkt, nur per direkter URL aufrufbar) */}
              <Route path="/admin-stats" element={<AdminStats />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
