// Luvina
// Vu Huy Hoang - Dev2
"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import type {
  ArticleDetailDto,
  ArticleListResponseDto,
  ArticleVersionDto,
  CategoryNodeDto,
  CurrentUserResponseDto,
} from "@/lib/api-types";
import { fetchAuthenticatedApi, getStoredAccessToken, subscribeToAuthTokenChanges } from "@/lib/auth";
import { formatArticleDate } from "@/lib/format";

interface DraftStudioProps {
  categories: CategoryNodeDto[];
}

interface CategoryOption {
  id: string;
  name: string;
}

function flattenCategories(nodes: CategoryNodeDto[], trail: string[] = []): CategoryOption[] {
  return nodes.flatMap((node) => {
    const label = [...trail, node.name].join(" / ");
    return [{ id: node.id, name: label }, ...flattenCategories(node.children, [...trail, node.name])];
  });
}

function extractText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(extractText).filter(Boolean).join("\n\n");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.text === "string") {
      return record.text;
    }
    if (Array.isArray(record.blocks)) {
      return record.blocks.map(extractText).filter(Boolean).join("\n\n");
    }
    if (Array.isArray(record.content)) {
      return record.content.map(extractText).filter(Boolean).join("\n\n");
    }
  }

  return "";
}

function buildContentPayload(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function DraftStudio({ categories }: DraftStudioProps) {
  const categoryOptions = flattenCategories(categories);
  const [drafts, setDrafts] = useState<ArticleDetailDto[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categoryOptions[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [versions, setVersions] = useState<ArticleVersionDto[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const loadArticle = useEffectEvent(async (articleId: string) => {
    const articleResult = await fetchAuthenticatedApi<ArticleDetailDto>(`/articles/${articleId}`);
    if (!articleResult.ok) {
      setMessage(articleResult.message);
      return;
    }

    const versionsResult = await fetchAuthenticatedApi<ArticleVersionDto[]>(`/articles/${articleId}/versions`);
    setSelectedArticleId(articleId);
    setTitle(articleResult.data.title);
    setCategoryId(articleResult.data.category.id);
    setContent(extractText(articleResult.data.content));
    setDirty(false);
    setVersions(versionsResult.ok ? versionsResult.data : []);
    setMessage(null);
  });

  const loadDrafts = useEffectEvent(async () => {
    if (!getStoredAccessToken()) {
      setMessage("Log in as an author to manage drafts.");
      setDrafts([]);
      setSelectedArticleId(null);
      return;
    }

    const userResult = await fetchAuthenticatedApi<CurrentUserResponseDto>("/auth/me");
    if (!userResult.ok) {
      setMessage(userResult.message);
      return;
    }

    if (userResult.data.user.role !== "AUTHOR") {
      setMessage("Only author accounts can use the draft studio.");
      setDrafts([]);
      setSelectedArticleId(null);
      return;
    }

    const draftsResult = await fetchAuthenticatedApi<ArticleListResponseDto>("/articles?status=DRAFT&skip=0&limit=50");
    if (!draftsResult.ok) {
      setMessage(draftsResult.message);
      setDrafts([]);
      return;
    }

    const detailResults = await Promise.all(
      draftsResult.data.items.map((item) => fetchAuthenticatedApi<ArticleDetailDto>(`/articles/${item.id}`))
    );

    const availableDrafts = detailResults.filter((result): result is { ok: true; data: ArticleDetailDto } => result.ok).map((result) => result.data);
    setDrafts(availableDrafts);
    setMessage(null);

    const nextSelectedId = selectedArticleId && availableDrafts.some((draft) => draft.id === selectedArticleId)
      ? selectedArticleId
      : availableDrafts[0]?.id ?? null;

    if (nextSelectedId) {
      await loadArticle(nextSelectedId);
    } else {
      setSelectedArticleId(null);
      setTitle("");
      setContent("");
      setVersions([]);
      setCategoryId(categoryOptions[0]?.id ?? "");
    }
  });

  useEffect(() => {
    startTransition(() => {
      void loadDrafts();
    });

    return subscribeToAuthTokenChanges(() => {
      startTransition(() => {
        void loadDrafts();
      });
    });
  }, [loadDrafts]);

  const saveDraft = useEffectEvent(async () => {
    if (!selectedArticleId || !dirty) {
      return;
    }

    setSaving(true);
    const result = await fetchAuthenticatedApi<ArticleDetailDto>(`/articles/${selectedArticleId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        categoryId,
        content: buildContentPayload(content),
      }),
    });

    if (!result.ok) {
      setMessage(result.message);
      setSaving(false);
      return;
    }

    setDirty(false);
    setSaving(false);
    setMessage("Draft saved.");
    const versionsResult = await fetchAuthenticatedApi<ArticleVersionDto[]>(`/articles/${selectedArticleId}/versions`);
    if (versionsResult.ok) {
      setVersions(versionsResult.data);
    }
  });

  useEffect(() => {
    if (!selectedArticleId || !dirty) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void saveDraft();
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dirty, saveDraft, selectedArticleId]);

  async function handleCreateDraft() {
    if (!categoryId) {
      setMessage("Choose a category before creating a draft.");
      return;
    }

    const result = await fetchAuthenticatedApi<ArticleDetailDto>("/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Untitled draft",
        categoryId,
        content: ["Start writing here."],
        status: "DRAFT",
      }),
    });

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    await loadDrafts();
    await loadArticle(result.data.id);
  }

  async function handleRestoreVersion(versionId: string) {
    if (!selectedArticleId) {
      return;
    }

    const result = await fetchAuthenticatedApi<ArticleVersionDto[]>(`/articles/${selectedArticleId}/restore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ versionId }),
    });

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setVersions(result.data);
    await loadArticle(selectedArticleId);
    setMessage("Version restored.");
  }

  async function handlePublish() {
    if (!selectedArticleId) {
      return;
    }

    const result = await fetchAuthenticatedApi<ArticleDetailDto>(`/articles/${selectedArticleId}/publish`, {
      method: "PATCH",
    });

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage("Article published.");
    await loadDrafts();
  }

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="rounded-[2.25rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-8 shadow-[0_24px_80px_rgba(33,37,41,0.08)] sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">Draft studio</p>
              <h1 className="mt-3 text-4xl leading-[1.05] text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-5xl">
                Autosave and version history
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
                Drafts autosave every eight seconds while you type. Each successful save appears in version history and can be restored.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleCreateDraft()}
                className="cursor-pointer rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)]"
              >
                New draft
              </button>
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={saving || !dirty || !selectedArticleId}
                className="cursor-pointer rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save now"}
              </button>
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={!selectedArticleId}
                className="cursor-pointer rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Publish
              </button>
            </div>
          </div>
        </section>

        {message ? (
          <section className="rounded-[1.75rem] border border-[var(--color-line)] bg-white px-6 py-4 text-sm leading-7 text-[var(--color-foreground)]">
            {message}
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)_20rem]">
          <aside className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-5 shadow-[0_18px_60px_rgba(33,37,41,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Drafts</p>
            <div className="mt-4 space-y-3">
              {drafts.length === 0 ? (
                <p className="text-sm leading-7 text-[var(--color-muted)]">No drafts available.</p>
              ) : (
                drafts.map((draftItem) => (
                  <button
                    key={draftItem.id}
                    type="button"
                    onClick={() => {
                      void loadArticle(draftItem.id);
                    }}
                    className={`w-full rounded-[1.25rem] border px-4 py-4 text-left transition-colors duration-200 ${
                      selectedArticleId === draftItem.id
                        ? "border-[var(--color-accent)] bg-[color:color-mix(in_srgb,var(--color-accent)_10%,white)]"
                        : "border-[var(--color-line)] bg-white hover:border-[var(--color-accent)]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">{draftItem.title}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">{draftItem.category.name}</p>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_18px_60px_rgba(33,37,41,0.05)]">
            {selectedArticleId ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">Title</span>
                    <input
                      value={title}
                      onChange={(event) => {
                        setTitle(event.target.value);
                        setDirty(true);
                      }}
                      className="w-full rounded-[1.25rem] border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">Category</span>
                    <select
                      value={categoryId}
                      onChange={(event) => {
                        setCategoryId(event.target.value);
                        setDirty(true);
                      }}
                      className="w-full rounded-[1.25rem] border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] outline-none"
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">Body</span>
                  <textarea
                    value={content}
                    onChange={(event) => {
                      setContent(event.target.value);
                      setDirty(true);
                    }}
                    rows={18}
                    className="w-full resize-y rounded-[1.5rem] border border-[var(--color-line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--color-foreground)] outline-none"
                  />
                </label>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] p-6 text-sm leading-7 text-[var(--color-muted)]">
                Create a new draft or choose one from the list.
              </div>
            )}
          </section>

          <aside className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-5 shadow-[0_18px_60px_rgba(33,37,41,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Version history</p>
            <div className="mt-4 space-y-3">
              {versions.length === 0 ? (
                <p className="text-sm leading-7 text-[var(--color-muted)]">No saved versions yet.</p>
              ) : (
                versions.map((version) => (
                  <article key={version.id} className="rounded-[1.25rem] border border-[var(--color-line)] bg-white p-4">
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">{version.updatedBy.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      {formatArticleDate(version.updatedAt)}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleRestoreVersion(version.id)}
                      className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]"
                    >
                      Restore this version
                    </button>
                  </article>
                ))
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}