import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_TILE_URL, MAP_TILE_ATTRIBUTION } from "@/config/maps";
import { cn } from "@/lib/utils";

interface RoutePreviewMapProps {
  waypoints: Array<{ lat: number; lon: number; name?: string }>;
  trackPoints: Array<[number, number]>;
  className?: string;
}

export function RoutePreviewMap({ waypoints, trackPoints, className }: RoutePreviewMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      attributionControl: true,
      scrollWheelZoom: false,
    });

    mapRef.current = map;

    L.tileLayer(MAP_TILE_URL, {
      attribution: MAP_TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const latLngs: L.LatLng[] = [];
    
    // Draw Track/Line
    if (trackPoints.length > 0) {
      const polyline = L.polyline(trackPoints, {
        color: "#f97316",
        weight: 4,
        opacity: 0.8,
        lineJoin: "round"
      }).addTo(layerGroup);
      
      trackPoints.forEach(tp => latLngs.push(L.latLng(tp[0], tp[1])));
    }

    // Draw Waypoints
    const waypointIcon = L.divIcon({
      html: `<div class="w-3 h-3 rounded-full bg-white border-2 border-primary shadow-sm"></div>`,
      className: "route-wp-marker",
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    const startEndIcon = L.divIcon({
      html: `<div class="w-5 h-5 rounded-full bg-primary border-2 border-white shadow-md flex items-center justify-center">
               <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
             </div>`,
      className: "route-start-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    waypoints.forEach((wp, idx) => {
      const latLng = L.latLng(wp.lat, wp.lon);
      latLngs.push(latLng);
      
      const isStartOrEnd = idx === 0 || idx === waypoints.length - 1;
      
      L.marker(latLng, { 
        icon: isStartOrEnd ? startEndIcon : waypointIcon,
        zIndexOffset: isStartOrEnd ? 100 : 0
      })
      .addTo(layerGroup)
      .bindTooltip(wp.name || "", { direction: "top", offset: [0, -5] });
    });

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [waypoints, trackPoints]);

  return (
    <div 
      ref={containerRef} 
      className={cn("h-[300px] w-full bg-slate-100 dark:bg-slate-900 overflow-hidden", className)} 
    />
  );
}
