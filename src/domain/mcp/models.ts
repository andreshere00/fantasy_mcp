import type { PlayerSnapshot, PlayerSnapshotOptions } from "../fantasy/models.js";
import type { UserContextSnapshot } from "../../application/fantasy/e2e/getUserContext.js";

/**
 * Port used by application use cases to retrieve model context and player data.
 *
 * This is implemented by the MCP client adapter (stdio client) in infrastructure.
 */
export interface FantasyContextPort {
    readUserContext(): Promise<UserContextSnapshot>;
    fetchPlayerSnapshot(slug: string, options?: PlayerSnapshotOptions): Promise<PlayerSnapshot>;
  }