// Luvina
// Vu Huy Hoang - Dev2
interface SearchHeroProps {
  query: string;
}

export function SearchHero({ query }: SearchHeroProps) {
  return (
    <section className="rounded-[2.5rem] border border-[var(--color-line)] bg-[linear-gradient(135deg,rgba(255,253,248,0.96),rgba(228,240,238,0.9))] p-8 shadow-[0_24px_80px_rgba(33,37,41,0.08)] sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-muted)]">
        Search articles
      </p>
      <h1 className="mt-4 text-4xl leading-[1.02] text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-6xl">
        {query ? `Results for “${query}”` : "Search the knowledge archive"}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
        Search runs against the live backend API and currently uses PostgreSQL full-text search over article titles and content.
      </p>
    </section>
  );
}