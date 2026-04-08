// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import {
  createArticle as createArticleService,
  deleteArticle as deleteArticleService,
  getArticleDetail,
  getArticleList,
  publishArticle,
  unpublishArticle,
  updateArticle as updateArticleService,
} from "../services/article.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type {
  ArticleDetailDto,
  ArticleListQueryDto,
  ArticleListResponseDto,
  ArticleRouteParamsDto,
  CreateArticleRequestDto,
  DeleteArticleResponseDto,
  UpdateArticleRequestDto,
} from "../types/article.types";

function readForwardedFor(headerValue: string | string[] | undefined): string | undefined {
  if (Array.isArray(headerValue)) {
    return headerValue[0]?.trim() || undefined;
  }

  if (typeof headerValue === "string") {
    return headerValue.split(",")[0]?.trim() || undefined;
  }

  return undefined;
}

function getViewerSessionKey(request: Request): string | undefined {
  if (request.user) {
    return `user:${request.user.id}`;
  }

  const cookieHeader = request.headers.cookie;
  if (typeof cookieHeader === "string" && cookieHeader.trim()) {
    return `cookie:${cookieHeader.trim()}`;
  }

  const forwardedFor = readForwardedFor(request.headers["x-forwarded-for"]);
  if (forwardedFor) {
    return `ip:${forwardedFor}`;
  }

  if (request.ip) {
    return `ip:${request.ip}`;
  }

  return undefined;
}

export async function createArticle(
  request: Request<Record<string, never>, ApiSuccessResponse<ArticleDetailDto>, CreateArticleRequestDto>,
  response: Response<ApiSuccessResponse<ArticleDetailDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await createArticleService(request.body, request.user);
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
    const result = await updateArticleService(request.params.articleId, request.body, request.user);
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
    const result = await deleteArticleService(request.params.articleId, request.user);
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
    const result = await publishArticle(request.params.articleId, request.user);
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
    const result = await unpublishArticle(request.params.articleId, request.user);
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
    const result = await getArticleDetail(request.params.articleId, request.user, getViewerSessionKey(request));
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
    const result = await getArticleList(request.query, request.user);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}