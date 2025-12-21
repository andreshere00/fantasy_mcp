import OpenAI from "openai";
import type {
  CompletionOptions,
  StructuredCompletionOptions,
  LlmModelInfo,
} from "../../../domain/llm/models.js";
import { BaseLlmModel } from "../base/baseLlm.js";
import { adaptSchemaToJsonSchema } from "../utils/schemaAdapter.js";


/**
 * OpenAI-backed LLM implementation.
 *
 * This class provides a concrete implementation of a Large Language Model
 * using OpenAI's official Node.js SDK. It supports both:
 *
 * - Free-form text completions
 * - Structured (JSON-schema-constrained) completions
 *
 * The class is designed to be used as an infrastructure adapter implementing
 * the LLM port defined at the application layer, following DDD / Clean
 * Architecture principles.
 *
 * @example
 * ```ts
 * const model = new OpenAiModel("gpt-4.1");
 * const text = await model.complete("Explain xG in football");
 * ```
 */
export class OpenAiModel extends BaseLlmModel {
  /** OpenAI SDK client instance */
  private readonly client: OpenAI;

  /**
   * Creates a new OpenAI model adapter.
   *
   * @param model - OpenAI model identifier or deployment name (default: "gpt-4.1")
   * @param apiKey - OpenAI API key. Defaults to `process.env.OPENAI_API_KEY`.
   *
   * @throws {Error} If no API key is provided.
   */
  constructor(
    model = "gpt-4.1", // 4.1 models support structured outputs
    apiKey = process.env.OPENAI_API_KEY!,
  ) {
    super(model);
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Generates a free-form text completion from a prompt.
   *
   * This method is intended for unstructured or semi-structured text generation
   * use cases such as explanations, summaries, or reasoning steps.
   *
   * @param prompt - User prompt to send to the LLM.
   * @param options - Optional generation parameters.
   * @param options.temperature - Sampling temperature controlling randomness.
   * @param options.maxTokens - Maximum number of tokens in the response.
   *
   * @returns A string containing the generated text.
   *
   * @throws {Error} If the OpenAI API call fails.
   */
  async complete(
    prompt: string,
    options?: CompletionOptions,
  ): Promise<string> {
    const result = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: "" },
        { role: "user", content: prompt },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 256,
    });

    return result.choices?.[0]?.message?.content ?? "";
  }

  /**
   * Generates a structured completion that strictly conforms to a JSON Schema.
   *
   * This method uses OpenAI's `response_format: json_schema` capability to
   * enforce schema validity at generation time. It is ideal for deterministic,
   * machine-consumable outputs such as lineup suggestions, recommendations,
   * or configuration objects.
   *
   * @template T - Expected TypeScript type of the structured output.
   *
   * @param prompt - User prompt describing the desired structured output.
   * @param options - Structured completion options.
   * @param options.schema - JSON Schema describing the expected output shape.
   * @param options.maxTokens - Maximum number of tokens in the response.
   * @param options.temperature - Sampling temperature (usually low for structure).
   *
   * @returns An object matching the provided schema and generic type `T`.
   *
   * @throws {Error} If the model returns an empty response.
   * @throws {Error} If the response cannot be parsed as valid JSON.
   */
  async completeStructured<T>(
    prompt: string,
    options: StructuredCompletionOptions<T>,
  ): Promise<T> {
    const { schema, maxTokens, temperature } = options;
  
    const normalized = adaptSchemaToJsonSchema(schema, "structured_output");
  
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: "" },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens ?? 512,
      temperature: temperature ?? 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: normalized.name,
          schema: normalized.schema,
          strict: true,
        },
      },
    });
  
    const raw = response.choices[0]?.message?.content;
  
    if (!raw) {
      throw new Error("Empty structured response");
    }
  
    return JSON.parse(raw) as T;
  }

  /**
   * Returns static metadata about the underlying LLM.
   *
   * This information can be used by application services to make
   * routing or capability decisions (e.g. whether structured outputs
   * are supported).
   *
   * @returns Model metadata and capabilities.
   */
  getModelInfo(): LlmModelInfo {
    return {
      provider: "openai",
      model: this.model,
      maxTokens: 131072,
      supportsJson: true,
    };
  }
}
