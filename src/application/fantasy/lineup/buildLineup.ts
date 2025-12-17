import type { BaseLlmModel } from "../../../infrastructure/llm/base/baseLlm.js";
import type { FantasyMcpClient } from "../../../infrastructure/mcp/client/index.js";
import type { PlayerSnapshot } from "../../../domain/fantasy/models.js";

import { LineupSchema } from "../../../domain/fantasy/models.js";
import  type { LineupResult, Formation } from "../../../domain/fantasy/alias.js";
import { formatLineupPrompt } from "./promptFormatter.js";
import type { PromptTemplatePort } from "../../../domain/llm/ports.js";

export async function buildLineup(deps: {
  mcp: FantasyMcpClient;
  llm: BaseLlmModel;
  prompts: PromptTemplatePort;
  request: { formation: Formation };
}): Promise<LineupResult> {
  const userContext = await deps.mcp.readUserContext();

  const squadCandidates = (userContext as any).squadPlayers?.map((p: any) => p.slug) ?? [];
  const slugsToFetch = squadCandidates.filter(Boolean).slice(0, 16);

  const snapshots: PlayerSnapshot[] = [];
  for (const slug of slugsToFetch) {
    snapshots.push(await deps.mcp.fetchPlayerSnapshot(String(slug), { includeInfo: true, includeMarket: true }));
  }

  const prompt = await formatLineupPrompt({
    prompts: deps.prompts,
    input: {
      formation: deps.request.formation, // ✅ request exists now
      userContext,
      playerSnapshots: snapshots,
    },
  });

  return deps.llm.completeStructured<LineupResult>(prompt, {
    schema: LineupSchema,
    temperature: 0.2,
    maxTokens: 900,
  });
}