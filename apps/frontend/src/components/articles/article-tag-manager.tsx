"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ArticleDetailDto, ArticleTagDto, AuthUserDto, CurrentUserResponseDto } from "@/lib/api-types";
import { fetchAuthenticatedApi, getStoredAccessToken, subscribeToAuthTokenChanges } from "@/lib/auth";
import { buildTagHref } from "@/lib/tag-links";

interface ArticleTagManagerProps {
  articleId: string;
  articleAuthorId: string;
  initialTags: ArticleTagDto[];
  currentUser: AuthUserDto | null;
}

function normalizeTagName(value: string): string {
  return value.trim().replace(/^#/, "");
}

export function ArticleTagManager({ articleId, articleAuthorId, initialTags, currentUser }: ArticleTagManagerProps) {
  const router = useRouter();
  const [tags, setTags] = useState<ArticleTagDto[]>(initialTags);
  const [resolvedUser, setResolvedUser] = useState<AuthUserDto | null>(currentUser);
  const [draftTagName, setDraftTagName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addTagButtonClassName = isEditing
    ? "inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-contrast)] shadow-[0_10px_28px_rgba(17,107,99,0.18)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)] hover:border-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
    : "inline-flex min-h-10 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--color-accent)_26%,white)] bg-white px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)] shadow-[0_8px_20px_rgba(17,107,99,0.08)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:bg-[color:color-mix(in_srgb,var(--color-accent)_8%,white)] hover:text-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60";

  useEffect(() => {
    let isDisposed = false;

    async function syncCurrentUser(): Promise<void> {
      if (currentUser) {
        setResolvedUser(currentUser);
        return;
      }

      if (!getStoredAccessToken()) {
        setResolvedUser(null);
        return;
      }

      const result = await fetchAuthenticatedApi<CurrentUserResponseDto>("/auth/me");
      if (isDisposed) {
        return;
      }

      setResolvedUser(result.ok ? result.data.user : null);
    }

    void syncCurrentUser();
    const unsubscribe = subscribeToAuthTokenChanges(() => {
      void syncCurrentUser();
    });

    return () => {
      isDisposed = true;
      unsubscribe();
    };
  }, [currentUser]);

  const canManageTags = useMemo(() => {
    if (!resolvedUser) {
      return false;
    }

    return resolvedUser.role === "EDITOR" || (resolvedUser.role === "AUTHOR" && resolvedUser.id === articleAuthorId);
  }, [articleAuthorId, resolvedUser]);

  async function persistTags(nextTagNames: string[]): Promise<void> {
    setIsSaving(true);
    setErrorMessage(null);

    const result = await fetchAuthenticatedApi<ArticleDetailDto>(`/articles/${articleId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags: nextTagNames }),
    });

    setIsSaving(false);

    if (!result.ok) {
      if (result.status === 401) {
        router.replace(`/login?redirectTo=${encodeURIComponent(`/articles/${articleId}`)}`);
        return;
      }
      if (result.status === 403) {
        router.replace("/forbidden");
        return;
      }

      setErrorMessage(result.message);
      return;
    }

    setTags(result.data.tags);
    setDraftTagName("");
    router.refresh();
  }

  async function handleAddTag(): Promise<void> {
    const normalizedTag = normalizeTagName(draftTagName);
    if (!normalizedTag) {
      setErrorMessage("Tag name is required.");
      return;
    }

    if (tags.some((tag) => tag.name.toLowerCase() === normalizedTag.toLowerCase())) {
      setErrorMessage("That tag already exists on this article.");
      return;
    }

    await persistTags([...tags.map((tag) => tag.name), normalizedTag]);
    setIsEditing(false);
  }

  async function handleRemoveTag(tagName: string): Promise<void> {
    await persistTags(tags.filter((tag) => tag.name !== tagName).map((tag) => tag.name));
  }

  return (
    <div className="space-y-4 pt-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Article tags</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
            Use tags to organize this article and make it easier to find later.
          </p>
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--color-accent)_18%,white)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-accent)] shadow-[0_6px_18px_rgba(17,107,99,0.06)]"
              >
                <Link href={buildTagHref(tag.id, tag.name)} className="hover:text-[var(--color-accent-strong)]">
                  #{tag.name}
                </Link>
                {canManageTags ? (
                  <button
                    type="button"
                    onClick={() => void handleRemoveTag(tag.name)}
                    disabled={isSaving}
                    className="rounded-full bg-[color:color-mix(in_srgb,var(--color-accent)_10%,white)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)] transition-colors duration-200 hover:bg-[color:color-mix(in_srgb,var(--color-accent)_18%,white)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded-[1rem] border border-dashed border-[color:color-mix(in_srgb,var(--color-accent)_20%,white)] bg-white/80 px-4 py-3 text-sm text-[var(--color-muted)]">
            No tags yet. Add one to help readers discover this article faster.
          </div>
        )}
      </div>

      {canManageTags ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsEditing((currentValue) => !currentValue);
              setErrorMessage(null);
            }}
            aria-pressed={isEditing}
            disabled={isSaving}
            className={addTagButtonClassName}
          >
            + Add new tag
          </button>
          <p className="text-sm text-[var(--color-muted)]">Visible for the article owner and editors.</p>
        </div>
      ) : null}

      {canManageTags && isEditing ? (
        <div className="flex flex-col gap-3 rounded-[1.3rem] border border-[color:color-mix(in_srgb,var(--color-accent)_20%,white)] bg-white p-4 shadow-[0_14px_34px_rgba(17,107,99,0.08)] sm:flex-row sm:items-center">
          <input
            value={draftTagName}
            onChange={(event) => setDraftTagName(event.target.value)}
            placeholder="Enter a tag name"
            className="min-w-0 flex-1 rounded-full border border-[color:color-mix(in_srgb,var(--color-accent)_18%,white)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-foreground)] outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleAddTag()}
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save tag"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setDraftTagName("");
                setErrorMessage(null);
              }}
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-line)] bg-white px-4 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {errorMessage ? <p className="text-sm text-[var(--color-danger)]">{errorMessage}</p> : null}
    </div>
  );
}