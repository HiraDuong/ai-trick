// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { getArticleReactions, reactToArticle } from "../services/reaction.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type { ArticleRouteParamsDto } from "../types/article.types";
import type { CreateReactionRequestDto, ReactionSummaryDto } from "../types/reaction.types";

export async function getArticleReactionsController(
  request: Request<ArticleRouteParamsDto, ApiSuccessResponse<ReactionSummaryDto>>,
  response: Response<ApiSuccessResponse<ReactionSummaryDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getArticleReactions(request.params.articleId, request.user);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function reactToArticleController(
  request: Request<Record<string, never>, ApiSuccessResponse<ReactionSummaryDto>, CreateReactionRequestDto>,
  response: Response<ApiSuccessResponse<ReactionSummaryDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await reactToArticle(request.body, request.user);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}