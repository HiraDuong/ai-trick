// Luvina
// Vu Huy Hoang - Dev2
import type { ReactNode } from "react";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function renderInlineText(value: JsonValue): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(renderInlineText).filter(Boolean).join(" ");
  }

  if (isObject(value)) {
    if (typeof value.text === "string") {
      return value.text;
    }

    if (Array.isArray(value.children)) {
      return value.children.map(renderInlineText).filter(Boolean).join(" ");
    }

    if (Array.isArray(value.content)) {
      return value.content.map(renderInlineText).filter(Boolean).join(" ");
    }
  }

  return "";
}

function renderBlock(block: JsonValue, key: string): ReactNode {
  if (typeof block === "string") {
    return (
      <p key={key} className="text-base leading-8 text-[var(--color-foreground)]/85">
        {block}
      </p>
    );
  }

  if (Array.isArray(block)) {
    return block.map((item, index) => renderBlock(item, `${key}-${index}`));
  }

  if (!isObject(block)) {
    return null;
  }

  if (Array.isArray(block.blocks)) {
    return block.blocks.map((item, index) => renderBlock(item, `${key}-block-${index}`));
  }

  if (Array.isArray(block.content) && (block.type === "bulletList" || block.type === "orderedList")) {
    const ListTag = block.type === "orderedList" ? "ol" : "ul";
    return (
      <ListTag key={key} className="ml-6 list-outside space-y-2 marker:text-[var(--color-accent)]">
        {block.content.map((item, index) => (
          <li key={`${key}-item-${index}`} className="pl-2 text-base leading-8 text-[var(--color-foreground)]/85">
            {renderInlineText(item)}
          </li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "heading") {
    return (
      <h2 key={key} className="mt-8 text-3xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)]">
        {renderInlineText(block)}
      </h2>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote key={key} className="rounded-[1.5rem] border-l-4 border-[var(--color-accent)] bg-[var(--color-background)] px-5 py-4 text-lg italic text-[var(--color-foreground)]/75">
        {renderInlineText(block)}
      </blockquote>
    );
  }

  if (block.type === "code") {
    return (
      <pre key={key} className="overflow-x-auto rounded-[1.5rem] bg-[#1f2430] p-5 text-sm text-[#f8f5ec]">
        <code>{renderInlineText(block)}</code>
      </pre>
    );
  }

  const text = renderInlineText(block);
  if (text) {
    return (
      <p key={key} className="text-base leading-8 text-[var(--color-foreground)]/85">
        {text}
      </p>
    );
  }

  return (
    <pre key={key} className="overflow-x-auto rounded-[1.5rem] bg-[var(--color-background)] p-5 text-sm text-[var(--color-muted)]">
      {JSON.stringify(block, null, 2)}
    </pre>
  );
}

interface ArticleContentRendererProps {
  content: unknown;
}

export function ArticleContentRenderer({ content }: ArticleContentRendererProps) {
  const normalizedContent = content as JsonValue;

  return <div className="space-y-5">{renderBlock(normalizedContent, "root")}</div>;
}