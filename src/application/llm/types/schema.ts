import type { ZodType } from "zod";

/**
 * Schema definition accepted by LLM structured outputs.
 * Can be either:
 * - A valid JSON Schema
 * - A Zod schema (to be converted internally)
 */
export type LlmSchema =
  | Record<string, unknown> // JSON Schema
  | ZodType;