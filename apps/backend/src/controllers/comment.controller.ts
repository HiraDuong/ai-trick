// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { createComment, deleteComment, getArticleComments } from "../services/comment.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type { AuthenticatedUser } from "../types/auth.types";
import type {
  CommentListQueryDto,
  CommentListResponseDto,
  CommentDto,
  CommentRouteParamsDto,
  CreateCommentRequestDto,
  DeleteCommentResponseDto,
  DeleteCommentRouteParamsDto,
} from "../types/comment.types";

function readRequestUser(request: unknown): AuthenticatedUser | undefined {
  return (request as Request & { user?: AuthenticatedUser }).user;
}

export async function createCommentController(
  request: Request<CommentRouteParamsDto, ApiSuccessResponse<CommentDto>, CreateCommentRequestDto>,
  response: Response<ApiSuccessResponse<CommentDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await createComment(request.params.articleId, request.body, readRequestUser(request));
    response.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getArticleCommentsController(
  request: Request<CommentRouteParamsDto, ApiSuccessResponse<CommentListResponseDto>, Record<string, never>, CommentListQueryDto>,
  response: Response<ApiSuccessResponse<CommentListResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getArticleComments(request.params.articleId, request.query, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteCommentController(
  request: Request<DeleteCommentRouteParamsDto, ApiSuccessResponse<DeleteCommentResponseDto>>,
  response: Response<ApiSuccessResponse<DeleteCommentResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await deleteComment(request.params.commentId, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}