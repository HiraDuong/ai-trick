// Luvina
// Vu Huy Hoang - Dev2
import { ArticleStatus, Prisma } from "@prisma/client";
import prisma from "../config/prisma";

const articleListSelect = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  title: true,
  status: true,
  publishedAt: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  articleTags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
});

const articleDetailSelect = Prisma.validator<Prisma.ArticleSelect>()({
  ...articleListSelect,
  authorId: true,
  content: true,
});

const articleAccessSelect = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  authorId: true,
  status: true,
});

export type ArticleListRecord = Prisma.ArticleGetPayload<{ select: typeof articleListSelect }>;
export type ArticleDetailRecord = Prisma.ArticleGetPayload<{ select: typeof articleDetailSelect }>;
export type ArticleAccessRecord = Prisma.ArticleGetPayload<{ select: typeof articleAccessSelect }>;

const articleVersionSelect = Prisma.validator<Prisma.ArticleVersionSelect>()({
  id: true,
  articleId: true,
  updatedAt: true,
  contentSnapshot: true,
  updatedBy: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
});

export type ArticleVersionRecord = Prisma.ArticleVersionGetPayload<{ select: typeof articleVersionSelect }>;

export interface ArticleListParams {
  status: ArticleStatus;
  authorId?: string;
  skip: number;
  take: number;
}

export interface ArticleMutationData {
  title?: string;
  content?: Prisma.InputJsonValue;
  categoryId?: string;
  status?: ArticleStatus;
  publishedAt?: Date | null;
  authorId?: string;
}

export async function findCategoryById(categoryId: string): Promise<{ id: string } | null> {
  return prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
}

export async function findArticleAccessById(articleId: string): Promise<ArticleAccessRecord | null> {
  return prisma.article.findUnique({ where: { id: articleId }, select: articleAccessSelect });
}

export async function findArticleDetailById(articleId: string): Promise<ArticleDetailRecord | null> {
  return prisma.article.findUnique({ where: { id: articleId }, select: articleDetailSelect });
}

export async function createArticle(data: ArticleMutationData): Promise<ArticleDetailRecord> {
  return prisma.article.create({
    data: data as Prisma.ArticleCreateInput,
    select: articleDetailSelect,
  });
}

export async function createArticleWithInitialVersion(
  data: ArticleMutationData,
  updatedById: string
): Promise<ArticleDetailRecord> {
  return prisma.$transaction(async (tx) => {
    const article = await tx.article.create({
      data: data as Prisma.ArticleCreateInput,
      select: articleDetailSelect,
    });

    await tx.articleVersion.create({
      data: {
        articleId: article.id,
        contentSnapshot: article.content === null ? Prisma.JsonNull : (article.content as Prisma.InputJsonValue),
        updatedById,
      },
    });

    return article;
  });
}

export async function updateArticle(articleId: string, data: ArticleMutationData): Promise<ArticleDetailRecord> {
  return prisma.article.update({
    where: { id: articleId },
    data,
    select: articleDetailSelect,
  });
}

export async function updateArticleWithVersionSnapshot(params: {
  articleId: string;
  data: ArticleMutationData;
  updatedById: string;
  shouldSnapshotContent: (previousContent: Prisma.JsonValue) => boolean;
}): Promise<ArticleDetailRecord> {
  const { articleId, data, updatedById, shouldSnapshotContent } = params;

  return prisma.$transaction(async (tx) => {
    const current = await tx.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        content: true,
      },
    });

    if (!current) {
      // Keep behavior consistent with service layer 404 checks.
      // Callers should have validated existence, but we fail safe here.
      throw new Error("Article not found");
    }

    if (shouldSnapshotContent(current.content)) {
      await tx.articleVersion.create({
        data: {
          articleId,
          contentSnapshot: current.content === null ? Prisma.JsonNull : (current.content as Prisma.InputJsonValue),
          updatedById,
        },
      });
    }

    return tx.article.update({
      where: { id: articleId },
      data,
      select: articleDetailSelect,
    });
  });
}

export async function deleteArticle(articleId: string): Promise<{ id: string; title: string }> {
  return prisma.article.delete({
    where: { id: articleId },
    select: {
      id: true,
      title: true,
    },
  });
}

export async function findArticles({ status, authorId, skip, take }: ArticleListParams): Promise<ArticleListRecord[]> {
  const where: Prisma.ArticleWhereInput = {
    status,
    ...(authorId ? { authorId } : {}),
  };

  const orderBy: Prisma.ArticleOrderByWithRelationInput[] =
    status === ArticleStatus.PUBLISHED
      ? [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }]
      : [{ createdAt: "desc" }, { id: "desc" }];

  return prisma.article.findMany({
    where,
    select: articleListSelect,
    orderBy,
    skip,
    take,
  });
}

export async function findArticleVersionsByArticleId(articleId: string): Promise<ArticleVersionRecord[]> {
  return prisma.articleVersion.findMany({
    where: { articleId },
    select: articleVersionSelect,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });
}