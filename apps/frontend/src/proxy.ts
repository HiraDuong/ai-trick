// Luvina
// Vu Huy Hoang - Dev2
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE_NAME = "ikp_access_token";

function buildLoginRedirectUrl(request: NextRequest): URL {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return loginUrl;
}

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.redirect(buildLoginRedirectUrl(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/bookmarks/:path*"],
};