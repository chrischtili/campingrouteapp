import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { getDb } from "./db/db.js";
import crypto from "crypto";

export function createMcpServer(): Server {
  const server = new Server(
    {
      name: "campingroute",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Define tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
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
      }
    ]
  };
});

// Handle tool executions
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const db = await getDb();
  const { name, arguments: args } = request.params;

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

        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (error: any) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(ErrorCode.InternalError, error.message || "An unexpected error occurred");
    }
  });

  return server;
}

export const mcpServer = createMcpServer();
