import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

import type { 
  MatchEventRow, 
  MatchEvent, 
  MatchScoreDetails, 
  ParsedTeamBlock 
} from "../../../domain/config/interfaces.js";
import { EventType } from "../../../domain/config/interfaces.js";
import type { CheerioNode } from "../../../domain/config/types.js";
import { parseIntSafe, parseFloatSafe } from "../../utils/parsers.js";

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
 * Parsers
 */

// Parse the fantasy events table from a cheerio root.
export function parseFantasyTable($: CheerioAPI): MatchEventRow[] {
  const rows = $(FANTASY_EVENT_ROWS_ID).toArray();

  return rows
    .map((rowNode) => parseRow($, $(rowNode) as CheerioNode))
    .filter((row): row is MatchEventRow => row !== null);
}

// Parse a single row into a MatchEventRow.
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
 * Extractors (columns)
 */

function extractMatchday(row: CheerioNode): number {
  const text = row.find(FANTASY_EVENT_MATCHDAY_ID).first().text().trim(); // "J15"
  return parseIntSafe(text);
}

function extractScoreDetails(
  $: CheerioAPI,
  row: CheerioNode,
): MatchScoreDetails | null {
  // Identify blocks containing <img alt="team"> + <p>goals</p>
  const rawBlocks = row
    .find(FANTASY_EVENT_SCORE_ID)
    .parent()
    .toArray();

  // MUST contain exactly 2 team blocks
  if (rawBlocks.length !== 2) {
    return null;
  }

  const parsedBlocks: ParsedTeamBlock[] = rawBlocks.map((raw): ParsedTeamBlock => {
    const block = $(raw) as CheerioNode;

    // Strictly typed extraction of teamName
    const imgAlt = block.find("img").attr("alt");
    const teamName: string = typeof imgAlt === "string" && imgAlt.trim().length > 0
      ? imgAlt.trim()
      : "Unknown Team";

    // Strictly typed extraction of goals
    const goalsRaw = block.find("p").first().text().trim();
    const goals: number = parseIntSafe(goalsRaw);

    return { teamName, goals };
  });

  // Now parsedBlocks is guaranteed length 2 and fully typed
  const [home, away] = parsedBlocks;

  // FIX: Add this guard clause. 
  // It removes 'undefined' from the types of 'home' and 'away'.
  if (!home || !away) {
    return null;
  }

  // Strict construction of MatchScoreDetails
  // No more errors here because home and away are guaranteed to be defined
  const display: string = `${home.teamName} (${home.goals}) - ${away.teamName} (${away.goals})`;

  const scoreDetails: MatchScoreDetails = {
    homeTeam: home.teamName,
    awayTeam: away.teamName,
    homeGoals: home.goals,
    awayGoals: away.goals,
    display,
  };

  return scoreDetails;
}

function extractTitularity(row: CheerioNode): boolean {
  const svg = row.find(FANTASY_EVENT_TITULARITY_ID).first();
  if (svg.length === 0) {
    return false;
  }

  // Green square with check
  const hasGreenPath = svg.find(FANTASY_EVENT_TITULARITY_FLAG).length > 0;
  return hasGreenPath;
}

export function extractMinutesPlayed(row: CheerioNode): number {
  const text = row.find(FANTASY_EVENT_MINUTES_PLAYED).first().text().trim();
  return parseIntSafe(text);
}

export function extractLaLigaScore(row: CheerioNode): number {
  const text = row
    .find(FANTASY_EVENT_LALIGA_SCORE_ID)
    .first()
    .text()
    .trim();
  return parseIntSafe(text);
}

export function extractBonusScore(row: CheerioNode): number {
  const text = row
    .find(FANTASY_EVENT_BONUS_SCORE_ID)
    .first()
    .text()
    .trim();
  return parseFloatSafe(text);
}

/**
 * Event extractor
 */

export function extractEvents(
  $: CheerioAPI,
  row: CheerioNode,
): MatchEvent[] {
  const eventNodes = row
    .find(FANTASY_EVENT_NODES_ID)
    .toArray();

  return eventNodes.map((node) => {
    const wrapper = $(node) as CheerioNode;
    const minuteText = wrapper.find("p").first().text().trim() || null;
    const minute = minuteText ? parseIntSafe(minuteText) : null;

    const type = detectEventType($, wrapper);

    return { type, minute };
  });
}

/**
 * Detect event type based on the icon shown in the cell.
 * Efficient: each SVG's <path> elements are scanned exactly once.
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
  if (
    fills.has(FANTASY_EVENT_SUB_IN_FILL) ||
    ds.has(FANTASY_EVENT_SUB_IN_D)
  ) {
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

export function parseFantasyEventsFromHtml(html: string): MatchEventRow[] {
  const $ = cheerio.load(html);
  return parseFantasyTable($);
}