"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArticleVersionDto } from "@/lib/api-types";
import { fetchAuthenticatedApi } from "@/lib/auth";
import { formatArticleDate } from "@/lib/format";
import { ArticleContentRenderer } from "./article-content-renderer";

interface ArticleVersionHistoryPanelProps {
  articleId: string;
}

export function ArticleVersionHistoryPanel({ articleId }: ArticleVersionHistoryPanelProps) {
  const [versions, setVersions] = useState<ArticleVersionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVersions(): Promise<void> {
      setLoading(true);
      setErrorMessage(null);
      const result = await fetchAuthenticatedApi<{ items: ArticleVersionDto[] }>(`/articles/${articleId}/versions`);

      if (cancelled) {
        return;
      }

      setLoading(false);
      if (!result.ok) {
        setErrorMessage(result.message);
        setVersions([]);
        setSelectedVersionId(null);
        return;
      }

      setVersions(result.data.items);
      setSelectedVersionId(result.data.items[0]?.id ?? null);
    }

    void loadVersions();
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedVersionId) ?? null,
    [selectedVersionId, versions]
  );

  return (
    <section className="space-y-4 rounded-[1.2rem] border border-[var(--color-line)] bg-white p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">Version history</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Select a snapshot to view content in read-only mode.</p>
      </div>

      {loading ? <p className="text-sm text-[var(--color-muted)]">Loading versions...</p> : null}
      {errorMessage ? <p className="text-sm text-[var(--color-danger)]">{errorMessage}</p> : null}

      {!loading && !errorMessage ? (
        <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="space-y-2">
            {versions.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">No versions available yet.</p>
            ) : (
              versions.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => setSelectedVersionId(version.id)}
                  className={`w-full rounded-[0.9rem] border px-3 py-2 text-left text-sm transition-colors ${
                    selectedVersionId === version.id
                      ? "border-[var(--color-accent)] bg-[color:color-mix(in_srgb,var(--color-accent)_10%,white)]"
                      : "border-[var(--color-line)] bg-white hover:border-[var(--color-accent)]"
                  }`}
                >
                  <p className="font-semibold text-[var(--color-foreground)]">{version.updatedBy.name}</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {formatArticleDate(version.createdAt ?? version.updatedAt)}
                  </p>
                </button>
              ))
            )}
          </aside>

          <div className="rounded-[0.9rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
            {selectedVersion ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  Snapshot by {selectedVersion.updatedBy.name} on {formatArticleDate(selectedVersion.createdAt ?? selectedVersion.updatedAt)}
                </p>
                <ArticleContentRenderer content={selectedVersion.contentSnapshot} />
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">Choose a version to preview snapshot content.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
