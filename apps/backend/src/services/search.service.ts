// Luvina
// Vu Huy Hoang - Dev2
import {
  findPublishedArticleIdsByTagId,
  findSearchArticlesByIds,
  findTagById,
  findTagByName,
  searchPublishedArticleIds,
  type SearchArticleRecord,
  type SearchTagRecord,
} from "../repositories/search.repository";
import type { SearchArticleItemDto, SearchArticlesQueryDto, SearchArticlesResponseDto } from "../types/search.types";
import { buildExcerpt } from "../utils/content.utils";
import { createHttpError } from "../utils/error.utils";
import { normalizeTagInput, trimOptionalString } from "../utils/search.utils";

interface ValidatedSearchQuery {
  query: string;
  normalizedQuery: string;
  tagId: string | null;
  tagName: string | null;
  limit: number;
  skip: number;
}

function buildHighlightTerms(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((term) => term.trim())
        .filter((term) => term.length > 1)
    )
  ).slice(0, 6);
}

function readOptionalString(value: unknown, fieldName: string): string | null {
  if (typeof value === "undefined") {
    return null;
  }
  if (typeof value !== "string") {
    throw createHttpError(400, `${fieldName} must be a string`);
  }

  return trimOptionalString(value);
}

function validateSearchQuery(query: SearchArticlesQueryDto): ValidatedSearchQuery {
  const keyword = readOptionalString(query.q, "Query");
  const tagId = readOptionalString(query.tagId, "Tag id");
  const tagName = readOptionalString(query.tag, "Tag");
  const limit = Number.parseInt(query.limit ?? "10", 10);
  const skip = Number.parseInt(query.skip ?? "0", 10);

  if (!keyword && !tagId && !tagName) {
    throw createHttpError(400, "Query, tag id, or tag is required");
  }
  if (keyword && (keyword.length < 2 || keyword.length > 100)) {
    throw createHttpError(400, "Query must be between 2 and 100 characters long");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw createHttpError(400, "Limit must be an integer between 1 and 50");
  }
  if (!Number.isInteger(skip) || skip < 0) {
    throw createHttpError(400, "Skip must be a non-negative integer");
  }

  return {
    query: keyword ?? "",
    normalizedQuery: keyword ? normalizeTagInput(keyword) : "",
    tagId: tagId ?? null,
    tagName: tagName ? normalizeTagInput(tagName) : null,
    limit,
    skip,
  };
}

async function resolveTag(tagId: string | null, tagName: string | null): Promise<SearchTagRecord | null> {
  if (tagId) {
    return findTagById(tagId);
  }
  if (tagName) {
    return findTagByName(tagName);
  }
  return null;
}

function mapSearchArticle(article: SearchArticleRecord, score: number, query: string): SearchArticleItemDto {
  const highlightTerms = buildHighlightTerms(query);

  return {
    id: article.id,
    title: article.title,
    excerpt: buildExcerpt(article.content, query),
    highlightTerms,
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
  const tag = await resolveTag(validatedQuery.tagId, validatedQuery.tagName);

  if ((validatedQuery.tagId || validatedQuery.tagName) && !tag) {
    throw createHttpError(404, "Tag not found");
  }

  const { rows, total } =
    tag && !validatedQuery.query
      ? await findPublishedArticleIdsByTagId(tag.id, validatedQuery.skip, validatedQuery.limit + 1)
      : await searchPublishedArticleIds(
          validatedQuery.query,
          validatedQuery.normalizedQuery,
          validatedQuery.skip,
          validatedQuery.limit + 1
        );

  const hasMore = rows.length > validatedQuery.limit;
  const visibleRows = hasMore ? rows.slice(0, validatedQuery.limit) : rows;
  const articleIds = visibleRows.map((row) => row.id);
  const articles = await findSearchArticlesByIds(articleIds);
  const articlesById = new Map(articles.map((article) => [article.id, article]));

  const items = visibleRows
    .map((row) => {
      const article = articlesById.get(row.id);
      if (!article) {
        return null;
      }

      return mapSearchArticle(article, row.score, validatedQuery.query);
    })
    .filter((item): item is SearchArticleItemDto => item !== null);

  return {
    query: validatedQuery.query,
    tag,
    items,
    pagination: {
      limit: validatedQuery.limit,
      skip: validatedQuery.skip,
      total,
      hasMore,
      nextSkip: hasMore ? validatedQuery.skip + validatedQuery.limit : null,
    },
  };
}
