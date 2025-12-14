import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

import type {
  MatchEventRow,
  MatchEvent,
  MatchScoreDetails,
  ParsedTeamBlock,
} from "../../domain/config/interfaces.js";
import { EventType } from "../../domain/config/interfaces.js";
import type { CheerioNode } from "../../domain/config/types.js";
import { parseIntSafe, parseFloatSafe } from "../utils/helpers.js";

import {
  FANTASY_EVENT_MATCHDAY_ID,
  FANTASY_EVENT_SCORE_ID,
  FANTASY_EVENT_TITULARITY_ID,
  FANTASY_EVENT_TITULARITY_FLAG,
  FANTASY_EVENT_MINUTES_PLAYED,
  FANTASY_EVENT_LALIGA_SCORE_ID,
  FANTASY_EVENT_BONUS_SCORE_ID,
  FANTASY_EVENT_NODES_ID,
  FANTASY_EVENT_YELLOW_CARD_ID,
  FANTASY_EVENT_RED_CARD_ID,
  FANTASY_EVENT_SUB_IN_FILL,
  FANTASY_EVENT_SUB_OUT_FILL,
  FANTASY_EVENT_SUB_IN_D,
  FANTASY_EVENT_SUB_OUT_D,
  FANTASY_EVENT_GOAL_FILL,
  FANTASY_EVENT_ASSIST_FILL,
  FANTASY_EVENT_ROWS_ID,
} from "../../domain/config/constants.js";

/**
 * ======================
 * Parsers
 * ======================
 */

/**
 * Parses the fantasy events table from a Cheerio root.
 *
 * This function:
 * - selects all match rows from the fantasy events table
 * - parses each row into a {@link MatchEventRow}
 * - filters out invalid or incomplete rows
 *
 * @param $ - Cheerio API instance for the loaded HTML document
 * @returns List of parsed fantasy match event rows
 */
export function parseFantasyTable($: CheerioAPI): MatchEventRow[] {
  const rows = $(FANTASY_EVENT_ROWS_ID).toArray();

  return rows
    .map((rowNode) => parseRow($, $(rowNode) as CheerioNode))
    .filter((row): row is MatchEventRow => row !== null);
}

/**
 * Parses a single fantasy table row into a {@link MatchEventRow}.
 *
 * A row is considered invalid if:
 * - the matchday cannot be extracted
 * - the score block does not contain exactly two teams
 *
 * @param $ - Cheerio API instance
 * @param row - Cheerio node pointing to a single table row
 * @returns Parsed match event row or `null` if required data is missing
 */
function parseRow($: CheerioAPI, row: CheerioNode): MatchEventRow | null {
  const matchday = extractMatchday(row);
  if (!matchday) {
    return null;
  }

  const score = extractScoreDetails($, row);
  if (!score) {
    return null;
  }

  const events = extractEvents($, row);
  const titularity = extractTitularity(row);
  const minutesPlayed = extractMinutesPlayed(row);
  const laLigaScore = extractLaLigaScore(row);
  const bonusScore = extractBonusScore(row);

  return {
    matchday,
    score,
    events,
    titularity,
    minutesPlayed,
    laLigaScore,
    bonusScore,
  };
}

/**
 * ======================
 * Column Extractors
 * ======================
 */

/**
 * Extracts the matchday number from a row.
 *
 * Example HTML value: `"J15"` → `15`
 *
 * @param row - Cheerio node pointing to a table row
 * @returns Parsed matchday number (defaults to `0` if invalid)
 */
function extractMatchday(row: CheerioNode): number {
  const text = row.find(FANTASY_EVENT_MATCHDAY_ID).first().text().trim();
  return parseIntSafe(text);
}

/**
 * Extracts match score details (home/away teams and goals).
 *
 * The score cell is expected to contain **exactly two team blocks**,
 * each composed of:
 * - an `<img alt="TEAM_NAME">`
 * - a `<p>` element with the goals scored
 *
 * @param $ - Cheerio API instance
 * @param row - Cheerio node pointing to a table row
 * @returns Parsed score details or `null` if the structure is invalid
 */
function extractScoreDetails(
  $: CheerioAPI,
  row: CheerioNode,
): MatchScoreDetails | null {
  const rawBlocks = row
    .find(FANTASY_EVENT_SCORE_ID)
    .parent()
    .toArray();

  if (rawBlocks.length !== 2) {
    return null;
  }

  const parsedBlocks: ParsedTeamBlock[] = rawBlocks.map(
    (raw): ParsedTeamBlock => {
      const block = $(raw) as CheerioNode;

      const imgAlt = block.find("img").attr("alt");
      const teamName =
        typeof imgAlt === "string" && imgAlt.trim().length > 0
          ? imgAlt.trim()
          : "Unknown Team";

      const goalsRaw = block.find("p").first().text().trim();
      const goals = parseIntSafe(goalsRaw);

      return { teamName, goals };
    },
  );

  const [home, away] = parsedBlocks;
  if (!home || !away) {
    return null;
  }

  const display = `${home.teamName} (${home.goals}) - ${away.teamName} (${away.goals})`;

  return {
    homeTeam: home.teamName,
    awayTeam: away.teamName,
    homeGoals: home.goals,
    awayGoals: away.goals,
    display,
  };
}

