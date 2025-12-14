import type {
  MatchEventRow,
  PlayerDetails,
  MarketDetails,
} from "../config/interfaces.js";
import type { AnaliticaPageKind } from "./types.js";
import type { MarketPlayer, OpponentInfo, SquadPlayer } from "./models.js";

/**
 * ======================
 * Gateways
 * ======================
 */

/**
 * Gateway responsible for retrieving raw HTML pages
 * from the Analítica Fantasy platform.
 *
 * Implementations decide how pages are fetched
 * (HTTP, cache, filesystem, mock, etc.).
 */
export interface AnaliticaPageGateway {
  /**
   * Loads the HTML content of a page given its kind and slug.
   *
   * @param kind - Type of page to load (info, market, etc.).
   * @param slug - Player or resource identifier used in the URL.
   * @returns Raw HTML string.
   */
  loadPage(kind: AnaliticaPageKind, slug: string): Promise<string>;
}

/**
 * ======================
 * Extractors
 * ======================
 */

/**
 * Extractor responsible for parsing fantasy match events
 * from a player's information HTML page.
 */
export interface FantasyEventsExtractor {
  /**
   * Extracts fantasy match event rows from the info page HTML.
   *
   * @param html - Raw HTML of the player information page.
   * @returns Parsed fantasy match events.
   */
  extractFromInfoHtml(html: string): MatchEventRow[];
}

/**
 * Extractor responsible for parsing player details
 * from a player's information HTML page.
 */
export interface PlayerDetailsExtractor {
  /**
   * Extracts player details from the info page HTML.
   *
   * @param html - Raw HTML of the player information page.
   * @returns Parsed player details.
   */
  extractFromInfoHtml(html: string): PlayerDetails;
}

/**
 * Extractor responsible for parsing market-related data
 * from a player's market HTML page.
 */
export interface MarketDetailsExtractor {
  /**
   * Extracts market details from the market page HTML.
   *
   * @param html - Raw HTML of the player market page.
   * @returns Parsed market details.
   */
  extractFromMarketHtml(html: string): MarketDetails;
}

/**
 * ======================
 * User Context Ports
 * ======================
 */

/**
 * Port for retrieving the user's available balance.
 *
 * Implementations may obtain this value from:
 * - CLI prompts
 * - Web UI
 * - Persistence layer
 */
export interface AvailableBalancePort {
  /**
   * Returns the user's currently available balance.
   */
  getAvailableBalance(): Promise<number>;
}

/**
 * Port for retrieving the players currently in the user's squad.
 */
export interface SquadPlayersPort {
  /**
   * Returns the list of players owned by the user.
   */
  getSquadPlayers(): Promise<SquadPlayer[]>;
}

/**
 * Port for retrieving the players currently available on the market.
 */
export interface AvailableMarketPlayersPort {
  /**
   * Returns the list of players available for purchase.
   */
  getAvailableMarketPlayers(): Promise<MarketPlayer[]>;
}

/**
 * Port for retrieving information about opponents.
 */
export interface OpponentsInfoPort {
  /**
   * Returns information about opposing teams or managers.
   */
  getOpponentsInfo(): Promise<OpponentInfo[]>;
}