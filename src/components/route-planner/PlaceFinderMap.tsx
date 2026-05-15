import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapPinned } from "lucide-react";
import { useTranslation } from "react-i18next";

import { MAP_ISSUE_URL, MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from "@/config/maps";
import { cn } from "@/lib/utils";
import type { PlaceCategory, PlaceSearchResult } from "@/types/placeFinder";

interface PlaceFinderMapProps {
  places: PlaceSearchResult[];
  highlightedPlace: PlaceSearchResult | null;
  onSelectPlace: (place: PlaceSearchResult) => void;
  standalone?: boolean;
  aiMarkers?: any[];
}

const categoryColorMap: Record<PlaceCategory, string> = {
  camp_site: "#f97316",
  caravan_site: "#0f766e",
};

function hasCoordinates(place: PlaceSearchResult) {
  return Number.isFinite(place.lat) && Number.isFinite(place.lon);
}

function invalidateMapSize(map: L.Map) {
  window.requestAnimationFrame(() => {
    map.invalidateSize(false);
  });
}

export function PlaceFinderMap({
  places,
  highlightedPlace,
  onSelectPlace,
  standalone = false,
  aiMarkers = [],
}: PlaceFinderMapProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const aiMarkerLayerRef = useRef<L.LayerGroup | null>(null);
  const markersByIdRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const aiMarkersByIdRef = useRef<Map<string, L.Marker>>(new Map());
  const lastBoundsKeyRef = useRef<string>("");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      attributionControl: true,
      scrollWheelZoom: false,
      zoomControl: false,
    });

    mapRef.current = map;
    tileLayerRef.current = L.tileLayer(MAP_TILE_URL, {
      attribution: MAP_TILE_ATTRIBUTION,
      crossOrigin: true,
      maxZoom: 19,
    }).addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    aiMarkerLayerRef.current = L.layerGroup().addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    map.setView([51.1657, 10.4515], 6);
    invalidateMapSize(map);

    return () => {
      markerLayerRef.current?.clearLayers();
      markerLayerRef.current = null;
      aiMarkerLayerRef.current?.clearLayers();
      aiMarkerLayerRef.current = null;
      markersByIdRef.current.clear();
      aiMarkersByIdRef.current.clear();
      tileLayerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;

    if (!map || !markerLayer) {
      return;
    }

    markerLayer.clearLayers();
    markersByIdRef.current.clear();

    const visiblePlaces = places.filter(hasCoordinates);
    if (visiblePlaces.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(
      visiblePlaces.map((place) => [place.lat, place.lon] as [number, number]),
    );
    const boundsKey = visiblePlaces
      .map((place) => `${place.id}:${place.lat.toFixed(5)}:${place.lon.toFixed(5)}`)
      .join("|");

    visiblePlaces.forEach((place) => {
      const isHighlighted = highlightedPlace?.id === place.id;
      const marker = L.circleMarker([place.lat, place.lon], {
        color: isHighlighted ? "#111827" : "#ffffff",
        fillColor: categoryColorMap[place.category],
        fillOpacity: isHighlighted ? 0.96 : 0.84,
        radius: isHighlighted ? 10 : 7,
        weight: isHighlighted ? 3 : 2,
      });

      marker.on("click", () => onSelectPlace(place));
      marker.bindTooltip(place.name, {
        direction: "top",
        offset: [0, -10],
        opacity: 0.92,
      });
      marker.addTo(markerLayer);
      markersByIdRef.current.set(place.id, marker);
    });

    invalidateMapSize(map);

    // Keep the selected marker highlighted, but do not move the map when a user
    // opens place details from the list. Repositioning is only useful when the
    // actual result set changes.
    if (lastBoundsKeyRef.current === boundsKey) {
      return;
    }

    lastBoundsKeyRef.current = boundsKey;

    map.fitBounds(bounds, {
      maxZoom: 13,
      padding: [28, 28],
    });
  }, [onSelectPlace, places]);

  useEffect(() => {
    const markersById = markersByIdRef.current;

    markersById.forEach((marker, placeId) => {
      const isHighlighted = highlightedPlace?.id === placeId;

      marker.setStyle({
        color: isHighlighted ? "#111827" : "#ffffff",
        fillOpacity: isHighlighted ? 0.96 : 0.84,
        radius: isHighlighted ? 10 : 7,
        weight: isHighlighted ? 3 : 2,
      });
    });
  }, [highlightedPlace]);

  useEffect(() => {
    const map = mapRef.current;
    const aiMarkerLayer = aiMarkerLayerRef.current;
    if (!map || !aiMarkerLayer) return;

    aiMarkerLayer.clearLayers();
    aiMarkersByIdRef.current.clear();

    if (aiMarkers.length === 0) return;

    const aiIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#EAB308] shadow-lg ring-2 ring-white text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </div>`,
      className: "ai-suggested-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const latLngs: L.LatLng[] = [];

    aiMarkers.forEach((marker) => {
      if (!marker.lat || !marker.lon) return;

      const latLng = L.latLng(marker.lat, marker.lon);
      latLngs.push(latLng);

      const leafletMarker = L.marker(latLng, {
        icon: aiIcon,
        zIndexOffset: 1000,
      })
        .addTo(aiMarkerLayer)
        .bindPopup(`
          <div class="p-1 font-sans">
            <div class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">KI-Highlight</div>
            <div class="font-bold text-sm text-slate-900">${marker.label || marker.name}</div>
          </div>
        `);

      aiMarkersByIdRef.current.set(marker.id || marker.label, leafletMarker);
    });

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [aiMarkers]);

  if (places.filter(hasCoordinates).length === 0 && aiMarkers.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "place-finder-map overflow-hidden rounded-[1.75rem] border shadow-[0_18px_46px_rgba(15,23,42,0.10)]",
        standalone
          ? "border-border/70 bg-background/88 dark:border-white/10 dark:bg-white/[0.04]"
          : "border-white/10 bg-white/[0.04]",
      )}
    >
      <div className="flex items-start gap-3 border-b border-border/70 px-4 py-4 dark:border-white/10 sm:px-5">
        <div className="rounded-2xl bg-primary/12 p-2.5 text-primary">
          <MapPinned className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className={cn("text-base font-black tracking-tight", standalone ? "text-foreground dark:text-white" : "text-white")}>
            {t("planner.placeFinder.map.title")}
          </h3>
          <p
            className={cn(
              "mt-1 text-sm leading-6",
              standalone ? "text-foreground/62 dark:text-white/60" : "text-white/62",
            )}
          >
            {t("planner.placeFinder.map.help")}
          </p>
        </div>
      </div>

      <div ref={containerRef} className="h-[320px] w-full sm:h-[380px] lg:h-[420px]" />

      <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          <span className={cn("inline-flex items-center gap-2", standalone ? "text-foreground/70 dark:text-white/70" : "text-white/70")}>
            <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
            {t("planner.placeFinder.categories.camp_site")}
          </span>
          <span className={cn("inline-flex items-center gap-2", standalone ? "text-foreground/70 dark:text-white/70" : "text-white/70")}>
            <span className="h-2.5 w-2.5 rounded-full bg-[#0f766e]" />
            {t("planner.placeFinder.categories.caravan_site")}
          </span>
        </div>
        <a
          href={MAP_ISSUE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-primary hover:text-primary/80"
        >
          {t("planner.placeFinder.map.issueLink")}
        </a>
      </div>
    </section>
  );
}
