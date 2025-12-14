import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import type {
  AvailableBalancePort,
  AvailableMarketPlayersPort,
  OpponentsInfoPort,
  SquadPlayersPort,
} from '../../../domain/fantasy/ports.js';

import type { MarketPlayer, OpponentInfo, SquadPlayer } from '../../../domain/fantasy/models.js';

const parseNumber = (raw: string): number => {
  const normalized = raw.trim().replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid number: "${raw}"`);
  }
  return n;
};

const parseCSV = (raw: string): string[] =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Converts a string to a URL-safe ASCII slug:
 * - Removes accents/diacritics (á -> a, ñ -> n, ü -> u)
 * - Removes non-ASCII symbols
 * - Lowercases
 * - Collapses whitespace to single hyphens
 */
const toAsciiSlug = (value: string): string => {
  const ascii = value
    .trim()
    .toLowerCase()
    .normalize('NFD') // Split letters and diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, ' ') // Remove non-ASCII / punctuation
    .replace(/\s+/g, ' ') // Collapse spaces
    .trim();

  return ascii.replace(/\s+/g, '-').replace(/-+/g, '-');
};

const uniqueNonEmpty = (items: readonly string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const item of items) {
    const v = item.trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }

  return out;
};

/**
 * Builds candidate ids from a full name:
 *  1) name-surname
 *  2) name
 *  3) surname
 *  4) firstInitial-surname
 *
 * "Name" is the first token, "surname" is the last token.
 */
const buildIdCandidatesFromFullName = (fullName: string): string[] => {
  const cleaned = fullName
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[-_]+/g, ' ');

  const parts = cleaned.split(' ').filter(Boolean);

  const name = parts.at(0) ?? '';
  const surname = parts.length > 1 ? (parts.at(-1) ?? '') : '';
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

export class ConsoleUserContext
  implements AvailableBalancePort, SquadPlayersPort, AvailableMarketPlayersPort, OpponentsInfoPort
{
  private readonly rl = createInterface({ input, output });

  async getAvailableBalance(): Promise<number> {
    const answer = await this.rl.question('Available balance (€): ');
    return parseNumber(answer);
  }

  async getSquadPlayers(): Promise<SquadPlayer[]> {
    const countRaw = await this.rl.question('How many players are in your squad list? ');
    const count = Math.max(0, Math.floor(parseNumber(countRaw)));

    const players: SquadPlayer[] = [];

    for (let i = 0; i < count; i += 1) {
      const name = (await this.rl.question(`Squad player #${i + 1} (full name): `)).trim();

      if (!name) {
        // Skip empty input; alternatively, you could re-prompt here
        continue;
      }

      players.push({
        ids: buildIdCandidatesFromFullName(name),
        name,
      });
    }

    return players;
  }

  async getAvailableMarketPlayers(): Promise<MarketPlayer[]> {
    const countRaw = await this.rl.question('How many players are currently available in the market? ');
    const count = Math.max(0, Math.floor(parseNumber(countRaw)));

    const players: MarketPlayer[] = [];

    for (let i = 0; i < count; i += 1) {
      const name = (await this.rl.question(`Market player #${i + 1} (full name): `)).trim();

      if (!name) {
        // Skip empty input; alternatively, you could re-prompt here
        continue;
      }

      players.push({
        ids: buildIdCandidatesFromFullName(name),
        name,
      });
    }

    return players;
  }

  async getOpponentsInfo(): Promise<OpponentInfo[]> {
    const countRaw = await this.rl.question('How many opponents do you want to enter? ');
    const count = Math.max(0, Math.floor(parseNumber(countRaw)));

    const opponents: OpponentInfo[] = [];

    for (let i = 0; i < count; i += 1) {
      output.write(`\nOpponent #${i + 1}\n`);

      const name = (await this.rl.question('  opponent name: ')).trim();
      const formationRaw = (await this.rl.question('  formation (optional, Enter to skip): ')).trim();
      const keyPlayersRaw = (await this.rl.question('  key players (comma-separated, optional): ')).trim();

      const opponent: OpponentInfo = {
        ids: buildIdCandidatesFromFullName(name),
        name,
      };

      // With exactOptionalPropertyTypes, omit optional properties instead of assigning undefined
      if (formationRaw) {
        opponent.formation = formationRaw;
      }
      if (keyPlayersRaw) {
        opponent.keyPlayers = parseCSV(keyPlayersRaw);
      }

      opponents.push(opponent);
    }

    return opponents;
  }

  async close(): Promise<void> {
    this.rl.close();
  }
}