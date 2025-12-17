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
 * Ensures the returned schema is a JSON Schema with root `type: "object"`.
 *
 * `zod-to-json-schema` may return a `$ref` root with `definitions` / `$defs`.
 * Azure/OpenAI structured outputs require the root schema itself to be an object.
 *
 * @param raw - JSON schema returned by `zod-to-json-schema`
 * @param fallbackName - Logical schema name used as fallback lookup key
 * @returns Root object JSON schema
 * @throws Error if a root object schema cannot be resolved
 */
function resolveRootObjectSchema(
  raw: Record<string, unknown>,
  _fallbackName: string,
): Record<string, unknown> {
  // Case 1: already a root object schema
  if (raw.type === "object") {
    return raw;
  }

  // If schema is a $ref root, resolve from definitions/$defs using the ref path.
  const ref = typeof raw.$ref === "string" ? raw.$ref : null;
  const defs =
    (raw.definitions as Record<string, unknown> | undefined) ??
    (raw.$defs as Record<string, unknown> | undefined);

  if (ref && defs) {
    const defKey =
      extractRefKey(ref, "#/definitions/") ??
      extractRefKey(ref, "#/$defs/");

    if (defKey) {
      const resolved = defs[defKey];
      if (
        resolved &&
        typeof resolved === "object" &&
        (resolved as Record<string, unknown>).type === "object"
      ) {
        return resolved as Record<string, unknown>;
      }

      // If it exists but isn't an object, fail with details
      throw new Error(
        `Resolved schema root is not an object. ref=${ref} resolvedType=${
          resolved && typeof resolved === "object"
            ? String((resolved as any).type)
            : typeof resolved
        }`,
      );
    }
  }

  // Helpful diagnostics: show whether definitions/$defs exist and their keys
  const defKeys = Object.keys((raw.definitions as any) ?? {});
  const defsKeys = Object.keys((raw.$defs as any) ?? {});

  throw new Error(
    `Invalid JSON schema root. Expected type: "object". Got: ${JSON.stringify({
      type: raw.type,
      $ref: raw.$ref,
      definitionsKeys: defKeys.slice(0, 20),
      $defsKeys: defsKeys.slice(0, 20),
    })}`,
  );
}
/**
 * Extracts the definition key from a JSON Schema $ref.
 *
 * Example:
 * - ref: "#/definitions/MySchema" + prefix "#/definitions/" -> "MySchema"
 *
 * @param ref - The $ref string
 * @param prefix - The expected prefix
 * @returns The extracted key or null if prefix doesn't match
 */
function extractRefKey(ref: string, prefix: string): string | null {
  if (!ref.startsWith(prefix)) return null;
  const key = ref.slice(prefix.length);
  return key.length ? key : null;
}
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
    const raw = zodToJsonSchema(input as any, {
      name,
      $refStrategy: "none",
    }) as Record<string, unknown>;

    const schema = resolveRootObjectSchema(raw, name);

    return {
      name,
      schema,
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