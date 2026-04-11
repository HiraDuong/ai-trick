import { ArticleForm } from "@/components/articles/article-form";
import { fetchCategoryTree } from "@/lib/api";
import { requireArticleContributorUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

interface EditArticlePageProps {
  params: Promise<{ articleId: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { articleId } = await params;
  await requireArticleContributorUser(`/articles/${articleId}/edit`);
  const categoryResult = await fetchCategoryTree();

  return (
    <ArticleForm
      mode="edit"
      articleId={articleId}
      categories={categoryResult.ok ? categoryResult.data.categories : []}
    />
  );
}
