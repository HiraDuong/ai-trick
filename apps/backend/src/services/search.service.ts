// Luvina
// Vu Huy Hoang - Dev2
import { findSearchArticlesByIds, searchPublishedArticleIds, type SearchArticleRecord } from "../repositories/search.repository";
import type { SearchArticleItemDto, SearchArticlesQueryDto, SearchArticlesResponseDto } from "../types/search.types";
import { createHttpError } from "../utils/error.utils";

interface ValidatedSearchQuery {
  query: string;
  limit: number;
  skip: number;
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw createHttpError(400, `${fieldName} must be a string`);
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    throw createHttpError(400, `${fieldName} is required`);
  }

  return trimmedValue;
}

function validateSearchQuery(query: SearchArticlesQueryDto): ValidatedSearchQuery {
  const keyword = readRequiredString(query.q, "Query");
  const limit = Number.parseInt(query.limit ?? "10", 10);
  const skip = Number.parseInt(query.skip ?? "0", 10);

  if (keyword.length < 2 || keyword.length > 100) {
    throw createHttpError(400, "Query must be between 2 and 100 characters long");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw createHttpError(400, "Limit must be an integer between 1 and 50");
  }
  if (!Number.isInteger(skip) || skip < 0) {
    throw createHttpError(400, "Skip must be a non-negative integer");
  }

  return {
    query: keyword,
    limit,
    skip,
  };
}

function mapSearchArticle(article: SearchArticleRecord, score: number): SearchArticleItemDto {
  return {
    id: article.id,
    title: article.title,
    publishedAt: article.publishedAt,
    views: article.views,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    score,
    author: article.author,
    category: article.category,
    tags: article.articleTags.map((articleTag) => articleTag.tag),
  };
}

export async function searchArticles(query: SearchArticlesQueryDto): Promise<SearchArticlesResponseDto> {
  const validatedQuery = validateSearchQuery(query);
  const { rows, total } = await searchPublishedArticleIds(
    validatedQuery.query,
    validatedQuery.skip,
    validatedQuery.limit + 1
  );

  const hasMore = rows.length > validatedQuery.limit;
  const visibleRows = hasMore ? rows.slice(0, validatedQuery.limit) : rows;
  const articleIds = visibleRows.map((row) => row.id);
  const articles = await findSearchArticlesByIds(articleIds);
  const articlesById = new Map(articles.map((article) => [article.id, article]));

  return {
    query: validatedQuery.query,
    items: visibleRows
      .map((row) => {
        const article = articlesById.get(row.id);
        if (!article) {
          return null;
        }

        return mapSearchArticle(article, row.score);
      })
      .filter((item): item is SearchArticleItemDto => item !== null),
    pagination: {
      limit: validatedQuery.limit,
      skip: validatedQuery.skip,
      total,
      hasMore,
      nextSkip: hasMore ? validatedQuery.skip + validatedQuery.limit : null,
    },
  };
}