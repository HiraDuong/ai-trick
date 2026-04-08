// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { getCurrentUserResponse, getEditorAccessResponse, loginUser, registerUser } from "../services/auth.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type {
  AuthenticatedUser,
  AuthResponseDto,
  CurrentUserResponseDto,
  EditorAccessResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
} from "../types/auth.types";
import { createHttpError } from "../utils/error.utils";

function readRequestUser(request: Request): AuthenticatedUser | undefined {
  return (request as Request & { user?: AuthenticatedUser }).user;
}

export async function register(
  request: Request<Record<string, never>, ApiSuccessResponse<AuthResponseDto>, RegisterRequestDto>,
  response: Response<ApiSuccessResponse<AuthResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await registerUser(request.body);
    response.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(
  request: Request<Record<string, never>, ApiSuccessResponse<AuthResponseDto>, LoginRequestDto>,
  response: Response<ApiSuccessResponse<AuthResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await loginUser(request.body);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(
  request: Request,
  response: Response<ApiSuccessResponse<CurrentUserResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const user = readRequestUser(request);
    if (!user) {
      throw createHttpError(401, "Authenticated user is required");
    }

    const result = await getCurrentUserResponse(user.id);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getEditorAccess(
  _request: Request,
  response: Response<ApiSuccessResponse<EditorAccessResponseDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = getEditorAccessResponse();
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}