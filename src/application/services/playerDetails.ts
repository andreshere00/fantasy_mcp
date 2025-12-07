// src/modules/playerDetails.ts

import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';

import {
  AVAILABILITY_FILL_COLOR,
  PLAYER_DETAILS_LABEL_TEXT,
  PLAYER_DETAILS_SELECTORS,
  POSITION_CODE_MAP,
} from '../../domain/config/constants.js';
import type { PlayerDetails, } from '../../domain/config/interfaces.js';
import type { PlayerPosition } from '../../domain/config/types.js';
import { parsePercentageToDecimal, parseScore } from '../utils/parsers.js';

/**
 * Maps a short position code (e.g., "MC") to a normalized PlayerPosition value.
 *
 * @param rawCode Raw position code extracted from the HTML.
 * @returns Normalized PlayerPosition.
 */
const mapPositionCode = (rawCode: string): PlayerPosition => {
  const normalizedCode = rawCode.trim().toUpperCase();
  const mapped = POSITION_CODE_MAP[normalizedCode];

  if (!mapped) {
    return 'unknown';
  }

  return mapped;
};

/**
 * Determines whether the player is available by checking for an SVG path
 * with the availability fill color inside the availability container.
 *
 * @param $ Cheerio API instance.
 * @returns True if the availability indicator is present with the expected color.
 */
const getAvailability = ($: CheerioAPI): boolean => {
  const selector = `${PLAYER_DETAILS_SELECTORS.availabilityContainer} path`;
  const fillValue = $(selector).attr('fill');

  if (!fillValue) {
    return false;
  }

  return fillValue.trim().toUpperCase() === AVAILABILITY_FILL_COLOR.toUpperCase();
};

/**
 * Extracts titularity chance and trustability stats from the HTML.
 *
 * Assumption:
 *   - The first "css-iplaw2" element corresponds to titularityChance.
 *   - The second "css-iplaw2" element corresponds to trustability.
 *
 * @param $ Cheerio API instance.
 * @returns Tuple [titularityChance, trustability].
 */
const getPercentageStats = ($: CheerioAPI): [number, number] => {
  const extractPercentageByLabel = (labelText: string): number => {
    // Find the <p> with the label "Titular" / "Seguridad"
    const label = $(PLAYER_DETAILS_SELECTORS.statLabel)
      .filter((_, el) => $(el).text().includes(labelText))
      .first();

    if (!label.length) {
      return NaN;
    }

    // This <div> is the row container for that stat
    const container = label.closest('div.MuiBox-root');

    // Prefer the main percentage <p> (css-iplaw2)
    const percentageElement = container
      .find(PLAYER_DETAILS_SELECTORS.percentageStats)
      .first();

    if (!percentageElement.length) {
      return NaN;
    }

    // Clone and remove any nested <style> tags that inject CSS text
    const cleaned = percentageElement.clone();
    cleaned.find('style').remove();

    let raw = cleaned.text().trim();

    // Fallback: if for some reason still empty, try the span
    if (!raw) {
      const span = container
        .find(PLAYER_DETAILS_SELECTORS.statSpan)
        .first();

      raw = span.text().trim();
    }

    return parsePercentageToDecimal(raw);
  };

  const titularityChance = extractPercentageByLabel(
    PLAYER_DETAILS_LABEL_TEXT.titular,
  );
  const trustability = extractPercentageByLabel(
    PLAYER_DETAILS_LABEL_TEXT.trust,
  );

  return [titularityChance, trustability];
};
/**
 * Extracts expected scores (starter and substitute) from the HTML.
 *
 * Assumption:
 *   - The first "css-18s8kw9" element corresponds to expectedScoreAsStarter.
 *   - The second "css-18s8kw9" element corresponds to expectedScoreAsSubstitute.
 *
 * @param $ Cheerio API instance.
 * @returns Tuple [expectedScoreAsStarter, expectedScoreAsSubstitute].
 */
const getExpectedScores = ($: CheerioAPI): [number, number] => {
  const extractScoreByLabel = (labelText: string): number => {
    const label = $(PLAYER_DETAILS_SELECTORS.statLabel)
      .filter((_, el) => $(el).text().includes(labelText))
      .first();

    if (!label.length) {
      return NaN;
    }

    const container = label.closest('div.MuiBox-root');

    const raw = container
      .find(PLAYER_DETAILS_SELECTORS.expectedScoreValue)
      .first()
      .text()
      .trim();

    return parseScore(raw);
  };

  const expectedScoreAsStarter = extractScoreByLabel(
    PLAYER_DETAILS_LABEL_TEXT.expectedStarter,
  );
  const expectedScoreAsSubstitute = extractScoreByLabel(
    PLAYER_DETAILS_LABEL_TEXT.expectedSubstitute,
  );

  return [expectedScoreAsStarter, expectedScoreAsSubstitute];
};

/**
 * Parses the player details page HTML and returns a normalized PlayerDetails object.
 *
 * @param html Raw HTML contents of the player's page.
 * @returns Normalized PlayerDetails data.
 */
export const parsePlayerDetailsFromHtml = (html: string): PlayerDetails => {
    const $ = cheerio.load(html);
  
    const name = $(PLAYER_DETAILS_SELECTORS.name).first().text().trim();
    const team = $(PLAYER_DETAILS_SELECTORS.team).first().text().trim();
  
    // Try position from the configured selector first
    let positionRaw = $(PLAYER_DETAILS_SELECTORS.position).first().text().trim();
  
    // If still empty, try a more generic fallback (just in case)
    if (!positionRaw) {
      positionRaw = $("[class*='css-ev0stz']").first().text().trim();
    }
  
    // Only warn if the *really mandatory* fields are missing
    if (!name || !team) {
      // eslint-disable-next-line no-console
      console.warn('parsePlayerDetailsFromHtml: Some mandatory fields are empty.');
    }
  
    const position = mapPositionCode(positionRaw);
    const isAvailable = getAvailability($);
    const [titularityChance, trustability] = getPercentageStats($);
    const [expectedScoreAsStarter, expectedScoreAsSubstitute] = getExpectedScores($);
  
    const result: PlayerDetails = {
      name,
      team,
      position,
      isAvailable,
      titularityChance,
      trustability,
      expectedScoreAsStarter,
      expectedScoreAsSubstitute,
    };
  
    return result;
  };