import type { LlmSchema } from "../types/schema.js";

export interface LlmModelInfo {
    provider: string;
    model: string;
    maxTokens: number;
    supportsJson: boolean;
  }
  
export interface CompletionOptions {
    temperature?: number;
    maxTokens?: number;
  }

export interface StructuredCompletionOptions<T> {
  schema: LlmSchema;
  maxTokens?: number;
  temperature?: number;
}
  
export interface LlmModelPort {
  complete(
    prompt: string,
    options?: CompletionOptions,
  ): Promise<string>;

  completeStructured<T>(
    prompt: string,
    options: StructuredCompletionOptions<T>,
  ): Promise<T>;

  getModelInfo(): LlmModelInfo;
}