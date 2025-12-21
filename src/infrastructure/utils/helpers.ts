import { isObject, isTextContent } from "../../domain/mcp/constants.js";

/**
 * Extracts the first text payload from an MCP tool result.
 *
 * @param result - Raw result returned by `client.callTool(...)`
 * @returns The first text content item
 * @throws Error if content is missing or not a text item
 */
export function firstToolText(result: unknown): string {
    if (!isObject(result)) {
      throw new Error("Invalid tool result: expected object");
    }
  
    const content = result.content;
  
    if (!Array.isArray(content)) {
      throw new Error("Invalid tool result: content is not an array");
    }
  
    const first = content[0];
    if (!isTextContent(first)) {
      throw new Error("Invalid tool result: first content item is not text");
    }
  
    return first.text;
  }

/**
 * Extracts the first text payload from an MCP resource read result.
 *
 * @param result - Raw result returned by `client.readResource(...)`
 * @returns The first text content item
 * @throws Error if contents is missing or not a text item
 */
export function firstResourceText(result: unknown): string {
    if (!isObject(result)) {
      throw new Error("Invalid resource result: expected object");
    }
  
    const contents = result.contents;
  
    if (!Array.isArray(contents)) {
      throw new Error("Invalid resource result: contents is not an array");
    }
  
    // Resource content items often look like { uri, mimeType, text }
    const first = contents[0];
    if (!isObject(first) || typeof first.text !== "string") {
      throw new Error("Invalid resource result: first contents item has no text");
    }
  
    return first.text;
  }