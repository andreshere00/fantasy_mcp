import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import type {
  AvailableBalancePort,
  AvailableMarketPlayersPort,
  OpponentsInfoPort,
  SquadPlayersPort,
} from "../../../domain/fantasy/ports.js";

import type {
  MarketPlayer,
  OpponentInfo,
  OpponentPlayer,
  SquadPlayer,
  ReleaseClauseInfo
} from "../../../domain/fantasy/models.js";

import {
  parseDays,
  parseIntSafe,
  toAsciiSlug,
  uniqueNonEmpty,
} from "../../../application/utils/helpers.js";

/**
 * Builds candidate identifiers from a full name.
 *
 * The goal is to generate multiple stable IDs that can match
 * different naming conventions across sources.
 *
 * Rules:
 *  1) name-surname
 *  2) name
 *  3) surname
 *  4) firstInitial-surname
 *
 * Notes:
 * - "Name" is the first token
 * - "Surname" is the last token
 *
 * Example:
 * - `"Pedri González"` ->
 *   `["pedri-gonzalez", "pedri", "gonzalez", "p-gonzalez"]`
 *
 * @param fullName - Full name provided by the user.
 * @returns List of slugified candidate IDs.
 */
const buildIdCandidatesFromFullName = (fullName: string): string[] => {
  const cleaned = fullName
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[-_]+/g, " ");

  const parts = cleaned.split(" ").filter(Boolean);

  const name = parts.at(0) ?? "";
  const surname = parts.length > 1 ? (parts.at(-1) ?? "") : "";
  const initial = name.charAt(0);

  if (!name && !surname) {
    return [];
  }

  const c1 = surname ? `${name} ${surname}` : name;
  const c2 = name;
  const c3 = surname;
  const c4 = surname && initial ? `${initial} ${surname}` : initial;

  return uniqueNonEmpty([
    toAsciiSlug(c1),
    toAsciiSlug(c2),
    toAsciiSlug(c3),
    toAsciiSlug(c4),
  ]);
};

/**
 * Prompts the user for release clause information for a player.
 *
 * With `exactOptionalPropertyTypes` enabled, callers should omit the property
 * when the user chooses to skip.
 *
 * @param rl - Readline interface used to prompt the user.
 * @returns Release clause info, or `undefined` if the user skipped input.
 * @throws Error If the entered days or clause value cannot be parsed.
 */
const askReleaseClause = async (
  rl: ReturnType<typeof createInterface>,
): Promise<ReleaseClauseInfo | undefined> => {
  const daysRaw = (
    await rl.question("  release to market in days (Enter to skip): ")
  ).trim();

  if (!daysRaw) {
    return undefined;
  }

  const clauseRaw = (await rl.question("  clause value (€) (Enter to skip): ")).trim();
  if (!clauseRaw) {
    return undefined;
  }

  return {
    releaseToMarketIn: { unit: "days", value: parseDays(daysRaw) },
    clauseValueEur: parseIntSafe(clauseRaw),
  };
};

/**
 * Prompts the user for a list of opponent players, each optionally enriched
 * with release clause information.
 *
 * @param rl - Readline interface used to prompt the user.
 * @returns List of opponent players, or `undefined` if the user chose to skip.
 * @throws Error If numeric inputs cannot be parsed.
 */
const askOpponentPlayers = async (
  rl: ReturnType<typeof createInterface>,
): Promise<OpponentPlayer[] | undefined> => {
  const countRaw = (
    await rl.question("  how many opponent players to enter? (0 to skip): ")
  ).trim();

  if (!countRaw) {
    return undefined;
  }

  const count = Math.max(0, Math.floor(parseIntSafe(countRaw)));
  if (count === 0) {
    return undefined;
  }

  const players: OpponentPlayer[] = [];

  for (let j = 0; j < count; j += 1) {
    const name = (await rl.question(`    player #${j + 1} full name: `)).trim();
    if (!name) {
      continue;
    }

    const releaseClause = await askReleaseClause(rl);

    players.push({
      ids: buildIdCandidatesFromFullName(name),
      name,
      ...(releaseClause ? { releaseClause } : {}),
    });
  }

  return players.length > 0 ? players : undefined;
};

/**
 * ======================
 * Console adapter
 * ======================
 */

