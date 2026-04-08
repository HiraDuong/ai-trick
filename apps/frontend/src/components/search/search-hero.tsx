// Luvina
// Vu Huy Hoang - Dev2
interface SearchHeroProps {
  query: string;
  mode?: "search" | "tag";
}

export function SearchHero({ query, mode = "search" }: SearchHeroProps) {
  const eyebrow = mode === "tag" ? "Browse tag" : "Search articles";
  const title = mode === "tag"
    ? (query ? `Articles tagged “${query}”` : "Browse articles by tag")
    : (query ? `Results for “${query}”` : "Search the knowledge archive");
  const description = mode === "tag"
    ? "This view lists published articles associated with the selected tag, using the tag identifier rather than a fragile text search."
    : "Search runs against the live backend API and currently uses PostgreSQL full-text search over article titles, content, and exact tag matches.";

  return (
    <section className="rounded-[2.5rem] border border-[var(--color-line)] bg-[linear-gradient(135deg,rgba(255,253,248,0.96),rgba(228,240,238,0.9))] p-8 shadow-[0_24px_80px_rgba(33,37,41,0.08)] sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-muted)]">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-4xl leading-[1.02] text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-6xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
        {description}
      </p>
    </section>
  );
}