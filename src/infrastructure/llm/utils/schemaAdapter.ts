import { zodToJsonSchema } from "zod-to-json-schema";
import type { ZodType } from "zod";

/**
 * ======================
 * Schema Types
 * ======================
 */

/**
 * Represents any Zod schema at runtime.
 *
 * We intentionally use a broad `ZodType<any, any, any>` here to:
 * - avoid leaking complex generic constraints into the LLM layer
 * - support arbitrary structured outputs
 *
 * Type safety is recovered later when parsing/validating the LLM response.
 */
export type AnyZodType = ZodType<any, any, any>;

/**
 * Input schema accepted by the LLM layer.
 *
 * The schema may be provided as:
 * - a Zod schema (preferred at application level)
 * - a raw JSON Schema object (already normalized)
 */
export type LlmSchemaInput = AnyZodType | Record<string, unknown>;


/**
 * Normalized JSON Schema representation used internally
 * and passed to LLM providers that support structured outputs.
 */
export interface NormalizedJsonSchema {
  /**
   * Logical name of the schema.
   *
   * Some providers (e.g. OpenAI) require a named schema
   * for structured outputs.
   */
  name: string;

  /**
   * JSON Schema object describing the expected output shape.
   */
  schema: Record<string, unknown>;

  /**
   * Whether the schema should be enforced strictly.
   *
   * A strict schema instructs the model/provider to:
   * - disallow additional properties
   * - adhere closely to the schema definition
   */
  strict: boolean;
}

/**
 * ======================
 * Schema Adapter
 * ======================
 */

/**
 * Converts a Zod schema or raw JSON Schema into a normalized JSON Schema
 * compatible with LLM structured output APIs.
 *
 * This function centralizes schema normalization so that:
 * - application code can use Zod for type safety
 * - infrastructure adapters can rely on plain JSON Schema
 *
 * @param input - Zod schema or JSON Schema object
 * @param name - Logical schema name (required by some LLM providers)
 * @returns Normalized JSON Schema ready for LLM consumption
 *
 * @throws Error if the schema name is missing or empty
 */
export function adaptSchemaToJsonSchema(
  input: LlmSchemaInput,
  name: string,
): NormalizedJsonSchema {
  if (!name) {
    throw new Error("Schema name is required for structured outputs");
  }

  if (isZod(input)) {
    const jsonSchema = zodToJsonSchema(input as any, { name });

    return {
      name,
      schema: jsonSchema as Record<string, unknown>,
      strict: true,
    };
  }

  // Already JSON Schema
  return {
    name,
    schema: input,
    strict: true,
  };
}

/**
 * ======================
 * Type Guards
 * ======================
 */

/**
 * Runtime type guard to detect whether a value is a Zod schema.
 *
 * Zod schemas always expose a private `_def` property
 * that can be used safely for runtime detection.
 *
 * @param value - Value to test
 * @returns `true` if the value is a Zod schema
 */
function isZod(value: unknown): value is AnyZodType {
  return (
    typeof value === "object" &&
    value !== null &&
    "_def" in value
  );
}