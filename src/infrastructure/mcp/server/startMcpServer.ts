import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerFetchPlayerSnapshotTool } from "./tools/fetchPlayerSnapshot.tool.js";
import { registerSetUserContextTool } from "./tools/setUserContext.tool.js";
import { registerFantasyResources } from "./resources/userContext.resource.js";
import { buildFantasyDeps } from "./wiring/fantasyDeps.wire.js";
import { UserContextStore } from "./state/userContextStore.js";

export async function startMcpServer(): Promise<void> {
  const server = new McpServer({ name: "fantasy-mcp", version: "0.1.0" });

  // Server-side memory store
  const store = new UserContextStore();

  // Existing deps (player snapshot scraping)
  const deps = await buildFantasyDeps();

  // Register dynamic context endpoints
  registerSetUserContextTool(server, { store });
  registerFantasyResources(server, { store });

  // Existing tool(s)
  registerFetchPlayerSnapshotTool(server, deps);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
