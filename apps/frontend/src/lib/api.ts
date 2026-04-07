// Luvina
// Vu Huy Hoang - Dev2
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  ArticleDetailDto,
  ArticleListResponseDto,
  CategoryTreeResponseDto,
  DashboardFeedResponseDto,
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

export async function fetchPublishedArticles(skip: number, limit: number): Promise<ApiResult<ArticleListResponseDto>> {
  return fetchApi<ArticleListResponseDto>(`/articles?skip=${skip}&limit=${limit}`);
}

export async function fetchArticleDetail(articleId: string): Promise<ApiResult<ArticleDetailDto>> {
  return fetchApi<ArticleDetailDto>(`/articles/${articleId}`);
}

export async function fetchCategoryTree(): Promise<ApiResult<CategoryTreeResponseDto>> {
  return fetchApi<CategoryTreeResponseDto>("/categories/tree");
}

export async function fetchDashboardFeed(): Promise<ApiResult<DashboardFeedResponseDto>> {
  return fetchApi<DashboardFeedResponseDto>("/dashboard/feed");
}

export async function fetchSearchResults(query: string, skip: number, limit: number): Promise<ApiResult<SearchArticlesResponseDto>> {
  const params = new URLSearchParams({
    q: query,
    skip: String(skip),
    limit: String(limit),
  });

  return fetchApi<SearchArticlesResponseDto>(`/search/articles?${params.toString()}`);
}