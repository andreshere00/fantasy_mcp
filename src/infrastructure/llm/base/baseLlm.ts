import type {
  LlmModelPort,
  CompletionOptions,
  StructuredCompletionOptions,
  LlmModelInfo,
} from "../../../application/llm/ports/llmPorts.js";

/**
 * ======================
 * Base LLM Class
 * ======================
 */

/**
 * Abstract base class for Large Language Model adapters.
 *
 * This class:
 * - implements the {@link LlmModelPort} contract
 * - stores common configuration (model identifier)
 * - provides a shared foundation for concrete LLM implementations
 *
 * Subclasses are expected to handle:
 * - provider-specific API calls
 * - authentication
 * - error handling and retries
 */
export abstract class BaseLlmModel implements LlmModelPort {
  /**
   * Identifier of the underlying model as expected by the provider.
   */
  protected readonly model: string;

  /**
   * @param model - Model identifier (e.g. "gpt-4o-mini", "llama3")
   */
  constructor(model: string) {
    this.model = model;
  }

  /**
   * Executes a free-form text completion.
   *
   * @param prompt - Prompt sent to the LLM
   * @param options - Optional completion configuration
   * @returns Raw text completion from the model
   */
  abstract complete(
    prompt: string,
    options?: CompletionOptions,
  ): Promise<string>;

  /**
   * Executes a structured completion constrained by a schema.
   *
   * Implementations must ensure that the returned value:
   * - conforms to the provided schema
   * - is parsed into the expected generic type
   *
   * @typeParam T - Expected structured output type
   * @param prompt - Prompt sent to the LLM
   * @param options - Structured completion configuration
   * @returns Parsed and validated structured response
   */
  abstract completeStructured<T>(
    prompt: string,
    options: StructuredCompletionOptions<T>,
  ): Promise<T>;

  /**
   * Returns metadata describing the underlying model.
   *
   * This information may be used for:
   * - capability checks
   * - dynamic token limits
   * - logging and observability
   */
  abstract getModelInfo(): LlmModelInfo;
}