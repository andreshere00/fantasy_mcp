import type { PlayerPosition } from './types.js';

/**
 * Fantasy events
 */

export enum EventType {
  GOAL = "goal",
  ASSIST = "assist",
  YELLOW_CARD = "yellow_card",
  RED_CARD = "red_card",
  SUB_IN = "sub_in",
  SUB_OUT = "sub_out",
  GREEN_ARROW = "green_arrow",
  OTHER = "other",
}

export interface MatchEvent {
  type: EventType;
  minute: number | null;
  playerIn?: string;
  playerOut?: string;
}

// Detailed score info for a match.
export interface MatchScoreDetails {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  display: string;
}

// A single match entry in the fantasy events table
export interface MatchEventRow {
  matchday: number;
  /**
   * Simple display version of the score, e.g.:
   *  "Real Betis (3) - Barcelona (5)"
   */
  score: MatchScoreDetails;

  events: MatchEvent[];
  titularity: boolean;
  minutesPlayed: number;
  laLigaScore: number;
  bonusScore: number;
}

export interface ParsedTeamBlock {
  teamName: string;
  goals: number;
}


/**
 * playerDetails
 */

export interface PlayerDetails {
  name: string;
  team: string;
  position: PlayerPosition;
  isAvailable: boolean;
  titularityChance: number; // 0..1
  trustability: number;     // 0..1
  expectedScoreAsStarter: number;
  expectedScoreAsSubstitute: number;
}

/**
 * marketDetails
 */

export interface PriceWithDate {
  value: number;  // in euros
  date: string;   // ISO date string, e.g. "2025-10-26"
}

export interface AllTimeFantasyMarket {
  maxPrice: PriceWithDate;
  minPrice: PriceWithDate;
  highestRaise: PriceWithDate;
  highestDrop: PriceWithDate;
  bestBid?: number; // euros
  maxBid?: number;  // euros
}

export interface MarketDelta {
  amount: number;    // delta in euros, can be negative
  percent?: number;  // percentage relative to previous value
}

export interface LastFantasyMarketValues {
  currentValue: number;
  lastDay: MarketDelta;
  last2Days: MarketDelta;
  last3Days: MarketDelta;
  last5Days: MarketDelta;
  last10Days: MarketDelta;
  last14Days: MarketDelta;
  last29Days: MarketDelta;
}

export interface MarketDetails {
  allTimeFantasyMarket: AllTimeFantasyMarket;
  lastFantasyMarketValues: LastFantasyMarketValues;
}