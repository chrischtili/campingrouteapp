import 'leaflet';

declare module 'leaflet' {
  interface MarkerClusterGroupOptions {
    maxClusterRadius?: number;
    showCoverageOnHover?: boolean;
    spiderfyOnMaxZoom?: boolean;
    disableClusteringAtZoom?: number;
  }
  class MarkerClusterGroup extends FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
  }
  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
