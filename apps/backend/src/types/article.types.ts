// Luvina
// Vu Huy Hoang - Dev2
import type { ArticleStatus, Prisma } from "@prisma/client";

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
  status: ArticleStatus;
  publishedAt: Date | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  author: ArticleAuthorDto;
  category: ArticleCategoryDto;
  tags: ArticleTagDto[];
}

export interface ArticleDetailDto extends ArticleListItemDto {
  content: Prisma.JsonValue;
}

export interface ArticleStatsRouteParamsDto {
  [key: string]: string;
  articleId: string;
}

export interface CreateArticleRequestDto {
  title: string;
  content: Prisma.InputJsonValue;
  categoryId: string;
  status?: string;
  tags?: string[];
}

export interface UpdateArticleRequestDto {
  title?: string;
  content?: Prisma.InputJsonValue;
  categoryId?: string;
  status?: string;
  tags?: string[];
}

export interface ArticleRouteParamsDto {
  [key: string]: string;
  articleId: string;
}

export interface ArticleListQueryDto {
  limit?: string;
  skip?: string;
  status?: string;
  categoryId?: string;
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

export interface DeleteArticleResponseDto {
  id: string;
  title: string;
}

export interface ArticleVersionActorDto {
  id: string;
  name: string;
  role: string;
}

export interface ArticleVersionItemDto {
  id: string;
  articleId: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: ArticleVersionActorDto;
  contentSnapshot: Prisma.JsonValue;
}

export interface ArticleVersionListResponseDto {
  items: ArticleVersionItemDto[];
}