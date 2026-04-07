// Luvina
// Vu Huy Hoang - Dev2
import type { Request, Response } from "express";
import type { ApiSuccessResponse } from "../types/api.types";

export interface HealthResponseDto {
  status: string;
  service: string;
}

export async function getHealth(
  _request: Request,
  response: Response<ApiSuccessResponse<HealthResponseDto>>
): Promise<void> {
  response.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "backend",
    },
  });
}