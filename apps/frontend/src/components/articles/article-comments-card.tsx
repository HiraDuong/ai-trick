// Luvina
// Vu Huy Hoang - Dev2
"use client";

import { useEffect, useState } from "react";
import type { ApiResult } from "@/lib/api";
import type { CommentDto, CommentListResponseDto, CurrentUserResponseDto } from "@/lib/api-types";
import { fetchAuthenticatedApi, getStoredAccessToken, subscribeToAuthTokenChanges } from "@/lib/auth";
import { formatArticleDate } from "@/lib/format";

interface ArticleCommentsCardProps {
  articleId: string;
  commentsResult: ApiResult<CommentListResponseDto>;
}

function updateReplies(comment: CommentDto, nextReply: CommentDto): CommentDto {
  return {
    ...comment,
    replies: [...comment.replies, nextReply],
  };
}

function markCommentDeleted(comment: CommentDto, commentId: string, deletedAt: string): CommentDto {
  if (comment.id === commentId) {
    return {
      ...comment,
      content: "Comment removed",
      deletedAt,
    };
  }

  return {
    ...comment,
    replies: comment.replies.map((reply) => markCommentDeleted(reply, commentId, deletedAt)),
  };
}

function CommentThread({
  comment,
  currentUserId,
  onToggleReply,
  onSubmitReply,
  onDelete,
  replyTargetId,
  replyDraft,
  setReplyDraft,
  submitting,
}: {
  comment: CommentDto;
  currentUserId: string | null;
  onToggleReply: (parentId: string) => void;
  onSubmitReply: (parentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  replyTargetId: string | null;
  replyDraft: string;
  setReplyDraft: (value: string) => void;
  submitting: boolean;
}) {
  const canDelete = currentUserId === comment.author.id && !comment.deletedAt;
  const showReplyBox = replyTargetId === comment.id;

  return (
    <article className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-background)]/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          <span>{comment.author.name}</span>
          <span>{formatArticleDate(comment.createdAt)}</span>
          {comment.deletedAt ? <span>Deleted</span> : null}
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
          {!comment.deletedAt && !comment.parentId ? (
            <button
              type="button"
              onClick={() => onToggleReply(comment.id)}
              className="cursor-pointer rounded-full border border-[var(--color-line)] px-3 py-2 text-[var(--color-muted)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Reply
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={() => void onDelete(comment.id)}
              className="cursor-pointer rounded-full border border-[color:color-mix(in_srgb,var(--color-danger)_22%,white)] px-3 py-2 text-[var(--color-danger)] transition-colors duration-200 hover:bg-[color:color-mix(in_srgb,var(--color-danger)_8%,white)]"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
      <p className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${comment.deletedAt ? "italic text-[var(--color-muted)]" : "text-[var(--color-foreground)]"}`}>
        {comment.content}
      </p>

      {showReplyBox ? (
        <div className="mt-4 rounded-[1.25rem] border border-[var(--color-line)] bg-white p-3">
          <textarea
            value={replyDraft}
            onChange={(event) => setReplyDraft(event.target.value)}
            rows={3}
            placeholder="Add a reply"
            className="w-full resize-y rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-foreground)] outline-none"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={submitting || !replyDraft.trim()}
              onClick={() => void onSubmitReply(comment.id)}
              className="cursor-pointer rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reply
            </button>
          </div>
        </div>
      ) : null}

      {comment.replies.length > 0 ? (
        <div className="mt-4 space-y-3 pl-3 sm:pl-6">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onToggleReply={onToggleReply}
              onSubmitReply={onSubmitReply}
              onDelete={onDelete}
              replyTargetId={replyTargetId}
              replyDraft={replyDraft}
              setReplyDraft={setReplyDraft}
              submitting={submitting}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function ArticleCommentsCard({ articleId, commentsResult }: ArticleCommentsCardProps) {
  const [comments, setComments] = useState<CommentDto[]>(commentsResult.ok ? commentsResult.data.items : []);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [message, setMessage] = useState<string | null>(commentsResult.ok ? null : commentsResult.message);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setComments(commentsResult.ok ? commentsResult.data.items : []);
    setMessage(commentsResult.ok ? null : commentsResult.message);
  }, [commentsResult]);

  useEffect(() => {
    async function syncCurrentUser() {
      if (!getStoredAccessToken()) {
        setCurrentUserId(null);
        return;
      }

      const result = await fetchAuthenticatedApi<CurrentUserResponseDto>("/auth/me");
      if (result.ok) {
        setCurrentUserId(result.data.user.id);
      } else {
        setCurrentUserId(null);
      }
    }

    void syncCurrentUser();
    return subscribeToAuthTokenChanges(() => {
      void syncCurrentUser();
    });
  }, []);

  async function createComment(parentId?: string) {
    const content = parentId ? replyDraft.trim() : draft.trim();
    if (!content) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const result = await fetchAuthenticatedApi<CommentDto>(`/articles/${articleId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parentId ? { content, parentId } : { content }),
    });

    if (!result.ok) {
      setMessage(result.message);
      setSubmitting(false);
      return;
    }

    if (parentId) {
      setComments((currentComments) =>
        currentComments.map((comment) => (comment.id === parentId ? updateReplies(comment, result.data) : comment))
      );
      setReplyDraft("");
      setReplyTargetId(null);
    } else {
      setComments((currentComments) => [...currentComments, result.data]);
      setDraft("");
    }

    setSubmitting(false);
  }

  async function handleDelete(commentId: string) {
    setSubmitting(true);
    setMessage(null);

    const result = await fetchAuthenticatedApi<{ id: string; deletedAt: string }>(`/comments/${commentId}`, {
      method: "DELETE",
    });

    if (!result.ok) {
      setMessage(result.message);
      setSubmitting(false);
      return;
    }

    setComments((currentComments) =>
      currentComments.map((comment) => markCommentDeleted(comment, result.data.id, result.data.deletedAt))
    );
    setSubmitting(false);
  }

  function handleToggleReply(parentId: string) {
    setReplyTargetId((currentReplyTargetId) => {
      const nextReplyTargetId = currentReplyTargetId === parentId ? null : parentId;
      if (nextReplyTargetId === null) {
        setReplyDraft("");
      }

      return nextReplyTargetId;
    });
  }

  return (
    <article className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-6 shadow-[0_20px_60px_rgba(33,37,41,0.07)] sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">Comments</p>
      <h2 className="mt-3 text-3xl leading-tight text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-4xl">
        Discussion on this article
      </h2>

      <div className="mt-6 rounded-[1.5rem] border border-[var(--color-line)] bg-white p-4">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          placeholder="Add a comment"
          className="w-full resize-y rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-foreground)] outline-none"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-muted)]">Reply support is limited to one nested level.</p>
          <button
            type="button"
            disabled={submitting || !draft.trim()}
            onClick={() => void createComment()}
            className="cursor-pointer rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Post comment
          </button>
        </div>
      </div>

      {message ? <p className="mt-4 text-sm text-[var(--color-danger)]">{message}</p> : null}

      {comments.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--color-line)] bg-[var(--color-background)]/70 p-5 text-sm leading-7 text-[var(--color-muted)]">
          No comments yet. Log in to start the discussion.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onToggleReply={handleToggleReply}
              onSubmitReply={createComment}
              onDelete={handleDelete}
              replyTargetId={replyTargetId}
              replyDraft={replyDraft}
              setReplyDraft={setReplyDraft}
              submitting={submitting}
            />
          ))}
        </div>
      )}

    </article>
  );
}