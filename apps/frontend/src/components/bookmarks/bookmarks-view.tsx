// Luvina
// Vu Huy Hoang - Dev2
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BookmarkListItemDto } from "@/lib/api-types";
import { fetchAuthenticatedApi, getStoredAccessToken, subscribeToAuthTokenChanges } from "@/lib/auth";
import { toPlainTextPreview } from "@/lib/content-preview";
import { formatArticleDate } from "@/lib/format";

export function BookmarksView() {
  const [bookmarks, setBookmarks] = useState<BookmarkListItemDto[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookmarks() {
      if (!getStoredAccessToken()) {
        setMessage("Log in to see your saved articles.");
        setBookmarks([]);
        return;
      }

      const result = await fetchAuthenticatedApi<BookmarkListItemDto[]>("/bookmarks");
      if (!result.ok) {
        setMessage(result.message);
        setBookmarks([]);
        return;
      }

      setMessage(null);
      setBookmarks(result.data);
    }

    void loadBookmarks();
    return subscribeToAuthTokenChanges(() => {
      void loadBookmarks();
    });
  }, []);

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-[2.25rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-8 shadow-[0_24px_80px_rgba(33,37,41,0.08)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">Bookmarks</p>
          <h1 className="mt-3 text-4xl leading-[1.05] text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-5xl">
            Your saved reading list
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Saved articles stay here so you can come back to them without rebuilding the search context.
          </p>
        </section>

        {message ? (
          <section className="rounded-[2rem] border border-[color:color-mix(in_srgb,var(--color-danger)_22%,white)] bg-[color:color-mix(in_srgb,var(--color-danger)_8%,white)] p-6 text-sm leading-7 text-[var(--color-foreground)]">
            {message}
          </section>
        ) : bookmarks.length === 0 ? (
          <section className="rounded-[2rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface)]/80 p-8 text-sm leading-7 text-[var(--color-muted)]">
            You have not saved any articles yet.
          </section>
        ) : (
          <section className="grid gap-5">
            {bookmarks.map((bookmark) => (
              <article
                key={bookmark.articleId}
                className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.08)]"
              >
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  <span>Saved {formatArticleDate(bookmark.createdAt)}</span>
                </div>
                <Link
                  href={`/articles/${bookmark.articleId}`}
                  className="mt-4 block text-2xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] transition-colors duration-200 hover:text-[var(--color-accent)] sm:text-3xl"
                >
                  {bookmark.title}
                </Link>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">{toPlainTextPreview(bookmark.excerpt ?? "")}</p>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}