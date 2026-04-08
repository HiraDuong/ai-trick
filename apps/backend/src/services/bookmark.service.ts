// Luvina
// Vu Huy Hoang - Dev2
import { findArticleAccessById } from "../repositories/article.repository";
import { deleteBookmark, findBookmarksByUserId, hasBookmark, upsertBookmark } from "../repositories/bookmark.repository";
import type { AuthenticatedUser } from "../types/auth.types";
import type { BookmarkDto, BookmarkListItemDto } from "../types/bookmark.types";
import { buildExcerpt } from "../utils/content.utils";
import { createHttpError } from "../utils/error.utils";

function ensureAuthenticatedUser(user: AuthenticatedUser | undefined): asserts user is AuthenticatedUser {
  if (!user) {
    throw createHttpError(401, "Authentication is required");
  }
}

function readArticleId(articleId: string): string {
  const normalizedArticleId = articleId.trim();
  if (!normalizedArticleId) {
    throw createHttpError(400, "Article id is required");
  }

  return normalizedArticleId;
}

async function ensureBookmarkedArticleIsAccessible(articleId: string): Promise<void> {
  const article = await findArticleAccessById(articleId);
  if (!article || article.status !== "PUBLISHED") {
    throw createHttpError(404, "Article not found");
  }
}

export async function createBookmark(articleId: string, user: AuthenticatedUser | undefined): Promise<BookmarkDto> {
  ensureAuthenticatedUser(user);
  const normalizedArticleId = readArticleId(articleId);
  await ensureBookmarkedArticleIsAccessible(normalizedArticleId);
  await upsertBookmark(user.id, normalizedArticleId);

  return {
    articleId: normalizedArticleId,
    bookmarked: true,
  };
}

export async function removeBookmark(articleId: string, user: AuthenticatedUser | undefined): Promise<BookmarkDto> {
  ensureAuthenticatedUser(user);
  const normalizedArticleId = readArticleId(articleId);
  await deleteBookmark(user.id, normalizedArticleId);

  return {
    articleId: normalizedArticleId,
    bookmarked: false,
  };
}

export async function getBookmarks(user: AuthenticatedUser | undefined): Promise<BookmarkListItemDto[]> {
  ensureAuthenticatedUser(user);
  const bookmarks = await findBookmarksByUserId(user.id);

  return bookmarks
    .filter((bookmark) => bookmark.article.status === "PUBLISHED")
    .map((bookmark) => ({
      articleId: bookmark.articleId,
      title: bookmark.article.title,
      excerpt: buildExcerpt(bookmark.article.content),
      createdAt: bookmark.createdAt,
    }));
}

export async function getBookmarkStatus(articleId: string, user: AuthenticatedUser | undefined): Promise<BookmarkDto> {
  ensureAuthenticatedUser(user);
  const normalizedArticleId = readArticleId(articleId);
  await ensureBookmarkedArticleIsAccessible(normalizedArticleId);

  return {
    articleId: normalizedArticleId,
    bookmarked: await hasBookmark(user.id, normalizedArticleId),
  };
}