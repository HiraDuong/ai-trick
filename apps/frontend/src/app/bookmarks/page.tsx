// Luvina
// Vu Huy Hoang - Dev2
import { BookmarksView } from "@/components/bookmarks/bookmarks-view";
import { requireAuthenticatedUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  await requireAuthenticatedUser("/bookmarks");
  return <BookmarksView />;
}