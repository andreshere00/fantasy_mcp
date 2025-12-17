import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { PromptTemplatePort } from "../../../../domain/llm/ports.js";

export class FilePromptTemplateAdapter implements PromptTemplatePort {
  constructor(private readonly templatesDir: string) {}

  async getTemplate(name: string): Promise<string> {
    const filePath = join(this.templatesDir, `${name}.prompt.md`);
    return readFile(filePath, "utf-8");
  }
}
