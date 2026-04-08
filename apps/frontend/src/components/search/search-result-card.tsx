// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";
import type { SearchArticleItemDto } from "@/lib/api-types";
import { formatArticleDate, formatViewCount } from "@/lib/format";
import { buildTagHref } from "@/lib/tag-links";

interface SearchResultCardProps {
  item: SearchArticleItemDto;
}

export function SearchResultCard({ item }: SearchResultCardProps) {
  return (
    <article className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.08)]">
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
        <span>{item.category.name}</span>
        <span>Score {item.score.toFixed(2)}</span>
      </div>
      <Link
        href={`/articles/${item.id}`}
        className="mt-4 block text-2xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] transition-colors duration-200 hover:text-[var(--color-accent)] sm:text-3xl"
      >
        {item.title}
      </Link>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-muted)]">
        <span>By {item.author.name}</span>
        <span>{formatArticleDate(item.publishedAt ?? item.createdAt)}</span>
        <span>{formatViewCount(item.views)}</span>
      </div>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">{item.excerpt}</p>
      {item.highlightTerms.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.highlightTerms.map((term) => (
            <span
              key={term}
              className="rounded-full border border-[color:color-mix(in_srgb,var(--color-accent)_26%,white)] bg-[color:color-mix(in_srgb,var(--color-accent)_8%,white)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]"
            >
              {term}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {item.tags.length > 0 ? (
          item.tags.map((tag) => (
            <Link
              key={tag.id}
              href={buildTagHref(tag.id, tag.name)}
              className="rounded-full bg-[color:color-mix(in_srgb,var(--color-accent)_12%,white)] px-3 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors duration-200 hover:bg-[color:color-mix(in_srgb,var(--color-accent)_18%,white)]"
            >
              #{tag.name}
            </Link>
          ))
        ) : (
          <span className="rounded-full bg-[var(--color-background)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
            No tags yet
          </span>
        )}
      </div>
    </article>
  );
}