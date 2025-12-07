// src/modules/infoFetcher.ts

import axios from "axios";
import * as cheerio from "cheerio";

import { BASE_URL, USER_AGENT } from "../domain/config/constants.js";
import { parseFantasyTable } from "../application/services/fantasyEvent.js";
import { parsePlayerDetailsFromHtml } from "../application/services/playerDetails.js";
import type {
  MatchEventRow,
  PlayerDetails,
} from "../domain/config/interfaces.js";

/**
 * Combined result of the "info" endpoint:
 *  - fantasy event rows
 *  - player details
 */
export interface PlayerInfoResult {
  fantasyEvents: MatchEventRow[];
  playerDetails: PlayerDetails;
}

/**
 * Builds the URL for the main player info page.
 *
 * @param slug Player slug (e.g., "pedri").
 * @returns Fully-qualified URL.
 */
export function buildPlayerInfoUrl(slug: string): string {
  return `${BASE_URL}/${slug}`;
}

/**
 * Fetches and parses data from the main info endpoint:
 *   https://www.analiticafantasy.com/jugadores/{slug}
 *
 * @param slug Player slug.
 * @returns Parsed fantasy events and player details.
 */
export async function fetchPlayerInfo(
  slug: string,
): Promise<PlayerInfoResult> {
  const url = buildPlayerInfoUrl(slug);

  const response = await axios.get<string>(url, {
    headers: {
      "User-Agent": USER_AGENT,
    },
    responseType: "text",
  });

  const html = response.data;
  const $ = cheerio.load(html);

  const fantasyEvents: MatchEventRow[] = parseFantasyTable($);
  const playerDetails: PlayerDetails = parsePlayerDetailsFromHtml(html);

  return {
    fantasyEvents,
    playerDetails,
  };
}