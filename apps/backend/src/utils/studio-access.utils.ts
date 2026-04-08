// Luvina
// Vu Huy Hoang - Dev2
import type { UserRole } from "@prisma/client";
import type { AuthenticatedUser } from "../types/auth.types";
import { createHttpError } from "./error.utils";

export function hasStudioAccessRole(role: UserRole | undefined): boolean {
  return role === "AUTHOR" || role === "EDITOR";
}

export function ensureStudioAccessUser(user: AuthenticatedUser | undefined, forbiddenMessage: string): asserts user is AuthenticatedUser {
  if (!user) {
    throw createHttpError(401, "Authentication is required");
  }

  if (!hasStudioAccessRole(user.role)) {
    throw createHttpError(403, forbiddenMessage);
  }
}

export function canManageArticle(user: AuthenticatedUser, articleAuthorId: string): boolean {
  return user.role === "EDITOR" || user.id === articleAuthorId;
}