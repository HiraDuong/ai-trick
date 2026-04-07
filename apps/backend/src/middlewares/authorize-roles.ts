// Luvina
// Vu Huy Hoang - Dev2
import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { createHttpError } from "../utils/error.utils";

export function authorizeRoles(...roles: UserRole[]) {
  return async function roleMiddleware(
    request: Request,
    _response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!request.user) {
        throw createHttpError(401, "Authentication is required");
      }

      if (!roles.includes(request.user.role)) {
        throw createHttpError(403, "You do not have permission to access this resource");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}