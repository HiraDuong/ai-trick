// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { searchArticles } from "../services/search.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type { SearchArticlesQueryDto, SearchArticlesResponseDto } from "../types/search.types";

export async function searchArticlesController(
  request: Request<Record<string, never>, ApiSuccessResponse<SearchArticlesResponseDto>, Record<string, never>, SearchArticlesQueryDto>,
  response: Response<ApiSuccessResponse<SearchArticlesResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await searchArticles(request.query);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}