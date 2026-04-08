// Luvina
// Vu Huy Hoang - Dev2
"use client";

import { useEffect, useState } from "react";
import type { ReactionSummaryDto } from "@/lib/api-types";
import { fetchAuthenticatedApi, getStoredAccessToken, subscribeToAuthTokenChanges } from "@/lib/auth";

type ReactionType = "LIKE" | "LOVE" | "LAUGH";

interface ArticleReactionBarProps {
  articleId: string;
  initialSummary: ReactionSummaryDto | null;
}

const reactionLabels: Record<ReactionType, string> = {
  LIKE: "👍 Like",
  LOVE: "❤️ Love",
  LAUGH: "😂 Laugh",
};

export function ArticleReactionBar({ articleId, initialSummary }: ArticleReactionBarProps) {
  const [summary, setSummary] = useState<ReactionSummaryDto | null>(initialSummary);
  const [hasToken, setHasToken] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<ReactionType | null>(null);

  useEffect(() => {
    async function syncSummary() {
      const token = getStoredAccessToken();
      setHasToken(Boolean(token));

      if (!token) {
        setSummary(initialSummary);
        setMessage(null);
        return;
      }

      const result = await fetchAuthenticatedApi<ReactionSummaryDto>(`/articles/${articleId}/reactions`);
      if (result.ok) {
        setSummary(result.data);
      }
    }

    void syncSummary();
    return subscribeToAuthTokenChanges(() => {
      void syncSummary();
    });
  }, [articleId, initialSummary]);

  async function handleReact(type: ReactionType) {
    setSubmitting(type);
    setMessage(null);

    const result = await fetchAuthenticatedApi<ReactionSummaryDto>("/reactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ articleId, type }),
    });

    if (!result.ok) {
      setMessage(result.message);
      setSubmitting(null);
      return;
    }

    setSummary(result.data);
    setSubmitting(null);
  }

  return (
    <article className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.07)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">Reactions</p>
      <h2 className="mt-3 text-3xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-4xl">
        Quick pulse from readers
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {(["LIKE", "LOVE", "LAUGH"] as const).map((type) => {
          const isActive = summary?.userReaction === type;
          const count = type === "LIKE" ? summary?.likeCount ?? 0 : type === "LOVE" ? summary?.loveCount ?? 0 : summary?.laughCount ?? 0;

          return (
            <button
              key={type}
              type="button"
              onClick={() => void handleReact(type)}
              disabled={submitting !== null || !hasToken}
              className={`rounded-[1.5rem] border px-4 py-4 text-left transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                isActive
                  ? "border-[var(--color-accent)] bg-[color:color-mix(in_srgb,var(--color-accent)_12%,white)]"
                  : "border-[var(--color-line)] bg-white hover:border-[var(--color-accent)]"
              }`}
            >
              <span className="block text-sm font-semibold text-[var(--color-foreground)]">{reactionLabels[type]}</span>
              <span className="mt-2 block text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{count} reactions</span>
            </button>
          );
        })}
      </div>
      {!hasToken ? <p className="mt-4 text-sm text-[var(--color-muted)]">Log in to react to this article.</p> : null}
      {message ? <p className="mt-4 text-sm text-[var(--color-danger)]">{message}</p> : null}
    </article>
  );
}