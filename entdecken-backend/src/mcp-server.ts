import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { getDb } from "./db/db.js";
import crypto from "crypto";
import { searchDztTrails, searchDztEvents, searchDztPois } from "./dzt.js";

export const MCP_TOOLS = [
  {
    name: "search_places",
    description: "Search for campgrounds, caravan sites, and tourist attractions in Europe. Results include structured location data (country, state, city), amenities, pricing and quality-based ratings.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search term (e.g., 'Lofoten', 'Zugspitze')" },
        type: { type: "string", enum: ["campground", "caravan", "glamping", "attraction"], description: "Filter by place type" },
        country: { type: "string", description: "Two-letter country code (e.g., DE, AT, CH, SE, NO)" },
        state: { type: "string", description: "State, region or canton name (e.g., 'Bayern', 'Toskana', 'Wallis')" },
        city: { type: "string", description: "City or municipality name (e.g., 'München', 'Stockholm')" },
        amenities: { type: "string", description: "Comma-separated amenities (e.g. 'wifi,showers,hookups')" }
      }
    }
  },
  {
    name: "get_place_details",
    description: "Get full details of a specific place including contact info, pricing, coordinates, and amenities.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The unique ID of the place" }
      },
      required: ["id"]
    }
  },
  {
    name: "get_reviews",
    description: "Get traveler reviews for a specific place.",
    inputSchema: {
      type: "object",
      properties: {
        place_id: { type: "string", description: "The unique ID of the place" }
      },
      required: ["place_id"]
    }
  },
  {
    name: "add_review",
    description: "Write a traveler review for a specific place you have visited.",
    inputSchema: {
      type: "object",
      properties: {
        place_id: { type: "string", description: "The unique ID of the place" },
        author: { type: "string", description: "Name of the reviewer" },
        content: { type: "string", description: "The detailed review content" },
        rating: { type: "number", minimum: 1, maximum: 5, description: "Rating from 1 to 5 stars" }
      },
      required: ["place_id", "author", "content", "rating"]
    }
  },
  {
    name: "get_lists",
    description: "Retrieve all your saved travel lists.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "create_list",
    description: "Create a new named travel list to save places.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name of the list (e.g., 'Norway Summer 2026')" },
        description: { type: "string", description: "Optional description of the list" }
      },
      required: ["name"]
    }
  },
  {
    name: "save_to_list",
    description: "Save a place to one of your travel lists.",
    inputSchema: {
      type: "object",
      properties: {
        list_id: { type: "string", description: "The ID of the list to add to" },
        place_id: { type: "string", description: "The ID of the place to save" }
      },
      required: ["list_id", "place_id"]
    }
  },
  {
    name: "get_german_trails",
    description: "Search official German hiking and biking trails (tours) via the German National Tourist Board (DZT) Knowledge Graph. Returns verified routes, difficulty, distance, and official descriptions.",
    inputSchema: {
      type: "object",
      properties: {
        region: { type: "string", description: "Region or federal state in Germany (e.g., 'Schwarzwald', 'Allgäu', 'Bayern')" },
        locality: { type: "string", description: "City or town name" },
        keywords: { type: "string", description: "Keywords (e.g., 'Rundweg,Aussicht,Familie')" },
        difficulty: { type: "string", enum: ["easy", "medium", "hard"], description: "Trail difficulty level" },
        max_length_km: { type: "number", description: "Maximum trail length in kilometers" }
      }
    }
  },
  {
    name: "get_german_events",
    description: "Search official upcoming events, festivals, and cultural highlights in Germany via the DZT Knowledge Graph.",
    inputSchema: {
      type: "object",
      properties: {
        region: { type: "string", description: "Region or federal state in Germany (e.g., 'Bodensee', 'Harz')" },
        locality: { type: "string", description: "City or town name" },
        keywords: { type: "string", description: "Event keywords (e.g., 'Weinfest,Festival,Markt')" },
        dateRangeStart: { type: "string", description: "Start date in ISO format (YYYY-MM-DD)" },
        dateRangeEnd: { type: "string", description: "End date in ISO format (YYYY-MM-DD)" }
      }
    }
  },
  {
    name: "get_german_pois",
    description: "Search verified official tourist attractions, castles, museums, nature spots, and points of interest in Germany via the DZT Knowledge Graph.",
    inputSchema: {
      type: "object",
      properties: {
        region: { type: "string", description: "Region or federal state in Germany (e.g., 'Sachsen', 'Mecklenburg-Vorpommern')" },
        locality: { type: "string", description: "City or town name" },
        keywords: { type: "string", description: "Keywords (e.g., 'Burg,Schloss,See,Museum')" },
        type: { type: "string", description: "Type of POI (e.g., 'TouristAttraction', 'Museum', 'Castle')" }
      }
    }
  }
];

