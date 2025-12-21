import type {
  FantasyEventsExtractor,
} from "../../../domain/fantasy/ports.js";
import type { MatchEventRow } from "../../../domain/config/models.js";
import { parseFantasyEventsFromHtml } from "../../../application/fantasy/parsers/fantasyEvent.parser.js";

/**
 * Infrastructure adapter that extracts fantasy match events
 * from a player's information HTML page.
 *
 * This implementation is a thin wrapper around the
 * {@link parseFantasyEventsFromHtml} parser, fulfilling the
 * {@link FantasyEventsExtractor} port contract.
 */
export class FantasyEventsExtractorImpl
  implements FantasyEventsExtractor
{
  /**
   * Parses fantasy match events from the player info HTML.
   *
   * @param html - Raw HTML of the player information page
   * @returns List of parsed fantasy match event rows
   */
  extractFromInfoHtml(html: string): MatchEventRow[] {
    return parseFantasyEventsFromHtml(html);
  }
}