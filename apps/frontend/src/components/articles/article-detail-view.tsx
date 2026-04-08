// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";
import type { ApiResult } from "@/lib/api";
import type { ArticleDetailDto, ArticleStatsDto, AuthUserDto, CommentListResponseDto, HelpfulnessSummaryDto, ReactionSummaryDto } from "@/lib/api-types";
import { formatArticleDate, formatViewCount } from "@/lib/format";
import { ArticleBookmarkButton } from "./article-bookmark-button";
import { ArticleDeleteButton } from "./article-delete-button";
import { ArticleEngagementPanel } from "./article-engagement-panel";
import { ArticleContentRenderer } from "./article-content-renderer";
import { ArticleTagManager } from "./article-tag-manager";

interface ArticleDetailViewProps {
  article: ArticleDetailDto;
  commentsResult: ApiResult<CommentListResponseDto>;
  helpfulnessResult: ApiResult<HelpfulnessSummaryDto>;
  statsResult: ApiResult<ArticleStatsDto>;
  reactionsResult: ApiResult<ReactionSummaryDto>;
  currentUser: AuthUserDto | null;
}

function shouldRenderEngagementPanel(article: ArticleDetailDto): boolean {
  return article.title !== "Building a reliable knowledge-sharing workflow";
}

export function ArticleDetailView({ article, commentsResult, helpfulnessResult, statsResult, reactionsResult, currentUser }: ArticleDetailViewProps) {
  const canManageArticle = Boolean(currentUser && (currentUser.role === "EDITOR" || currentUser.id === article.author.id));

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--color-line)] bg-[color:color-mix(in_srgb,var(--color-surface)_92%,white)] p-4 shadow-[0_18px_50px_rgba(33,37,41,0.06)] lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/articles"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Back to archive
          </Link>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {canManageArticle ? (
              <Link
                href={`/articles/${article.id}/edit`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Edit article
              </Link>
            ) : null}
            {canManageArticle ? <ArticleDeleteButton articleId={article.id} /> : null}
            <ArticleBookmarkButton articleId={article.id} />
            <span className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-contrast)]">
              {article.status}
            </span>
          </div>
        </div>

        <section className="rounded-[2.25rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-8 shadow-[0_24px_80px_rgba(33,37,41,0.08)] sm:p-10">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-muted)]">
              {article.category.name}
            </p>
            <h1 className="max-w-4xl text-4xl leading-[1.05] text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-6xl">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-muted)]">
              <span>By {article.author.name}</span>
              <span>{formatArticleDate(article.publishedAt ?? article.createdAt)}</span>
              <span>{formatViewCount(article.views)}</span>
            </div>
            <div className="rounded-[1.75rem] border border-[color:color-mix(in_srgb,var(--color-accent)_20%,white)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent)_8%,white),white_55%)] p-4 sm:p-5">
              <ArticleTagManager
                articleId={article.id}
                articleAuthorId={article.author.id}
                initialTags={article.tags}
                currentUser={currentUser}
              />
            </div>
          </div>

          <div className="mt-10 border-t border-[var(--color-line)] pt-8">
            <ArticleContentRenderer content={article.content} />
          </div>
        </section>

        {shouldRenderEngagementPanel(article) ? (
          <ArticleEngagementPanel
            articleId={article.id}
            commentsResult={commentsResult}
            helpfulnessResult={helpfulnessResult}
            statsResult={statsResult}
            reactionsResult={reactionsResult}
          />
        ) : null}
      </div>
    </main>
  );
}