export async function executeMcpTool(name: string, args: any): Promise<any> {
  const db = await getDb();
  try {
    switch (name) {
      case "search_places": {
        const { query, type, country, state, city, amenities } = (args || {}) as any;
        let sql = "SELECT * FROM places WHERE 1=1";
        const params: any[] = [];

        if (query) {
          sql += " AND (name LIKE ? OR description LIKE ? OR address LIKE ?)";
          const q = `%${query}%`;
          params.push(q, q, q);
        }
        if (type) {
          sql += " AND type = ?";
          params.push(type);
        }
        if (country) {
          sql += " AND country = ?";
          params.push(country.toUpperCase());
        }
        if (state) {
          sql += " AND state = ? AND country = ?";
          params.push(state, (country || '').toUpperCase());
        }
        if (city) {
          sql += " AND (city LIKE ? OR address LIKE ? OR name LIKE ?)";
          const q = `%${city}%`;
          params.push(q, q, q);
        }
        if (amenities) {
          const list = amenities.split(",").map((a: string) => a.trim());
          for (const am of list) {
            sql += " AND amenities LIKE ?";
            params.push(`%${am}%`);
          }
        }

        sql += " ORDER BY rating DESC LIMIT 25";
        const places = await db.all(sql, params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(places, null, 2)
            }
          ]
        };
      }

      case "get_place_details": {
        const { id } = (args || {}) as any;
        const place = await db.get("SELECT * FROM places WHERE id = ?", [id]);
        if (!place) {
          throw new McpError(ErrorCode.InvalidRequest, `Place not found: ${id}`);
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(place, null, 2)
            }
          ]
        };
      }

      case "get_reviews": {
        const { place_id } = (args || {}) as any;
        const reviews = await db.all("SELECT * FROM reviews WHERE place_id = ? ORDER BY created_at DESC", [place_id]);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(reviews, null, 2)
            }
          ]
        };
      }

      case "add_review": {
        const { place_id, author, content, rating } = (args || {}) as any;
        
        // Verify place exists
        const place = await db.get("SELECT id FROM places WHERE id = ?", [place_id]);
        if (!place) {
          throw new McpError(ErrorCode.InvalidRequest, `Place not found: ${place_id}`);
        }

        const reviewId = crypto.randomUUID();
        const createdAt = new Date().toISOString().split("T")[0];
        
        await db.run(
          "INSERT INTO reviews (id, place_id, author, content, rating, created_at) VALUES (?, ?, ?, ?, ?, ?)",
          [reviewId, place_id, author, content, rating, createdAt]
        );

        // Update average rating
        const stats = await db.get("SELECT AVG(rating) as avgRating FROM reviews WHERE place_id = ?", [place_id]);
        if (stats && stats.avgRating) {
          await db.run("UPDATE places SET rating = ? WHERE id = ?", [parseFloat(stats.avgRating.toFixed(1)), place_id]);
        }

        return {
          content: [
            {
              type: "text",
              text: `Review successfully added. Review ID: ${reviewId}`
            }
          ]
        };
      }

      case "get_lists": {
        const lists = await db.all("SELECT * FROM lists ORDER BY created_at DESC");
        // Pull items count for each list
        const listsWithCounts = await Promise.all(
          lists.map(async (list) => {
            const countObj = await db.get("SELECT COUNT(*) as count FROM list_items WHERE list_id = ?", [list.id]);
            return {
              ...list,
              item_count: countObj?.count || 0
            };
          })
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(listsWithCounts, null, 2)
            }
          ]
        };
      }

      case "create_list": {
        const { name, description } = (args || {}) as any;
        const listId = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        
        await db.run(
          "INSERT INTO lists (id, name, description, is_private, created_at) VALUES (?, ?, ?, 1, ?)",
          [listId, name, description || "", createdAt]
        );

        return {
          content: [
            {
              type: "text",
              text: `List successfully created. List ID: ${listId}`
            }
          ]
        };
      }

      case "save_to_list": {
        const { list_id, place_id } = (args || {}) as any;
        
        // Verify list and place exist
        const list = await db.get("SELECT id FROM lists WHERE id = ?", [list_id]);
        if (!list) {
          throw new McpError(ErrorCode.InvalidRequest, `List not found: ${list_id}`);
        }
        const place = await db.get("SELECT id FROM places WHERE id = ?", [place_id]);
        if (!place) {
          throw new McpError(ErrorCode.InvalidRequest, `Place not found: ${place_id}`);
        }

        await db.run(
          "INSERT OR IGNORE INTO list_items (list_id, place_id, added_at) VALUES (?, ?, ?)",
          [list_id, place_id, new Date().toISOString()]
        );

        return {
          content: [
            {
              type: "text",
              text: `Place successfully saved to list ${list_id}.`
            }
          ]
        };
      }

      case "get_german_trails": {
        const trails = await searchDztTrails(args || {});
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                source: "Deutsche Zentrale für Tourismus e.V. (DZT) Knowledge Graph / Open Data Germany",
                count: trails.length,
                trails: trails.map((t: any) => ({
                  id: t["@id"],
                  name: t["schema:name"],
                  description: t["schema:description"] ? t["schema:description"].replace(/<[^>]*>?/gm, '').slice(0, 300) : undefined,
                  image: t["schema:image"] ? (Array.isArray(t["schema:image"]) ? t["schema:image"][0]?.["schema:contentUrl"] : t["schema:image"]?.["schema:contentUrl"]) : undefined
                }))
              }, null, 2)
            }
          ]
        };
      }

      case "get_german_events": {
        const events = await searchDztEvents(args || {});
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                source: "Deutsche Zentrale für Tourismus e.V. (DZT) Knowledge Graph / Open Data Germany",
                count: events.length,
                events: events.map((e: any) => ({
                  id: e["@id"],
                  name: e["schema:name"],
                  description: e["schema:description"] ? e["schema:description"].replace(/<[^>]*>?/gm, '').slice(0, 300) : undefined,
                  address: e["schema:address"],
                  startDate: e["schema:startDate"],
                  image: e["schema:image"] ? (Array.isArray(e["schema:image"]) ? e["schema:image"][0]?.["schema:contentUrl"] : e["schema:image"]?.["schema:contentUrl"]) : undefined
                }))
              }, null, 2)
            }
          ]
        };
      }

      case "get_german_pois": {
        const pois = await searchDztPois(args || {});
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                source: "Deutsche Zentrale für Tourismus e.V. (DZT) Knowledge Graph / Open Data Germany",
                count: pois.length,
                pois: pois.map((p: any) => ({
                  id: p["@id"],
                  name: p["schema:name"],
                  description: p["schema:description"] ? p["schema:description"].replace(/<[^>]*>?/gm, '').slice(0, 300) : undefined,
                  address: p["schema:address"],
                  image: p["schema:image"] ? (Array.isArray(p["schema:image"]) ? p["schema:image"][0]?.["schema:contentUrl"] : p["schema:image"]?.["schema:contentUrl"]) : undefined
                }))
              }, null, 2)
            }
          ]
        };
      }

        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, error.message || "An unexpected error occurred");
  }
}

export function createMcpServer(): Server {
  const server = new Server(
    {
      name: "campingroute",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {
          listChanged: true,
        },
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: MCP_TOOLS,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return await executeMcpTool(request.params.name, request.params.arguments);
  });

  return server;
}

export const mcpServer = createMcpServer();
