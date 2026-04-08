"use client";

import DOMPurify from "dompurify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { fetchAuthenticatedApi } from "@/lib/auth";
import type { ArticleDetailDto, CategoryNodeDto, CurrentUserResponseDto } from "@/lib/api-types";
import { ArticleEditor } from "@/components/editor/article-editor";
import { ArticleVersionHistoryPanel } from "@/components/articles/article-version-history-panel";

interface CategoryOption {
  id: string;
  name: string;
}

interface ArticleFormProps {
  mode: "create" | "edit";
  categories: CategoryNodeDto[];
  articleId?: string;
}

interface ArticleFormValues {
  title: string;
  categoryId: string;
  content: string;
  tagsInput: string;
}

function flattenCategories(nodes: CategoryNodeDto[], trail: string[] = []): CategoryOption[] {
  return nodes.flatMap((node) => {
    const label = [...trail, node.name].join(" / ");
    return [{ id: node.id, name: label }, ...flattenCategories(node.children, [...trail, node.name])];
  });
}

function extractContentAsHtml(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  return "<p></p>";
}

export function ArticleForm({ mode, categories, articleId }: ArticleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  const form = useForm<ArticleFormValues>({
    defaultValues: {
      title: "",
      categoryId: categoryOptions[0]?.id ?? "",
      content: "<p></p>",
      tagsInput: "",
    },
  });

  useEffect(() => {
    if (mode !== "edit" || !articleId) {
      return;
    }

    let cancelled = false;
    async function loadArticle(): Promise<void> {
      const userResult = await fetchAuthenticatedApi<CurrentUserResponseDto>("/auth/me");
      if (!userResult.ok) {
        router.replace(`/login?redirectTo=${encodeURIComponent(`/articles/${articleId}/edit`)}`);
        return;
      }

      const articleResult = await fetchAuthenticatedApi<ArticleDetailDto>(`/articles/${articleId}`);
      if (!articleResult.ok) {
        setErrorMessage(articleResult.message);
        return;
      }

      if (articleResult.data.author.id !== userResult.data.user.id) {
        router.replace("/forbidden");
        return;
      }

      if (!cancelled) {
        form.reset({
          title: articleResult.data.title,
          categoryId: articleResult.data.category.id,
          content: extractContentAsHtml(articleResult.data.content),
          tagsInput: "",
        });
        setTags(articleResult.data.tags.map((tag) => tag.name));
      }
    }

    void loadArticle();
    return () => {
      cancelled = true;
    };
  }, [mode, articleId, form, router]);

  function commitTagInput(): void {
    const rawInput = form.getValues("tagsInput").trim();
    if (!rawInput) {
      return;
    }
    const nextTag = rawInput.replace(/^#/, "");
    if (nextTag && !tags.includes(nextTag)) {
      setTags((current) => [...current, nextTag]);
    }
    form.setValue("tagsInput", "");
  }

  async function submit(status: "DRAFT" | "PUBLISHED"): Promise<void> {
    setIsSubmitting(true);
    setMessage(null);
    setErrorMessage(null);

    const values = form.getValues();
    const payload = {
      title: values.title,
      categoryId: values.categoryId,
      content: values.content,
      status,
      tags,
    };

    const path = mode === "create" ? "/articles" : `/articles/${articleId}`;
    const method = mode === "create" ? "POST" : "PUT";
    const result = await fetchAuthenticatedApi<ArticleDetailDto>(path, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);
    if (!result.ok) {
      if (result.status === 401) {
        router.replace(`/login?redirectTo=${encodeURIComponent(mode === "create" ? "/articles/new" : `/articles/${articleId}/edit`)}`);
        return;
      }
      if (result.status === 403) {
        router.replace("/forbidden");
        return;
      }
      setErrorMessage(result.message);
      return;
    }

    setMessage(mode === "create" ? "Article created successfully." : "Article updated successfully.");
    router.replace(`/articles/${result.data.id}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.06)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-4xl">
              {mode === "create" ? "Create article" : "Edit article"}
            </h1>
            <Link
              href="/articles"
              className="rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)]"
            >
              Back to archive
            </Link>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-[1rem] border border-[color:color-mix(in_srgb,var(--color-danger)_28%,white)] bg-[color:color-mix(in_srgb,var(--color-danger)_8%,white)] p-3 text-sm text-[var(--color-foreground)]">
              {errorMessage}
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 rounded-[1rem] border border-[var(--color-line)] bg-white p-3 text-sm text-[var(--color-foreground)]">
              {message}
            </div>
          ) : null}

          <form className="mt-6 space-y-5" onSubmit={(event) => event.preventDefault()}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">Title</span>
              <input
                {...form.register("title", { required: true, minLength: 3 })}
                className="w-full rounded-[1.2rem] border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)]"
                placeholder="Write a concise title"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">Category</span>
              <select
                {...form.register("categoryId", { required: true })}
                className="w-full rounded-[1.2rem] border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)]"
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">Tags</span>
              <div className="rounded-[1.2rem] border border-[var(--color-line)] bg-white p-3">
                <div className="mb-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="rounded-full bg-[color:color-mix(in_srgb,var(--color-accent)_12%,white)] px-3 py-1 text-xs font-medium text-[var(--color-accent)]"
                      onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                    >
                      #{tag} ×
                    </button>
                  ))}
                </div>
                <input
                  {...form.register("tagsInput")}
                  placeholder="Type a tag and press Enter"
                  className="w-full bg-transparent text-sm text-[var(--color-foreground)] outline-none"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitTagInput();
                    }
                  }}
                  onBlur={commitTagInput}
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">Content</span>
              <Controller
                name="content"
                control={form.control}
                rules={{ required: true }}
                render={({ field }) => <ArticleEditor value={field.value} onChange={field.onChange} />}
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">Preview</span>
              <div
                className="prose prose-sm max-w-none rounded-[1.2rem] border border-[var(--color-line)] bg-white px-4 py-4"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.watch("content")) }}
              />
            </div>

            {mode === "edit" && articleId ? <ArticleVersionHistoryPanel articleId={articleId} /> : null}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => void submit("DRAFT")}
                disabled={isSubmitting}
                className="rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save draft"}
              </button>
              <button
                type="button"
                onClick={() => void submit("PUBLISHED")}
                disabled={isSubmitting}
                className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-contrast)] disabled:opacity-60"
              >
                {isSubmitting ? "Publishing..." : "Publish"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
