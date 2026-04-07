// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { getArticleHelpfulness, rateArticleHelpfulness } from "../services/helpfulness.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type {
  HelpfulnessRouteParamsDto,
  HelpfulnessSummaryDto,
  RateArticleHelpfulnessRequestDto,
} from "../types/helpfulness.types";

export async function getArticleHelpfulnessController(
  request: Request<HelpfulnessRouteParamsDto>,
  response: Response<ApiSuccessResponse<HelpfulnessSummaryDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getArticleHelpfulness(request.params.articleId, request.user);
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
    const result = await rateArticleHelpfulness(request.params.articleId, request.body, request.user);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}