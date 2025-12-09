import type {
    MatchEventRow,
    PlayerDetails,
    MarketDetails,
  } from "../config/interfaces.js";
import type { AnaliticaPageKind } from "./types.js";

export interface AnaliticaPageGateway {
loadPage(kind: AnaliticaPageKind, slug: string): Promise<string>; // HTML
}

// Extractores de alto nivel: reciben HTML (ya cargado) y devuelven dominio
export interface FantasyEventsExtractor {
extractFromInfoHtml(html: string): MatchEventRow[];
}

export interface PlayerDetailsExtractor {
extractFromInfoHtml(html: string): PlayerDetails;
}

export interface MarketDetailsExtractor {
extractFromMarketHtml(html: string): MarketDetails;
}