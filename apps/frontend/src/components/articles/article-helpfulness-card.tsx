// Luvina
// Vu Huy Hoang - Dev2
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ApiResult } from "@/lib/api";
import { clearStoredAccessToken, fetchAuthenticatedApi, getStoredAccessToken, subscribeToAuthTokenChanges } from "@/lib/auth";
import type { HelpfulnessSummaryDto } from "@/lib/api-types";

type HelpfulnessValue = "HELPFUL" | "NOT_HELPFUL";

interface ArticleHelpfulnessCardProps {
  articleId: string;
  helpfulnessResult: ApiResult<HelpfulnessSummaryDto>;
}

type HelpfulnessSummaryState = HelpfulnessSummaryDto | null;

function buildLoginHref(pathname: string): string {
  const params = new URLSearchParams({ redirectTo: pathname || "/" });
  return `/login?${params.toString()}`;
}

export function ArticleHelpfulnessCard({ articleId, helpfulnessResult }: ArticleHelpfulnessCardProps) {
  const pathname = usePathname();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [summaryOverride, setSummaryOverride] = useState<HelpfulnessSummaryState>(null);
  const summary = summaryOverride ?? (helpfulnessResult.ok ? helpfulnessResult.data : null);

  useEffect(() => {
    const syncToken = () => {
      const nextToken = getStoredAccessToken();
      setAccessToken(nextToken);

      if (!nextToken) {
        setSummaryOverride(null);
      }
    };

    syncToken();
    return subscribeToAuthTokenChanges(syncToken);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function refreshSummaryForAuthenticatedUser() {
      if (!accessToken) {
        return;
      }

      const result = await fetchAuthenticatedApi<HelpfulnessSummaryDto>(`/articles/${articleId}/helpfulness`);
      if (isCancelled) {
        return;
      }

      if (!result.ok) {
        if (result.status === 401) {
          clearStoredAccessToken();
          setFeedbackMessage("Your session expired or is invalid. Log in again to continue voting.");
          setSummaryOverride(null);
        }

        return;
      }

      setSummaryOverride(result.data);
    }

    void refreshSummaryForAuthenticatedUser();

    return () => {
      isCancelled = true;
    };
  }, [accessToken, articleId, helpfulnessResult]);

  const loginHref = buildLoginHref(pathname);

  async function submitVote(value: HelpfulnessValue) {
    if (isSubmitting) {
      return;
    }

    if (!accessToken) {
      setFeedbackMessage("Log in to vote on this article.");
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage(null);

    const result = await fetchAuthenticatedApi<HelpfulnessSummaryDto>(`/articles/${articleId}/helpfulness`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value }),
    });

    if (!result.ok) {
      if (result.status === 401) {
        clearStoredAccessToken();
        setFeedbackMessage("Your session expired or is invalid. Log in again to continue voting.");
      } else {
        setFeedbackMessage(result.message);
      }

      setIsSubmitting(false);
      return;
    }

    setSummaryOverride(result.data);
    setFeedbackMessage(`Vote saved as ${value === "HELPFUL" ? "helpful" : "not helpful"}.`);
    setIsSubmitting(false);
  }

  const isAuthenticated = Boolean(accessToken);

  return (
    <article className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.07)] sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">Helpfulness</p>
      <h2 className="mt-3 text-3xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-4xl">
        Reader feedback
      </h2>

      {!summary && !helpfulnessResult.ok ? (
        <p className="mt-5 text-sm leading-7 text-[var(--color-danger)]">{helpfulnessResult.message}</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Helpful</p>
              <p className="mt-3 text-3xl text-[var(--color-foreground)] [font-family:var(--font-display)]">
                {summary?.helpfulCount ?? 0}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Not helpful</p>
              <p className="mt-3 text-3xl text-[var(--color-foreground)] [font-family:var(--font-display)]">
                {summary?.notHelpfulCount ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-background)]/65 p-4">
            {isAuthenticated ? (
              <p className="text-sm leading-7 text-[var(--color-muted)]">
                Your access token is active in this browser. Votes are submitted automatically.
              </p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-7 text-[var(--color-muted)]">
                  Log in to submit a helpfulness vote. Your session is stored locally and reused after refresh.
                </p>
                <Link
                  href={loginHref}
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)]"
                >
                  Log in to vote
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => submitVote("HELPFUL")}
              disabled={isSubmitting || !isAuthenticated}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
                summary?.userVote === "HELPFUL"
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-contrast)]"
                  : "border border-[var(--color-line)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              } ${isSubmitting || !isAuthenticated ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {isSubmitting && summary?.userVote !== "HELPFUL" ? "Saving..." : "Helpful"}
            </button>
            <button
              type="button"
              onClick={() => submitVote("NOT_HELPFUL")}
              disabled={isSubmitting || !isAuthenticated}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
                summary?.userVote === "NOT_HELPFUL"
                  ? "bg-[var(--color-foreground)] text-white"
                  : "border border-[var(--color-line)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              } ${isSubmitting || !isAuthenticated ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {isSubmitting && summary?.userVote !== "NOT_HELPFUL" ? "Saving..." : "Not helpful"}
            </button>
          </div>

          {summary?.userVote ? (
            <p className="mt-4 text-sm font-semibold text-[var(--color-accent)]">
              Your current vote: {summary.userVote.replace("_", " ")}
            </p>
          ) : isAuthenticated ? (
            <p className="mt-4 text-sm text-[var(--color-muted)]">You are logged in. Choose a vote to record your feedback.</p>
          ) : (
            <p className="mt-4 text-sm text-[var(--color-muted)]">No vote recorded for the current visitor.</p>
          )}

          {feedbackMessage ? <p className="mt-3 text-sm leading-7 text-[var(--color-foreground)]">{feedbackMessage}</p> : null}
        </>
      )}
    </article>
  );
}