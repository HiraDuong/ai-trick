// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";
import type { ArticleListItemDto } from "@/lib/api-types";
import { formatArticleDate, formatViewCount } from "@/lib/format";

interface ArticleCardProps {
  article: ArticleListItemDto;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.08)] transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
            {article.category.name}
          </p>
          <h2 className="max-w-2xl text-2xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-3xl">
            <Link href={`/articles/${article.id}`} className="transition-colors duration-200 hover:text-[var(--color-accent)]">
              {article.title}
            </Link>
          </h2>
        </div>

        <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-background)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
          {article.status}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-muted)]">
        <span>By {article.author.name}</span>
        <span>{formatArticleDate(article.publishedAt ?? article.createdAt)}</span>
        <span>{formatViewCount(article.views)}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {article.tags.length > 0 ? (
          article.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-[color:color-mix(in_srgb,var(--color-accent)_12%,white)] px-3 py-1 text-xs font-medium text-[var(--color-accent)]"
            >
              #{tag.name}
            </span>
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