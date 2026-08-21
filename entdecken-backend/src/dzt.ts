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
      timeout: 10000
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
    const args: Record<string, any> = {
      keywords: params.keywords || "Festival,Kultur,Markt"
    };
    if (params.region) args.region = params.region;
    if (params.locality) args.locality = params.locality;
    if (params.dateRangeStart) args.dateRangeStart = params.dateRangeStart;
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
