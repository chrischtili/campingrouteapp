import { useSyncExternalStore } from "react";
import type { BreadcrumbItem } from "@/components/AppBreadcrumbs";

// Kleiner externer Store: Die Entdecken-Seite meldet ihren aktuellen
// Navigationspfad, damit AppBreadcrumbs (in campingroute_app) ihn anzeigen kann.
let items: BreadcrumbItem[] = [{ label: "Entdecken" }];
const listeners = new Set<() => void>();

export function setDiscoverBreadcrumbs(next: BreadcrumbItem[]) {
  items = next.length > 0 ? next : [{ label: "Entdecken" }];
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return items;
}

export function useDiscoverBreadcrumbs(): BreadcrumbItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
