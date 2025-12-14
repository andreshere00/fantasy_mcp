import {
    BASE_URL,
    PLAYER_MARKET_BASE_URL,
    USER_AGENT,
  } from "../../domain/config/constants.js";
  import type { AnaliticaPageKind } from "../../domain/fantasy/types.js";
  import type { AnaliticaPageGateway } from "../../domain/fantasy/ports.js";
  import type { HttpClient } from "../http/axiosHtmlClient.js";
  
  /**
   * Infrastructure gateway responsible for loading HTML pages
   * from the Analítica Fantasy website.
   *
   * This gateway:
   * - maps domain-level page kinds to concrete URLs
   * - applies required HTTP headers (e.g. User-Agent)
   * - delegates HTTP execution to an injected {@link HttpClient}
   *
   * It intentionally contains **no parsing logic**.
   */
  export class AnaliticaPageGatewayImpl implements AnaliticaPageGateway {
    /**
     * @param httpClient - HTTP client used to fetch remote HTML pages
     */
    constructor(private readonly httpClient: HttpClient) {}
  
    /**
     * Builds the URL for a player's information page.
     *
     * @param slug - Player slug identifier
     * @returns Fully qualified player info URL
     */
    private buildPlayerInfoUrl(slug: string): string {
      return `${BASE_URL}/${slug}`;
    }
  
    /**
     * Builds the URL for a player's market page.
     *
     * @param slug - Player slug identifier
     * @returns Fully qualified player market URL
     */
    private buildPlayerMarketUrl(slug: string): string {
      return `${PLAYER_MARKET_BASE_URL}/${slug}`;
    }
  
    /**
     * Loads a page of the given kind for the specified player.
     *
     * @param kind - Type of page to load (info or market)
     * @param slug - Player slug identifier
     * @returns Raw HTML string of the requested page
     *
     * @throws Error if the page kind is not supported
     */
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
