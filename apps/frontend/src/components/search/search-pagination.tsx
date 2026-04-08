// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";
import type { SearchPaginationDto } from "@/lib/api-types";

interface SearchPaginationProps {
  query: string;
  skip: number;
  limit: number;
  pagination: SearchPaginationDto;
  tagId?: string;
}

function buildResultsHref(query: string, nextSkip: number, limit: number, tagId?: string): string {
  const params = new URLSearchParams({
    skip: String(nextSkip),
    limit: String(limit),
  });

  if (tagId) {
    if (query) {
      params.set("name", query.replace(/^#+/, ""));
    }

    return `/tags/${tagId}?${params.toString()}`;
  }

  if (query) {
    params.set("q", query);
  }

  return `/search?${params.toString()}`;
}

export function SearchPagination({ query, skip, limit, pagination, tagId }: SearchPaginationProps) {
  const previousSkip = Math.max(skip - limit, 0);
  const canGoPrevious = skip > 0;
  const canGoNext = pagination.hasMore && pagination.nextSkip !== null;
  const disabledClassName =
    "cursor-not-allowed rounded-full border border-[var(--color-line)] bg-[var(--color-background)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)]";

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)]/90 px-5 py-4">
      <p className="text-sm text-[var(--color-muted)]">{pagination.total} total matches</p>

      <div className="flex items-center gap-3">
        {canGoPrevious ? (
          <Link
            href={buildResultsHref(query, previousSkip, limit, tagId)}
            className="rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Previous
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledClassName}>
            Previous
          </span>
        )}

        {canGoNext ? (
          <Link
            href={buildResultsHref(query, pagination.nextSkip!, limit, tagId)}
            className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)]"
          >
            Next
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledClassName}>
            Next
          </span>
        )}
      </div>
    </div>
  );
}