// Luvina
// Vu Huy Hoang - Dev2
import { HelpfulnessValue } from "@prisma/client";
import {
  countHelpfulnessRatings,
  findArticleAccessById,
  findUserHelpfulnessRating,
  upsertHelpfulnessRating,
} from "../repositories/helpfulness.repository";
import type { AuthenticatedUser } from "../types/auth.types";
import type {
  HelpfulnessSummaryDto,
  RateArticleHelpfulnessRequestDto,
} from "../types/helpfulness.types";
import { createHttpError } from "../utils/error.utils";
import { canManageArticle, hasStudioAccessRole } from "../utils/studio-access.utils";

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

function parseHelpfulnessValue(value: string): HelpfulnessValue {
  const normalizedValue = readRequiredString(value, "Value").toUpperCase();
  if (normalizedValue !== HelpfulnessValue.HELPFUL && normalizedValue !== HelpfulnessValue.NOT_HELPFUL) {
    throw createHttpError(400, "Value must be HELPFUL or NOT_HELPFUL");
  }

  return normalizedValue;
}

function validateRatePayload(payload: RateArticleHelpfulnessRequestDto | unknown): HelpfulnessValue {
  const body = readPayloadObject(payload);
  return parseHelpfulnessValue(readRequiredString(body.value, "Value"));
}

async function ensureArticleIsAccessible(articleId: string, user: AuthenticatedUser): Promise<void> {
  const article = await findArticleAccessById(articleId);
  if (!article) {
    throw createHttpError(404, "Article not found");
  }

  if (article.status !== "PUBLISHED") {
    if (!hasStudioAccessRole(user.role) || !canManageArticle(user, article.authorId)) {
      throw createHttpError(403, "You do not have permission to access this article");
    }
  }
}

async function ensureArticleIsAccessibleForRead(articleId: string, user: AuthenticatedUser | undefined): Promise<void> {
  const article = await findArticleAccessById(articleId);
  if (!article) {
    throw createHttpError(404, "Article not found");
  }

  if (article.status !== "PUBLISHED") {
    if (!user) {
      throw createHttpError(404, "Article not found");
    }

    if (!hasStudioAccessRole(user.role) || !canManageArticle(user, article.authorId)) {
      throw createHttpError(403, "You do not have permission to access this article");
    }
  }
}

async function buildHelpfulnessSummary(articleId: string, userId?: string): Promise<HelpfulnessSummaryDto> {
  const [counts, userRating] = await Promise.all([
    countHelpfulnessRatings(articleId),
    userId ? findUserHelpfulnessRating(articleId, userId) : Promise.resolve(null),
  ]);

  let helpfulCount = 0;
  let notHelpfulCount = 0;

  for (const count of counts) {
    if (count.value === HelpfulnessValue.HELPFUL) {
      helpfulCount = count.count;
      continue;
    }

    if (count.value === HelpfulnessValue.NOT_HELPFUL) {
      notHelpfulCount = count.count;
    }
  }

  return {
    articleId,
    helpfulCount,
    notHelpfulCount,
    userVote: userRating?.value ?? null,
  };
}

export async function getArticleHelpfulness(
  articleId: string,
  user: AuthenticatedUser | undefined
): Promise<HelpfulnessSummaryDto> {
  const normalizedArticleId = readArticleId(articleId);
  await ensureArticleIsAccessibleForRead(normalizedArticleId, user);
  return buildHelpfulnessSummary(normalizedArticleId, user?.id);
}

export async function rateArticleHelpfulness(
  articleId: string,
  payload: RateArticleHelpfulnessRequestDto | unknown,
  user: AuthenticatedUser | undefined
): Promise<HelpfulnessSummaryDto> {
  ensureAuthenticatedUser(user);
  const normalizedArticleId = readArticleId(articleId);
  await ensureArticleIsAccessible(normalizedArticleId, user);

  const value = validateRatePayload(payload);
  await upsertHelpfulnessRating({
    articleId: normalizedArticleId,
    userId: user.id,
    value,
  });

  return buildHelpfulnessSummary(normalizedArticleId, user.id);
}