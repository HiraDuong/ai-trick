// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { getVersions, restoreVersion } from "../services/version.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type { ArticleRouteParamsDto } from "../types/article.types";
import type { ArticleVersionDto, RestoreArticleVersionRequestDto } from "../types/version.types";

export async function getArticleVersionsController(
  request: Request<ArticleRouteParamsDto, ApiSuccessResponse<ArticleVersionDto[]>>,
  response: Response<ApiSuccessResponse<ArticleVersionDto[]>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getVersions(request.params.articleId, request.user);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function restoreArticleVersionController(
  request: Request<ArticleRouteParamsDto, ApiSuccessResponse<ArticleVersionDto[]>, RestoreArticleVersionRequestDto>,
  response: Response<ApiSuccessResponse<ArticleVersionDto[]>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await restoreVersion(request.params.articleId, request.body, request.user);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}