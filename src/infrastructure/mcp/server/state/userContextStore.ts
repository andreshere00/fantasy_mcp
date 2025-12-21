import type { UserContextSnapshot } from "../../../../application/fantasy/e2e/getUserContext.js";

/**
 * In-memory store for the current user context snapshot.
 *
 * This store is intentionally process-local:
 * - it resets when the MCP server restarts
 * - it is safe for stdio MCP (no external I/O)
 */
export class UserContextStore {
  private snapshot: UserContextSnapshot | null = null;

  set(snapshot: UserContextSnapshot): void {
    this.snapshot = snapshot;
  }

  get(): UserContextSnapshot | null {
    return this.snapshot;
  }

  has(): boolean {
    return this.snapshot !== null;
  }
}
