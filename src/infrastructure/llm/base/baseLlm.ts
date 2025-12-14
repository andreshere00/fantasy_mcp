import type {
    LlmModelPort,
    CompletionOptions,
    StructuredCompletionOptions,
    LlmModelInfo,
  } from "../../../application/llm/ports/llmPorts.js"
  
  export abstract class BaseLlmModel implements LlmModelPort {
    protected readonly model: string;
  
    constructor(model: string) {
      this.model = model;
    }
  
    abstract complete(
      prompt: string,
      options?: CompletionOptions,
    ): Promise<string>;
  
    abstract completeStructured<T>(
      prompt: string,
      options: StructuredCompletionOptions<T>,
    ): Promise<T>;
  
    abstract getModelInfo(): LlmModelInfo;
  }