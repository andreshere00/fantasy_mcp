import { ConsoleUserContext } from "../../infrastructure/fantasy/userContext/userInformation.js";
import { getUserContextSnapshot } from "../../application/fantasy/userContext/getUserContext.js";

/**
 * CLI entrypoint for collecting a user context snapshot via console prompts.
 *
 * This script executes the "User Context Snapshot" use case, which:
 *
 * 1) Prompts the user for their current fantasy context:
 *    - available balance
 *    - squad players
 *    - market players
 *    - opponent info
 * 2) Aggregates the inputs into a single structured object
 * 3) Prints that snapshot as JSON to stdout
 *
 * ## Usage
 *
 * ```bash
 * bun run setup
 * ```
 *
 * ## Architecture Notes
 *
 * - {@link ConsoleUserContext} is an infrastructure adapter that implements
 *   the required ports (balance, squad, market, opponents) by reading from stdin.
 *
 * - {@link getUserContextSnapshot} is an application-level use case function that:
 *   - calls each port in a deterministic order
 *   - produces a single domain-friendly "user context" object
 *
 * This CLI file contains **no domain logic**; it only wires adapters, executes the
 * use case, and handles output/cleanup.
 */
async function main(): Promise<void> {
  /**
   * Console adapter that provides user context information by prompting.
   *
   * It is expected to implement:
   * - AvailableBalancePort
   * - SquadPlayersPort
   * - AvailableMarketPlayersPort
   * - OpponentsInfoPort
   */
  const consoleContext = new ConsoleUserContext();

  try {
    /**
     * Execute the use case, providing the required ports via the same adapter.
     *
     * This is intentionally explicit so that, in the future, each port can be
     * backed by a different adapter (e.g., web UI, persisted storage, API).
     */
    const userContext = await getUserContextSnapshot({
      balance: consoleContext,
      squad: consoleContext,
      market: consoleContext,
      opponents: consoleContext,
    });

    /**
     * User-facing output:
     * Print the collected context snapshot so it can be inspected or piped.
     *
     * Next step (future work): feed this snapshot into a lineup builder use case.
     */
    console.log("\nUser context snapshot:\n", JSON.stringify(userContext, null, 2));
  } catch (err) {
    /**
     * CLI error handling:
     * - log a user-friendly failure message
     * - keep process alive long enough to close readline resources in `finally`
     */
    console.error("CLI failed:", err);
  } finally {
    /**
     * Always close the console adapter to release stdin/readline resources.
     * This prevents hanging processes in some terminals/CI environments.
     */
    await consoleContext.close();
  }
}

/**
 * Executes the CLI entrypoint.
 *
 * `void` is used to make the "fire-and-forget" Promise explicit at the top level.
 */
void main();