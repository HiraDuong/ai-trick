// Luvina
// Vu Huy Hoang - Dev2
import type { Prisma } from "@prisma/client";
import { touchArticleViewSession } from "../repositories/article-view.repository";
import {
  createArticle as createArticleRecord,
  deleteArticle as deleteArticleRecord,
  findArticleAccessById,
  findArticleDetailById,
  findArticles,
  findCategoryById,
  incrementArticleViews,
  updateArticle as updateArticleRecord,
  type ArticleDetailRecord,
  type ArticleListRecord,
  type ArticleMutationData,
} from "../repositories/article.repository";
import { createArticleVersion, createArticleVersionIfChanged } from "../repositories/version.repository";
import type { AuthenticatedUser } from "../types/auth.types";
import type {
  ArticleDetailDto,
  ArticleListQueryDto,
  ArticleListItemDto,
  ArticleListResponseDto,
  CreateArticleRequestDto,
  DeleteArticleResponseDto,
  UpdateArticleRequestDto,
} from "../types/article.types";
import { createHttpError } from "../utils/error.utils";
import { hasMeaningfulJsonContent } from "../utils/json-content.utils";
import { canManageArticle, ensureStudioAccessUser, hasStudioAccessRole } from "../utils/studio-access.utils";

type SupportedArticleStatus = "DRAFT" | "PUBLISHED";

interface ValidatedCreateArticleInput {
  title: string;
  content: Prisma.InputJsonValue;
  categoryId: string;
  status: SupportedArticleStatus;
}

interface ValidatedUpdateArticleInput {
  title?: string;
  content?: Prisma.InputJsonValue;
  categoryId?: string;
  status?: SupportedArticleStatus;
}

interface ValidatedListQuery {
  limit: number;
  skip: number;
  status: SupportedArticleStatus;
}

const VIEW_DEDUP_WINDOW_MS = 30 * 60 * 1000;

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

function readJsonValue(value: Prisma.InputJsonValue | undefined, fieldName: string): Prisma.InputJsonValue {
  if (value === undefined) {
    throw createHttpError(400, `${fieldName} is required`);
  }

  if (!hasMeaningfulJsonContent(value)) {
    throw createHttpError(400, `${fieldName} cannot be empty`);
  }

  return value;
}

function readArticleId(articleId: string): string {
  return readRequiredString(articleId, "Article id");
}

function parseStatus(value: string): SupportedArticleStatus {
  const normalizedStatus = readRequiredString(value, "Status").toUpperCase();
  if (normalizedStatus !== "DRAFT" && normalizedStatus !== "PUBLISHED") {
    throw createHttpError(400, "Status must be DRAFT or PUBLISHED");
  }

  return normalizedStatus;
}

function readStatus(value: string | undefined, fallback: SupportedArticleStatus): SupportedArticleStatus {
  return value === undefined ? fallback : parseStatus(value);
}

function ensureArticleManagerUser(user: AuthenticatedUser | undefined): asserts user is AuthenticatedUser {
  ensureStudioAccessUser(user, "Only authors or editors can manage articles");
}

function validateCreatePayload(payload: CreateArticleRequestDto | unknown): ValidatedCreateArticleInput {
  const body = readPayloadObject(payload);
  const title = readRequiredString(body.title, "Title");
  const categoryId = readRequiredString(body.categoryId, "Category id");
  const content = readJsonValue(body.content as Prisma.InputJsonValue | undefined, "Content");

  if (title.length < 3 || title.length > 200) {
    throw createHttpError(400, "Title must be between 3 and 200 characters long");
  }

  return {
    title,
    content,
    categoryId,
    status: readStatus(typeof body.status === "string" ? body.status : undefined, "DRAFT"),
  };
}

