import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

import type {
  MatchEventRow,
  MatchEvent,
  MatchScoreDetails,
  ParsedTeamBlock,
} from "../../../domain/config/models.js";
import { EventType } from "../../../domain/config/models.js";
import type { CheerioNode } from "../../../domain/config/alias.js";
import { parseIntSafe, parseFloatSafe } from "../../utils/helpers.js";

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
} from "../../../domain/config/constants.js";

/**
 * ======================
 * Parsers
 * ======================
 */

/**
 * Parses the fantasy events table from an already-loaded Cheerio root.
 *
 * This function:
 * - selects all match rows from the events table
 * - converts each row into a {@link MatchEventRow}
 * - filters out incomplete/invalid rows (e.g., missing matchday or score)
 *
 * @param $ - Cheerio API root for the info HTML document
 * @returns A list of parsed match event rows
 */
export function parseFantasyTable($: CheerioAPI): MatchEventRow[] {
  const rows = $(FANTASY_EVENT_ROWS_ID).toArray();

  return rows
    .map((rowNode) => parseRow($, $(rowNode) as CheerioNode))
    .filter((row): row is MatchEventRow => row !== null);
}

/**
 * Parses a single HTML table row into a {@link MatchEventRow}.
 *
 * The row is considered invalid and returns `null` if:
 * - matchday cannot be extracted
 * - score details cannot be extracted (e.g., malformed team blocks)
 *
 * @param $ - Cheerio API root for the info HTML document
 * @param row - Cheerio node pointing to a single table row
 * @returns Parsed row or `null` if required fields are missing
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
 * Extractors (columns)
 * ======================
 */

/**
 * Extracts the matchday number from a fantasy events row.
 *
 * The HTML typically contains values like `"J15"`, where `15` is the matchday.
 *
 * @param row - Cheerio node pointing to a single table row
 * @returns Parsed matchday number (falls back to `0` if unparsable)
 */
function extractMatchday(row: CheerioNode): number {
  const text = row.find(FANTASY_EVENT_MATCHDAY_ID).first().text().trim();
  return parseIntSafe(text);
}

/**
 * Extracts score details from a fantasy events row.
 *
 * The score cell is expected to contain exactly two team blocks:
 * - home: `<img alt="TEAM">` + `<p>goals</p>`
 * - away: `<img alt="TEAM">` + `<p>goals</p>`
 *
 * If the structure is not as expected (e.g., not exactly two blocks),
 * this function returns `null`.
 *
 * @param $ - Cheerio API root for the info HTML document
 * @param row - Cheerio node pointing to a single table row
 * @returns Parsed score details or `null` if the score structure is invalid
 */
function extractScoreDetails(
  $: CheerioAPI,
  row: CheerioNode,
): MatchScoreDetails | null {
  const rawBlocks = row.find(FANTASY_EVENT_SCORE_ID).parent().toArray();

  // Must contain exactly 2 team blocks (home + away)
  if (rawBlocks.length !== 2) {
    return null;
  }

  const parsedBlocks: ParsedTeamBlock[] = rawBlocks.map(
    (raw): ParsedTeamBlock => {
      const block = $(raw) as CheerioNode;

      const imgAlt = block.find("img").attr("alt");
      const teamName: string =
        typeof imgAlt === "string" && imgAlt.trim().length > 0
          ? imgAlt.trim()
          : "Unknown Team";

      const goalsRaw = block.find("p").first().text().trim();
      const goals: number = parseIntSafe(goalsRaw);

      return { teamName, goals };
    },
  );

  const [home, away] = parsedBlocks;
  if (!home || !away) {
    return null;
  }

  const display: string = `${home.teamName} (${home.goals}) - ${away.teamName} (${away.goals})`;

  return {
    homeTeam: home.teamName,
    awayTeam: away.teamName,
    homeGoals: home.goals,
    awayGoals: away.goals,
    display,
  };
}

/**
 * Determines whether the player was a starter (titular) for the match.
 *
 * The UI renders a green checked square inside the titularity SVG when true.
 *
 * @param row - Cheerio node pointing to a single table row
 * @returns `true` if a starter flag is detected; otherwise `false`
 */
