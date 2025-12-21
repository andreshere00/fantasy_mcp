import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { UserContextStore } from "../state/userContextStore.js";

type Deps = {
  store: UserContextStore;
};

/**
 * Registers the fantasy://user-context resource.
 *
 * The resource reads the current snapshot from server memory.
 * The snapshot must be set first via the set_user_context tool.
 */
export function registerFantasyResources(server: McpServer, deps: Deps): void {
  server.registerResource(
    "user_context",
    "fantasy://user-context",
    {
      title: "User Fantasy Context",
      description:
        "Snapshot of available balance, squad players, market players, and opponents info.",
      mimeType: "application/json",
    },
    async (uri, _extra) => {
      const snapshot = deps.store.get();

      if (!snapshot) {
        // Return a structured “empty” response; client can detect and call set_user_context.
        return {
          contents: [
            {
              uri: uri.toString(),
              mimeType: "application/json",
              text: JSON.stringify({
                error: "USER_CONTEXT_NOT_SET",
                message: "Call tool set_user_context before reading fantasy://user-context.",
              }),
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(snapshot),
          },
        ],
      };
    },
  );
}
