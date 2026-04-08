// Luvina
// Vu Huy Hoang - Dev2
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";

const searchArticleSelect = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  title: true,
  content: true,
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

const searchTagSelect = Prisma.validator<Prisma.TagSelect>()({
  id: true,
  name: true,
});

export type SearchArticleRecord = Prisma.ArticleGetPayload<{ select: typeof searchArticleSelect }>;
export type SearchTagRecord = Prisma.TagGetPayload<{ select: typeof searchTagSelect }>;

function buildSearchVector(): Prisma.Sql {
  return Prisma.sql`
    setweight(to_tsvector('english', COALESCE(a.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(a.content::text, '')), 'B')
  `;
}

export async function searchPublishedArticleIds(
  query: string,
  normalizedTagQuery: string,
  skip: number,
  take: number
): Promise<{ rows: SearchArticleRow[]; total: number }> {
  const searchVector = buildSearchVector();
  const tsQuery = Prisma.sql`websearch_to_tsquery('english', ${query})`;

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<SearchArticleRow[]>(Prisma.sql`
      WITH matching_articles AS (
        SELECT
          a.id,
          ts_rank_cd((${searchVector}), ${tsQuery}) AS score
        FROM "Article" AS a
        WHERE a.status = 'PUBLISHED'
          AND ${tsQuery} @@ (${searchVector})

        UNION ALL

        SELECT
          a.id,
          1.25::float AS score
        FROM "Article" AS a
        INNER JOIN "ArticleTag" AS at ON at."articleId" = a.id
        INNER JOIN "Tag" AS t ON t.id = at."tagId"
        WHERE a.status = 'PUBLISHED'
          AND LOWER(t.name) = ${normalizedTagQuery}
      )
      SELECT
        matched.id,
        MAX(matched.score) AS score
      FROM matching_articles AS matched
      INNER JOIN "Article" AS a ON a.id = matched.id
      GROUP BY matched.id, a."publishedAt", a."createdAt"
      ORDER BY MAX(matched.score) DESC, a."publishedAt" DESC NULLS LAST, a."createdAt" DESC, matched.id DESC
      OFFSET ${skip}
      LIMIT ${take}
    `),
    prisma.$queryRaw<SearchCountRow[]>(Prisma.sql`
      WITH matching_articles AS (
        SELECT a.id
        FROM "Article" AS a
        WHERE a.status = 'PUBLISHED'
          AND ${tsQuery} @@ (${searchVector})

        UNION

        SELECT a.id
        FROM "Article" AS a
        INNER JOIN "ArticleTag" AS at ON at."articleId" = a.id
        INNER JOIN "Tag" AS t ON t.id = at."tagId"
        WHERE a.status = 'PUBLISHED'
          AND LOWER(t.name) = ${normalizedTagQuery}
      )
      SELECT COUNT(*)::int AS total
      FROM matching_articles
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

export async function findTagById(tagId: string): Promise<SearchTagRecord | null> {
  return prisma.tag.findUnique({
    where: { id: tagId },
    select: searchTagSelect,
  });
}

export async function findPublishedArticleIdsByTagId(
  tagId: string,
  skip: number,
  take: number
): Promise<{ rows: SearchArticleRow[]; total: number }> {
  const where = {
    status: "PUBLISHED" as const,
    articleTags: {
      some: {
        tagId,
      },
    },
  };

  const [rows, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: {
        id: true,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      skip,
      take,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      score: 1,
    })),
    total,
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