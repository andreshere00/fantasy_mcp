import type {
    PlayerSnapshot,
    PlayerSnapshotOptions
  } from "../../../domain/fantasy/models.js";
import type { PlayerSlug } from "../../../domain/fantasy/types.js";
import type {
  AnaliticaPageGateway,
  FantasyEventsExtractor,
  PlayerDetailsExtractor,
  MarketDetailsExtractor,
} from "../../../domain/fantasy/ports.js";
import type {
  MatchEventRow,
  PlayerDetails,
  MarketDetails,
} from "../../../domain/config/interfaces.js";


export class FetchPlayerSnapshotUseCase {
  constructor(
    private readonly pageGateway: AnaliticaPageGateway,
    private readonly fantasyEventsExtractor: FantasyEventsExtractor,
    private readonly playerDetailsExtractor: PlayerDetailsExtractor,
    private readonly marketDetailsExtractor: MarketDetailsExtractor,
  ) {}

  async execute(
    slug: PlayerSlug,
    options: PlayerSnapshotOptions = {},
  ): Promise<PlayerSnapshot> {
    const { includeInfo = true, includeMarket = true } = options;

    const infoHtmlPromise = includeInfo
      ? this.pageGateway.loadPage("playerInfo", slug)
      : Promise.resolve<string | null>(null);

    const marketHtmlPromise = includeMarket
      ? this.pageGateway.loadPage("market", slug)
      : Promise.resolve<string | null>(null);

    const [infoHtml, marketHtml] = await Promise.all([
      infoHtmlPromise,
      marketHtmlPromise,
    ]);

    let fantasyEvents: MatchEventRow[] = [];
    let playerDetails: PlayerDetails = {
      name: "",
      team: "",
      position: "unknown",
      isAvailable: false,
      titularityChance: Number.NaN,
      trustability: Number.NaN,
      expectedScoreAsStarter: Number.NaN,
      expectedScoreAsSubstitute: Number.NaN,
    };

    if (infoHtml) {
      fantasyEvents = this.fantasyEventsExtractor.extractFromInfoHtml(infoHtml);
      playerDetails = this.playerDetailsExtractor.extractFromInfoHtml(infoHtml);
    }

    let marketDetails: MarketDetails = {
      allTimeFantasyMarket: {
        maxPrice: { value: 0, date: "" },
        minPrice: { value: 0, date: "" },
        highestRaise: { value: 0, date: "" },
        highestDrop: { value: 0, date: "" },
        bestBid: 0,
        maxBid: 0,
      },
      lastFantasyMarketValues: {
        currentValue: 0,
        lastDay: { amount: 0, percent: 0 },
        last2Days: { amount: 0, percent: 0 },
        last3Days: { amount: 0, percent: 0 },
        last5Days: { amount: 0, percent: 0 },
        last10Days: { amount: 0, percent: 0 },
        last14Days: { amount: 0, percent: 0 },
        last29Days: { amount: 0, percent: 0 },
      },
    };

    if (marketHtml) {
      marketDetails = this.marketDetailsExtractor.extractFromMarketHtml(marketHtml);
    }

    return {
      slug,
      fantasyEvents,
      playerDetails,
      marketDetails,
    };
  }
}