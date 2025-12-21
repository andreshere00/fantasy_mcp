import type { Formation } from "../../../domain/fantasy/alias.js";
import type { PlayerSnapshot } from "../../../domain/fantasy/models.js";
import type { PromptTemplatePort } from "../../../domain/llm/ports.js";

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

export async function formatLineupPrompt(deps: {
  prompts: PromptTemplatePort;
  input: {
    formation: Formation;
    userContext: unknown;
    playerSnapshots: PlayerSnapshot[];
  };
}): Promise<string> {
  const template = await deps.prompts.getTemplate("lineup");

  return renderTemplate(template, {
    formation: deps.input.formation,
    userContextJson: JSON.stringify(deps.input.userContext),
    playerSnapshotsJson: JSON.stringify(deps.input.playerSnapshots),
  });
}