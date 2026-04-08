// Luvina
// Vu Huy Hoang - Dev2
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";

const searchArticleSelect = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  title: true,
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

type SearchArticleRow = {
  id: string;
  score: number;
};

type SearchCountRow = {
  total: number;
};

export type SearchArticleRecord = Prisma.ArticleGetPayload<{ select: typeof searchArticleSelect }>;
export type TagRecord = { id: string; name: string };

function buildSearchVector(): Prisma.Sql {
  return Prisma.sql`
    setweight(to_tsvector('english', COALESCE(a.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(a.content::text, '')), 'B')
  `;
}

export async function searchPublishedArticleIds(
  query: string,
  skip: number,
  take: number
): Promise<{ rows: SearchArticleRow[]; total: number }> {
  const searchVector = buildSearchVector();
  const tsQuery = Prisma.sql`websearch_to_tsquery('english', ${query})`;

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<SearchArticleRow[]>(Prisma.sql`
      SELECT
        a.id,
        ts_rank_cd((${searchVector}), ${tsQuery}) AS score
      FROM "Article" AS a
      WHERE a.status = 'PUBLISHED'
        AND ${tsQuery} @@ (${searchVector})
      ORDER BY score DESC, a."publishedAt" DESC NULLS LAST, a."createdAt" DESC, a.id DESC
      OFFSET ${skip}
      LIMIT ${take}
    `),
    prisma.$queryRaw<SearchCountRow[]>(Prisma.sql`
      SELECT COUNT(*)::int AS total
      FROM "Article" AS a
      WHERE a.status = 'PUBLISHED'
        AND ${tsQuery} @@ (${searchVector})
    `),
  ]);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      score: Number(row.score),
    })),
    total: countRows[0]?.total ?? 0,
  };
}

export async function findSearchArticlesByIds(articleIds: string[]): Promise<SearchArticleRecord[]> {
  if (articleIds.length === 0) {
    return [];
  }

  return prisma.article.findMany({
    where: {
      id: {
        in: articleIds,
      },
    },
    select: searchArticleSelect,
  });
}

export async function findTagById(tagId: string): Promise<TagRecord | null> {
  return prisma.tag.findUnique({
    where: { id: tagId },
    select: { id: true, name: true },
  });
}

export async function findTagByName(name: string): Promise<TagRecord | null> {
  return prisma.tag.findUnique({
    where: { name },
    select: { id: true, name: true },
  });
}

export async function searchPublishedArticleIdsByTag(
  tagId: string,
  skip: number,
  take: number
): Promise<{ rows: SearchArticleRow[]; total: number }> {
  const [rows, total] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        articleTags: {
          some: {
            tagId,
          },
        },
      },
      select: { id: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      skip,
      take,
    }),
    prisma.article.count({
      where: {
        status: "PUBLISHED",
        articleTags: {
          some: {
            tagId,
          },
        },
      },
    }),
  ]);

  return {
    rows: rows.map((row) => ({ id: row.id, score: 1 })),
    total,
  };
}