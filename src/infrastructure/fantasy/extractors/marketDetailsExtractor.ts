import type {
  MarketDetailsExtractor,
} from "../../../domain/fantasy/ports.js";
import type { MarketDetails } from "../../../domain/config/interfaces.js";
import { parseMarketDetailsFromHtml } from "../../../application/fantasy/parsers/marketDetailsParser.js";

/**
 * Infrastructure adapter that extracts market-related data
 * from a player's market HTML page.
 *
 * This class delegates all parsing logic to the
 * {@link parseMarketDetailsFromHtml} function and exists
 * solely to satisfy the {@link MarketDetailsExtractor} port.
 */
export class MarketDetailsExtractorImpl
  implements MarketDetailsExtractor
{
  /**
   * Parses market details from the player market HTML.
   *
   * @param html - Raw HTML of the player market page
   * @returns Parsed market details
   */
  extractFromMarketHtml(html: string): MarketDetails {
    return parseMarketDetailsFromHtml(html);
  }
}