// Luvina
// Vu Huy Hoang - Dev2
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { areJsonValuesEqual } from "../utils/json-content.utils";

const articleVersionSelect = Prisma.validator<Prisma.ArticleVersionSelect>()({
  id: true,
  articleId: true,
  contentSnapshot: true,
  updatedAt: true,
  updatedBy: {
    select: {
      id: true,
      name: true,
    },
  },
});

export type ArticleVersionRecord = Prisma.ArticleVersionGetPayload<{ select: typeof articleVersionSelect }>;

export async function createArticleVersion(articleId: string, updatedById: string, contentSnapshot: Prisma.JsonValue): Promise<void> {
  await prisma.articleVersion.create({
    data: {
      articleId,
      updatedById,
      contentSnapshot: contentSnapshot === null ? Prisma.JsonNull : (contentSnapshot as Prisma.InputJsonValue),
    },
  });
}

export async function createArticleVersionIfChanged(
  articleId: string,
  updatedById: string,
  contentSnapshot: Prisma.JsonValue
): Promise<boolean> {
  const latestVersion = await findLatestArticleVersion(articleId);
  if (latestVersion && areJsonValuesEqual(latestVersion.contentSnapshot, contentSnapshot)) {
    return false;
  }

  await createArticleVersion(articleId, updatedById, contentSnapshot);
  return true;
}

export async function findArticleVersions(articleId: string): Promise<ArticleVersionRecord[]> {
  return prisma.articleVersion.findMany({
    where: { articleId },
    select: articleVersionSelect,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });
}

export async function findLatestArticleVersion(articleId: string): Promise<ArticleVersionRecord | null> {
  return prisma.articleVersion.findFirst({
    where: { articleId },
    select: articleVersionSelect,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });
}

export async function findArticleVersionById(articleId: string, versionId: string): Promise<ArticleVersionRecord | null> {
  return prisma.articleVersion.findFirst({
    where: {
      id: versionId,
      articleId,
    },
    select: articleVersionSelect,
  });
}