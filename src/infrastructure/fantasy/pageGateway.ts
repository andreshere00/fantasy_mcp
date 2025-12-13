import {
    BASE_URL,
    PLAYER_MARKET_BASE_URL,
    USER_AGENT,
  } from "../../domain/config/constants.js";
import type { AnaliticaPageKind } from "../../domain/fantasy/types.js";
import type { AnaliticaPageGateway } from "../../domain/fantasy/ports.js";
import type { HttpClient } from "../http/axiosHtmlClient.js";

export class AnaliticaPageGatewayImpl implements AnaliticaPageGateway {
constructor(private readonly httpClient: HttpClient) {}

private buildPlayerInfoUrl(slug: string): string {
    return `${BASE_URL}/${slug}`;
}

private buildPlayerMarketUrl(slug: string): string {
    return `${PLAYER_MARKET_BASE_URL}/${slug}`;
}

async loadPage(kind: AnaliticaPageKind, slug: string): Promise<string> {
    const headers = { "User-Agent": USER_AGENT };

    if (kind === "playerInfo") {
    const url = this.buildPlayerInfoUrl(slug);
    return this.httpClient.get(url, headers);
    }

    if (kind === "market") {
    const url = this.buildPlayerMarketUrl(slug);
    return this.httpClient.get(url, headers);
    }

    throw new Error(`Unsupported page kind: ${kind}`);
}
}