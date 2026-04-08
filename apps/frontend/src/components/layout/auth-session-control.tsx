// Luvina
// Vu Huy Hoang - Dev2
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearStoredAccessToken, getStoredAccessToken, subscribeToAuthTokenChanges } from "@/lib/auth";

function buildLoginHref(pathname: string): string {
  const params = new URLSearchParams({ redirectTo: pathname || "/" });
  return `/login?${params.toString()}`;
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
      <path d="M14.5 7.5 19 12l-4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12h13.5" strokeLinecap="round" />
      <path d="M9.5 4.5h-2A2.5 2.5 0 0 0 5 7v10a2.5 2.5 0 0 0 2.5 2.5h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
      <path d="M14.5 7.5 19 12l-4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 12H19" strokeLinecap="round" />
      <path d="M9.5 4.5h-2A2.5 2.5 0 0 0 5 7v10a2.5 2.5 0 0 0 2.5 2.5h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const actionButtonClassName =
  "group inline-flex min-h-12 min-w-12 items-center overflow-hidden rounded-full border border-[var(--color-line)] bg-white px-3 text-[var(--color-foreground)] transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:border-[var(--color-accent)] focus-visible:text-[var(--color-accent)]";
const actionLabelClassName =
  "ml-0 max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-200 group-hover:ml-3 group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:ml-3 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100";

export function AuthSessionControl() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const syncTokenState = () => {
      setHasToken(Boolean(getStoredAccessToken()));
    };

    syncTokenState();
    return subscribeToAuthTokenChanges(syncTokenState);
  }, []);

  if (!hasToken) {
    return (
      <Link
        href={buildLoginHref(pathname)}
        aria-label="Log in"
        title="Log in"
        className={actionButtonClassName}
      >
        <LoginIcon />
        <span className={actionLabelClassName}>Log in</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        clearStoredAccessToken();
        router.refresh();
      }}
      aria-label="Log out"
      title="Log out"
      className={actionButtonClassName}
    >
      <LogoutIcon />
      <span className={actionLabelClassName}>Log out</span>
    </button>
  );
}