function validateUpdatePayload(payload: UpdateArticleRequestDto | unknown): ValidatedUpdateArticleInput {
  const body = readPayloadObject(payload);
  const updateData: ValidatedUpdateArticleInput = {};

  if (Object.prototype.hasOwnProperty.call(body, "title")) {
    const title = readRequiredString(body.title, "Title");
    if (title.length < 3 || title.length > 200) {
      throw createHttpError(400, "Title must be between 3 and 200 characters long");
    }
    updateData.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(body, "content")) {
    updateData.content = readJsonValue(body.content as Prisma.InputJsonValue | undefined, "Content");
  }

  if (Object.prototype.hasOwnProperty.call(body, "categoryId")) {
    updateData.categoryId = readRequiredString(body.categoryId, "Category id");
  }

  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    updateData.status = parseStatus(readRequiredString(body.status, "Status"));
  }

  if (Object.keys(updateData).length === 0) {
    throw createHttpError(400, "At least one updatable field is required");
  }

  return updateData;
}

function validateListQuery(query: ArticleListQueryDto): ValidatedListQuery {
  const limit = Number.parseInt(query.limit ?? "10", 10);
  const skip = Number.parseInt(query.skip ?? "0", 10);
  const status = readStatus(query.status, "PUBLISHED");

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw createHttpError(400, "Limit must be an integer between 1 and 50");
  }
  if (!Number.isInteger(skip) || skip < 0) {
    throw createHttpError(400, "Skip must be a non-negative integer");
  }

  return { limit, skip, status };
}

function mapArticleListItem(article: ArticleListRecord): ArticleListItemDto {
  return {
    id: article.id,
    title: article.title,
    status: article.status,
    publishedAt: article.publishedAt,
    views: article.views,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    author: article.author,
    category: article.category,
    tags: article.articleTags.map((articleTag) => articleTag.tag),
  };
}

function mapArticleDetail(article: ArticleDetailRecord): ArticleDetailDto {
  return {
    ...mapArticleListItem(article),
    content: article.content,
  };
}

function buildPublicationFields(status: SupportedArticleStatus): Pick<ArticleMutationData, "status" | "publishedAt"> {
  return status === "PUBLISHED"
    ? { status: "PUBLISHED", publishedAt: new Date() }
    : { status: "DRAFT", publishedAt: null };
}

function applyPublicationLifecycle(updateData: ValidatedUpdateArticleInput): ArticleMutationData {
  return updateData.status
    ? { ...updateData, ...buildPublicationFields(updateData.status) }
    : { ...updateData };
}

async function ensureCategoryExists(categoryId: string): Promise<void> {
  const category = await findCategoryById(categoryId);
  if (!category) {
    throw createHttpError(400, "Category does not exist");
  }
}

async function getOwnedArticleAccess(articleId: string, user: AuthenticatedUser | undefined): Promise<void> {
  ensureArticleManagerUser(user);
  const article = await findArticleAccessById(articleId);
  if (!article) {
    throw createHttpError(404, "Article not found");
  }
  if (!canManageArticle(user, article.authorId)) {
    throw createHttpError(403, "You do not have permission to manage this article");
  }
}

async function recordArticleSnapshot(articleId: string, userId: string): Promise<void> {
  const article = await findArticleDetailById(articleId);
  if (!article) {
    throw createHttpError(404, "Article not found");
  }

  await createArticleVersionIfChanged(articleId, userId, article.content);
}

function buildArticleViewKey(articleId: string, viewerSessionKey?: string): string | null {
  if (!viewerSessionKey) {
    return null;
  }

  return `${articleId}:${viewerSessionKey}`;
}

async function shouldIncrementArticleView(articleId: string, viewerSessionKey?: string): Promise<boolean> {
  const cacheKey = buildArticleViewKey(articleId, viewerSessionKey);
  if (!cacheKey) {
    return true;
  }

  return touchArticleViewSession(articleId, cacheKey, VIEW_DEDUP_WINDOW_MS);
}

