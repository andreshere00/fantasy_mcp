import path from "node:path";
import type { PlayerPosition } from './alias.js';

/**
 * General
 */

export const BASE_URL: string = "https://www.analiticafantasy.com/jugadores";

export const PLAYER_MARKET_BASE_URL: string = `${BASE_URL}/subidas-mercado-la-liga-fantasy`;

export const OUTPUT_DIR: string = path.join(process.cwd(), "data", "html");

export const USER_AGENT: string =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * fantasyEvent – CSS selectors for columns
 */

export const FANTASY_EVENT_ROWS_ID: string = ".MuiBox-root.css-2p80or"
export const FANTASY_EVENT_MATCHDAY_ID: string = ".css-1i4ugup p";
export const FANTASY_EVENT_SCORE_ID: string = ".css-12zt0v .css-wpwytb p";
export const FANTASY_EVENT_TITULARITY_ID: string = ".css-1is2l86 svg";
export const FANTASY_EVENT_TITULARITY_FLAG: string = 'path[fill="#00D26A"]';
export const FANTASY_EVENT_MINUTES_PLAYED: string = ".css-cxbjoz";
export const FANTASY_EVENT_LALIGA_SCORE_ID: string =
  ".css-13oaq36 .fixture-score-container__color p";
export const FANTASY_EVENT_BONUS_SCORE_ID =
  ".css-66zn4o .fixture-score-container__color p";
export const FANTASY_EVENT_NODES_ID: string =
  ".css-11xjwpp .css-6xe17a";

// Cards (non-SVG boxes)
export const FANTASY_EVENT_YELLOW_CARD_ID: string = ".css-1qkqqso";
export const FANTASY_EVENT_RED_CARD_ID: string = ".css-1dijepo";

/**
 * SVG-based event markers – colors & path shapes
 */

// Sub in / out – by color and by exact `d` path
export const FANTASY_EVENT_SUB_IN_FILL: string = "#059669";
export const FANTASY_EVENT_SUB_OUT_FILL: string = "#e11d48";

export const FANTASY_EVENT_SUB_IN_D: string =
  "M15 20H9v-8H4.16L12 4.16L19.84 12H15v8Z";
export const FANTASY_EVENT_SUB_OUT_D: string =
  "M9 4h6v8h4.84L12 19.84L4.16 12H9V4Z";

// Goals & assists – by fill color
export const FANTASY_EVENT_GOAL_FILL: string = "#31373D";
export const FANTASY_EVENT_ASSIST_FILL: string = "#BE1931";

/**
 * playerDetails
 */

export const POSITION_CODE_MAP: Record<string, PlayerPosition> = {
  MC: 'midfielder',
  DL: 'forward',
  DF: 'back',
  PO: 'goalkeeper',
};

export const AVAILABILITY_FILL_COLOR = '#32BEA6';

export const PLAYER_DETAILS_SELECTORS = {
  name: 'p.MuiTypography-root.MuiTypography-body1.css-2rah4n',
  team: 'p.MuiTypography-root.MuiTypography-body1.css-1f1jjtq',
  position: "[class*='css-ev0stz']",
  availabilityContainer: 'div.MuiBox-root.css-j2at52',

  // Stats panel (titular, seguridad, puntuaciones ...)
  statLabel: 'p.MuiTypography-root.MuiTypography-body1.css-17c0u7v',
  statSpan: 'span.MuiTypography-root.MuiTypography-span.css-54ro1u',
  percentageStats: 'p.MuiTypography-root.MuiTypography-body1.css-iplaw2',
  expectedScoreValue: 'p.MuiTypography-root.MuiTypography-body1.css-18s8kw9',
}

export const PLAYER_DETAILS_LABEL_TEXT = {
  titular: 'Titular',
  trust: 'Seguridad',
  expectedStarter: 'Puntuación esperada titular',
  expectedSubstitute: 'Puntuación esperada suplente',
}

/**
 * marketDetails
 */

export const MARKET_DETAILS_LABEL_TEXT = {
  maxPrice: 'Precio máximo',
  minPrice: 'Precio mínimo',
  highestRaise: 'Mayor subida',
  highestDrop: 'Mayor bajada',
  bestBid: 'Puja ideal',
  maxBid: 'Puja Máxima',
}

export const MARKET_DETAILS_INTERVAL_LABELS = {
  lastDay: 'Último',
  last2Days: 'Últimos 2',
  last3Days: 'Últimos 3',
  last5Days: 'Últimos 5',
  last10Days: 'Últimos 10',
  last14Days: 'Últimos 14',
  last29Days: 'Últimos 29',
}
