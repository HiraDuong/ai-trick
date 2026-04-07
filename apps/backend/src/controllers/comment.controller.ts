// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { createComment, getArticleComments } from "../services/comment.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type {
  CommentListQueryDto,
  CommentListResponseDto,
  CommentDto,
  CommentRouteParamsDto,
  CreateCommentRequestDto,
} from "../types/comment.types";

export async function createCommentController(
  request: Request<CommentRouteParamsDto, ApiSuccessResponse<CommentDto>, CreateCommentRequestDto>,
  response: Response<ApiSuccessResponse<CommentDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await createComment(request.params.articleId, request.body, request.user);
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
    const result = await getArticleComments(request.params.articleId, request.query, request.user);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}