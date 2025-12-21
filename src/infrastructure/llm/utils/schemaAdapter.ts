import type { ZodType } from "zod";

export type AnyZodType = ZodType<any, any, any>;
export type LlmSchemaInput = AnyZodType | Record<string, unknown>;

export interface NormalizedJsonSchema {
  name: string;
  schema: Record<string, unknown>;
  strict: boolean;
}

/**
 * Converts a Zod schema to Azure OpenAI compatible JSON Schema.
 * 
 * Supports both Zod v3 (using zod-to-json-schema) and Zod v4 (using built-in toJSONSchema).
 */
export function adaptSchemaToJsonSchema(
  input: LlmSchemaInput,
  name: string,
): NormalizedJsonSchema {
  if (!name) {
    throw new Error("Schema name is required for structured outputs");
  }

  let schema: Record<string, unknown>;

  if (isZod(input)) {
    // Check if this is Zod v4 with built-in toJSONSchema method
    if (typeof (input as any).toJSONSchema === "function") {
      schema = (input as any).toJSONSchema() as Record<string, unknown>;
    } else {
      // Fallback to zod-to-json-schema for Zod v3
      const { zodToJsonSchema } = require("zod-to-json-schema");
      schema = zodToJsonSchema(input as any, name) as Record<string, unknown>;
    }
  } else {
    schema = input;
  }

  // Ensure additionalProperties: false on all objects (Azure requirement)
  const azureSchema = ensureStrictSchema(schema);

  return {
    name,
    schema: azureSchema,
    strict: true,
  };
}

/**
 * Recursively adds additionalProperties: false to all objects.
 * This is required by Azure OpenAI's structured output.
 */
function ensureStrictSchema(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(ensureStrictSchema);

  const result = { ...obj };

  // Add additionalProperties: false to objects
  if (result.type === "object" && result.properties) {
    result.additionalProperties = false;
  }

  // Recurse into nested structures
  if (result.properties) {
    result.properties = Object.fromEntries(
      Object.entries(result.properties).map(([k, v]) => [k, ensureStrictSchema(v)])
    );
  }

  if (result.items) {
    result.items = ensureStrictSchema(result.items);
  }

  for (const key of ["anyOf", "oneOf", "allOf"]) {
    if (Array.isArray(result[key])) {
      result[key] = result[key].map(ensureStrictSchema);
    }
  }

  return result;
}

function isZod(value: unknown): value is AnyZodType {
  return typeof value === "object" && value !== null && "_def" in value;
}
