import type { LlmSchema } from "../types/schema.js";

/**
 * ======================
 * LLM Model Metadata
 * ======================
 */

/**
 * Describes the capabilities and limits of an LLM model.
 *
 * This information is intended for:
 * - capability checks (e.g. structured output support)
 * - dynamic prompt sizing
 * - logging / observability
 */
export interface LlmModelInfo {
  /**
   * Provider name (e.g. "openai", "ollama", "anthropic").
   */
  provider: string;

  /**
   * Model identifier as expected by the provider.
   *
   * Example: "gpt-4.1", "gpt-4o-mini", "llama3"
   */
  model: string;

  /**
   * Maximum number of tokens the model can generate
   * (or accept, depending on provider semantics).
   */
  maxTokens: number;

  /**
   * Indicates whether the model supports native structured (JSON) output.
   */
  supportsJson: boolean;
}

/**
 * ======================
 * Completion Options
 * ======================
 */

/**
 * Configuration options for a free-form text completion.
 */
export interface CompletionOptions {
  /**
   * Sampling temperature.
   *
   * Higher values increase randomness, lower values increase determinism.
   *
   * @defaultValue Provider default
   */
  temperature?: number;

  /**
   * Maximum number of tokens to generate for the completion.
   *
   * @defaultValue Provider default
   */
  maxTokens?: number;
}

/**
 * Configuration options for a structured (schema-constrained) completion.
 *
 * @typeParam T - Expected output type after schema validation
 */
export interface StructuredCompletionOptions<T> {
  /**
   * Schema describing the expected JSON output.
   *
   * This is typically used to:
   * - validate LLM output
   * - coerce responses into a predictable structure
   */
  schema: LlmSchema;

  /**
   * Maximum number of tokens to generate for the completion.
   *
   * @defaultValue Provider default
   */
  maxTokens?: number;

  /**
   * Sampling temperature.
   *
   * @defaultValue Provider default
   */
  temperature?: number;
}

/**
 * ======================
 * LLM Model Port
 * ======================
 */

/**
 * Port defining the contract for interacting with a Large Language Model.
 *
 * Implementations may wrap:
 * - OpenAI
 * - local models (Ollama, LM Studio)
 * - mocks for testing
 *
 * The port exposes both free-form and schema-constrained completions.
 */
export interface LlmModelPort {
  /**
   * Executes a free-form text completion.
   *
   * @param prompt - Prompt sent to the LLM
   * @param options - Optional generation configuration
   * @returns Raw text response from the model
   */
  complete(
    prompt: string,
    options?: CompletionOptions,
  ): Promise<string>;

  /**
   * Executes a structured completion constrained by a schema.
   *
   * Implementations are responsible for:
   * - ensuring the model returns valid JSON
   * - validating/parsing the response against the provided schema
   *
   * @typeParam T - Expected output type
   * @param prompt - Prompt sent to the LLM
   * @param options - Structured completion configuration
   * @returns Parsed and validated structured response
   */
  completeStructured<T>(
    prompt: string,
    options: StructuredCompletionOptions<T>,
  ): Promise<T>;

  /**
   * Returns metadata describing the underlying model.
   */
  getModelInfo(): LlmModelInfo;
}