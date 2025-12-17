import type { Cheerio } from "cheerio";

/**
 * DOM Generic
 */

export type CheerioNode = Cheerio<any>;

export type PlayerPosition =
  | 'midfielder'
  | 'forward'
  | 'back'
  | 'goalkeeper'
  | 'unknown';