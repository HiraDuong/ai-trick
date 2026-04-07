// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface)]/90 p-10 text-center shadow-[0_20px_60px_rgba(33,37,41,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
          Article not found
        </p>
        <h1 className="mt-4 text-4xl text-[var(--color-foreground)] [font-family:var(--font-display)]">
          This article is no longer available in the public archive.
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">
          It may have been removed, unpublished, or the URL may be incorrect.
        </p>
        <Link
          href="/articles"
          className="mt-8 inline-flex rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)]"
        >
          Return to article archive
        </Link>
      </div>
    </main>
  );
}