import { z } from "zod";
import { LineupSchema } from "./models.js";

/**
 * AnaliticaFantasy
 */

export type AnaliticaPageKind = "playerInfo" | "market";

/**
 * PlayerInformation
 */

export type PlayerSlug = string;
export type PlayerId = string;

/**
 * Lineup
 */
export type LineupResult = z.infer<typeof LineupSchema>;
export type Formation = LineupResult["formation"];

/**
 * Other aliases
 */
export type EurAmount = number;