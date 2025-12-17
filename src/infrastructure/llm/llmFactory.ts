import type { BaseLlmModel } from "./base/baseLlm.js";
import { OpenAiModel } from "./openai/openaiModel.js";
import { AzureOpenAiModel } from "./azureOpenAI/azureOpenaiModel.js";
import type { LlmProvider } from "../../domain/llm/alias.js";

export function buildLlmModel(provider: LlmProvider): BaseLlmModel {
  switch (provider) {
    case "openai":
      return new OpenAiModel();
    case "azure-openai":
      return new AzureOpenAiModel();
    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unsupported LLM provider: ${String(_exhaustive)}`);
    }
  }
}