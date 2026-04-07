// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { getUserById, verifyAccessToken } from "../services/auth.service";
import { createHttpError } from "../utils/error.utils";

export async function authenticateUser(
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw createHttpError(401, "Authorization header is required");
    }

    const token = authorizationHeader.replace("Bearer ", "").trim();
    const payload = verifyAccessToken(token);
    request.user = await getUserById(payload.sub);
    next();
  } catch (error) {
    next(error);
  }
}