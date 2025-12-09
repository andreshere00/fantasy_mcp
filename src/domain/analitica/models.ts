import type {
    MatchEventRow,
    PlayerDetails,
    MarketDetails,
  } from "../config/interfaces.js";
import type { PlayerSlug } from "./types.js";


export interface PlayerSnapshot {
slug: PlayerSlug;
fantasyEvents: MatchEventRow[];
playerDetails: PlayerDetails;
marketDetails: MarketDetails;
}

export interface PlayerSnapshotOptions {
includeInfo?: boolean;
includeMarket?: boolean;
}