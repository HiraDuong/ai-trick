// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { getCategoryTree } from "../services/category.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type { CategoryTreeResponseDto } from "../types/category.types";

export async function getCategoryTreeController(
  _request: Request,
  response: Response<ApiSuccessResponse<CategoryTreeResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getCategoryTree();
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}