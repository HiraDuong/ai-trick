// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { getDashboardFeed } from "../services/dashboard.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type { DashboardFeedResponseDto } from "../types/dashboard.types";

export async function getDashboardFeedController(
  _request: Request,
  response: Response<ApiSuccessResponse<DashboardFeedResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getDashboardFeed();
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}