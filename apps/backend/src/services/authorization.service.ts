import type { UserRole } from "@prisma/client";
import type { AuthenticatedUser } from "../types/auth.types";
import { createHttpError } from "../utils/error.utils";

export type AppCapability =
  | "article:create"
  | "article:update:own"
  | "article:delete:own"
  | "article:read"
  | "comment:create"
  | "vote:create";

const roleCapabilities: Record<UserRole, Set<AppCapability>> = {
  AUTHOR: new Set<AppCapability>([
    "article:create",
    "article:update:own",
    "article:delete:own",
    "article:read",
    "comment:create",
    "vote:create",
  ]),
  EDITOR: new Set<AppCapability>([
    "article:create",
    "article:update:own",
    "article:delete:own",
    "article:read",
    "comment:create",
    "vote:create",
  ]),
  VIEWER: new Set<AppCapability>(["article:read", "comment:create", "vote:create"]),
};

export function hasCapability(role: UserRole, capability: AppCapability): boolean {
  return roleCapabilities[role].has(capability);
}

export function assertCapability(
  user: AuthenticatedUser | undefined,
  capability: AppCapability,
  message = "You do not have permission to perform this action"
): asserts user is AuthenticatedUser {
  if (!user) {
    throw createHttpError(401, "Authentication is required");
  }

  if (!hasCapability(user.role, capability)) {
    throw createHttpError(403, message);
  }
}

export function assertOwnershipOrThrow(resourceOwnerId: string, userId: string): void {
  if (resourceOwnerId !== userId) {
    throw createHttpError(403, "You can only manage your own articles");
  }
}