export async function createArticle(
  payload: CreateArticleRequestDto | unknown,
  user: AuthenticatedUser | undefined
): Promise<ArticleDetailDto> {
  ensureArticleManagerUser(user);
  const articleData = validateCreatePayload(payload);
  await ensureCategoryExists(articleData.categoryId);

  const article = await createArticleRecord({
    title: articleData.title,
    content: articleData.content,
    categoryId: articleData.categoryId,
    authorId: user.id,
    ...buildPublicationFields(articleData.status),
  });

  await createArticleVersion(article.id, user.id, article.content);

  return mapArticleDetail(article);
}

export async function updateArticle(
  articleId: string,
  payload: UpdateArticleRequestDto | unknown,
  user: AuthenticatedUser | undefined
): Promise<ArticleDetailDto> {
  const normalizedArticleId = readArticleId(articleId);
  await getOwnedArticleAccess(normalizedArticleId, user);
  ensureArticleManagerUser(user);
  const updateData = validateUpdatePayload(payload);
  if (updateData.categoryId) {
    await ensureCategoryExists(updateData.categoryId);
  }

  const article = await updateArticleRecord(normalizedArticleId, applyPublicationLifecycle(updateData));
  await recordArticleSnapshot(normalizedArticleId, user.id);
  return mapArticleDetail(article);
}

export async function deleteArticle(
  articleId: string,
  user: AuthenticatedUser | undefined
): Promise<DeleteArticleResponseDto> {
  const normalizedArticleId = readArticleId(articleId);
  await getOwnedArticleAccess(normalizedArticleId, user);
  return deleteArticleRecord(normalizedArticleId);
}

export async function publishArticle(
  articleId: string,
  user: AuthenticatedUser | undefined
): Promise<ArticleDetailDto> {
  const normalizedArticleId = readArticleId(articleId);
  await getOwnedArticleAccess(normalizedArticleId, user);
  ensureArticleManagerUser(user);
  const article = await updateArticleRecord(normalizedArticleId, buildPublicationFields("PUBLISHED"));
  await recordArticleSnapshot(normalizedArticleId, user.id);
  return mapArticleDetail(article);
}

export async function unpublishArticle(
  articleId: string,
  user: AuthenticatedUser | undefined
): Promise<ArticleDetailDto> {
  const normalizedArticleId = readArticleId(articleId);
  await getOwnedArticleAccess(normalizedArticleId, user);
  ensureArticleManagerUser(user);
  const article = await updateArticleRecord(normalizedArticleId, buildPublicationFields("DRAFT"));
  await recordArticleSnapshot(normalizedArticleId, user.id);
  return mapArticleDetail(article);
}

export async function getArticleDetail(
  articleId: string,
  user: AuthenticatedUser | undefined,
  viewerSessionKey?: string
): Promise<ArticleDetailDto> {
  const normalizedArticleId = readArticleId(articleId);
  const article = await findArticleDetailById(normalizedArticleId);
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
  } else if (await shouldIncrementArticleView(normalizedArticleId, viewerSessionKey)) {
    await incrementArticleViews(normalizedArticleId);
  }

  return mapArticleDetail(article);
}

export async function getArticleList(
  query: ArticleListQueryDto,
  user: AuthenticatedUser | undefined
): Promise<ArticleListResponseDto> {
  const pagination = validateListQuery(query);
  let authorId: string | undefined;

  if (pagination.status === "DRAFT") {
    ensureArticleManagerUser(user);
    authorId = user.role === "AUTHOR" ? user.id : undefined;
  }

  const articleQuery = {
    status: pagination.status,
    skip: pagination.skip,
    take: pagination.limit + 1,
    ...(authorId ? { authorId } : {}),
  };

  const articles = await findArticles(articleQuery);

  const hasMore = articles.length > pagination.limit;
  const visibleArticles = hasMore ? articles.slice(0, pagination.limit) : articles;

  return {
    items: visibleArticles.map((article) => mapArticleListItem(article)),
    pagination: {
      limit: pagination.limit,
      skip: pagination.skip,
      hasMore,
      nextSkip: hasMore ? pagination.skip + pagination.limit : null,
    },
  };
}