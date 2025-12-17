/**
 * ======================
 * Generic Helpers
 * ======================
 */

/**
 * Safely parses an integer from a string.
 *
 * - Removes all non-numeric characters except the minus sign
 * - Returns `0` if parsing fails
 *
 * @param value - Raw input string
 * @returns Parsed integer or `0` if invalid
 */
export function parseIntSafe(value: string | null | undefined): number {
  const cleaned = (value ?? "").replace(/[^\d-]/g, "");
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Parses a human-readable day duration into a non-negative integer number of days.
 *
 * Supported input formats (case-insensitive, surrounding whitespace ignored):
 * - `"2"`
 * - `"2d"`
 * - `"2 día"`, `"2 días"`
 * - `"2 dia"`, `"2 dias"`
 *
 * The function extracts the numeric component and validates that it represents
 * a finite, non-negative integer.
 *
 * @param raw - Raw user-provided input representing a duration in days.
 * @returns Number of days as a non-negative integer.
 *
 * @throws Error If the input does not match a supported format or if the parsed
 * number is not a non-negative integer.
 */
export const parseDays = (raw: string): number => {
  const cleaned = raw.trim().toLowerCase();

  // Accept: "2", "2d", "2 días", "2 dias"
  const m = RegExp(/^(\d+)\s*(d|día|dias|días)?$/i).exec(cleaned);
  if (!m) throw new Error(`Invalid days: "${raw}"`);

  const n = Number(m[1]);
  if (!Number.isInteger(n) || n < 0) throw new Error(`Invalid days: "${raw}"`);
  return n;
};

/**
 * Safely parses a floating-point number from a string.
 *
 * - Supports European decimal format (`,` as decimal separator)
 * - Removes non-numeric characters
 * - Returns `0` if parsing fails
 *
 * @param value - Raw input string
 * @returns Parsed float or `0` if invalid
 */
export function parseFloatSafe(value: string | null | undefined): number {
  const cleaned = (value ?? "")
    .replace(/[^0-9.,-]/g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Extracts and normalizes the first numeric value found in a string.
 *
 * Centralizes logic for parsing numbers in European formats:
 *
 * Logic:
 * 1. Finds the first numeric pattern (e.g. "1.200,50")
 * 2. Removes thousands separators (`.`)
 * 3. Replaces decimal comma with dot (`.`)
 *
 * @param text - Input text containing a numeric value
 * @returns Parsed number or `NaN` if no valid number is found
 */
const extractNumberFromText = (text: string): number => {
  const match = RegExp(/(\d+(?:[.,]\d+)?)/).exec(text);
  const numericPart = match?.[1];

  if (!numericPart) {
    return NaN;
  }

  const normalized = numericPart
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(normalized);
};

/**
 * Extracts a percentage from a string and converts it to a decimal value.
 *
 * Example:
 * - `"50,5%"` → `0.505`
 *
 * @param value - Raw percentage string
 * @returns Decimal value between `0` and `1`, or `NaN` if invalid
 */
export const parsePercentageToDecimal = (
  value: string | null | undefined,
): number => {
  if (value == null) {
    return NaN;
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return NaN;
  }

  const match = RegExp(/(\d+(?:[.,]\d+)?)/).exec(trimmed);
  const numericPart = match?.[1];

  if (!numericPart) {
    return NaN;
  }

  const cleanedNumericPart = numericPart
    .replace(/\./g, "")
    .replace(",", ".");

  const numeric = Number(cleanedNumericPart);
  if (Number.isNaN(numeric)) {
    return NaN;
  }

  const decimal = numeric / 100;

  // Clamp between 0 and 1
  return Math.min(1, Math.max(0, decimal));
};

/**
 * Extracts a numeric score from a string.
 *
 * Supports European decimal formats and ignores surrounding text.
 *
 * @param value - Raw score string
 * @returns Parsed numeric score or `NaN` if invalid
 */
export const parseScore = (value: string | null | undefined): number => {
  if (value == null) {
    return NaN;
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return NaN;
  }

  const match = RegExp(/(\d+(?:[.,]\d+)?)/).exec(trimmed);
  const numericPart = match?.[1];

  if (!numericPart) {
    return NaN;
  }

  const cleanedNumericPart = numericPart
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(cleanedNumericPart);
};

/**
 * Parses a user-provided numeric string into a `number`.
 *
 * Supports common European formats:
 * - Thousands separator: `.`
 * - Decimal separator: `,`
 *
 * Examples:
 * - `"1.250"` -> `1250`
 * - `"1.250,50"` -> `1250.50`
 *
 * @param raw - Raw user input
 * @returns Parsed number
 * @throws Error if the input cannot be parsed into a finite number
 */
export const parseNumber = (raw: string): number => {
  const normalized = raw.trim().replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid number: "${raw}"`);
  }
  return n;
};

/**
 * Parses a comma-separated string into a list of trimmed, non-empty tokens.
 *
 * Example:
 * - `"Pedri, Lewandowski,  Gavi "` -> `["Pedri", "Lewandowski", "Gavi"]`
 *
 * @param raw - Raw CSV user input
 * @returns List of trimmed items (empty items are removed)
 */
export const parseCSV = (raw: string): string[] =>
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);


/**
 * Parses a euro-formatted monetary string into an integer.
 *
 * Examples:
 * - `"18.890.000€"` → `18890000`
 * - `"-160.000€"` → `-160000`
 *
 * @param raw - Raw euro-formatted string
 * @returns Integer representation of the value
 */
export function parseEuroToInteger(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) {
    return 0;
  }

  const isNegative = trimmed.startsWith("-");
  const digitsOnly = trimmed.replace(/\D/g, "");

  if (!digitsOnly) {
    return 0;
  }

  const numeric = Number(digitsOnly);
  return isNegative ? -numeric : numeric;
}

/**
 * Converts a string to a URL-safe ASCII slug.
 *
 * Rules:
 * - Removes accents/diacritics (á -> a, ñ -> n, ü -> u)
 * - Removes non-ASCII symbols and punctuation
 * - Lowercases
 * - Collapses whitespace into single hyphens
 *
 * @param value - Input string
 * @returns URL-safe ASCII slug
 */
export const toAsciiSlug = (value: string): string => {
  const ascii = value
    .trim()
    .toLowerCase()
    .normalize("NFD") // Split letters and diacritics
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, " ") // Remove non-ASCII / punctuation
    .replace(/\s+/g, " ") // Collapse spaces
    .trim();

  return ascii.replace(/\s+/g, "-").replace(/-+/g, "-");
};

/**
 * Returns a list of unique, non-empty strings
 * while preserving original order.
 *
 * @param items - Input list
 * @returns Deduplicated list without empty values
 */
export const uniqueNonEmpty = (items: readonly string[]): string[] => {
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
 * Builds a list of candidate identifiers from a full name.
 *
 * Rules:
 * 1. `name-surname`
 * 2. `name`
 * 3. `surname`
 * 4. `initial-surname`
 *
 * "Name" is the first token, "surname" is the last token.
 *
 * @param fullName - Full name of the player
 * @returns List of candidate ID slugs
 */
export const buildIdCandidatesFromFullName = (
  fullName: string,
): string[] => {
  const cleaned = fullName
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[-_]+/g, " ");

  const parts = cleaned.split(" ").filter(Boolean);

  const name = parts.at(0) ?? "";
  const surname = parts.length > 1 ? parts.at(-1) ?? "" : "";
  const nameInitial = name.charAt(0);

  if (!name && !surname) {
    return [];
  }

  const c1 = surname ? `${name} ${surname}` : name;
  const c2 = name;
  const c3 = surname;
  const c4 = surname && nameInitial ? `${nameInitial} ${surname}` : nameInitial;

  return uniqueNonEmpty([
    toAsciiSlug(c1),
    toAsciiSlug(c2),
    toAsciiSlug(c3),
    toAsciiSlug(c4),
  ]);
};