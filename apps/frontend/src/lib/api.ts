// Luvina
// Vu Huy Hoang - Dev2
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  ArticleDetailDto,
  ArticleListResponseDto,
  ArticleStatsDto,
  CategoryTreeResponseDto,
  CommentListResponseDto,
  DashboardFeedResponseDto,
  HelpfulnessSummaryDto,
  ReactionSummaryDto,
  SearchArticlesResponseDto,
} from "./api-types";

export interface ApiResultSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiResultFailure {
  ok: false;
  status: number;
  message: string;
}

export type ApiResult<T> = ApiResultSuccess<T> | ApiResultFailure;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

async function readApiResponse<T>(response: Response): Promise<ApiResult<T>> {
  const payload = (await response.json().catch(() => null)) as
    | ApiSuccessResponse<T>
    | ApiErrorResponse
    | null;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        payload && "error" in payload && payload.error?.message
          ? payload.error.message
          : "Unable to load data from the backend API",
    };
  }

  if (!payload || !("data" in payload)) {
    return {
      ok: false,
      status: 500,
      message: "Backend API returned an unexpected payload",
    };
  }

  return {
    ok: true,
    data: payload.data,
  };
}

async function fetchApi<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
    });

    return readApiResponse<T>(response);
  } catch {
    return {
      ok: false,
      status: 503,
      message: "Frontend could not connect to the backend API",
    };
  }
}

export async function fetchPublishedArticles(
  skip: number,
  limit: number,
  options?: { categoryId?: string }
): Promise<ApiResult<ArticleListResponseDto>> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  if (options?.categoryId) {
    params.set("categoryId", options.categoryId);
  }

  return fetchApi<ArticleListResponseDto>(`/articles?${params.toString()}`);
}

export async function fetchArticleDetail(articleId: string): Promise<ApiResult<ArticleDetailDto>> {
  return fetchApi<ArticleDetailDto>(`/articles/${articleId}`);
}

export async function fetchArticleComments(articleId: string, skip = 0, limit = 20): Promise<ApiResult<CommentListResponseDto>> {
  return fetchApi<CommentListResponseDto>(`/articles/${articleId}/comments?skip=${skip}&limit=${limit}`);
}

export async function fetchArticleHelpfulness(articleId: string): Promise<ApiResult<HelpfulnessSummaryDto>> {
  return fetchApi<HelpfulnessSummaryDto>(`/articles/${articleId}/helpfulness`);
}

export async function fetchArticleStats(articleId: string): Promise<ApiResult<ArticleStatsDto>> {
  return fetchApi<ArticleStatsDto>(`/articles/${articleId}/stats`);
}

export async function fetchArticleReactions(articleId: string): Promise<ApiResult<ReactionSummaryDto>> {
  return fetchApi<ReactionSummaryDto>(`/articles/${articleId}/reactions`);
}

export async function fetchCategoryTree(): Promise<ApiResult<CategoryTreeResponseDto>> {
  return fetchApi<CategoryTreeResponseDto>("/categories/tree");
}

export async function fetchDashboardFeed(): Promise<ApiResult<DashboardFeedResponseDto>> {
  return fetchApi<DashboardFeedResponseDto>("/dashboard/feed");
}

interface FetchSearchResultsOptions {
  tagId?: string;
  tag?: string;
}

export async function fetchSearchResults(
  query: string,
  skip: number,
  limit: number,
  options?: FetchSearchResultsOptions
): Promise<ApiResult<SearchArticlesResponseDto>> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });

  if (query) {
    params.set("q", query);
  }
  if (options?.tagId) {
    params.set("tagId", options.tagId);
  }
  if (options?.tag) {
    params.set("tag", options.tag);
  }

  return fetchApi<SearchArticlesResponseDto>(`/search/articles?${params.toString()}`);
}