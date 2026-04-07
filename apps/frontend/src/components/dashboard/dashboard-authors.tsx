// Luvina
// Vu Huy Hoang - Dev2
import type { ActiveAuthorDto } from "@/lib/api-types";

interface DashboardAuthorsProps {
  authors: ActiveAuthorDto[];
}

export function DashboardAuthors({ authors }: DashboardAuthorsProps) {
  return (
    <section className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.07)] sm:p-7">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">Active authors</p>
        <h2 className="text-3xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-4xl">
          Teams publishing knowledge consistently.
        </h2>
        <p className="text-sm leading-7 text-[var(--color-muted)] sm:text-base">
          This ranking is calculated from published article counts in the live backend.
        </p>
      </div>

      {authors.length > 0 ? (
        <div className="mt-8 grid gap-4">
          {authors.map((author, index) => (
            <article
              key={author.id}
              className="flex items-start justify-between gap-4 rounded-[1.6rem] border border-[var(--color-line)] bg-[color:color-mix(in_srgb,var(--color-background)_68%,white)] p-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-contrast)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl text-[var(--color-foreground)] [font-family:var(--font-display)]">
                      {author.name}
                    </h3>
                    <p className="mt-1 truncate text-sm text-[var(--color-muted)]">{author.email}</p>
                  </div>
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)]">
                {author.articleCount} article{author.articleCount === 1 ? "" : "s"}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[1.6rem] border border-dashed border-[var(--color-line)] bg-[var(--color-background)]/70 p-6 text-sm leading-7 text-[var(--color-muted)]">
          No author activity is available yet because there are no published articles in the dashboard feed.
        </div>
      )}
    </section>
  );
}
