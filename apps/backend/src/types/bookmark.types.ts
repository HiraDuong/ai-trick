// Luvina
// Vu Huy Hoang - Dev2
export interface BookmarkDto {
  articleId: string;
  bookmarked: boolean;
}

export interface BookmarkListItemDto {
  articleId: string;
  title: string;
  excerpt: string;
  createdAt: Date;
}

export interface CreateBookmarkRequestDto {
  articleId: string;
}

export interface BookmarkRouteParamsDto {
  [key: string]: string;
  articleId: string;
}