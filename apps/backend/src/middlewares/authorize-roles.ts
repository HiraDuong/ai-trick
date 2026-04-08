// Luvina
// Vu Huy Hoang - Dev2
import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedUser } from "../types/auth.types";
import { createHttpError } from "../utils/error.utils";

function readRequestUser(request: Request): AuthenticatedUser | undefined {
  return (request as Request & { user?: AuthenticatedUser }).user;
}

export function authorizeRoles(...roles: UserRole[]) {
  return async function roleMiddleware(
    request: Request,
    _response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = readRequestUser(request);
      if (!user) {
        throw createHttpError(401, "Authentication is required");
      }

      if (!roles.includes(user.role)) {
        throw createHttpError(403, "You do not have permission to access this resource");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}