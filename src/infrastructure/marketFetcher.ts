import axios from "axios";

import {
  PLAYER_MARKET_BASE_URL,
  USER_AGENT,
} from "../domain/config/constants.js";
import { parseMarketDetailsFromHtml } from "../application/services/marketDetails.js";
import type { MarketDetails } from "../domain/config/interfaces.js";

/**
 * Builds the URL for the market details page.
 *
 * @param slug Player slug (e.g., "pedri").
 * @returns Fully-qualified URL.
 */
export function buildPlayerMarketUrl(slug: string): string {
  return `${PLAYER_MARKET_BASE_URL}/${slug}`;
}

/**
 * Fetches and parses data from the market endpoint:
 *   https://www.analiticafantasy.com/jugadores/subidas-mercado-la-liga-fantasy/{slug}
 *
 * @param slug Player slug.
 * @returns Parsed MarketDetails.
 */
export async function fetchPlayerMarket(
  slug: string,
): Promise<MarketDetails> {
  const url = buildPlayerMarketUrl(slug);

  const response = await axios.get<string>(url, {
    headers: {
      "User-Agent": USER_AGENT,
    },
    responseType: "text",
  });

  const html = response.data;
  return parseMarketDetailsFromHtml(html);
}