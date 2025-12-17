import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { firstResourceText, firstToolText } from "../../utils/helpers.js";

import type { UserContextSnapshot } from "../../../application/fantasy/e2e/getUserContext.js";
import type { PlayerSnapshot, PlayerSnapshotOptions } from "../../../domain/fantasy/models.js";

export class FantasyMcpClient {
  private readonly client = new Client(
    { name: "fantasy-cli-client", version: "0.1.0" },
    { capabilities: {} },
  );

  private transport: StdioClientTransport | null = null;

  async connect(command: string, args: string[] = []): Promise<void> {
    if (this.transport) return;

    this.transport = new StdioClientTransport({ command, args });
    await this.client.connect(this.transport);
  }

  async close(): Promise<void> {
    await this.client.close();
    this.transport = null;
  }

  /**
   * Pushes the current user context snapshot into the MCP server memory.
   */
  async setUserContext(snapshot: UserContextSnapshot): Promise<void> {
    await this.client.callTool({
      name: "set_user_context",
      arguments: { snapshot },
    });
  }

  /**
   * Reads the current user context snapshot from the MCP server resource.
   *
   * The server must have been initialized by calling `set_user_context` first.
   */
  async readUserContext(): Promise<UserContextSnapshot> {
    const result = await this.client.readResource({
      uri: "fantasy://user-context",
    });

    const raw = firstResourceText(result);
    return JSON.parse(raw) as UserContextSnapshot;
  }

  async fetchPlayerSnapshot(
    slug: string,
    options: PlayerSnapshotOptions = {},
  ): Promise<PlayerSnapshot> {
    const includeInfo = options.includeInfo ?? true;
    const includeMarket = options.includeMarket ?? true;

    const result = await this.client.callTool({
      name: "fetch_player_snapshot",
      arguments: { slug, includeInfo, includeMarket },
    });

    const raw = firstToolText(result);
    return JSON.parse(raw) as PlayerSnapshot;
  }
}
