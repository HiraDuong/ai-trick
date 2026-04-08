// Luvina
// Vu Huy Hoang - Dev2
"use client";

import { useEffect, useState } from "react";
import type { BookmarkDto } from "@/lib/api-types";
import { fetchAuthenticatedApi, getStoredAccessToken, subscribeToAuthTokenChanges } from "@/lib/auth";

interface ArticleBookmarkButtonProps {
  articleId: string;
}

export function ArticleBookmarkButton({ articleId }: ArticleBookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const buttonClassName = bookmarked
    ? "inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-contrast)] shadow-[0_12px_32px_rgba(17,107,99,0.22)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)] hover:border-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
    : "inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60";

  useEffect(() => {
    async function syncBookmarkState() {
      const token = getStoredAccessToken();
      setHasToken(Boolean(token));

      if (!token) {
        setBookmarked(false);
        setMessage(null);
        return;
      }

      const result = await fetchAuthenticatedApi<BookmarkDto>(`/articles/${articleId}/bookmark-status`);
      if (result.ok) {
        setBookmarked(result.data.bookmarked);
      }
    }

    void syncBookmarkState();
    return subscribeToAuthTokenChanges(() => {
      void syncBookmarkState();
    });
  }, [articleId]);

  async function handleToggleBookmark() {
    setLoading(true);
    setMessage(null);

    const result = await fetchAuthenticatedApi<{ articleId: string; bookmarked: boolean }>(
      bookmarked ? `/bookmarks/${articleId}` : "/bookmarks",
      {
        method: bookmarked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        ...(bookmarked ? {} : { body: JSON.stringify({ articleId }) }),
      }
    );

    if (!result.ok) {
      setMessage(result.message);
      setLoading(false);
      return;
    }

    setBookmarked(result.data.bookmarked);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => void handleToggleBookmark()}
        disabled={loading || !hasToken}
        aria-pressed={bookmarked}
        className={buttonClassName}
      >
        {!hasToken ? "Log in to bookmark" : bookmarked ? "Bookmarked" : "Bookmark article"}
      </button>
      {message ? <p className="text-xs text-[var(--color-danger)]">{message}</p> : null}
    </div>
  );
}