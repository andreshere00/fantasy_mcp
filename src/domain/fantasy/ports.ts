import type {
    MatchEventRow,
    PlayerDetails,
    MarketDetails,
  } from "../config/interfaces.js";
import type { AnaliticaPageKind } from "./types.js";
import type { MarketPlayer, OpponentInfo, SquadPlayer } from './models.js';

export interface AnaliticaPageGateway {
loadPage(kind: AnaliticaPageKind, slug: string): Promise<string>; // HTML
}

export interface FantasyEventsExtractor {
extractFromInfoHtml(html: string): MatchEventRow[];
}

export interface PlayerDetailsExtractor {
extractFromInfoHtml(html: string): PlayerDetails;
}

export interface MarketDetailsExtractor {
extractFromMarketHtml(html: string): MarketDetails;
}

export interface AvailableBalancePort {
  getAvailableBalance(): Promise<number>;
}

export interface SquadPlayersPort {
  getSquadPlayers(): Promise<SquadPlayer[]>;
}

export interface AvailableMarketPlayersPort {
  getAvailableMarketPlayers(): Promise<MarketPlayer[]>;
}

export interface OpponentsInfoPort {
  getOpponentsInfo(): Promise<OpponentInfo[]>;
}