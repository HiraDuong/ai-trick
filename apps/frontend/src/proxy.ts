// Luvina
// Vu Huy Hoang - Dev2
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasStudioAccessRole } from "./lib/studio-access";

const ACCESS_TOKEN_COOKIE_NAME = "ikp_access_token";

function buildLoginRedirectUrl(request: NextRequest): URL {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return loginUrl;
}

function decodeJwtPayload(token: string): { role?: string } | null {
  const encodedPayload = token.split(".")[1];
  if (!encodedPayload) {
    return null;
  }

  try {
    const normalizedPayload = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4), "=");
    return JSON.parse(atob(paddedPayload)) as { role?: string };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.redirect(buildLoginRedirectUrl(request));
  }

  if (request.nextUrl.pathname.startsWith("/studio")) {
    const payload = decodeJwtPayload(accessToken);
    if (!payload) {
      return NextResponse.redirect(buildLoginRedirectUrl(request));
    }

    if (!hasStudioAccessRole(payload.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/bookmarks/:path*", "/articles/new", "/articles/:path*/edit"],
};