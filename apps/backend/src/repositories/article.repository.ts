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
  categoryId?: string;
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
  updatedById: string,
  tagNames: string[] = []
): Promise<ArticleDetailRecord> {
  return prisma.$transaction(async (tx) => {
    const createInput: Prisma.ArticleCreateInput = {
      title: data.title as string,
      content: data.content as Prisma.InputJsonValue,
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.publishedAt !== undefined ? { publishedAt: data.publishedAt } : {}),
      author: {
        connect: {
          id: data.authorId as string,
        },
      },
      category: {
        connect: {
          id: data.categoryId as string,
        },
      },
      ...(tagNames.length > 0
        ? {
            articleTags: {
              create: tagNames.map((name) => ({
                tag: {
                  connectOrCreate: {
                    where: { name },
                    create: { name },
                  },
                },
              })),
            },
          }
        : {}),
    };

    const article = await tx.article.create({
      data: createInput,
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
  tagNames?: string[];
}): Promise<ArticleDetailRecord> {
  const { articleId, data, updatedById, shouldSnapshotContent, tagNames } = params;

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

    const shouldCreateVersion = shouldSnapshotContent(current.content);

    const updateInput: Prisma.ArticleUpdateInput = {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.publishedAt !== undefined ? { publishedAt: data.publishedAt } : {}),
      ...(data.categoryId !== undefined ? { category: { connect: { id: data.categoryId } } } : {}),
      ...(tagNames
        ? {
            articleTags: {
              deleteMany: {},
              ...(tagNames.length > 0
                ? {
                    create: tagNames.map((name) => ({
                      tag: {
                        connectOrCreate: {
                          where: { name },
                          create: { name },
                        },
                      },
                    })),
                  }
                : {}),
            },
          }
        : {}),
    };

    const updatedArticle = await tx.article.update({
      where: { id: articleId },
      data: updateInput,
      select: articleDetailSelect,
    });

    if (shouldCreateVersion) {
      await tx.articleVersion.create({
        data: {
          articleId,
          contentSnapshot:
            updatedArticle.content === null ? Prisma.JsonNull : (updatedArticle.content as Prisma.InputJsonValue),
          updatedById,
        },
      });
    }

    return updatedArticle;
  });
}

export async function incrementArticleViews(articleId: string): Promise<void> {
  await prisma.article.update({
    where: { id: articleId },
    data: {
      views: {
        increment: 1,
      },
    },
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

export async function findArticles({ status, authorId, categoryId, skip, take }: ArticleListParams): Promise<ArticleListRecord[]> {
  const where: Prisma.ArticleWhereInput = {
    status,
    ...(authorId ? { authorId } : {}),
    ...(categoryId ? { categoryId } : {}),
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