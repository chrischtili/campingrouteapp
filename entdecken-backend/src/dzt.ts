import https from "https";

const DZT_MCP_URL = "https://proxy.opendatagermany.io/api/its/mcp";
const DZT_API_KEY = process.env.DZT_MCP_KEY || "647e87679f71e0ec10f66056ad0721ef";

export interface DztMcpResponse {
  jsonrpc: string;
  id: string | number;
  result?: {
    content?: Array<{ type: string; text: string }>;
    structuredContent?: {
      "@graph"?: any[];
      "@context"?: any;
    };
    isError?: boolean;
  };
  error?: {
    code: number;
    message: string;
  };
}

export function callDztMcp(toolName: string, args: Record<string, any>): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      jsonrpc: "2.0",
      id: "dzt-" + Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    });

    const options = {
      hostname: "proxy.opendatagermany.io",
      path: "/api/its/mcp",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": DZT_API_KEY,
        "Content-Length": Buffer.byteLength(payload)
      },
      timeout: 20000
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          const parsed: DztMcpResponse = JSON.parse(body);
          if (parsed.error) {
            return reject(new Error(parsed.error.message));
          }
          
          let graph: any[] = [];
          if (parsed.result?.structuredContent?.["@graph"]) {
            graph = parsed.result.structuredContent["@graph"];
          } else if (parsed.result?.content?.[0]?.text) {
            try {
              const inner = JSON.parse(parsed.result.content[0].text);
              graph = inner["@graph"] || [];
            } catch {
              graph = [];
            }
          }
          resolve(graph);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("DZT Knowledge Graph request timed out"));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Search official hiking and biking trails in Germany via DZT Knowledge Graph.
 */
export async function searchDztTrails(params: {
  region?: string;
  locality?: string;
  keywords?: string;
  difficulty?: string;
  max_length_km?: number;
}): Promise<any[]> {
  try {
    const args: Record<string, any> = {};
    if (params.region) args.region = params.region;
    if (params.locality) args.locality = params.locality;
    if (params.keywords) args.keywords = params.keywords;
    if (params.difficulty) args.difficulty = params.difficulty;
    if (params.max_length_km) args.max_length_km = params.max_length_km;

    return await callDztMcp("get_trails_by_criteria", args);
  } catch (err: any) {
    console.error("[DZT] Error fetching trails:", err.message);
    return [];
  }
}

/**
 * Search official cultural, food, and sports events in Germany via DZT Knowledge Graph.
 */
export async function searchDztEvents(params: {
  region?: string;
  locality?: string;
  keywords?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  type?: string;
}): Promise<any[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const args: Record<string, any> = {
      keywords: params.keywords || "Wein,Festival,Kultur,Markt",
      dateRangeStart: params.dateRangeStart || today,
    };
    if (params.region && params.region !== "Alle Bundesländer" && params.region !== "all") {
      args.region = params.region;
    }
    if (params.locality) args.locality = params.locality;
    if (params.dateRangeEnd) args.dateRangeEnd = params.dateRangeEnd;
    if (params.type) args.type = params.type;

    return await callDztMcp("get_events_by_criteria", args);
  } catch (err: any) {
    console.error("[DZT] Error fetching events:", err.message);
    return [];
  }
}

/**
 * Search official POIs and tourist sights in Germany via DZT Knowledge Graph.
 */
export async function searchDztPois(params: {
  region?: string;
  locality?: string;
  keywords?: string;
  type?: string;
  near_point?: string;
}): Promise<any[]> {
  try {
    const args: Record<string, any> = {};
    if (params.region) args.region = params.region;
    if (params.locality) args.locality = params.locality;
    if (params.keywords) args.keywords = params.keywords;
    if (params.type) args.type = params.type;
    if (params.near_point) args.near_point = params.near_point;

    return await callDztMcp("get_pois_by_criteria", args);
  } catch (err: any) {
    console.error("[DZT] Error fetching POIs:", err.message);
    return [];
  }
}

/**
 * Fetch detailed entity data from DZT Open Data, including coordinates and route polyline (schema:line).
 */
export async function getDztEntityDetails(uri: string): Promise<{
  entity: any;
  polyline: [number, number][];
  startCoords?: [number, number];
  endCoords?: [number, number];
  startName?: string;
  endName?: string;
} | null> {
  try {
    const graph = await callDztMcp("get_entity_details", { uri, language: "de" });
    if (!graph || graph.length === 0) return null;
    const entity = graph[0];

    function fixLatLng(v1: number, v2: number): [number, number] {
      if (isNaN(v1) || isNaN(v2)) return [0, 0];
      // In Europe/Germany: Lat is 40..60, Lon is -15..35
      if (v1 >= 35 && v1 <= 70 && v2 >= -15 && v2 <= 40) return [v1, v2];
      if (v2 >= 35 && v2 <= 70 && v1 >= -15 && v1 <= 40) return [v2, v1];
      return [v1, v2];
    }

    let polyline: [number, number][] = [];
    const geo = entity["https://schema.org/geo"] || entity["schema:geo"] || entity.geo;
    const lineStr = geo?.["https://schema.org/line"] || geo?.["schema:line"] || geo?.line || (typeof geo === "string" ? geo : null);
    if (lineStr && typeof lineStr === "string") {
      const pairs = lineStr.trim().split(/\s+/);
      polyline = pairs.map(p => {
        const [c1, c2] = p.split(",").map(Number);
        return fixLatLng(c1, c2);
      }).filter(([lat, lon]) => lat !== 0 && lon !== 0);
    }

    let startCoords: [number, number] | undefined;
    let endCoords: [number, number] | undefined;

    const startLoc = entity["https://odta.io/voc/startLocation"] || entity["odta:startLocation"] || entity.startLocation;
    const startGeo = startLoc?.["https://schema.org/geo"] || startLoc?.["schema:geo"] || startLoc?.geo;
    if (startGeo) {
      const lat = Number(startGeo["https://schema.org/latitude"]?.["@value"] || startGeo["schema:latitude"] || startGeo.latitude);
      const lon = Number(startGeo["https://schema.org/longitude"]?.["@value"] || startGeo["schema:longitude"] || startGeo.longitude);
      if (!isNaN(lat) && !isNaN(lon)) startCoords = fixLatLng(lat, lon);
    }

    const endLoc = entity["https://odta.io/voc/endLocation"] || entity["odta:endLocation"] || entity.endLocation;
    const endGeo = endLoc?.["https://schema.org/geo"] || endLoc?.["schema:geo"] || endLoc?.geo;
    if (endGeo) {
      const lat = Number(endGeo["https://schema.org/latitude"]?.["@value"] || endGeo["schema:latitude"] || endGeo.latitude);
      const lon = Number(endGeo["https://schema.org/longitude"]?.["@value"] || endGeo["schema:longitude"] || endGeo.longitude);
      if (!isNaN(lat) && !isNaN(lon)) endCoords = fixLatLng(lat, lon);
    }

    return {
      entity,
      polyline,
      startCoords,
      endCoords,
      startName: typeof startLoc?.["https://schema.org/name"] === "object" ? startLoc?.["https://schema.org/name"]?.["@value"] : (startLoc?.["https://schema.org/name"] || startLoc?.["schema:name"] || startLoc?.name),
      endName: typeof endLoc?.["https://schema.org/name"] === "object" ? endLoc?.["https://schema.org/name"]?.["@value"] : (endLoc?.["https://schema.org/name"] || endLoc?.["schema:name"] || endLoc?.name)
    };
  } catch (err: any) {
    console.error("[DZT] Error fetching entity details:", err.message);
    return null;
  }
}

