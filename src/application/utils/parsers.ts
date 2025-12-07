/**
 * Generic Helpers
 */

export function parseIntSafe(value: string | null | undefined): number {
    const cleaned = (value ?? "").replace(/[^\d-]/g, "");
    const parsed = Number.parseInt(cleaned, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  
  export function parseFloatSafe(value: string | null | undefined): number {
    const cleaned = (value ?? "").replace(/[^0-9.,-]/g, "").replace(",", ".");
    const parsed = Number.parseFloat(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  
/**
 * Helper function to normalize number strings.
 * Centralizes the logic for "European" format cleaning.
 * * Logic:
 * 1. Find the first number pattern (e.g. "1.200,50")
 * 2. Remove dots (thousands separators)
 * 3. Replace comma with dot (decimal separator)
 */
const extractNumberFromText = (text: string): number => {
    // Use the specific regex from your original parse functions
    const match = RegExp(/(\d+(?:[.,]\d+)?)/).exec(text);
  
    // FIX: Use optional chaining (?.) to access index 1 safely.
    // This solves "Object is possibly 'undefined'" and SonarLint S6582.
    const numericPart = match?.[1];
  
    if (!numericPart) {
      return NaN;
    }
  
    const normalized = numericPart
      .replace(/\./g, '') // remove thousands (European)
      .replace(',', '.'); // decimal comma (European)
  
    return Number(normalized);
  };
  
/**
 * Extracts a percentage and converts it to a decimal (0-1).
 * Example: "50,5%" -> 0.505
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

  // Grab the first integer/decimal-looking number anywhere in the string
  const match = RegExp(/(\d+(?:[.,]\d+)?)/).exec(trimmed);
  
  // FIX: Use Optional Chaining (?.) to safely access the captured group.
  // This resolves the TS2532 error on match[1].
  const numericPart = match?.[1];
  
  if (!numericPart) {
    return NaN;
  }

  const cleanedNumericPart = numericPart
    .replace(/\./g, '') // remove thousands separators
    .replace(',', '.'); // decimal comma

  const numeric = Number(cleanedNumericPart);
  if (Number.isNaN(numeric)) {
    return NaN;
  }

  const decimal = numeric / 100;
  // Clamp between 0 and 1
  return Math.min(1, Math.max(0, decimal));
};

export const parseScore = (value: string | null | undefined): number => {
  if (value == null) {
    return NaN;
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return NaN;
  }

  const match = RegExp(/(\d+(?:[.,]\d+)?)/).exec(trimmed);

  // FIX: Use Optional Chaining (?.) to safely access the captured group.
  const numericPart = match?.[1];

  if (!numericPart) {
      return NaN;
  }

  const cleanedNumericPart = numericPart
    .replace(/\./g, '')
    .replace(',', '.');

  return Number(cleanedNumericPart);
};

export function parseEuroToInteger(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) {
    return 0;
  }

  const isNegative = trimmed.startsWith('-');
  const digitsOnly = trimmed.replace(/[^0-9]/g, '');

  if (!digitsOnly) {
    return 0;
  }

  const numeric = Number(digitsOnly);
  return isNegative ? -numeric : numeric;
}