/**
 * Determines whether the player started the match.
 *
 * The UI indicates titularity with a green checked square SVG.
 *
 * @param row - Cheerio node pointing to a table row
 * @returns `true` if the titularity indicator is present
 */
function extractTitularity(row: CheerioNode): boolean {
  const svg = row.find(FANTASY_EVENT_TITULARITY_ID).first();
  if (svg.length === 0) {
    return false;
  }

  return svg.find(FANTASY_EVENT_TITULARITY_FLAG).length > 0;
}

/**
 * Extracts the number of minutes played in the match.
 *
 * @param row - Cheerio node pointing to a table row
 * @returns Minutes played (defaults to `0` if missing)
 */
export function extractMinutesPlayed(row: CheerioNode): number {
  const text = row.find(FANTASY_EVENT_MINUTES_PLAYED).first().text().trim();
  return parseIntSafe(text);
}

/**
 * Extracts the LaLiga fantasy score for the match.
 *
 * @param row - Cheerio node pointing to a table row
 * @returns LaLiga score (defaults to `0` if missing)
 */
export function extractLaLigaScore(row: CheerioNode): number {
  const text = row
    .find(FANTASY_EVENT_LALIGA_SCORE_ID)
    .first()
    .text()
    .trim();
  return parseIntSafe(text);
}

/**
 * Extracts the bonus score awarded for the match.
 *
 * @param row - Cheerio node pointing to a table row
 * @returns Bonus score (defaults to `0` if missing)
 */
export function extractBonusScore(row: CheerioNode): number {
  const text = row
    .find(FANTASY_EVENT_BONUS_SCORE_ID)
    .first()
    .text()
    .trim();
  return parseFloatSafe(text);
}

/**
 * ======================
 * Event Extraction
 * ======================
 */

/**
 * Extracts all in-match events (cards, goals, assists, substitutions).
 *
 * Each event includes:
 * - event type (detected from icon structure)
 * - minute (if present)
 *
 * @param $ - Cheerio API instance
 * @param row - Cheerio node pointing to a table row
 * @returns List of parsed match events
 */
export function extractEvents(
  $: CheerioAPI,
  row: CheerioNode,
): MatchEvent[] {
  const eventNodes = row.find(FANTASY_EVENT_NODES_ID).toArray();

  return eventNodes.map((node) => {
    const wrapper = $(node) as CheerioNode;
    const minuteText = wrapper.find("p").first().text().trim() || null;
    const minute = minuteText ? parseIntSafe(minuteText) : null;

    const type = detectEventType($, wrapper);

    return { type, minute };
  });
}

/**
 * Detects the {@link EventType} represented by an event icon.
 *
 * Detection strategy:
 * 1. Cards: detected via specific DOM nodes (no SVG)
 * 2. SVG-based events: inspect `<path>` attributes (`fill` and `d`)
 *
 * Each SVG is scanned exactly once for performance.
 *
 * @param $ - Cheerio API instance
 * @param node - Cheerio node pointing to an event wrapper
 * @returns Detected event type
 */
function detectEventType($: CheerioAPI, node: CheerioNode): EventType {
  if (node.find(FANTASY_EVENT_YELLOW_CARD_ID).length > 0) {
    return EventType.YELLOW_CARD;
  }
  if (node.find(FANTASY_EVENT_RED_CARD_ID).length > 0) {
    return EventType.RED_CARD;
  }

  const svg = node.find("svg").first();
  if (svg.length === 0) {
    return EventType.OTHER;
  }

  const pathNodes = svg.find("path").toArray();
  if (pathNodes.length === 0) {
    return EventType.OTHER;
  }

  const fills = new Set<string>();
  const ds = new Set<string>();

  for (const raw of pathNodes) {
    const pathEl = $(raw);
    const fill = pathEl.attr("fill");
    const d = pathEl.attr("d");

    if (fill) fills.add(fill);
    if (d) ds.add(d);
  }

  if (fills.has(FANTASY_EVENT_SUB_IN_FILL) || ds.has(FANTASY_EVENT_SUB_IN_D)) {
    return EventType.SUB_IN;
  }

  if (
    fills.has(FANTASY_EVENT_SUB_OUT_FILL) ||
    ds.has(FANTASY_EVENT_SUB_OUT_D)
  ) {
    return EventType.SUB_OUT;
  }

  if (fills.has(FANTASY_EVENT_GOAL_FILL)) {
    return EventType.GOAL;
  }

  if (fills.has(FANTASY_EVENT_ASSIST_FILL)) {
    return EventType.ASSIST;
  }

  return EventType.OTHER;
}

/**
 * Convenience helper to parse fantasy events directly from raw HTML.
 *
 * @param html - Raw HTML string of the player info page
 * @returns Parsed fantasy match event rows
 */
export function parseFantasyEventsFromHtml(html: string): MatchEventRow[] {
  const $ = cheerio.load(html);
  return parseFantasyTable($);
}
