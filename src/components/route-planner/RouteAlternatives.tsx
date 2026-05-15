import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Navigation, Compass, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { RouteOption, RouteStage } from "@/types/routePlanner";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ConceptMap } from "./ConceptMap";

interface RouteAlternativesProps {
  options: RouteOption[];
  onSelect: (option: RouteOption) => void;
  isLoading?: boolean;
  aiMarkers?: any[];
  startPoint?: string;
  destination?: string;
  stages?: RouteStage[];
}

export function RouteAlternatives({ 
  options, 
  onSelect, 
  isLoading, 
  aiMarkers = [],
  startPoint,
  destination,
  stages = []
}: RouteAlternativesProps) {
  const { t } = useTranslation();

  // Filter markers for each specific option based on highlights and order them
  const getMarkersForOption = (option: RouteOption) => {
    const orderedMarkers: any[] = [];
    const usedCoords = new Set<string>();
    
    // Hilfsfunktion für robustes Matching
    const findMarker = (query: string) => {
      if (!query) return null;
      const normalized = query.toLowerCase().trim();
      
      // 1. Exakter Match auf originalQuery
      let match = aiMarkers.find(m => (m.originalQuery || "").toLowerCase().trim() === normalized);
      if (match) return match;

      // 2. Suche in Name oder Label (Teil-Übereinstimmung)
      match = aiMarkers.find(m => {
        const name = (m.name || "").toLowerCase();
        const label = (m.label || "").toLowerCase();
        return name.includes(normalized) || 
               label.includes(normalized) ||
               normalized.includes(name) ||
               (name.length > 3 && normalized.includes(name));
      });
      if (match) return match;

      // 3. Fallback: Irgendein Marker, der die Query im originalQuery hat
      return aiMarkers.find(m => (m.originalQuery || "").toLowerCase().includes(normalized));
    };

    const addMarkerIfFound = (query?: string) => {
      if (!query) return;
      const marker = findMarker(query);
      if (marker && marker.lat && marker.lon) {
        const lat = parseFloat(String(marker.lat));
        const lon = parseFloat(String(marker.lon));
        if (!isNaN(lat) && !isNaN(lon)) {
          const coordKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
          if (!usedCoords.has(coordKey)) {
            orderedMarkers.push({ ...marker, lat, lon });
            usedCoords.add(coordKey);
          }
        }
      }
    };

    // 1. Startpunkt
    addMarkerIfFound(startPoint);
    
    // 2. Bestehende Zwischenziele vom Nutzer
    stages.forEach(s => addMarkerIfFound(s.destination));
    
    // 3. Highlights von der KI (mit Reinigung)
    option.highlights.forEach(h => {
      const cleanH = h.replace(/^[-•*]|\d+\.\s*/g, "").trim();
      addMarkerIfFound(cleanH);
    });
    
    // 4. Zielpunkt
    addMarkerIfFound(destination);
    
    // Fallback: Wenn keine Marker gefunden wurden, alle verfügbaren Marker verwenden
    if (orderedMarkers.length === 0 && aiMarkers.length > 0) {
      return aiMarkers.slice(0, 5);
    }
    
    return orderedMarkers;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight text-foreground dark:text-white">
              {t("planner.alternatives.loadingTitle")}
            </h3>
            <p className="text-sm text-foreground/60 dark:text-white/60">
              {t("planner.alternatives.loadingLead")}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-[0.12em] uppercase mb-2">
          <Compass className="w-3 h-3" /> {t("planner.alternatives.badge")}
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground dark:text-white">
          {t("planner.alternatives.title")}
        </h2>
        <p className="text-sm text-foreground/60 dark:text-white/60 max-w-lg mx-auto leading-relaxed">
          {t("planner.alternatives.lead")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative flex flex-col h-full rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden transition-all hover:border-primary/40"
            >
              {/* Map / Image Area */}
              <div className="relative h-48 w-full border-b border-slate-100 dark:border-white/10">
                <ConceptMap markers={getMarkersForOption(option)} />
                <div className="absolute top-4 left-4 z-10 w-10 h-10 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform duration-500 border border-white/20 dark:border-white/10">
                  {index === 0 ? <Navigation className="w-5 h-5" /> : index === 1 ? <Map className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
                </div>
                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[9px] font-bold text-foreground/70 dark:text-white/70 tracking-wider uppercase shadow-sm border border-white/20 dark:border-white/10">
                  {option.estimatedDistance}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 flex-grow">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-primary tracking-[0.14em] uppercase">
                    {option.theme}
                  </span>
                  <h3 className="text-xl font-black tracking-tight text-foreground dark:text-white leading-tight">
                    {option.title}
                  </h3>
                </div>

                <p className="text-sm text-foreground/70 dark:text-white/70 leading-relaxed min-h-[3rem]">
                  {option.shortDescription}
                </p>

                {/* Highlights */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10">
                  <span className="text-[10px] font-bold text-foreground/40 dark:text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                    <Info className="w-3 h-3" /> {t("planner.alternatives.highlightsTitle")}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {option.highlights.map((h, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[11px] font-medium text-foreground/80 dark:text-white/80">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 pt-0 mt-auto">
                <Button 
                  onClick={() => onSelect(option)}
                  className="w-full rounded-2xl h-12 font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/20"
                  variant="outline"
                >
                  {t("planner.nav.chooseRoute")}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              {/* Subtle background glow on hover */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
