import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { UserContextStore } from "../state/userContextStore.js";

/**
 * Minimal input schema for setting the user context on the server.
 *
 * You can tighten this later by using a full Zod schema matching your
 * UserContextSnapshot exactly.
 */
const SetUserContextInputSchema = z.object({
  snapshot: z.unknown(),
});

type Deps = {
  store: UserContextStore;
};

/**
 * Registers a tool that sets the current user context snapshot
 * in the MCP server in-memory state.
 *
 * This enables stdio MCP servers to use dynamic, user-provided context
 * without reading from stdin interactively.
 */
export function registerSetUserContextTool(server: McpServer, deps: Deps): void {
  server.registerTool(
    "set_user_context",
    {
      title: "Set User Context",
      description:
        "Sets the current user context snapshot in server memory. Must be called before reading fantasy://user-context.",
      inputSchema: SetUserContextInputSchema,
    },
    async ({ snapshot }, _extra) => {
      // Store as-is; caller controls shape. Tighten with validation later if desired.
      deps.store.set(snapshot as any);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: true }),
          },
        ],
      };
    },
  );
}
