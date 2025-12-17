import type {
  MatchEventRow,
  PlayerDetails,
  MarketDetails,
} from "../config/interfaces.js";
import type { PlayerSlug, EurAmount } from "./alias.js";

/**
 * ======================
 * Player Information
 * ======================
 */

/**
 * Aggregated snapshot of all information related to a single player.
 *
 * This structure represents the result of an end-to-end use case
 * that fetches, parses, and normalizes data from multiple sources
 * (fantasy events, player details, and market data).
 */
export interface PlayerSnapshot {
  /**
   * Unique slug identifying the player (e.g. "pedri", "pedri-gonzalez").
   */
  slug: PlayerSlug;

  /**
   * Parsed fantasy match events associated with the player.
   */
  fantasyEvents: MatchEventRow[];

  /**
   * Static and dynamic details about the player
   * (position, availability, role, etc.).
   */
  playerDetails: PlayerDetails;

  /**
   * Market-related information for the player,
   * including current value and historical changes.
   */
  marketDetails: MarketDetails;
}

/**
 * Configuration options that control which parts of a
 * {@link PlayerSnapshot} should be fetched and included.
 */
export interface PlayerSnapshotOptions {
  /**
   * Whether player details information should be included.
   *
   * @defaultValue true
   */
  includeInfo?: boolean;

  /**
   * Whether market-related information should be included.
   *
   * @defaultValue true
   */
  includeMarket?: boolean;
}

/**
 * ======================
 * User Information
 * ======================
 */

/**
 * Represents a player owned by the user in their squad.
 *
 * The `ids` field allows mapping the same player across
 * different providers or data sources.
 */
export interface SquadPlayer {
  /**
   * List of provider-specific or normalized identifiers
   * associated with the player.
   */
  ids: string[];

  /**
   * Display name of the player.
   */
  name: string;
}

/**
 * Represents a player available on the transfer market.
 */
export interface MarketPlayer {
  /**
   * List of provider-specific or normalized identifiers
   * associated with the player.
   */
  ids: string[];

  /**
   * Display name of the player.
   */
  name: string;
}


/**
 * Opponents should expose actual players (not just string names)
 * so you can attach releaseClause info.
 */
export interface OpponentPlayer {
  ids: string[];
  name: string;
  releaseClause?: ReleaseClauseInfo;
}

/**
 * Represents information about an opposing team or manager.
 */
export interface OpponentInfo {
  /**
   * Display name of the opponent.
   */
  name: string;

  /**
   * Tactical formation used by the opponent, if known.
   *
   * Example: "4-3-3", "3-5-2"
   */
  formation?: string;

  /**
   * List of key players to consider when analyzing the opponent.
   */
  players?: OpponentPlayer[];
}

/**
 * Minimal representation of a player identified by a single ID.
 *
 * Useful for lightweight references, dropdowns, or mappings.
 */
export interface NamedPlayer {
  /**
   * Unique identifier of the player.
   */
  id: string;

  /**
   * Display name of the player.
   */
  name: string;
}

export interface ReleaseToMarketDelay {
  unit: "days";
  value: number; // integer >= 0
}

/**
 * Release clause info attached to a player in a squad (or opponent squad).
 * If unknown, omit the property (preferred with exactOptionalPropertyTypes).
 */
export interface ReleaseClauseInfo {
  /**
   * How long until the player is released to market (e.g. 2 days).
   */
  releaseToMarketIn: ReleaseToMarketDelay;

  /**
   * Clause value in euros (e.g. 56000000 for "56.000.000€").
   */
  clauseValueEur: EurAmount;
}
