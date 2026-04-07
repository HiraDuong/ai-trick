// Luvina
// Vu Huy Hoang - Dev2
export interface CommentAuthorDto {
  id: string;
  name: string;
}

export interface CommentDto {
  id: string;
  content: string;
  articleId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: CommentAuthorDto;
  replies: CommentDto[];
}

export interface CreateCommentRequestDto {
  content: string;
  parentId?: string;
}

export interface CommentRouteParamsDto {
  [key: string]: string;
  articleId: string;
}

export interface CommentListQueryDto {
  limit?: string;
  skip?: string;
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