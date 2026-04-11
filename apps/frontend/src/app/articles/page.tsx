// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticlePagination } from "@/components/articles/article-pagination";
import { fetchPublishedArticles } from "@/lib/api";

export const dynamic = "force-dynamic";

interface ArticlesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseInteger(value: string | string[] | undefined, fallback: number): number {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  if (!normalizedValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(normalizedValue, 10);
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : fallback;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const resolvedSearchParams = await searchParams;
  const skip = parseInteger(resolvedSearchParams.skip, 0);
  const limit = Math.min(Math.max(parseInteger(resolvedSearchParams.limit, 6), 1), 12);
  const categoryId = typeof resolvedSearchParams.categoryId === "string" ? resolvedSearchParams.categoryId.trim() : "";
  const categoryName = typeof resolvedSearchParams.categoryName === "string" ? resolvedSearchParams.categoryName.trim() : "";
  const result = await fetchPublishedArticles(skip, limit, { categoryId: categoryId || undefined });

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-[2.5rem] border border-[var(--color-line)] bg-[linear-gradient(135deg,rgba(255,253,248,0.96),rgba(230,242,238,0.9))] p-8 shadow-[0_24px_80px_rgba(33,37,41,0.08)] sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-muted)]">
                Article archive
              </p>
              <h1 className="text-4xl leading-[1.02] text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-6xl">
                Browse published knowledge without leaving the system context.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
                This page is wired directly to the backend article APIs. It shows live published content,
                real pagination, and links through to the full optimized article detail experience.
              </p>
              {categoryId ? (
                <p className="inline-flex w-fit rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)]">
                  Category filter: {categoryName || categoryId}
                </p>
              ) : null}
            </div>

            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Platform home
            </Link>
          </div>
        </section>

        {!result.ok ? (
          <section className="rounded-[2rem] border border-[color:color-mix(in_srgb,var(--color-danger)_28%,white)] bg-[color:color-mix(in_srgb,var(--color-danger)_8%,white)] p-6 text-[var(--color-foreground)] shadow-[0_18px_50px_rgba(33,37,41,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-danger)]">
              Article list unavailable
            </p>
            <p className="mt-3 text-base leading-7">{result.message}</p>
          </section>
        ) : (
          <>
            <section className="grid gap-5">
              {result.data.items.length > 0 ? (
                result.data.items.map((article) => <ArticleCard key={article.id} article={article} />)
              ) : (
                <div className="rounded-[2rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface)]/90 p-10 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                    No published articles
                  </p>
                  <p className="mt-4 text-lg text-[var(--color-foreground)]/80">
                    The backend returned an empty list for this page window.
                  </p>
                </div>
              )}
            </section>

            <ArticlePagination
              limit={result.data.pagination.limit}
              skip={result.data.pagination.skip}
              hasMore={result.data.pagination.hasMore}
              nextSkip={result.data.pagination.nextSkip}
            />
          </>
        )}
      </div>
    </main>
  );
}