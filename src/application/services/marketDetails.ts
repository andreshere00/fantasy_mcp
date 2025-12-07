import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio'; 

import {
  MARKET_DETAILS_LABEL_TEXT,
  MARKET_DETAILS_INTERVAL_LABELS,
} from '../../domain/config/constants.js';
import type {
  AllTimeFantasyMarket,
  LastFantasyMarketValues,
  MarketDelta,
  MarketDetails,
  PriceWithDate,
} from '../../domain/config/interfaces.js';
import { parseEuroToInteger } from '../utils/parsers.js';

/**
 * Parse a summary "card" that contains label, value and date.
 *
 * @param $ Cheerio API.
 * @param element Root element of the card.
 * @returns PriceWithDate or null if the card does not match.
 */
const parsePriceWithDateCard = ($: CheerioAPI, element: any): PriceWithDate | null => {
  const $el = $(element);
  const paragraphs = $el.find('p');

  if (paragraphs.length < 3) {
    return null;
  }

  const valueText = $(paragraphs[1]).text().trim();
  const dateText = $(paragraphs[2]).text().trim();

  if (!valueText) {
    return null;
  }

  const value = parseEuroToInteger(valueText);

  return {
    value,
    date: dateText,
  };
};

/**
 * Parses the all-time market summary section (max/min price, highest raise/drop, bids).
 *
 * @param $ Cheerio API.
 * @returns AllTimeFantasyMarket object.
 */
const parseAllTimeFantasyMarket = ($: CheerioAPI): AllTimeFantasyMarket => {
  const result: Partial<AllTimeFantasyMarket> = {};

  // The summary cards share a common structure; we identify them by their first <p> text.
  $('div.MuiBox-root').each((_, el) => {
    const $el = $(el);
    const firstParagraph = $el.find('p').first();
    const label = firstParagraph.text().trim();

    switch (label) {
      case MARKET_DETAILS_LABEL_TEXT.maxPrice: {
        const price = parsePriceWithDateCard($, el);
        if (price) {
          result.maxPrice = price;
        }
        break;
      }
      case MARKET_DETAILS_LABEL_TEXT.minPrice: {
        const price = parsePriceWithDateCard($, el);
        if (price) {
          result.minPrice = price;
        }
        break;
      }
      case MARKET_DETAILS_LABEL_TEXT.highestRaise: {
        const price = parsePriceWithDateCard($, el);
        if (price) {
          result.highestRaise = price;
        }
        break;
      }
      case MARKET_DETAILS_LABEL_TEXT.highestDrop: {
        const price = parsePriceWithDateCard($, el);
        if (price) {
          result.highestDrop = price;
        }
        break;
      }
      case MARKET_DETAILS_LABEL_TEXT.bestBid: {
        const paragraphs = $el.find('p');
        const valueText = paragraphs.eq(1).text().trim();
        if (valueText) {
          result.bestBid = parseEuroToInteger(valueText);
        }
        break;
      }
      case MARKET_DETAILS_LABEL_TEXT.maxBid: {
        const paragraphs = $el.find('p');
        const valueText = paragraphs.eq(1).text().trim();
        if (valueText) {
          result.maxBid = parseEuroToInteger(valueText);
        }
        break;
      }
      default:
        break;
    }
  });

  return result as AllTimeFantasyMarket;
};

/**
 * Creates a MarketDelta from an absolute amount and current value.
 *
 * Formula:
 * previousValue = currentValue - amount
 * percent = amount / previousValue * 100
 *
 * @param amount Delta in euros.
 * @param currentValue Current market value in euros.
 * @returns MarketDelta.
 */
const toMarketDelta = (amount: number, currentValue: number): MarketDelta => {
  const previousValue = currentValue - amount;

  if (previousValue === 0) {
    return { amount };
  }

  const percent = (amount / previousValue) * 100;
  return { amount, percent };
};

/**
 * Parses the block containing current value and last N days changes.
 *
 * Uses the visible texts (e.g. "Valor actual:", "Último", "Últimos 2"...)
 * rather than relying heavily on dynamic CSS class names.
 *
 * @param $ Cheerio API.
 * @returns LastFantasyMarketValues object.
 */
const parseLastFantasyMarketValues = ($: CheerioAPI): LastFantasyMarketValues => {
  // Find the section by its title text to be more robust.
  const titleSelector = 'p.MuiTypography-root';
  const sectionTitle = 'Subida y bajada de los últimos valores de mercados';

  const titleElement = $(titleSelector).filter((_, el) => {
    return $(el).text().trim() === sectionTitle;
  }).first();

  const section = titleElement.closest('div.MuiBox-root');

  // Current value row: two <p>, second one is the value.
  const currentRow = section.find('div').filter((_, el) => {
    return $(el).find('p').first().text().trim().startsWith('Valor actual');
  }).first();

  const currentValueText = currentRow.find('p').last().text().trim();
  const currentValue = parseEuroToInteger(currentValueText);

  const deltasByLabel: Record<string, number> = {};

  // Each delta box has an <h4> with the label and a <p> with the value.
  section
    .find('h4')
    .each((_, el) => {
      const label = $(el).text().trim();
      const valueText = $(el).siblings('p').first().text().trim();
      if (!valueText || valueText === '-') {
        return;
      }
      const amount = parseEuroToInteger(valueText);
      deltasByLabel[label] = amount;
    });

  const getAmount = (label: string): number => deltasByLabel[label] ?? 0;

  return {
    currentValue,
    lastDay: toMarketDelta(getAmount(MARKET_DETAILS_INTERVAL_LABELS.lastDay), currentValue),
    last2Days: toMarketDelta(getAmount(MARKET_DETAILS_INTERVAL_LABELS.last2Days), currentValue),
    last3Days: toMarketDelta(getAmount(MARKET_DETAILS_INTERVAL_LABELS.last3Days), currentValue),
    last5Days: toMarketDelta(getAmount(MARKET_DETAILS_INTERVAL_LABELS.last5Days), currentValue),
    last10Days: toMarketDelta(getAmount(MARKET_DETAILS_INTERVAL_LABELS.last10Days), currentValue),
    last14Days: toMarketDelta(getAmount(MARKET_DETAILS_INTERVAL_LABELS.last14Days), currentValue),
    last29Days: toMarketDelta(getAmount(MARKET_DETAILS_INTERVAL_LABELS.last29Days), currentValue),
  };
};

/**
 * Parses full market details for a player from the HTML
 * of the "subidas-mercado-la-liga-fantasy" page.
 *
 * This function is *agnostic of HTTP*: it only receives HTML.
 *
 * @param html Raw HTML string of the player's market page.
 * @returns MarketDetails structure.
 */
export function parseMarketDetailsFromHtml(html: string): MarketDetails {
  const $ = cheerio.load(html);

  const allTimeFantasyMarket = parseAllTimeFantasyMarket($);
  const lastFantasyMarketValues = parseLastFantasyMarketValues($);

  return {
    allTimeFantasyMarket,
    lastFantasyMarketValues,
  };
}