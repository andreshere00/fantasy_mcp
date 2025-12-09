import { AxiosHtmlClient } from "../../infrastructure/http/axiosHtmlClient.js";
import { AnaliticaPageGatewayImpl } from "../../infrastructure/fantasy/pageGateway.js";
import { FantasyEventsExtractorImpl } from "../../infrastructure/fantasy/extractors/fantasyEventsExtractor.js";
import { PlayerDetailsExtractorImpl } from "../../infrastructure/fantasy/extractors/playerDetailsExtractor.js";
import { MarketDetailsExtractorImpl } from "../../infrastructure/fantasy/extractors/marketDetailsExtractor.js";
import { FetchPlayerSnapshotUseCase } from "../../application/fantasy/e2e/fetchPlayerSnapshot.js";

async function run(): Promise<void> {
  const slug: string = process.argv[2] ?? "pedri";

  console.log(`Fetching data for player: ${slug}`);

  try {
    // Infra
    const httpClient = new AxiosHtmlClient();
    const pageGateway = new AnaliticaPageGatewayImpl(httpClient);

    // Extractors
    const fantasyEventsExtractor = new FantasyEventsExtractorImpl();
    const playerDetailsExtractor = new PlayerDetailsExtractorImpl();
    const marketDetailsExtractor = new MarketDetailsExtractorImpl();

    // Use case
    const useCase = new FetchPlayerSnapshotUseCase(
      pageGateway,
      fantasyEventsExtractor,
      playerDetailsExtractor,
      marketDetailsExtractor,
    );

    const snapshot = await useCase.execute(slug);

    console.log(
      `Parsed ${snapshot.fantasyEvents.length} fantasy rows for slug "${slug}":`,
    );
    console.log(JSON.stringify(snapshot.fantasyEvents, null, 2));

    console.log("Player details:");
    console.log(JSON.stringify(snapshot.playerDetails, null, 2));

    console.log("Market details:");
    console.log(JSON.stringify(snapshot.marketDetails, null, 2));
  } catch (error) {
    console.error(`Error fetching or parsing data for slug "${slug}":`, error);
    process.exit(1);
  }
}

void run();