// Luvina
// Vu Huy Hoang - Dev2
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUserDto, CurrentUserResponseDto } from "./api-types";
import { ACCESS_TOKEN_COOKIE_NAME } from "./auth";
import { hasStudioAccessUser } from "./studio-access";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

function buildLoginRedirectPath(redirectTo: string): string {
  const params = new URLSearchParams({ redirectTo });
  return `/login?${params.toString()}`;
}

export async function readServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;
}

export async function fetchServerCurrentUser(): Promise<AuthUserDto | null> {
  const token = await readServerAccessToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json().catch(() => null)) as { data?: CurrentUserResponseDto } | null;
    return payload?.data?.user ?? null;
  } catch {
    return null;
  }
}

export async function requireAuthenticatedUser(redirectTo: string): Promise<AuthUserDto> {
  const user = await fetchServerCurrentUser();
  if (!user) {
    redirect(buildLoginRedirectPath(redirectTo));
  }

  return user;
}

export async function requireAuthorUser(redirectTo: string): Promise<AuthUserDto> {
  const user = await requireAuthenticatedUser(redirectTo);
  if (user.role !== "AUTHOR") {
    redirect("/");
  }

  return user;
}

export async function requireStudioUser(redirectTo: string): Promise<AuthUserDto> {
  const user = await requireAuthenticatedUser(redirectTo);
  if (!hasStudioAccessUser(user)) {
    redirect("/");
  }

  return user;
}

export async function requireArticleContributorUser(redirectTo: string): Promise<AuthUserDto> {
  return requireStudioUser(redirectTo);
}

export async function redirectAuthenticatedUser(redirectTo: string): Promise<void> {
  const user = await fetchServerCurrentUser();
  if (user) {
    redirect(redirectTo);
  }
}