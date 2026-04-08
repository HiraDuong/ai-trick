// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import {
  createArticle as createArticleService,
  deleteArticle as deleteArticleService,
  getArticleDetail,
  getArticleList,
  getArticleVersions,
  publishArticle,
  unpublishArticle,
  updateArticle as updateArticleService,
} from "../services/article.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type { AuthenticatedUser } from "../types/auth.types";
import type {
  ArticleDetailDto,
  ArticleListQueryDto,
  ArticleListResponseDto,
  ArticleRouteParamsDto,
  ArticleVersionListResponseDto,
  CreateArticleRequestDto,
  DeleteArticleResponseDto,
  UpdateArticleRequestDto,
} from "../types/article.types";

function readRequestUser(request: unknown): AuthenticatedUser | undefined {
  return (request as Request & { user?: AuthenticatedUser }).user;
}

export async function createArticle(
  request: Request<Record<string, never>, ApiSuccessResponse<ArticleDetailDto>, CreateArticleRequestDto>,
  response: Response<ApiSuccessResponse<ArticleDetailDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await createArticleService(request.body, readRequestUser(request));
    response.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function updateArticle(
  request: Request<ArticleRouteParamsDto, ApiSuccessResponse<ArticleDetailDto>, UpdateArticleRequestDto>,
  response: Response<ApiSuccessResponse<ArticleDetailDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await updateArticleService(request.params.articleId, request.body, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteArticle(
  request: Request<ArticleRouteParamsDto>,
  response: Response<ApiSuccessResponse<DeleteArticleResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await deleteArticleService(request.params.articleId, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function publishArticleController(
  request: Request<ArticleRouteParamsDto>,
  response: Response<ApiSuccessResponse<ArticleDetailDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await publishArticle(request.params.articleId, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function unpublishArticleController(
  request: Request<ArticleRouteParamsDto>,
  response: Response<ApiSuccessResponse<ArticleDetailDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await unpublishArticle(request.params.articleId, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getArticleDetailController(
  request: Request<ArticleRouteParamsDto>,
  response: Response<ApiSuccessResponse<ArticleDetailDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getArticleDetail(request.params.articleId, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getArticleListController(
  request: Request<Record<string, never>, ApiSuccessResponse<ArticleListResponseDto>, Record<string, never>, ArticleListQueryDto>,
  response: Response<ApiSuccessResponse<ArticleListResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getArticleList(request.query, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getArticleVersionsController(
  request: Request<ArticleRouteParamsDto>,
  response: Response<ApiSuccessResponse<ArticleVersionListResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getArticleVersions(request.params.articleId, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}