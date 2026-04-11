// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedUser } from "../types/auth.types";
import { getUserById, verifyAccessToken } from "../services/auth.service";
import { createHttpError } from "../utils/error.utils";

function setRequestUser(request: Request, user: AuthenticatedUser): void {
  (request as Request & { user?: AuthenticatedUser }).user = user;
}

export async function optionalAuthenticateUser(
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      next();
      return;
    }

    if (!authorizationHeader.startsWith("Bearer ")) {
      throw createHttpError(401, "Authorization header must use the Bearer scheme");
    }

    const token = authorizationHeader.replace("Bearer ", "").trim();
    const payload = verifyAccessToken(token);
    setRequestUser(request, await getUserById(payload.sub));
    next();
  } catch (error) {
    next(error);
  }
}