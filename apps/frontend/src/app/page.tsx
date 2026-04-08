// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";
import { DashboardArticleList } from "@/components/dashboard/dashboard-article-list";
import { DashboardAuthors } from "@/components/dashboard/dashboard-authors";
import { DashboardTags } from "@/components/dashboard/dashboard-tags";
import { fetchDashboardFeed } from "@/lib/api";

export const dynamic = "force-dynamic";

const launchActions = [
  {
    title: "Open archive",
    description: "Browse the full published article list with pagination and article detail links.",
    href: "/articles",
  },
  {
    title: "Search knowledge",
    description: "Run full-text queries against titles and content from the shared header search flow.",
    href: "/search",
  },
];

export default async function Home() {
  const result = await fetchDashboardFeed();
  const dashboard = result.ok ? result.data : null;
  const latestCount = dashboard?.latestArticles.length ?? 0;
  const trendingCount = dashboard?.mostViewedArticles.length ?? 0;
  const authorCount = dashboard?.activeAuthors.length ?? 0;
  const tagCount = dashboard?.popularTags.length ?? 0;
  const hasDashboardContent =
    latestCount > 0 || trendingCount > 0 || authorCount > 0 || tagCount > 0;

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2.6rem] border border-[var(--color-line)] bg-[linear-gradient(135deg,rgba(255,252,245,0.98),rgba(231,241,235,0.94)_52%,rgba(214,231,228,0.92))] p-8 shadow-[0_24px_90px_rgba(33,37,41,0.08)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-muted)]">
                Discovery dashboard
              </p>
              <h1 className="text-5xl leading-[0.98] text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-7xl">
                Find the most recent, most used, and most shared knowledge from one home surface.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
                This homepage is now backed by the live dashboard API. It surfaces latest published articles,
                trending content by views, active authors, and the most reused tags from the knowledge base.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[22rem]">
              <div className="rounded-[1.7rem] border border-[var(--color-line)] bg-white/85 p-4 shadow-[0_12px_30px_rgba(33,37,41,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Latest</p>
                <p className="mt-3 text-3xl text-[var(--color-foreground)] [font-family:var(--font-display)]">{latestCount}</p>
              </div>
              <div className="rounded-[1.7rem] border border-[var(--color-line)] bg-white/85 p-4 shadow-[0_12px_30px_rgba(33,37,41,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Trending</p>
                <p className="mt-3 text-3xl text-[var(--color-foreground)] [font-family:var(--font-display)]">{trendingCount}</p>
              </div>
              <div className="rounded-[1.7rem] border border-[var(--color-line)] bg-white/85 p-4 shadow-[0_12px_30px_rgba(33,37,41,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Authors</p>
                <p className="mt-3 text-3xl text-[var(--color-foreground)] [font-family:var(--font-display)]">{authorCount}</p>
              </div>
              <div className="rounded-[1.7rem] border border-[var(--color-line)] bg-white/85 p-4 shadow-[0_12px_30px_rgba(33,37,41,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Tags</p>
                <p className="mt-3 text-3xl text-[var(--color-foreground)] [font-family:var(--font-display)]">{tagCount}</p>
              </div>
            </div>
          </div>
        </section>

        {!result.ok ? (
          <section className="rounded-[2rem] border border-[color:color-mix(in_srgb,var(--color-danger)_28%,white)] bg-[color:color-mix(in_srgb,var(--color-danger)_8%,white)] p-6 text-[var(--color-foreground)] shadow-[0_18px_50px_rgba(33,37,41,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-danger)]">
              Dashboard unavailable
            </p>
            <p className="mt-3 max-w-3xl text-base leading-7">{result.message}</p>
          </section>
        ) : !hasDashboardContent ? (
          <section className="rounded-[2rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface)]/90 p-8 shadow-[0_18px_50px_rgba(33,37,41,0.05)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Dashboard feed is live
            </p>
            <h2 className="mt-4 text-3xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-4xl">
              No published content is available yet.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
              The homepage is already wired to the backend dashboard feed, but the current database does not
              have published articles, author activity, or tag usage to surface. As soon as content is published,
              these sections will populate automatically.
            </p>
          </section>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2">
          {launchActions.map((action) => (
            <article
              key={action.title}
              className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.06)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
                Launch point
              </p>
              <h2 className="mt-4 text-3xl text-[var(--color-foreground)] [font-family:var(--font-display)]">
                {action.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-[var(--color-muted)]">{action.description}</p>
              <Link
                href={action.href}
                className="mt-6 inline-flex rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)]"
              >
                {action.title}
              </Link>
            </article>
          ))}
        </section>

        {dashboard ? (
          <section className="grid gap-6 xl:grid-cols-2">
            <DashboardArticleList
              eyebrow="Latest articles"
              title="Freshly published knowledge"
              description="The newest published articles appear here first so teams can catch up on what changed most recently."
              articles={dashboard.latestArticles}
              emptyMessage="No published articles are available yet for the latest content section."
            />
            <DashboardArticleList
              eyebrow="Trending articles"
              title="Most viewed knowledge"
              description="This section highlights the published articles drawing the most attention across the platform."
              articles={dashboard.mostViewedArticles}
              emptyMessage="No trending articles are available yet because there are no published view counts to rank."
            />
          </section>
        ) : null}

        {dashboard ? (
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <DashboardAuthors authors={dashboard.activeAuthors} />
            <DashboardTags tags={dashboard.popularTags} />
          </section>
        ) : null}
      </div>

      {/* Floating action button for creating a new article */}
      <Link
        href="/articles/new"
        aria-label="Create new article"
        className="fixed bottom-8 right-8 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-contrast)] shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-transform transition-colors duration-200 hover:scale-105 hover:bg-[var(--color-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] sm:h-16 sm:w-16"
      >
        <span className="text-2xl sm:text-3xl leading-none">+</span>
      </Link>
    </main>
  );
}
