import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  PlayerSnapshotOptions,
  PlayerSnapshot,
} from "../../../../domain/fantasy/models.js";

type Deps = {
  fetchPlayerSnapshot: (
    slug: string,
    options: PlayerSnapshotOptions,
  ) => Promise<PlayerSnapshot>;
};

/**
 * Registers the `fetch_player_snapshot` MCP tool.
 *
 * This tool allows MCP clients and language models to fetch **on-demand,
 * detailed fantasy information** for a specific player, identified by slug.
 *
 * The returned snapshot aggregates:
 * - recent fantasy match events
 * - player details (team, position, availability, expected scores, etc.)
 * - market details (current value, deltas, historical extrema)
 *
 * @param server - MCP server instance used to register the tool
 * @param deps - Dependencies required to execute the tool
 * @param deps.fetchPlayerSnapshot - Application use case that fetches and parses player data
 */
export function registerFetchPlayerSnapshotTool(
  server: McpServer,
  deps: Deps,
): void {
  server.registerTool(
    "fetch_player_snapshot",
    {
      title: "Fetch Player Snapshot",
      description:
        "Fetch fantasy events, player details, and market details for a player slug.",
      inputSchema: z.object({
        slug: z.string().min(1),
        includeInfo: z.boolean().optional().default(true),
        includeMarket: z.boolean().optional().default(true),
      }),
    },
    async ({ slug, includeInfo, includeMarket }, _extra) => {
      const snapshot = await deps.fetchPlayerSnapshot(slug, {
        includeInfo,
        includeMarket,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(snapshot),
          },
        ],
      };
    },
  );
}