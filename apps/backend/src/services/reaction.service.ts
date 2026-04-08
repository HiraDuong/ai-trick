// Luvina
// Vu Huy Hoang - Dev2
import { ReactionType } from "@prisma/client";
import { findArticleAccessById } from "../repositories/article.repository";
import { deleteReaction, findArticleReactions, findUserReaction, upsertReaction } from "../repositories/reaction.repository";
import type { AuthenticatedUser } from "../types/auth.types";
import type { CreateReactionRequestDto, ReactionSummaryDto } from "../types/reaction.types";
import { createHttpError } from "../utils/error.utils";
import { canManageArticle, hasStudioAccessRole } from "../utils/studio-access.utils";

function readArticleId(articleId: string): string {
  const normalizedArticleId = articleId.trim();
  if (!normalizedArticleId) {
    throw createHttpError(400, "Article id is required");
  }

  return normalizedArticleId;
}

function ensureAuthenticatedUser(user: AuthenticatedUser | undefined): asserts user is AuthenticatedUser {
  if (!user) {
    throw createHttpError(401, "Authentication is required");
  }
}

function readReactionType(value: unknown): ReactionType {
  if (typeof value !== "string") {
    throw createHttpError(400, "Reaction type is required");
  }

  const normalizedType = value.trim().toUpperCase();
  if (normalizedType !== "LIKE" && normalizedType !== "LOVE" && normalizedType !== "LAUGH") {
    throw createHttpError(400, "Reaction type must be LIKE, LOVE, or LAUGH");
  }

  return normalizedType as ReactionType;
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

    if (!hasStudioAccessRole(user.role) || !canManageArticle(user, article.authorId)) {
      throw createHttpError(403, "You do not have permission to access reactions for this article");
    }
  }
}

async function buildReactionSummary(articleId: string, userId?: string): Promise<ReactionSummaryDto> {
  const reactions = await findArticleReactions(articleId);
  const counts = {
    LIKE: 0,
    LOVE: 0,
    LAUGH: 0,
  };

  for (const reaction of reactions) {
    counts[reaction.type] += 1;
  }

  const userReaction = userId ? await findUserReaction(articleId, userId) : null;

  return {
    articleId,
    likeCount: counts.LIKE,
    loveCount: counts.LOVE,
    laughCount: counts.LAUGH,
    userReaction: userReaction?.type ?? null,
  };
}

export async function getArticleReactions(articleId: string, user: AuthenticatedUser | undefined): Promise<ReactionSummaryDto> {
  const normalizedArticleId = readArticleId(articleId);
  await ensureArticleIsAccessible(normalizedArticleId, user);
  return buildReactionSummary(normalizedArticleId, user?.id);
}

export async function reactToArticle(payload: CreateReactionRequestDto | unknown, user: AuthenticatedUser | undefined): Promise<ReactionSummaryDto> {
  ensureAuthenticatedUser(user);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createHttpError(400, "Request body must be a JSON object");
  }

  const articleId = readArticleId((payload as { articleId?: string }).articleId ?? "");
  const reactionType = readReactionType((payload as { type?: string }).type);
  await ensureArticleIsAccessible(articleId, user);

  const existingReaction = await findUserReaction(articleId, user.id);
  if (existingReaction?.type === reactionType) {
    await deleteReaction(articleId, user.id);
  } else {
    await upsertReaction(articleId, user.id, reactionType);
  }

  return buildReactionSummary(articleId, user.id);
}