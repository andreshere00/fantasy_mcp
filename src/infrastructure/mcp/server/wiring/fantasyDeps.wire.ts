import { AxiosHtmlClient } from "../../../http/axiosHtmlClient.js";
import { AnaliticaPageGatewayImpl } from "../../../fantasy/pageGateway.js";
import { FantasyEventsExtractorImpl } from "../../../fantasy/extractors/fantasyEvents.extractor.js";
import { PlayerDetailsExtractorImpl } from "../../../fantasy/extractors/playerDetails.extractor.js";
import { MarketDetailsExtractorImpl } from "../../../fantasy/extractors/marketDetails.extractor.js";
import { FetchPlayerSnapshotUseCase } from "../../../../application/fantasy/e2e/fetchPlayerSnapshot.js";

import { getUserContextSnapshot } from "../../../../application/fantasy/e2e/getUserContext.js";
import { ConsoleUserContext } from "../../../fantasy/userContext/userContext.js";

/**
 * Builds and wires all dependencies required by the Fantasy MCP server.
 *
 * This function acts as the **composition root** for MCP-related fantasy features.
 * It instantiates infrastructure adapters, extractors, and application use cases,
 * and exposes them as simple callable functions suitable for MCP tools and resources.
 *
 * Responsibilities:
 * - Wire HTTP client, page gateway, and extractors for player scraping
 * - Instantiate the `FetchPlayerSnapshotUseCase`
 * - Provide a callable wrapper for the `getUserContextSnapshot` use case
 *
 * @returns An object containing callable functions used by MCP tool/resource handlers
 */
export async function buildFantasyDeps() {
  /**
   * ======================
   * Player snapshot wiring
   * ======================
   */

  const httpClient = new AxiosHtmlClient();
  const pageGateway = new AnaliticaPageGatewayImpl(httpClient);

  const useCase = new FetchPlayerSnapshotUseCase(
    pageGateway,
    new FantasyEventsExtractorImpl(),
    new PlayerDetailsExtractorImpl(),
    new MarketDetailsExtractorImpl(),
  );

  /**
   * ======================
   * User context wiring
   * ======================
   *
   * Console-based adapter used to gather user fantasy context.
   * This can later be replaced with a persisted or API-backed adapter
   * without changing the MCP layer.
   */
  const consoleContext = new ConsoleUserContext();

  return {
    /**
     * Retrieves the current user context snapshot.
     *
     * This function is intended to back the
     * `fantasy://user-context` MCP resource.
     */
    getUserContextSnapshot: () =>
      getUserContextSnapshot({
        balance: consoleContext,
        squad: consoleContext,
        market: consoleContext,
        opponents: consoleContext,
      }),

    /**
     * Fetches a fantasy player snapshot by slug.
     *
     * This function is intended to back the
     * `fetch_player_snapshot` MCP tool.
     */
    fetchPlayerSnapshot: (slug: string, options: any) =>
      useCase.execute(slug, options),
  };
}