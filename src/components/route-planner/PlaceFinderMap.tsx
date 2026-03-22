import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapPinned } from "lucide-react";
import { useTranslation } from "react-i18next";

import { MAP_ISSUE_URL, MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from "@/config/maps";
import { cn } from "@/lib/utils";
import type { PlaceCategory, PlaceSearchResult } from "@/types/placeFinder";

interface PlaceFinderMapProps {
  places: PlaceSearchResult[];
  selectedPlace: PlaceSearchResult | null;
  onSelectPlace: (place: PlaceSearchResult) => void;
  standalone?: boolean;
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
  selectedPlace,
  onSelectPlace,
  standalone = false,
}: PlaceFinderMapProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

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
    L.control.zoom({ position: "topright" }).addTo(map);
    map.setView([51.1657, 10.4515], 6);
    invalidateMapSize(map);

    return () => {
      markerLayerRef.current?.clearLayers();
      markerLayerRef.current = null;
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

    const visiblePlaces = places.filter(hasCoordinates);
    if (visiblePlaces.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(
      visiblePlaces.map((place) => [place.lat, place.lon] as [number, number]),
    );

    visiblePlaces.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const marker = L.circleMarker([place.lat, place.lon], {
        color: isSelected ? "#111827" : "#ffffff",
        fillColor: categoryColorMap[place.category],
        fillOpacity: isSelected ? 0.96 : 0.84,
        radius: isSelected ? 10 : 7,
        weight: isSelected ? 3 : 2,
      });

      marker.on("click", () => onSelectPlace(place));
      marker.bindTooltip(place.name, {
        direction: "top",
        offset: [0, -10],
        opacity: 0.92,
      });
      marker.addTo(markerLayer);
    });

    invalidateMapSize(map);

    if (selectedPlace && hasCoordinates(selectedPlace)) {
      const nextZoom = Math.max(map.getZoom(), 13);
      map.flyTo([selectedPlace.lat, selectedPlace.lon], nextZoom, {
        animate: true,
        duration: 0.45,
      });
      return;
    }

    map.fitBounds(bounds, {
      maxZoom: 13,
      padding: [28, 28],
    });
  }, [onSelectPlace, places, selectedPlace]);

  if (places.filter(hasCoordinates).length === 0) {
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
