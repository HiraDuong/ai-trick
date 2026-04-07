// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";

interface ArticlePaginationProps {
  limit: number;
  skip: number;
  hasMore: boolean;
  nextSkip: number | null;
}

function buildArticlesHref(skip: number, limit: number): string {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });

  return `/articles?${params.toString()}`;
}

export function ArticlePagination({ limit, skip, hasMore, nextSkip }: ArticlePaginationProps) {
  const previousSkip = Math.max(skip - limit, 0);
  const hasPrevious = skip > 0;

  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)]/90 px-5 py-4">
      <p className="text-sm text-[var(--color-muted)]">
        Page offset <span className="font-semibold text-[var(--color-foreground)]">{skip}</span>
      </p>

      <div className="flex items-center gap-3">
        <Link
          href={hasPrevious ? buildArticlesHref(previousSkip, limit) : "#"}
          aria-disabled={!hasPrevious}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
            hasPrevious
              ? "border border-[var(--color-line)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              : "cursor-not-allowed border border-[var(--color-line)] bg-[var(--color-background)] text-[var(--color-muted)]"
          }`}
        >
          Previous
        </Link>

        <Link
          href={hasMore && nextSkip !== null ? buildArticlesHref(nextSkip, limit) : "#"}
          aria-disabled={!hasMore || nextSkip === null}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
            hasMore && nextSkip !== null
              ? "bg-[var(--color-accent)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-strong)]"
              : "cursor-not-allowed border border-[var(--color-line)] bg-[var(--color-background)] text-[var(--color-muted)]"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}