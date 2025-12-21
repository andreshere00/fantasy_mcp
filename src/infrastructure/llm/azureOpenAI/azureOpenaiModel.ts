import OpenAI from "openai";
import type {
  CompletionOptions,
  StructuredCompletionOptions,
  LlmModelInfo,
} from "../../../domain/llm/models.js";
import { BaseLlmModel } from "../base/baseLlm.js";
import { adaptSchemaToJsonSchema } from "../utils/schemaAdapter.js";

/**
 * Azure OpenAI-backed LLM implementation.
 *
 * This adapter uses the OpenAI JavaScript SDK configured for Azure OpenAI.
 * Secrets and endpoint configuration MUST come from the MCP server process
 * environment (ideally injected from Azure Key Vault via Managed Identity).
 */
export class AzureOpenAiModel extends BaseLlmModel {
  private readonly client: OpenAI;
  private readonly deployment: string;

  constructor(
    deployment = process.env.AZURE_OPENAI_DEPLOYMENT!,
    endpoint = process.env.AZURE_OPENAI_ENDPOINT!,
    apiKey = process.env.AZURE_OPENAI_API_KEY!,
    apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2025-04-01-preview",
  ) {
    super(deployment);
    this.deployment = deployment;

    if (!endpoint) throw new Error("Missing AZURE_OPENAI_ENDPOINT");
    if (!apiKey) throw new Error("Missing AZURE_OPENAI_API_KEY");
    if (!deployment) throw new Error("Missing AZURE_OPENAI_DEPLOYMENT");

    // OpenAI SDK configured for Azure
    this.client = new OpenAI({
      apiKey,
      baseURL: `${endpoint.replace(/\/+$/, "")}/openai/deployments/${deployment}`,
      defaultQuery: { "api-version": apiVersion },
      defaultHeaders: { "api-key": apiKey },
    });
  }

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const result = await this.client.chat.completions.create({
      model: this.deployment,
      messages: [{ role: "user", content: prompt }],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 256,
    });

    return result.choices?.[0]?.message?.content ?? "";
  }

  async completeStructured<T>(
    prompt: string,
    options: StructuredCompletionOptions<T>,
  ): Promise<T> {
    const normalized = adaptSchemaToJsonSchema(options.schema, "structured_output");

    const result = await this.client.chat.completions.create({
      model: this.deployment,
      messages: [{ role: "user", content: prompt }],
      max_tokens: options.maxTokens ?? 512,
      temperature: options.temperature ?? 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: normalized.name,
          schema: normalized.schema,
          strict: true,
        },
      },
    });

    const raw = result.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty structured response");
    return JSON.parse(raw) as T;
  }

  getModelInfo(): LlmModelInfo {
    return {
      provider: "azure-openai",
      model: this.deployment,
      maxTokens: 131072,
      supportsJson: true,
    };
  }
}