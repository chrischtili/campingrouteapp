const geoapifyTileKey = String(import.meta.env.VITE_GEOAPIFY_MAPS_API_KEY || "").trim();
const tileTemplateOverride = String(import.meta.env.VITE_MAP_TILE_URL_TEMPLATE || "").trim();
const tileAttributionOverride = String(import.meta.env.VITE_MAP_TILE_ATTRIBUTION || "").trim();

const geoapifyTileUrl = geoapifyTileKey
  ? `https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=${geoapifyTileKey}`
  : "";

const geoapifyAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, ' +
  '<a href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Geoapify</a>';

const openStreetMapAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

export const MAP_TILE_URL = tileTemplateOverride || geoapifyTileUrl || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const MAP_TILE_ATTRIBUTION =
  tileAttributionOverride || (geoapifyTileUrl ? geoapifyAttribution : openStreetMapAttribution);
export const MAP_ISSUE_URL = "https://www.openstreetmap.org/fixthemap";
