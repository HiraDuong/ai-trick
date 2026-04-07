// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";
import type { ArticleDetailDto } from "@/lib/api-types";
import { formatArticleDate, formatViewCount } from "@/lib/format";
import { ArticleContentRenderer } from "./article-content-renderer";

interface ArticleDetailViewProps {
  article: ArticleDetailDto;
}

export function ArticleDetailView({ article }: ArticleDetailViewProps) {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/articles"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Back to archive
          </Link>

          <span className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-contrast)]">
            {article.status}
          </span>
        </div>

        <section className="rounded-[2.25rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-8 shadow-[0_24px_80px_rgba(33,37,41,0.08)] sm:p-10">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-muted)]">
              {article.category.name}
            </p>
            <h1 className="max-w-4xl text-4xl leading-[1.05] text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-6xl">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-muted)]">
              <span>By {article.author.name}</span>
              <span>{formatArticleDate(article.publishedAt ?? article.createdAt)}</span>
              <span>{formatViewCount(article.views)}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
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
          </div>

          <div className="mt-10 border-t border-[var(--color-line)] pt-8">
            <ArticleContentRenderer content={article.content} />
          </div>
        </section>
      </div>
    </main>
  );
}