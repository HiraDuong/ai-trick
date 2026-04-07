// Luvina
// Vu Huy Hoang - Dev2
import {
  createComment as createCommentRecord,
  findArticleAccessById,
  findParentCommentById,
  findRepliesByParentIds,
  findTopLevelComments,
  type CommentRecord,
} from "../repositories/comment.repository";
import type { AuthenticatedUser } from "../types/auth.types";
import type {
  CommentDto,
  CommentListQueryDto,
  CommentListResponseDto,
  CreateCommentRequestDto,
} from "../types/comment.types";
import { createHttpError } from "../utils/error.utils";

interface ValidatedCreateCommentInput {
  content: string;
  parentId?: string;
}

interface ValidatedCommentListQuery {
  limit: number;
  skip: number;
}

function readPayloadObject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createHttpError(400, "Request body must be a JSON object");
  }

  return payload as Record<string, unknown>;
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw createHttpError(400, `${fieldName} must be a string`);
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    throw createHttpError(400, `${fieldName} is required`);
  }

  return trimmedValue;
}

function readArticleId(articleId: string): string {
  return readRequiredString(articleId, "Article id");
}

function ensureAuthenticatedUser(user: AuthenticatedUser | undefined): asserts user is AuthenticatedUser {
  if (!user) {
    throw createHttpError(401, "Authentication is required");
  }
}

function validateCreatePayload(payload: CreateCommentRequestDto | unknown): ValidatedCreateCommentInput {
  const body = readPayloadObject(payload);
  const content = readRequiredString(body.content, "Content");

  if (content.length > 1000) {
    throw createHttpError(400, "Content must be 1000 characters or fewer");
  }

  const parentId = Object.prototype.hasOwnProperty.call(body, "parentId")
    ? readRequiredString(body.parentId, "Parent comment id")
    : undefined;

  return {
    content,
    ...(parentId ? { parentId } : {}),
  };
}

function validateListQuery(query: CommentListQueryDto): ValidatedCommentListQuery {
  const limit = Number.parseInt(query.limit ?? "20", 10);
  const skip = Number.parseInt(query.skip ?? "0", 10);

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw createHttpError(400, "Limit must be an integer between 1 and 50");
  }
  if (!Number.isInteger(skip) || skip < 0) {
    throw createHttpError(400, "Skip must be a non-negative integer");
  }

  return { limit, skip };
}

function mapComment(comment: CommentRecord, replies: CommentDto[] = []): CommentDto {
  return {
    id: comment.id,
    content: comment.content,
    articleId: comment.articleId,
    parentId: comment.parentId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.user,
    replies,
  };
}

async function ensureArticleIsAccessible(articleId: string, user: AuthenticatedUser | undefined): Promise<void> {
  const article = await findArticleAccessById(articleId);
  if (!article) {
    throw createHttpError(404, "Article not found");
  }

  if (article.status !== "PUBLISHED") {
    if (!user) {
      throw createHttpError(404, "Article not found");
    }

    if (user.role !== "AUTHOR" || user.id !== article.authorId) {
      throw createHttpError(403, "You do not have permission to access comments for this article");
    }
  }
}

async function validateParentComment(parentId: string, articleId: string): Promise<void> {
  const parentComment = await findParentCommentById(parentId);
  if (!parentComment) {
    throw createHttpError(400, "Parent comment does not exist");
  }
  if (parentComment.articleId !== articleId) {
    throw createHttpError(400, "Parent comment must belong to the same article");
  }
  if (parentComment.parentId) {
    throw createHttpError(400, "Only one reply level is supported");
  }
}

export async function createComment(
  articleId: string,
  payload: CreateCommentRequestDto | unknown,
  user: AuthenticatedUser | undefined
): Promise<CommentDto> {
  ensureAuthenticatedUser(user);
  const normalizedArticleId = readArticleId(articleId);
  await ensureArticleIsAccessible(normalizedArticleId, user);

  const commentData = validateCreatePayload(payload);
  if (commentData.parentId) {
    await validateParentComment(commentData.parentId, normalizedArticleId);
  }

  const comment = await createCommentRecord({
    content: commentData.content,
    articleId: normalizedArticleId,
    userId: user.id,
    ...(commentData.parentId ? { parentId: commentData.parentId } : {}),
  });

  return mapComment(comment);
}

export async function getArticleComments(
  articleId: string,
  query: CommentListQueryDto,
  user: AuthenticatedUser | undefined
): Promise<CommentListResponseDto> {
  const normalizedArticleId = readArticleId(articleId);
  await ensureArticleIsAccessible(normalizedArticleId, user);

  const pagination = validateListQuery(query);
  const topLevelComments = await findTopLevelComments({
    articleId: normalizedArticleId,
    skip: pagination.skip,
    take: pagination.limit + 1,
  });

  const hasMore = topLevelComments.length > pagination.limit;
  const visibleComments = hasMore ? topLevelComments.slice(0, pagination.limit) : topLevelComments;
  const replies = await findRepliesByParentIds(
    normalizedArticleId,
    visibleComments.map((comment) => comment.id)
  );

  const repliesByParentId = new Map<string, CommentDto[]>();
  for (const reply of replies) {
    if (!reply.parentId) {
      continue;
    }

    const parentReplies = repliesByParentId.get(reply.parentId) ?? [];
    parentReplies.push(mapComment(reply));
    repliesByParentId.set(reply.parentId, parentReplies);
  }

  return {
    items: visibleComments.map((comment) => mapComment(comment, repliesByParentId.get(comment.id) ?? [])),
    pagination: {
      limit: pagination.limit,
      skip: pagination.skip,
      hasMore,
      nextSkip: hasMore ? pagination.skip + pagination.limit : null,
    },
  };
}