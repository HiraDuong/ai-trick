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

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseDto {
  user: AuthUserDto;
  accessToken: string;
}

export interface CurrentUserResponseDto {
  user: AuthUserDto;
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

export interface CommentAuthorDto {
  id: string;
  name: string;
}

export interface CommentDto {
  id: string;
  content: string;
  articleId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: CommentAuthorDto;
  replies: CommentDto[];
}

export interface CommentListPaginationDto {
  limit: number;
  skip: number;
  hasMore: boolean;
  nextSkip: number | null;
}

export interface CommentListResponseDto {
  items: CommentDto[];
  pagination: CommentListPaginationDto;
}

export interface HelpfulnessSummaryDto {
  articleId: string;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote: "HELPFUL" | "NOT_HELPFUL" | null;
}

export interface SearchArticleItemDto {
  id: string;
  title: string;
  excerpt: string;
  highlightTerms: string[];
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
  tag: ArticleTagDto | null;
  items: SearchArticleItemDto[];
  pagination: SearchPaginationDto;
}

export interface ArticleStatsDto {
  views: number;
  comments: number;
  helpful: number;
  notHelpful: number;
}

export interface ReactionSummaryDto {
  articleId: string;
  likeCount: number;
  loveCount: number;
  laughCount: number;
  userReaction: "LIKE" | "LOVE" | "LAUGH" | null;
}

export interface BookmarkDto {
  articleId: string;
  bookmarked: boolean;
}

export interface BookmarkListItemDto {
  articleId: string;
  title: string;
  excerpt: string;
  createdAt: string;
}

export interface NotificationDto {
  id: string;
  type: "ARTICLE_COMMENT" | "COMMENT_REPLY";
  entityId: string;
  isRead: boolean;
  createdAt: string;
  message: string;
}

export interface ArticleVersionDto {
  id: string;
  articleId: string;
  contentSnapshot: unknown;
  updatedAt: string;
  updatedBy: {
    id: string;
    name: string;
  };
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