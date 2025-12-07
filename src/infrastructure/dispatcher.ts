// src/modules/dispatcher.ts

import { fetchPlayerInfo } from "./infoFetcher.js";
import { fetchPlayerMarket } from "./marketFetcher.js";
import type {
  MatchEventRow,
  PlayerDetails,
  MarketDetails,
} from "../domain/config/interfaces.js";

/**
 * High-level aggregated snapshot for a player.
 */
export interface PlayerSnapshot {
  slug: string;
  fantasyEvents: MatchEventRow[];
  playerDetails: PlayerDetails;
  marketDetails: MarketDetails;
}

/**
 * Dispatcher options to control what is fetched.
 */
export interface DispatcherOptions {
  includeInfo?: boolean;    // default: true
  includeMarket?: boolean; // default: true
}

/**
 * Dispatcher that knows *which* modules to call for a player.
 *
 *  - Delegates info fetching to infoFetcher (BASE_URL).
 *  - Delegates market fetching to marketFetcher (PLAYER_MARKET_BASE_URL).
 *
 * @param slug Player slug.
 * @param options Which parts to load (both by default).
 * @returns PlayerSnapshot with the requested data.
 */
export async function dispatchPlayerData(
  slug: string,
  options: DispatcherOptions = {},
): Promise<PlayerSnapshot> {
  const { includeInfo = true, includeMarket = true } = options;

  const infoPromise = includeInfo ? fetchPlayerInfo(slug) : null;
  const marketPromise = includeMarket ? fetchPlayerMarket(slug) : null;

  const [info, market] = await Promise.all([
    infoPromise,
    marketPromise,
  ]);

  return {
    slug,
    fantasyEvents: info?.fantasyEvents ?? [],
    playerDetails: (info?.playerDetails as PlayerDetails) ?? {
      // fallback minimal object if someone calls only market
      name: "",
      team: "",
      position: "unknown",
      isAvailable: false,
      titularityChance: NaN,
      trustability: NaN,
      expectedScoreAsStarter: NaN,
      expectedScoreAsSubstitute: NaN,
    },
    marketDetails: (market as MarketDetails) ?? {
      allTimeFantasyMarket: {
        maxPrice: { value: 0, date: "" },
        minPrice: { value: 0, date: "" },
        highestRaise: { value: 0, date: "" },
        highestDrop: { value: 0, date: "" },
        bestBid: 0,
        maxBid: 0,
      },
      lastFantasyMarketValues: {
        currentValue: 0,
        lastDay: { amount: 0, percent: 0 },
        last2Days: { amount: 0, percent: 0 },
        last3Days: { amount: 0, percent: 0 },
        last5Days: { amount: 0, percent: 0 },
        last10Days: { amount: 0, percent: 0 },
        last14Days: { amount: 0, percent: 0 },
        last29Days: { amount: 0, percent: 0 },
      },
    },
  };
}