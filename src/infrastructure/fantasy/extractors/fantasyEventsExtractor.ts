import type {
    FantasyEventsExtractor,
  } from "../../../domain/fantasy/ports.js";
  import type { MatchEventRow } from "../../../domain/config/interfaces.js";
  import { parseFantasyEventsFromHtml } from "../../../application/fantasy/parsers/fantasyEventParser.js";
  
export class FantasyEventsExtractorImpl implements FantasyEventsExtractor {
extractFromInfoHtml(html: string): MatchEventRow[] {
    return parseFantasyEventsFromHtml(html);
}
}