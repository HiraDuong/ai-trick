// Luvina
// Vu Huy Hoang - Dev2
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthSessionControl } from "./auth-session-control";
import { NotificationBell } from "./notification-bell";

const activeNavLinkClass =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-5 text-sm font-semibold text-[var(--color-accent-contrast)] shadow-[0_12px_32px_rgba(17,107,99,0.18)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)] hover:border-[var(--color-accent-strong)]";
const inactiveNavLinkClass =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-line)] bg-white px-5 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]";

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/articles") {
    return pathname === "/articles" || pathname.startsWith("/articles/") || pathname.startsWith("/tags/") || pathname.startsWith("/search");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderPrimaryNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-3 xl:justify-end">
      <Link href="/articles" aria-current={isActivePath(pathname, "/articles") ? "page" : undefined} className={isActivePath(pathname, "/articles") ? activeNavLinkClass : inactiveNavLinkClass}>
        Open archive
      </Link>
      <Link href="/bookmarks" aria-current={isActivePath(pathname, "/bookmarks") ? "page" : undefined} className={isActivePath(pathname, "/bookmarks") ? activeNavLinkClass : inactiveNavLinkClass}>
        Bookmarks
      </Link>
      <Link href="/studio" aria-current={isActivePath(pathname, "/studio") ? "page" : undefined} className={isActivePath(pathname, "/studio") ? activeNavLinkClass : inactiveNavLinkClass}>
        Studio
      </Link>
      <NotificationBell />
      <AuthSessionControl />
    </div>
  );
}