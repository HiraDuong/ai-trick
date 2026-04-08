// Luvina
// Vu Huy Hoang - Dev2
import type { Prisma } from "@prisma/client";

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function flattenContentNode(node: unknown): string[] {
  if (!node || typeof node !== "object" || Array.isArray(node)) {
    return [];
  }

  const contentNode = node as Record<string, unknown>;
  const parts: string[] = [];

  if (typeof contentNode.text === "string" && contentNode.text.trim()) {
    parts.push(contentNode.text.trim());
  }

  if (typeof contentNode.content === "string" && contentNode.content.trim()) {
    parts.push(contentNode.content.trim());
  }

  parts.push(...readStringArray(contentNode.items));

  if (Array.isArray(contentNode.content)) {
    for (const childNode of contentNode.content) {
      parts.push(...flattenContentNode(childNode));
    }
  }

  return parts;
}

export function extractPlainTextFromContent(content: Prisma.JsonValue): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .flatMap((node) => flattenContentNode(node))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildExcerpt(content: Prisma.JsonValue, keyword?: string, maxLength = 180): string {
  const plainText = extractPlainTextFromContent(content);
  if (!plainText) {
    return "No excerpt available.";
  }

  if (!keyword || keyword.trim().length === 0) {
    return plainText.length <= maxLength ? plainText : `${plainText.slice(0, maxLength).trimEnd()}...`;
  }

  const normalizedKeyword = keyword.trim().toLowerCase();
  const normalizedText = plainText.toLowerCase();
  const matchIndex = normalizedText.indexOf(normalizedKeyword);

  if (matchIndex === -1) {
    return plainText.length <= maxLength ? plainText : `${plainText.slice(0, maxLength).trimEnd()}...`;
  }

  const contextPadding = Math.max(24, Math.floor((maxLength - normalizedKeyword.length) / 2));
  const start = Math.max(0, matchIndex - contextPadding);
  const end = Math.min(plainText.length, matchIndex + normalizedKeyword.length + contextPadding);
  const excerpt = plainText.slice(start, end).trim();

  return `${start > 0 ? "..." : ""}${excerpt}${end < plainText.length ? "..." : ""}`;
}