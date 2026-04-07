// Luvina
// Vu Huy Hoang - Dev2
import { ArticleStatus, Prisma } from "@prisma/client";
import prisma from "../config/prisma";

const publishedArticleWhere = Prisma.validator<Prisma.ArticleWhereInput>()({
  status: ArticleStatus.PUBLISHED,
});

const dashboardArticleSummarySelect = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  title: true,
  views: true,
  publishedAt: true,
  createdAt: true,
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

export type DashboardArticleRecord = Prisma.ArticleGetPayload<{
  select: typeof dashboardArticleSummarySelect;
}>;

export interface ActiveAuthorCountRecord {
  authorId: string;
  _count: {
    authorId: number;
  };
}

export interface AuthorRecord {
  id: string;
  name: string;
  email: string;
}

export interface PopularTagCountRecord {
  tagId: string;
  _count: {
    tagId: number;
  };
}

export interface TagRecord {
  id: string;
  name: string;
}

export async function findLatestPublishedArticles(): Promise<DashboardArticleRecord[]> {
  return prisma.article.findMany({
    where: publishedArticleWhere,
    select: dashboardArticleSummarySelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 10,
  });
}

export async function findMostViewedArticles(): Promise<DashboardArticleRecord[]> {
  return prisma.article.findMany({
    where: publishedArticleWhere,
    select: dashboardArticleSummarySelect,
    orderBy: [{ views: "desc" }, { createdAt: "desc" }],
    take: 5,
  });
}

export async function findMostActiveAuthorCounts(): Promise<ActiveAuthorCountRecord[]> {
  const records = await prisma.article.groupBy({
    by: ["authorId"],
    where: publishedArticleWhere,
    _count: {
      authorId: true,
    },
    orderBy: {
      _count: {
        authorId: "desc",
      },
    },
    take: 3,
  });

  return records as ActiveAuthorCountRecord[];
}

export async function findUsersByIds(userIds: string[]): Promise<AuthorRecord[]> {
  if (userIds.length === 0) {
    return [];
  }

  return prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}

export async function findPopularTagCounts(): Promise<PopularTagCountRecord[]> {
  const records = await prisma.articleTag.groupBy({
    by: ["tagId"],
    where: {
      article: {
        status: ArticleStatus.PUBLISHED,
      },
    },
    _count: {
      tagId: true,
    },
    orderBy: {
      _count: {
        tagId: "desc",
      },
    },
    take: 5,
  });

  return records as PopularTagCountRecord[];
}

export async function findTagsByIds(tagIds: string[]): Promise<TagRecord[]> {
  if (tagIds.length === 0) {
    return [];
  }

  return prisma.tag.findMany({
    where: { id: { in: tagIds } },
    select: {
      id: true,
      name: true,
    },
  });
}