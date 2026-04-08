// Luvina
// Vu Huy Hoang - Dev2
"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { CategoryNodeDto } from "@/lib/api-types";
import { AuthSessionControl } from "./auth-session-control";
import { HeaderOffsetObserver } from "./header-offset-observer";
import { NotificationBell } from "./notification-bell";
import { SidebarTree } from "./sidebar-tree";

interface MainLayoutProps {
  children: ReactNode;
  categories: CategoryNodeDto[];
  categoryError: string | null;
}

const activeNavLinkClass =
  "group inline-flex min-h-12 min-w-12 items-center overflow-hidden rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 text-[var(--color-accent-contrast)] shadow-[0_12px_32px_rgba(17,107,99,0.18)] transition-all duration-200 hover:border-[var(--color-accent-strong)] hover:bg-[var(--color-accent-strong)] focus-visible:border-[var(--color-accent-strong)] focus-visible:bg-[var(--color-accent-strong)]";
const inactiveNavLinkClass =
  "group inline-flex min-h-12 min-w-12 items-center overflow-hidden rounded-full border border-[var(--color-line)] bg-white px-3 text-[var(--color-foreground)] transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:border-[var(--color-accent)] focus-visible:text-[var(--color-accent)]";
const navLabelClass =
  "ml-0 max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-200 group-hover:ml-3 group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:ml-3 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100";

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
      <path d="M4 7.5h16" strokeLinecap="round" />
      <path d="M6.5 7.5V18a1.5 1.5 0 0 0 1.5 1.5h8A1.5 1.5 0 0 0 17.5 18V7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 11.5h5" strokeLinecap="round" />
      <rect x="3.5" y="4.5" width="17" height="3" rx="1.5" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
      <path d="M7.5 4.5h9a1.5 1.5 0 0 1 1.5 1.5v13l-6-3-6 3V6a1.5 1.5 0 0 1 1.5-1.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StudioIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
      <path d="M4.5 18.5h4l9-9-4-4-9 9v4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m12.5 6.5 4 4" strokeLinecap="round" />
      <path d="M4.5 18.5h15" strokeLinecap="round" />
    </svg>
  );
}

interface HeaderNavItemProps {
  href: string;
  label: string;
  isActive: boolean;
  icon: ReactNode;
}

function HeaderNavItem({ href, label, isActive, icon }: HeaderNavItemProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      aria-current={isActive ? "page" : undefined}
      className={isActive ? activeNavLinkClass : inactiveNavLinkClass}
    >
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className={navLabelClass}>{label}</span>
    </Link>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/articles") {
    return pathname === "/articles" || pathname.startsWith("/articles/") || pathname.startsWith("/tags/") || pathname.startsWith("/search");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainLayout({ children, categories, categoryError }: MainLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-4 pb-4 sm:px-6 lg:px-8">
      <HeaderOffsetObserver />

      <div data-site-header className="fixed inset-x-0 top-0 z-[60] bg-[color:color-mix(in_srgb,var(--background)_86%,white)]/96 backdrop-blur-md">
        <div className="px-4 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[96rem] pt-0">
            <header className="rounded-b-[2rem] border border-t-0 border-[var(--color-line)] bg-[color:color-mix(in_srgb,var(--color-surface)_94%,white)] px-5 py-5 shadow-[0_18px_60px_rgba(33,37,41,0.08)] sm:px-6">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,42rem)] xl:items-start">
                <div className="space-y-2">
                  <Link href="/" className="inline-flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-contrast)]">
                      IK
                    </span>
                    <span className="text-lg font-semibold text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-xl">
                      Internal Knowledge Sharing Platform
                    </span>
                  </Link>
                  <p className="max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
                    Browse the knowledge archive with a shared category sidebar and a persistent search entry point.
                  </p>
                </div>

                <div className="flex flex-col gap-3 xl:items-end">
                  <Form action="/search" className="flex min-h-14 w-full items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]" role="search">
                    <input
                      type="search"
                      name="q"
                      placeholder="Search articles by keyword"
                      aria-label="Search articles"
                      className="min-w-0 flex-1 bg-transparent px-2 text-sm text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-muted)]"
                    />
                    <button
                      type="submit"
                      className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)]"
                    >
                      Search
                    </button>
                  </Form>
                  <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                    <HeaderNavItem href="/articles" label="Open archive" isActive={isActivePath(pathname, "/articles")} icon={<ArchiveIcon />} />
                    <HeaderNavItem href="/bookmarks" label="Bookmarks" isActive={isActivePath(pathname, "/bookmarks")} icon={<BookmarkIcon />} />
                    <HeaderNavItem href="/studio" label="Studio" isActive={isActivePath(pathname, "/studio")} icon={<StudioIcon />} />
                    <NotificationBell />
                    <AuthSessionControl />
                  </div>
                </div>
              </div>
            </header>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-4 pt-[var(--site-header-offset)]">
        <div className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-5 shadow-[0_18px_60px_rgba(33,37,41,0.05)] xl:sticky xl:top-[var(--site-header-offset)] xl:h-fit">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
                  Category tree
                </p>
                <h2 className="mt-2 text-2xl text-[var(--color-foreground)] [font-family:var(--font-display)]">
                  Browse by knowledge domain
                </h2>
              </div>

              {categoryError ? (
                <div className="rounded-[1.5rem] border border-[color:color-mix(in_srgb,var(--color-danger)_24%,white)] bg-[color:color-mix(in_srgb,var(--color-danger)_8%,white)] p-4 text-sm leading-6 text-[var(--color-foreground)]">
                  {categoryError}
                </div>
              ) : categories.length > 0 ? (
                <SidebarTree categories={categories} />
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] p-4 text-sm leading-6 text-[var(--color-muted)]">
                  No categories are available yet.
                </div>
              )}
            </div>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}