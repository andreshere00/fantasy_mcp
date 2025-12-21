import type { McpTextContent } from "./alias.js";

export const isObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

export const isTextContent = (v: unknown): v is McpTextContent => {
    if (!isObject(v)) return false;
    return v.type === "text" && typeof v.text === "string";
  };