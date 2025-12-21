import type { CompletionOptions, LlmModelInfo, StructuredCompletionOptions } from "./models.js";

export interface PromptTemplatePort {
    /**
     * Returns a named prompt template as plain text.
     *
     * The template can contain placeholders like:
     * - {{formation}}
     * - {{userContextJson}}
     * - {{playerSnapshotsJson}}
     */
    getTemplate(name: string): Promise<string>;
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