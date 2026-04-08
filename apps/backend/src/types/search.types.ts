// Luvina
// Vu Huy Hoang - Dev2
import type { ArticleAuthorDto, ArticleCategoryDto, ArticleTagDto } from "./article.types";

export interface SearchArticleItemDto {
  id: string;
  title: string;
  excerpt: string;
  highlightTerms: string[];
  publishedAt: Date | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  score: number;
  author: ArticleAuthorDto;
  category: ArticleCategoryDto;
  tags: ArticleTagDto[];
}

export interface SearchArticlesQueryDto {
  q?: string;
  tagId?: string;
  tag?: string;
  limit?: string;
  skip?: string;
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
  tag: ArticleTagDto | null;
  items: SearchArticleItemDto[];
  pagination: SearchPaginationDto;
}