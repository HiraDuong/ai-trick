// Luvina
// Vu Huy Hoang - Dev2
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";

const bookmarkSelect = Prisma.validator<Prisma.BookmarkSelect>()({
  articleId: true,
  createdAt: true,
  article: {
    select: {
      title: true,
      content: true,
      status: true,
    },
  },
});

export type BookmarkRecord = Prisma.BookmarkGetPayload<{ select: typeof bookmarkSelect }>;

export async function upsertBookmark(userId: string, articleId: string): Promise<void> {
  await prisma.bookmark.upsert({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
    update: {},
    create: {
      userId,
      articleId,
    },
  });
}

export async function deleteBookmark(userId: string, articleId: string): Promise<void> {
  await prisma.bookmark.deleteMany({
    where: {
      userId,
      articleId,
    },
  });
}

export async function findBookmarksByUserId(userId: string): Promise<BookmarkRecord[]> {
  return prisma.bookmark.findMany({
    where: { userId },
    select: bookmarkSelect,
    orderBy: [{ createdAt: "desc" }, { articleId: "asc" }],
  });
}

export async function hasBookmark(userId: string, articleId: string): Promise<boolean> {
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(bookmark);
}