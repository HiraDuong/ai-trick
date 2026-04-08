// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { getArticleStats } from "../services/stats.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type { ArticleStatsRouteParamsDto } from "../types/article.types";
import type { AuthenticatedUser } from "../types/auth.types";
import type { ArticleStatsDto } from "../types/stats.types";

function readRequestUser(request: unknown): AuthenticatedUser | undefined {
  return (request as Request & { user?: AuthenticatedUser }).user;
}

export async function getArticleStatsController(
  request: Request<ArticleStatsRouteParamsDto, ApiSuccessResponse<ArticleStatsDto>>,
  response: Response<ApiSuccessResponse<ArticleStatsDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getArticleStats(request.params.articleId, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}