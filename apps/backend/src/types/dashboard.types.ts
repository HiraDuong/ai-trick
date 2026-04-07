// Luvina
// Vu Huy Hoang - Dev2
import type { ArticleAuthorDto, ArticleCategoryDto, ArticleTagDto } from "./article.types";

export interface DashboardArticleSummaryDto {
  id: string;
  title: string;
  views: number;
  publishedAt: Date | null;
  createdAt: Date;
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