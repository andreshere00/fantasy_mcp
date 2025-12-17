import type { BaseLlmModel } from "../../../infrastructure/llm/base/baseLlm.js";
import type { FantasyMcpClient } from "../../../infrastructure/mcp/client/index.js";
import type { PromptTemplatePort } from "../../../domain/llm/ports.js";

import { buildLineup } from "../lineup/buildLineup.js";
import type { Formation, LineupResult } from "../../../domain/fantasy/alias.js";

export class LineupUseCase {
  constructor(
    private readonly mcp: FantasyMcpClient,
    private readonly llm: BaseLlmModel,
    private readonly prompts: PromptTemplatePort,
  ) {}

  async execute(formation: Formation): Promise<LineupResult> {
    return buildLineup({
      mcp: this.mcp,
      llm: this.llm,
      prompts: this.prompts,
      request: { formation },
    });
  }
}