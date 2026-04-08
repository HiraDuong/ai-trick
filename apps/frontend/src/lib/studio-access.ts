// Luvina
// Vu Huy Hoang - Dev2
import type { AuthUserDto } from "./api-types";

export const STUDIO_ALLOWED_ROLES = ["AUTHOR", "EDITOR"] as const;

export function hasStudioAccessRole(role: string | null | undefined): boolean {
  return role === "AUTHOR" || role === "EDITOR";
}

export function hasStudioAccessUser(user: Pick<AuthUserDto, "role"> | null | undefined): boolean {
  return hasStudioAccessRole(user?.role);
}