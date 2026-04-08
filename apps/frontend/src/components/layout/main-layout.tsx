// Luvina
// Vu Huy Hoang - Dev2
import Form from "next/form";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CategoryNodeDto } from "@/lib/api-types";
import { AuthSessionControl } from "./auth-session-control";
import { NotificationBell } from "./notification-bell";
import { SidebarTree } from "./sidebar-tree";

interface MainLayoutProps {
  children: ReactNode;
  categories: CategoryNodeDto[];
  categoryError: string | null;
}

export function MainLayout({ children, categories, categoryError }: MainLayoutProps) {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-4">
        <header className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 px-5 py-5 shadow-[0_18px_60px_rgba(33,37,41,0.06)] sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Form action="/search" className="flex min-w-[18rem] flex-1 items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-3 py-2 sm:min-w-[24rem]" role="search">
                <input
                  type="search"
                  name="q"
                  placeholder="Search articles by keyword"
                  aria-label="Search articles"
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-muted)]"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)]"
                >
                  Search
                </button>
              </Form>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/articles"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)]"
                >
                  Open archive
                </Link>
                <Link
                  href="/bookmarks"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Bookmarks
                </Link>
                <Link
                  href="/studio"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Studio
                </Link>
                <NotificationBell />
                <AuthSessionControl />
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-5 shadow-[0_18px_60px_rgba(33,37,41,0.05)] xl:sticky xl:top-4 xl:h-fit">
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