import type {
  PlayerDetailsExtractor,
} from "../../../domain/fantasy/ports.js";
import type { PlayerDetails } from "../../../domain/config/models.js";
import { parsePlayerDetailsFromHtml } from "../../../application/fantasy/parsers/playerDetails.parser.js";

/**
 * Infrastructure adapter that extracts player details
 * from a player's information HTML page.
 *
 * This implementation acts as a bridge between the
 * domain-level {@link PlayerDetailsExtractor} port
 * and the application-level HTML parser.
 */
export class PlayerDetailsExtractorImpl
  implements PlayerDetailsExtractor
{
  /**
   * Parses player details from the player info HTML.
   *
   * @param html - Raw HTML of the player information page
   * @returns Parsed player details
   */
  extractFromInfoHtml(html: string): PlayerDetails {
    return parsePlayerDetailsFromHtml(html);
  }
}