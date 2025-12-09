import type {
    PlayerDetailsExtractor,
  } from "../../../domain/fantasy/ports.js";
  import type { PlayerDetails } from "../../../domain/config/interfaces.js";
  import { parsePlayerDetailsFromHtml } from "../../../application/fantasy/parsers/playerDetailsParser.js";
  
  export class PlayerDetailsExtractorImpl implements PlayerDetailsExtractor {
    extractFromInfoHtml(html: string): PlayerDetails {
      return parsePlayerDetailsFromHtml(html);
    }
  }
