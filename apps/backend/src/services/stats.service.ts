// Luvina
// Vu Huy Hoang - Dev2
import { findArticleAccessById } from "../repositories/article.repository";
import { findArticleStatsById } from "../repositories/stats.repository";
import type { AuthenticatedUser } from "../types/auth.types";
import type { ArticleStatsDto } from "../types/stats.types";
import { createHttpError } from "../utils/error.utils";
import { canManageArticle, hasStudioAccessRole } from "../utils/studio-access.utils";

function readArticleId(articleId: string): string {
  const normalizedArticleId = articleId.trim();
  if (!normalizedArticleId) {
    throw createHttpError(400, "Article id is required");
  }

  return normalizedArticleId;
}

async function ensureArticleIsAccessible(articleId: string, user: AuthenticatedUser | undefined): Promise<void> {
  const article = await findArticleAccessById(articleId);
  if (!article) {
    throw createHttpError(404, "Article not found");
  }

  if (article.status !== "PUBLISHED") {
    if (!user) {
      throw createHttpError(404, "Article not found");
    }

    if (!hasStudioAccessRole(user.role) || !canManageArticle(user, article.authorId)) {
      throw createHttpError(403, "You do not have permission to access article statistics");
    }
  }
}

export async function getArticleStats(articleId: string, user: AuthenticatedUser | undefined): Promise<ArticleStatsDto> {
  const normalizedArticleId = readArticleId(articleId);
  await ensureArticleIsAccessible(normalizedArticleId, user);
  const stats = await findArticleStatsById(normalizedArticleId);

  if (!stats) {
    throw createHttpError(404, "Article not found");
  }

  return stats;
}