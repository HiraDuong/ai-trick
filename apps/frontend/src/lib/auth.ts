// Luvina
// Vu Huy Hoang - Dev2
import type { ApiResult } from "./api";
import type { ApiErrorResponse, ApiSuccessResponse, AuthResponseDto } from "./api-types";

export const ACCESS_TOKEN_STORAGE_KEY = "ikp_access_token";
export const AUTH_TOKEN_CHANGED_EVENT = "ikp-auth-token-changed";
export const ACCESS_TOKEN_COOKIE_NAME = "ikp_access_token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function writeAccessTokenCookie(token: string): void {
  if (!isBrowser()) {
    return;
  }

  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secureFlag}`;
}

function clearAccessTokenCookie(): void {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function readAccessTokenCookie(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const cookiePrefix = `${ACCESS_TOKEN_COOKIE_NAME}=`;
  const matchedCookie = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(cookiePrefix));

  if (!matchedCookie) {
    return null;
  }

  return decodeURIComponent(matchedCookie.slice(cookiePrefix.length));
}

function dispatchAuthTokenChanged(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CHANGED_EVENT));
}

function readApiErrorMessage(payload: ApiErrorResponse | ApiSuccessResponse<unknown> | null, fallbackMessage: string): string {
  if (payload && "error" in payload && payload.error?.message) {
    return payload.error.message;
  }

  return fallbackMessage;
}

export function getStoredAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const localStorageToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (localStorageToken) {
    return localStorageToken;
  }

  const cookieToken = readAccessTokenCookie();
  if (cookieToken) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, cookieToken);
  }

  return cookieToken;
}

export function setStoredAccessToken(token: string): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  writeAccessTokenCookie(token);
  dispatchAuthTokenChanged();
}

export function clearStoredAccessToken(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  clearAccessTokenCookie();
  dispatchAuthTokenChanged();
}

export function subscribeToAuthTokenChanges(callback: () => void): () => void {
  if (!isBrowser()) {
    return () => undefined;
  }

  window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export async function loginWithCredentials(email: string, password: string): Promise<ApiResult<AuthResponseDto>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const payload = (await response.json().catch(() => null)) as
      | ApiSuccessResponse<AuthResponseDto>
      | ApiErrorResponse
      | null;

    if (!response.ok || !payload || !("data" in payload)) {
      return {
        ok: false,
        status: response.status,
        message: readApiErrorMessage(payload, "Unable to sign in right now"),
      };
    }

    return {
      ok: true,
      data: payload.data,
    };
  } catch {
    return {
      ok: false,
      status: 503,
      message: "Frontend could not connect to the backend API",
    };
  }
}

export async function fetchAuthenticatedApi<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const token = getStoredAccessToken();
  if (!token) {
    return {
      ok: false,
      status: 401,
      message: "Authentication is required",
    };
  }

  try {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers,
    });

    const payload = (await response.json().catch(() => null)) as
      | ApiSuccessResponse<T>
      | ApiErrorResponse
      | null;

    if (!response.ok || !payload || !("data" in payload)) {
      return {
        ok: false,
        status: response.status,
        message: readApiErrorMessage(payload, "Authenticated request failed"),
      };
    }

    return {
      ok: true,
      data: payload.data,
    };
  } catch {
    return {
      ok: false,
      status: 503,
      message: "Frontend could not connect to the backend API",
    };
  }
}