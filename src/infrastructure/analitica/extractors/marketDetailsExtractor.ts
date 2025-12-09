import type {
  MarketDetailsExtractor,
} from "../../../domain/analitica/ports.js";
import type { MarketDetails } from "../../../domain/config/interfaces.js";
import { parseMarketDetailsFromHtml } from "../../../application/analitica/parsers/marketDetailsParser.js";

export class MarketDetailsExtractorImpl implements MarketDetailsExtractor {
  extractFromMarketHtml(html: string): MarketDetails {
    return parseMarketDetailsFromHtml(html);
  }
}