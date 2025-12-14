import { zodToJsonSchema } from "zod-to-json-schema";
import type { ZodType } from "zod";

/**
 * Represents any Zod schema. We use a simple ZodType with any generics
 * to avoid complex type constraints.
 */
export type AnyZodType = ZodType<any, any, any>;

/**
 * LLM schema input can be either:
 * - A Zod schema (AnyZodType)
 * - A plain JSON schema object (Record<string, unknown>)
 */
export type LlmSchemaInput = AnyZodType | Record<string, unknown>;

export interface NormalizedJsonSchema {
  name: string;
  schema: Record<string, unknown>;
  strict: boolean;
}

/**
 * Converts a Zod schema or JSON Schema into a Normalized JSON Schema
 * that OpenAI can use with structured outputs.
 *
 * @param input - Either Zod schema (runtime) or a JSON Schema object
 * @param name - Logical name used for JSON Schema (required by some providers)
 * @returns A NormalizedJsonSchema object
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
 * Type guard to detect a Zod schema at runtime.
 * A Zod type always has a `_def` property.
 */
function isZod(value: unknown): value is AnyZodType {
  return (
    typeof value === "object" &&
    value !== null &&
    "_def" in value
  );
}