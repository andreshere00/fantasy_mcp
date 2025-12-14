import { AxiosHtmlClient } from "../../infrastructure/http/axiosHtmlClient.js";
import { AnaliticaPageGatewayImpl } from "../../infrastructure/fantasy/pageGateway.js";
import { FantasyEventsExtractorImpl } from "../../infrastructure/fantasy/extractors/fantasyEventsExtractor.js";
import { PlayerDetailsExtractorImpl } from "../../infrastructure/fantasy/extractors/playerDetailsExtractor.js";
import { MarketDetailsExtractorImpl } from "../../infrastructure/fantasy/extractors/marketDetailsExtractor.js";
import { FetchPlayerSnapshotUseCase } from "../../application/fantasy/e2e/fetchPlayerSnapshot.js";

/**
 * CLI entrypoint for the "Fetch Player Snapshot" end-to-end use case.
 *
 * This script wires up the infrastructure adapters and executes the application
 * use case that:
 *
 * 1) Downloads player-related HTML pages from the Analítica Fantasy website
 * 2) Parses the HTML into structured domain models via extractors
 * 3) Aggregates the result into a single snapshot object
 * 4) Prints the resulting snapshot (events, player details, market details) to stdout
 *
 * ## Usage
 *
 * Run with the default slug ("pedri"):
 * ```bash
 * bun run scrap
 * ```
 *
 * Run with a specific player slug:
 * ```bash
 * bun run scrap pedri-gonzalez
 * ```
 *
 * ## Architecture Notes
 *
 * - Infrastructure:
 *   - {@link AxiosHtmlClient} performs the HTTP GET requests (raw HTML)
 *   - {@link AnaliticaPageGatewayImpl} selects the correct URL based on page kind
 *
 * - Extractors:
 *   - {@link FantasyEventsExtractorImpl} parses fantasy match events from info HTML
 *   - {@link PlayerDetailsExtractorImpl} parses player details from info HTML
 *   - {@link MarketDetailsExtractorImpl} parses market details from market HTML
 *
 * - Use case:
 *   - {@link FetchPlayerSnapshotUseCase} orchestrates page loading + extraction and
 *     returns a domain-level snapshot (events + details + market).
 *
 * This file intentionally contains no parsing logic. Its responsibility is wiring
 * and user-facing logging/exit codes.
 */
async function run(): Promise<void> {
  /**
   * Player slug passed from CLI.
   *
   * The first CLI argument after the script name is treated as the slug.
   * If omitted, defaults to `"pedri"`.
   */
  const slug: string = process.argv[2] ?? "pedri";

  console.log(`Fetching data for player: ${slug}`);

  try {
    /**
     * ======================
     * Infrastructure wiring
     * ======================
     */

    /**
     * HTTP client used to retrieve remote HTML documents.
     */
    const httpClient = new AxiosHtmlClient();

    /**
     * Gateway responsible for mapping page kinds to URLs and fetching HTML.
     */
    const pageGateway = new AnaliticaPageGatewayImpl(httpClient);

    /**
     * ======================
     * Extractors wiring
     * ======================
     *
     * Extractors convert raw HTML into structured domain models.
     * They are designed to be pure and testable (no network I/O).
     */

    /**
     * Parses fantasy match events table from the player info HTML.
     */
    const fantasyEventsExtractor = new FantasyEventsExtractorImpl();

    /**
     * Parses player details (position, availability, etc.) from the player info HTML.
     */
    const playerDetailsExtractor = new PlayerDetailsExtractorImpl();

    /**
     * Parses player market details (current value, deltas, etc.) from the market HTML.
     */
    const marketDetailsExtractor = new MarketDetailsExtractorImpl();

    /**
     * ======================
     * Use case execution
     * ======================
     */

    /**
     * End-to-end use case that loads the required pages and builds
     * a unified snapshot.
     */
    const useCase = new FetchPlayerSnapshotUseCase(
      pageGateway,
      fantasyEventsExtractor,
      playerDetailsExtractor,
      marketDetailsExtractor,
    );

    /**
     * Execute the use case for the given slug.
     */
    const snapshot = await useCase.execute(slug);

    /**
     * ======================
     * User-facing output
     * ======================
     *
     * We print each section separately to make CLI output readable
     * and allow future piping/grep usage.
     */

    console.log(
      `Parsed ${snapshot.fantasyEvents.length} fantasy rows for slug "${slug}":`,
    );
    console.log(JSON.stringify(snapshot.fantasyEvents, null, 2));

    console.log("Player details:");
    console.log(JSON.stringify(snapshot.playerDetails, null, 2));

    console.log("Market details:");
    console.log(JSON.stringify(snapshot.marketDetails, null, 2));
  } catch (error) {
    /**
     * CLI error handling:
     * - log the error with context
     * - exit with non-zero status for shell scripting compatibility
     */
    console.error(`Error fetching or parsing data for slug "${slug}":`, error);
    process.exit(1);
  }
}

/**
 * Executes the CLI entrypoint.
 *
 * `void` is used to signal that the returned Promise is intentionally not awaited
 * at the top level (standard pattern for Node/Bun CLI programs).
 */
void run();
