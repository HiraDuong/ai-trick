// Luvina
// Vu Huy Hoang - Dev2
import type { Prisma } from "@prisma/client";
import { findArticleAccessById, findArticleDetailById, updateArticle } from "../repositories/article.repository";
import { createArticleVersionIfChanged, findArticleVersionById, findArticleVersions } from "../repositories/version.repository";
import type { AuthenticatedUser } from "../types/auth.types";
import type { ArticleVersionDto, RestoreArticleVersionRequestDto } from "../types/version.types";
import { createHttpError } from "../utils/error.utils";
import { areJsonValuesEqual } from "../utils/json-content.utils";
import { canManageArticle, ensureStudioAccessUser } from "../utils/studio-access.utils";

function ensureVersionManagerUser(user: AuthenticatedUser | undefined): asserts user is AuthenticatedUser {
  ensureStudioAccessUser(user, "Only authors or editors can manage article versions");
}

function readArticleId(articleId: string): string {
  const normalizedArticleId = articleId.trim();
  if (!normalizedArticleId) {
    throw createHttpError(400, "Article id is required");
  }

  return normalizedArticleId;
}

function readVersionId(payload: RestoreArticleVersionRequestDto | unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createHttpError(400, "Request body must be a JSON object");
  }

  const versionId = (payload as { versionId?: unknown }).versionId;
  if (typeof versionId !== "string" || !versionId.trim()) {
    throw createHttpError(400, "Version id is required");
  }

  return versionId.trim();
}

async function ensureOwnedArticle(articleId: string, user: AuthenticatedUser | undefined): Promise<void> {
  ensureVersionManagerUser(user);
  const article = await findArticleAccessById(articleId);
  if (!article) {
    throw createHttpError(404, "Article not found");
  }
  if (!canManageArticle(user, article.authorId)) {
    throw createHttpError(403, "You do not have permission to manage this article version history");
  }
}

export async function getVersions(articleId: string, user: AuthenticatedUser | undefined): Promise<ArticleVersionDto[]> {
  const normalizedArticleId = readArticleId(articleId);
  await ensureOwnedArticle(normalizedArticleId, user);
  return findArticleVersions(normalizedArticleId);
}

export async function restoreVersion(
  articleId: string,
  payload: RestoreArticleVersionRequestDto | unknown,
  user: AuthenticatedUser | undefined
): Promise<ArticleVersionDto[]> {
  const normalizedArticleId = readArticleId(articleId);
  await ensureOwnedArticle(normalizedArticleId, user);
  ensureVersionManagerUser(user);
  const versionId = readVersionId(payload);
  const [article, version] = await Promise.all([
    findArticleDetailById(normalizedArticleId),
    findArticleVersionById(normalizedArticleId, versionId),
  ]);

  if (!article) {
    throw createHttpError(404, "Article not found");
  }
  if (!version) {
    throw createHttpError(404, "Version not found");
  }

  if (areJsonValuesEqual(article.content, version.contentSnapshot)) {
    return findArticleVersions(normalizedArticleId);
  }

  await createArticleVersionIfChanged(normalizedArticleId, user.id, article.content);
  await updateArticle(normalizedArticleId, {
    content: version.contentSnapshot as Prisma.InputJsonValue,
  });

  return findArticleVersions(normalizedArticleId);
}