function extractTitularity(row: CheerioNode): boolean {
  const svg = row.find(FANTASY_EVENT_TITULARITY_ID).first();
  if (svg.length === 0) {
    return false;
  }

  const hasGreenPath = svg.find(FANTASY_EVENT_TITULARITY_FLAG).length > 0;
  return hasGreenPath;
}

/**
 * Extracts minutes played from the row.
 *
 * @param row - Cheerio node pointing to a single table row
 * @returns Minutes played (falls back to `0` if missing/unparsable)
 */
export function extractMinutesPlayed(row: CheerioNode): number {
  const text = row.find(FANTASY_EVENT_MINUTES_PLAYED).first().text().trim();
  return parseIntSafe(text);
}

/**
 * Extracts LaLiga points/score for the match (as displayed by the site).
 *
 * @param row - Cheerio node pointing to a single table row
 * @returns LaLiga score (falls back to `0` if missing/unparsable)
 */
export function extractLaLigaScore(row: CheerioNode): number {
  const text = row.find(FANTASY_EVENT_LALIGA_SCORE_ID).first().text().trim();
  return parseIntSafe(text);
}

/**
 * Extracts bonus score for the match.
 *
 * Bonus values may use European numeric formats; parsing is delegated to {@link parseFloatSafe}.
 *
 * @param row - Cheerio node pointing to a single table row
 * @returns Bonus score (falls back to `0` if missing/unparsable)
 */
export function extractBonusScore(row: CheerioNode): number {
  const text = row.find(FANTASY_EVENT_BONUS_SCORE_ID).first().text().trim();
  return parseFloatSafe(text);
}

/**
 * ======================
 * Event extractor
 * ======================
 */

/**
 * Extracts match events (cards, goals, assists, substitutions, etc.) from a row.
 *
 * Each event is built from:
 * - event type (detected via icon structure)
 * - minute (if present)
 *
 * @param $ - Cheerio API root for the info HTML document
 * @param row - Cheerio node pointing to a single table row
 * @returns List of parsed events for that match
 */
export function extractEvents($: CheerioAPI, row: CheerioNode): MatchEvent[] {
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
 * Detects an {@link EventType} based on the icon shown in the event cell.
 *
 * Rules (in order):
 * 1. Cards: identified by the presence of specific inner divs (no SVG required)
 * 2. SVG-based events: scans `<path>` attributes (`fill` and `d`) once and
 *    compares them against known constants to classify substitutions, goals, assists, etc.
 *
 * If no known signature matches, the event is classified as {@link EventType.OTHER}.
 *
 * @param $ - Cheerio API root for the info HTML document
 * @param node - Cheerio node pointing to a single event wrapper
 * @returns Detected event type
 */
function detectEventType($: CheerioAPI, node: CheerioNode): EventType {
  // 1) Cards (no SVG, just inner divs)
  if (node.find(FANTASY_EVENT_YELLOW_CARD_ID).length > 0) {
    return EventType.YELLOW_CARD;
  }
  if (node.find(FANTASY_EVENT_RED_CARD_ID).length > 0) {
    return EventType.RED_CARD;
  }

  // 2) SVG-based events
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

    if (fill) {
      fills.add(fill);
    }
    if (d) {
      ds.add(d);
    }
  }

  // 2.a Substitution arrows
  if (fills.has(FANTASY_EVENT_SUB_IN_FILL) || ds.has(FANTASY_EVENT_SUB_IN_D)) {
    return EventType.SUB_IN;
  }

  if (
    fills.has(FANTASY_EVENT_SUB_OUT_FILL) ||
    ds.has(FANTASY_EVENT_SUB_OUT_D)
  ) {
    return EventType.SUB_OUT;
  }

  // 2.b Goals and assists
  if (fills.has(FANTASY_EVENT_GOAL_FILL)) {
    return EventType.GOAL;
  }

  if (fills.has(FANTASY_EVENT_ASSIST_FILL)) {
    return EventType.ASSIST;
  }

  return EventType.OTHER;
}

/**
 * Convenience function to parse fantasy events directly from a raw HTML string.
 *
 * @param html - Raw HTML of the player info page
 * @returns Parsed match event rows
 */
export function parseFantasyEventsFromHtml(html: string): MatchEventRow[] {
  const $ = cheerio.load(html);
  return parseFantasyTable($);
}