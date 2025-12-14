import type {
    MatchEventRow,
    PlayerDetails,
    MarketDetails,
  } from "../config/interfaces.js";
import type { PlayerSlug } from "./types.js";


/** 
 * Player Information
**/

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

/** 
 * User Information
**/

export interface SquadPlayer {
  ids: string[];
  name: string;
}

export interface MarketPlayer {
  ids: string[];
  name: string;
}

export interface OpponentInfo {
  ids: string[];
  name: string;
  formation?: string;
  keyPlayers?: string[];
}

export interface NamedPlayer {
  id: string;
  name: string;
}