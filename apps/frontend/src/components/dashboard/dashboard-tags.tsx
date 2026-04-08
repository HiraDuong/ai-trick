// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";
import type { PopularTagDto } from "@/lib/api-types";
import { buildTagHref } from "@/lib/tag-links";

interface DashboardTagsProps {
  tags: PopularTagDto[];
}

export function DashboardTags({ tags }: DashboardTagsProps) {
  return (
    <section className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.07)] sm:p-7">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">Popular tags</p>
        <h2 className="text-3xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-4xl">
          Topics that are drawing the most reuse.
        </h2>
        <p className="text-sm leading-7 text-[var(--color-muted)] sm:text-base">
          Tag popularity is based on how often published articles reference each topic.
        </p>
      </div>

      {tags.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={buildTagHref(tag.id, tag.name)}
              className="inline-flex items-center gap-3 rounded-full border border-[var(--color-line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <span>#{tag.name}</span>
              <span className="rounded-full bg-[var(--color-background)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {tag.articleCount}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[1.6rem] border border-dashed border-[var(--color-line)] bg-[var(--color-background)]/70 p-6 text-sm leading-7 text-[var(--color-muted)]">
          No popular tags are available yet because the published knowledge base is still empty.
        </div>
      )}
    </section>
  );
}
