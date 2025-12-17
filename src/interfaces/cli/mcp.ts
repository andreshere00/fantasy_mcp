import "dotenv/config";

import { FantasyMcpClient } from "../../infrastructure/mcp/client/index.js";
import { AzureOpenAiModel } from "../../infrastructure/llm/azureOpenAI/azureOpenaiModel.js";
import { LineupUseCase } from "../../application/fantasy/e2e/lineupBuilder.js";

import { join } from "node:path";
import { FilePromptTemplateAdapter } from "../../infrastructure/mcp/server/prompts/promptTemplateAdapter.js";

import { ConsoleUserContext } from "../../infrastructure/fantasy/userContext/userContext.js";
import { getUserContextSnapshot } from "../../application/fantasy/e2e/getUserContext.js";

async function main(): Promise<void> {
  const formation = (process.argv[2] ?? "433") as any;

  // ✅ Collect context in the CLI (interactive OK here)
  const consoleContext = new ConsoleUserContext();
  const snapshot = await getUserContextSnapshot({
    balance: consoleContext,
    squad: consoleContext,
    market: consoleContext,
    opponents: consoleContext,
  });
  await consoleContext.close();

  // ✅ Connect to MCP server
  const mcp = new FantasyMcpClient();
  await mcp.connect("bun", ["run", "mcp:server"]);

  try {
    // ✅ Push context into server memory
    await mcp.setUserContext(snapshot);

    const llm = new AzureOpenAiModel();

    const prompts = new FilePromptTemplateAdapter(
        join(process.cwd(), "src/infrastructure/mcp/server/prompts/templates"),
      );
      
    const useCase = new LineupUseCase(mcp, llm, prompts);

    const lineup = await useCase.execute(formation);
    console.log(JSON.stringify(lineup, null, 2));
  } finally {
    await mcp.close();
  }
}

void main();
