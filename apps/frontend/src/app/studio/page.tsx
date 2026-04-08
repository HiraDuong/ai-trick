// Luvina
// Vu Huy Hoang - Dev2
import { DraftStudio } from "@/components/studio/draft-studio";
import { fetchCategoryTree } from "@/lib/api";
import { requireStudioUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  await requireStudioUser("/studio");
  const categoriesResult = await fetchCategoryTree();

  return <DraftStudio categories={categoriesResult.ok ? categoriesResult.data.categories : []} />;
}