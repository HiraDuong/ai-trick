// Luvina
// Vu Huy Hoang - Dev2
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailView } from "@/components/articles/article-detail-view";
import { fetchArticleComments, fetchArticleDetail, fetchArticleHelpfulness, fetchArticleReactions, fetchArticleStats } from "@/lib/api";

export const dynamic = "force-dynamic";

interface ArticleDetailPageProps {
  params: Promise<{ articleId: string }>;
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { articleId } = await params;
  const result = await fetchArticleDetail(articleId);

  if (!result.ok) {
    return {
      title: "Article unavailable | Internal Knowledge Sharing Platform",
    };
  }

  return {
    title: `${result.data.title} | Internal Knowledge Sharing Platform`,
    description: `Read ${result.data.title} by ${result.data.author.name}.`,
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { articleId } = await params;
  const result = await fetchArticleDetail(articleId);

  if (!result.ok) {
    if (result.status === 404) {
      notFound();
    }

    return (
      <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-4xl rounded-[2rem] border border-[color:color-mix(in_srgb,var(--color-danger)_28%,white)] bg-[color:color-mix(in_srgb,var(--color-danger)_8%,white)] p-8 shadow-[0_20px_60px_rgba(33,37,41,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-danger)]">
            Article unavailable
          </p>
          <p className="mt-3 text-base leading-7 text-[var(--color-foreground)]">{result.message}</p>
        </div>
      </main>
    );
  }

  const [commentsResult, helpfulnessResult, statsResult, reactionsResult] = await Promise.all([
    fetchArticleComments(articleId),
    fetchArticleHelpfulness(articleId),
    fetchArticleStats(articleId),
    fetchArticleReactions(articleId),
  ]);

  return (
    <ArticleDetailView
      article={result.data}
      commentsResult={commentsResult}
      helpfulnessResult={helpfulnessResult}
      statsResult={statsResult}
      reactionsResult={reactionsResult}
    />
  );
}