/**
 * Console-based adapter that collects user context information via interactive prompts.
 *
 * This class implements multiple domain ports so that the application-layer
 * use case can gather all required user context from a single source.
 *
 * Implemented ports:
 * - {@link AvailableBalancePort}
 * - {@link SquadPlayersPort}
 * - {@link AvailableMarketPlayersPort}
 * - {@link OpponentsInfoPort}
 *
 * Architectural intent:
 * - Keep prompting / I/O concerns in infrastructure
 * - Keep use case orchestration in application
 * - Allow swapping the adapter later (web UI, config file, API, etc.)
 */
export class ConsoleUserContext
  implements
    AvailableBalancePort,
    SquadPlayersPort,
    AvailableMarketPlayersPort,
    OpponentsInfoPort
{
  /**
   * Readline interface used for interactive user prompts.
   */
  private readonly rl = createInterface({ input, output });

  /**
   * Prompts the user for their available balance in euros.
   *
   * @returns Available balance as a number.
   * @throws Error If the input cannot be parsed into a finite number.
   */
  async getAvailableBalance(): Promise<number> {
    const answer = await this.rl.question("Available balance (€): ");
    return parseIntSafe(answer);
  }

  /**
   * Prompts the user for the players currently in their squad.
   *
   * The user is first asked for the number of players to enter.
   * Each player is then requested by full name.
   *
   * Each player is enriched with:
   * - `ids` computed from {@link buildIdCandidatesFromFullName}
   * - optional `releaseClause` (release-to-market delay and clause value)
   *
   * @returns List of squad players entered by the user.
   * @throws Error If numeric inputs cannot be parsed.
   */
  async getSquadPlayers(): Promise<SquadPlayer[]> {
    const countRaw = await this.rl.question(
      "How many players are in your squad list? ",
    );
    const count = Math.max(0, Math.floor(parseIntSafe(countRaw)));

    const players: SquadPlayer[] = [];

    for (let i = 0; i < count; i += 1) {
      output.write(`\nSquad player #${i + 1}\n`);

      const name = (await this.rl.question("  full name: ")).trim();
      if (!name) {
        continue;
      }

      const releaseClause = await askReleaseClause(this.rl);

      players.push({
        ids: buildIdCandidatesFromFullName(name),
        name,
        ...(releaseClause ? { releaseClause } : {}),
      });
    }

    return players;
  }

  /**
   * Prompts the user for the players currently available in the market.
   *
   * The user is first asked for the number of market players to enter.
   * Each player is then requested by full name.
   *
   * Each player is enriched with `ids` computed from {@link buildIdCandidatesFromFullName}
   * to improve cross-source matching.
   *
   * @returns List of market players entered by the user.
   * @throws Error If the input cannot be parsed into a finite number.
   */
  async getAvailableMarketPlayers(): Promise<MarketPlayer[]> {
    const countRaw = await this.rl.question(
      "How many players are currently available in the market? ",
    );
    const count = Math.max(0, Math.floor(parseIntSafe(countRaw)));

    const players: MarketPlayer[] = [];

    for (let i = 0; i < count; i += 1) {
      const name = (
        await this.rl.question(`Market player #${i + 1} (full name): `)
      ).trim();

      if (!name) {
        continue;
      }

      players.push({
        ids: buildIdCandidatesFromFullName(name),
        name,
      });
    }

    return players;
  }

  /**
   * Prompts the user for information about opponents.
   *
   * For each opponent, the user can optionally provide:
   * - formation
   * - players (structured), each optionally with release clause info
   *
   * With `exactOptionalPropertyTypes` enabled, optional fields are omitted
   * when empty rather than being assigned `undefined`.
   *
   * @returns List of opponent info objects entered by the user.
   * @throws Error If numeric inputs cannot be parsed.
   */
  async getOpponentsInfo(): Promise<OpponentInfo[]> {
    const countRaw = await this.rl.question(
      "How many opponents do you want to enter? ",
    );
    const count = Math.max(0, Math.floor(parseIntSafe(countRaw)));

    const opponents: OpponentInfo[] = [];

    for (let i = 0; i < count; i += 1) {
      output.write(`\nOpponent #${i + 1}\n`);

      const name = (await this.rl.question("  opponent name: ")).trim();

      const players = await askOpponentPlayers(this.rl);

      const opponent: OpponentInfo = {
        name,
        ...(players ? { players } : {}),
      };

      opponents.push(opponent);
    }

    return opponents;
  }

  /**
   * Closes the underlying readline interface.
   *
   * This should always be called (typically in a `finally` block)
   * to avoid hanging processes in terminals or CI environments.
   */
  async close(): Promise<void> {
    this.rl.close();
  }
}
