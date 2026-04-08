import { ArticleForm } from "@/components/articles/article-form";
import { fetchCategoryTree } from "@/lib/api";
import { requireArticleContributorUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  await requireArticleContributorUser("/articles/new");
  const categoryResult = await fetchCategoryTree();

  return <ArticleForm mode="create" categories={categoryResult.ok ? categoryResult.data.categories : []} />;
}
