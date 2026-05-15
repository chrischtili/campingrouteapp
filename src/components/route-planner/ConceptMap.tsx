import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

interface ConceptMapProps {
  markers: any[];
  className?: string;
}

export function ConceptMap({ markers, className }: ConceptMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Leaflet Default Icon Fix (for Vite/Webpack)
    // @ts-expect-error Leaflet icons missing from type definitions sometimes
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    const map = L.map(containerRef.current, {
      attributionControl: false,
      scrollWheelZoom: false,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;

    markerLayer.clearLayers();
    if (markers.length === 0) return;

    const latLngs: L.LatLng[] = [];

    // Custom Icon für Highlights (Amber/Orange passend zum Design)
    const customIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-5 h-5 rounded-full bg-primary border-2 border-white shadow-md">
               <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
             </div>`,
      className: "custom-concept-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    markers.forEach((m, idx) => {
      if (!m.lat || !m.lon) return;
      const latLng = L.latLng(m.lat, m.lon);
      latLngs.push(latLng);
      
      const marker = L.marker(latLng, { icon: customIcon }).addTo(markerLayer);
      
      // Tooltip hinzufügen (Name des Ortes)
      if (m.name || m.label || m.originalQuery) {
        marker.bindTooltip(m.name || m.label || m.originalQuery, {
          permanent: false,
          direction: "top",
          className: "concept-marker-tooltip"
        });
      }
    });

    if (latLngs.length > 0) {
      // Verbindungslinie zeichnen
      if (latLngs.length > 1) {
        // Schatten/Glow für die Linie
        L.polyline(latLngs, {
          color: "#f97316",
          weight: 6,
          opacity: 0.2,
          lineJoin: "round"
        }).addTo(markerLayer);

        // Hauptlinie
        L.polyline(latLngs, {
          color: "#f97316", // primary color
          weight: 3,
          opacity: 0.8,
          lineJoin: "round"
        }).addTo(markerLayer);
      }

      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [25, 25], maxZoom: 10 });
    }
  }, [markers]);

  return (
    <div 
      ref={containerRef} 
      className={cn("h-full w-full bg-slate-100 dark:bg-slate-900 grayscale-[0.5] opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700", className)} 
    />
  );
}
