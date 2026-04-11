// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { getArticleHelpfulness, rateArticleHelpfulness } from "../services/helpfulness.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type { AuthenticatedUser } from "../types/auth.types";
import type {
  HelpfulnessRouteParamsDto,
  HelpfulnessSummaryDto,
  RateArticleHelpfulnessRequestDto,
} from "../types/helpfulness.types";

function readRequestUser(request: unknown): AuthenticatedUser | undefined {
  return (request as Request & { user?: AuthenticatedUser }).user;
}

export async function getArticleHelpfulnessController(
  request: Request<HelpfulnessRouteParamsDto>,
  response: Response<ApiSuccessResponse<HelpfulnessSummaryDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getArticleHelpfulness(request.params.articleId, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function rateArticleHelpfulnessController(
  request: Request<HelpfulnessRouteParamsDto, ApiSuccessResponse<HelpfulnessSummaryDto>, RateArticleHelpfulnessRequestDto>,
  response: Response<ApiSuccessResponse<HelpfulnessSummaryDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await rateArticleHelpfulness(request.params.articleId, request.body, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}