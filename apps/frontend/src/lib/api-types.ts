// Luvina
// Vu Huy Hoang - Dev2
export interface ApiErrorBody {
  message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export interface CategoryNodeDto {
  id: string;
  name: string;
  description: string | null;
  children: CategoryNodeDto[];
}

export interface CategoryTreeResponseDto {
  categories: CategoryNodeDto[];
  total: number;
}

export interface DashboardArticleSummaryDto {
  id: string;
  title: string;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  author: ArticleAuthorDto;
  category: ArticleCategoryDto;
  tags: ArticleTagDto[];
}

export interface ActiveAuthorDto {
  id: string;
  name: string;
  email: string;
  articleCount: number;
}

export interface PopularTagDto {
  id: string;
  name: string;
  articleCount: number;
}

export interface DashboardFeedResponseDto {
  latestArticles: DashboardArticleSummaryDto[];
  mostViewedArticles: DashboardArticleSummaryDto[];
  activeAuthors: ActiveAuthorDto[];
  popularTags: PopularTagDto[];
}

export interface SearchArticleItemDto {
  id: string;
  title: string;
  publishedAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
  score: number;
  author: ArticleAuthorDto;
  category: ArticleCategoryDto;
  tags: ArticleTagDto[];
}

export interface SearchPaginationDto {
  limit: number;
  skip: number;
  total: number;
  hasMore: boolean;
  nextSkip: number | null;
}

export interface SearchArticlesResponseDto {
  query: string;
  items: SearchArticleItemDto[];
  pagination: SearchPaginationDto;
}

export interface ArticleTagDto {
  id: string;
  name: string;
}

export interface ArticleAuthorDto {
  id: string;
  name: string;
}

export interface ArticleCategoryDto {
  id: string;
  name: string;
}

export interface ArticleListItemDto {
  id: string;
  title: string;
  status: string;
  publishedAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: ArticleAuthorDto;
  category: ArticleCategoryDto;
  tags: ArticleTagDto[];
}

export interface ArticleDetailDto extends ArticleListItemDto {
  content: unknown;
}

export interface ArticleListPaginationDto {
  limit: number;
  skip: number;
  hasMore: boolean;
  nextSkip: number | null;
}

export interface ArticleListResponseDto {
  items: ArticleListItemDto[];
  pagination: ArticleListPaginationDto;
}