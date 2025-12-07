// src/main.ts

import { dispatchPlayerData } from "./infrastructure/dispatcher.js";

/**
 * CLI entrypoint:
 *  - reads optional slug from CLI (default: "pedri")
 *  - uses the dispatcher to load all data
 *  - prints fantasy events, player details and market details
 */
async function run(): Promise<void> {
  const slug: string = process.argv[2] ?? "pedri";

  console.log(`Fetching data for player: ${slug}`);

  try {
    const snapshot = await dispatchPlayerData(slug);

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