import type {
    FantasyEventsExtractor,
  } from "../../../domain/analitica/ports.js";
  import type { MatchEventRow } from "../../../domain/config/interfaces.js";
  import { parseFantasyEventsFromHtml } from "../../../application/analitica/parsers/fantasyEventParser.js";
  
export class FantasyEventsExtractorImpl implements FantasyEventsExtractor {
extractFromInfoHtml(html: string): MatchEventRow[] {
    return parseFantasyEventsFromHtml(html);
}
}