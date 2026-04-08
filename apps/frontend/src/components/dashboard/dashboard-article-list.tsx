// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";
import type { DashboardArticleSummaryDto } from "@/lib/api-types";
import { formatArticleDate, formatViewCount } from "@/lib/format";
import { buildTagHref } from "@/lib/tag-links";

interface DashboardArticleListProps {
  eyebrow: string;
  title: string;
  description: string;
  articles: DashboardArticleSummaryDto[];
  emptyMessage: string;
}

export function DashboardArticleList({
  eyebrow,
  title,
  description,
  articles,
  emptyMessage,
}: DashboardArticleListProps) {
  return (
    <section className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.07)] sm:p-7">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">{eyebrow}</p>
        <h2 className="text-3xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-4xl">
          {title}
        </h2>
        <p className="text-sm leading-7 text-[var(--color-muted)] sm:text-base">{description}</p>
      </div>

      {articles.length > 0 ? (
        <div className="mt-8 grid gap-4">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className="rounded-[1.6rem] border border-[var(--color-line)] bg-[color:color-mix(in_srgb,var(--color-background)_68%,white)] p-5 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-contrast)]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                    <span>{article.category.name}</span>
                    <span>{formatViewCount(article.views)}</span>
                  </div>
                  <h3 className="mt-3 text-xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-2xl">
                    <Link href={`/articles/${article.id}`} className="transition-colors duration-200 hover:text-[var(--color-accent)]">
                      {article.title}
                    </Link>
                  </h3>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-muted)]">
                    <span>By {article.author.name}</span>
                    <span>{formatArticleDate(article.publishedAt ?? article.createdAt)}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.length > 0 ? (
                      article.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={buildTagHref(tag.id, tag.name)}
                          className="rounded-full bg-[color:color-mix(in_srgb,var(--color-accent)_12%,white)] px-3 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors duration-200 hover:bg-[color:color-mix(in_srgb,var(--color-accent)_18%,white)]"
                        >
                          #{tag.name}
                        </Link>
                      ))
                    ) : (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                        No tags yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[1.6rem] border border-dashed border-[var(--color-line)] bg-[var(--color-background)]/70 p-6 text-sm leading-7 text-[var(--color-muted)]">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}
