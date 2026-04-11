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
        className="inline-flex items-center justify-center rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        Log in
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
      className="inline-flex items-center justify-center rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
    >
      Log out
    </button>
  );
}