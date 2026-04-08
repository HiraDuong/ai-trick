// Luvina
// Vu Huy Hoang - Dev2
import type { ApiResult } from "@/lib/api";
import type { ArticleStatsDto, CommentListResponseDto, HelpfulnessSummaryDto, ReactionSummaryDto } from "@/lib/api-types";
import { ArticleHelpfulnessCard } from "./article-helpfulness-card";
import { ArticleCommentsCard } from "./article-comments-card";
import { ArticleReactionBar } from "./article-reaction-bar";

interface ArticleEngagementPanelProps {
  articleId: string;
  commentsResult: ApiResult<CommentListResponseDto>;
  helpfulnessResult: ApiResult<HelpfulnessSummaryDto>;
  statsResult: ApiResult<ArticleStatsDto>;
  reactionsResult: ApiResult<ReactionSummaryDto>;
}

function StatsCard({ statsResult }: { statsResult: ApiResult<ArticleStatsDto> }) {
  return (
    <article className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.07)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">Article statistics</p>
      <h2 className="mt-3 text-3xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-4xl">
        Live engagement snapshot
      </h2>
      {!statsResult.ok ? (
        <p className="mt-5 text-sm leading-7 text-[var(--color-danger)]">{statsResult.message}</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Views</p>
            <p className="mt-2 text-3xl text-[var(--color-foreground)]">{statsResult.data.views}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Comments</p>
            <p className="mt-2 text-3xl text-[var(--color-foreground)]">{statsResult.data.comments}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Helpful votes</p>
            <p className="mt-2 text-3xl text-[var(--color-foreground)]">{statsResult.data.helpful}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Not helpful votes</p>
            <p className="mt-2 text-3xl text-[var(--color-foreground)]">{statsResult.data.notHelpful}</p>
          </div>
        </div>
      )}
    </article>
  );
}

export function ArticleEngagementPanel({ articleId, commentsResult, helpfulnessResult, statsResult, reactionsResult }: ArticleEngagementPanelProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-6">
        <ArticleHelpfulnessCard key={articleId} articleId={articleId} helpfulnessResult={helpfulnessResult} />
        <StatsCard statsResult={statsResult} />
        <ArticleReactionBar articleId={articleId} initialSummary={reactionsResult.ok ? reactionsResult.data : null} />
      </div>

      <ArticleCommentsCard articleId={articleId} commentsResult={commentsResult} />
    </section>
  );
}
