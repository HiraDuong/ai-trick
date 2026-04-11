"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchAuthenticatedApi } from "@/lib/auth";

interface ArticleDeleteButtonProps {
  articleId: string;
}

interface DeleteArticleResponseDto {
  id: string;
  title: string;
}

export function ArticleDeleteButton({ articleId }: ArticleDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete(): Promise<void> {
    const confirmed = window.confirm("Delete this article permanently?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    const result = await fetchAuthenticatedApi<DeleteArticleResponseDto>(`/articles/${articleId}`, {
      method: "DELETE",
    });

    setIsDeleting(false);

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

    router.replace("/articles");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={isDeleting}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--color-danger)_35%,white)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-danger)] transition-colors duration-200 hover:bg-[color:color-mix(in_srgb,var(--color-danger)_10%,white)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Delete article"}
      </button>
      {errorMessage ? <p className="text-xs text-[var(--color-danger)]">{errorMessage}</p> : null}
    </div>
  );
}
