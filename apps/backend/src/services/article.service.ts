// Luvina
// Vu Huy Hoang - Dev2
import type { Prisma } from "@prisma/client";
import { touchArticleViewSession } from "../repositories/article-view.repository";
import {
  createArticleWithInitialVersion,
  deleteArticle as deleteArticleRecord,
  findArticleAccessById,
  findArticleDetailById,
  findArticleVersionsByArticleId,
  findArticles,
  findCategoryById,
  incrementArticleViews,
  updateArticle as updateArticleRecord,
  updateArticleWithVersionSnapshot,
  type ArticleDetailRecord,
  type ArticleListRecord,
  type ArticleMutationData,
  type ArticleVersionRecord,
} from "../repositories/article.repository";
import type { AuthenticatedUser } from "../types/auth.types";
import type {
  ArticleDetailDto,
  ArticleListItemDto,
  ArticleListQueryDto,
  ArticleListResponseDto,
  ArticleVersionItemDto,
  ArticleVersionListResponseDto,
  CreateArticleRequestDto,
  DeleteArticleResponseDto,
  UpdateArticleRequestDto,
} from "../types/article.types";
import { canManageArticle } from "../utils/studio-access.utils";
import { createHttpError } from "../utils/error.utils";
import { assertCapability, assertOwnershipOrThrow } from "./authorization.service";

type SupportedArticleStatus = "DRAFT" | "PUBLISHED";

interface ValidatedCreateArticleInput {
  title: string;
  content: Prisma.InputJsonValue;
  categoryId: string;
  status: SupportedArticleStatus;
  tags: string[];
}

interface ValidatedUpdateArticleInput {
  title?: string;
  content?: Prisma.InputJsonValue;
  categoryId?: string;
  status?: SupportedArticleStatus;
  tags?: string[];
}

interface ValidatedListQuery {
  limit: number;
  skip: number;
  status: SupportedArticleStatus;
  categoryId?: string;
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

function normalizeTags(value: unknown, fieldName: string): string[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw createHttpError(400, `${fieldName} must be an array of strings`);
  }

  const normalized = value
    .map((tag) => {
      if (typeof tag !== "string") {
        throw createHttpError(400, `${fieldName} must contain only strings`);
      }
      return tag.trim().replace(/^#/, "");
    })
    .filter(Boolean)
    .slice(0, 20);

  return Array.from(new Set(normalized));
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
    tags: normalizeTags(body.tags, "Tags"),
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
  if (Object.prototype.hasOwnProperty.call(body, "tags")) {
    updateData.tags = normalizeTags(body.tags, "Tags");
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
  const categoryId = query.categoryId ? readRequiredString(query.categoryId, "Category id") : undefined;

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw createHttpError(400, "Limit must be an integer between 1 and 50");
  }
  if (!Number.isInteger(skip) || skip < 0) {
    throw createHttpError(400, "Skip must be a non-negative integer");
  }

  return {
    limit,
    skip,
    status,
    ...(categoryId ? { categoryId } : {}),
  };
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
  return updateData.status ? { ...updateData, ...buildPublicationFields(updateData.status) } : { ...updateData };
}

async function ensureCategoryExists(categoryId: string): Promise<void> {
  const category = await findCategoryById(categoryId);
  if (!category) {
    throw createHttpError(400, "Category does not exist");
  }
}

async function getManageableArticleAccess(articleId: string, user: AuthenticatedUser | undefined): Promise<void> {
  assertCapability(user, "article:update:own", "You do not have permission to manage articles");
  const article = await findArticleAccessById(articleId);
  if (!article) {
    throw createHttpError(404, "Article not found");
  }

  if (!canManageArticle(user, article.authorId)) {
    assertOwnershipOrThrow(article.authorId, user.id);
  }
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function isJsonEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
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
  assertCapability(user, "article:create", "You do not have permission to create articles");
  const articleData = validateCreatePayload(payload);
  await ensureCategoryExists(articleData.categoryId);

  const article = await createArticleWithInitialVersion(
    {
      title: articleData.title,
      content: articleData.content,
      categoryId: articleData.categoryId,
      authorId: user.id,
      ...buildPublicationFields(articleData.status),
    },
    user.id,
    articleData.tags
  );

  return mapArticleDetail(article);
}

export async function updateArticle(
  articleId: string,
  payload: UpdateArticleRequestDto | unknown,
  user: AuthenticatedUser | undefined
): Promise<ArticleDetailDto> {
  const normalizedArticleId = readArticleId(articleId);
  await getManageableArticleAccess(normalizedArticleId, user);
  const updateData = validateUpdatePayload(payload);
  if (updateData.categoryId) {
    await ensureCategoryExists(updateData.categoryId);
  }

  const mutation = applyPublicationLifecycle(updateData);
  const shouldSnapshotContent =
    Object.prototype.hasOwnProperty.call(updateData, "content") && updateData.content !== undefined
      ? (previousContent: Prisma.JsonValue) => !isJsonEqual(previousContent, updateData.content)
      : () => false;

  const article = await updateArticleWithVersionSnapshot({
    articleId: normalizedArticleId,
    data: mutation,
    updatedById: user!.id,
    shouldSnapshotContent,
    ...(updateData.tags ? { tagNames: updateData.tags } : {}),
  });
  return mapArticleDetail(article);
}

export async function deleteArticle(
  articleId: string,
  user: AuthenticatedUser | undefined
): Promise<DeleteArticleResponseDto> {
  const normalizedArticleId = readArticleId(articleId);
  assertCapability(user, "article:delete:own", "You do not have permission to delete articles");
  await getManageableArticleAccess(normalizedArticleId, user);
  return deleteArticleRecord(normalizedArticleId);
}

export async function publishArticle(
  articleId: string,
  user: AuthenticatedUser | undefined
): Promise<ArticleDetailDto> {
  const normalizedArticleId = readArticleId(articleId);
  await getManageableArticleAccess(normalizedArticleId, user);
  const article = await updateArticleRecord(normalizedArticleId, buildPublicationFields("PUBLISHED"));
  return mapArticleDetail(article);
}

export async function unpublishArticle(
  articleId: string,
  user: AuthenticatedUser | undefined
): Promise<ArticleDetailDto> {
  const normalizedArticleId = readArticleId(articleId);
  await getManageableArticleAccess(normalizedArticleId, user);
  const article = await updateArticleRecord(normalizedArticleId, buildPublicationFields("DRAFT"));
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
    if (user.id !== article.authorId) {
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
    assertCapability(user, "article:update:own", "You do not have permission to view draft articles");
    authorId = user!.id;
  }

  const articles = await findArticles({
    status: pagination.status,
    skip: pagination.skip,
    take: pagination.limit + 1,
    ...(pagination.categoryId ? { categoryId: pagination.categoryId } : {}),
    ...(authorId ? { authorId } : {}),
  });

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

function mapArticleVersionItem(version: ArticleVersionRecord): ArticleVersionItemDto {
  return {
    id: version.id,
    articleId: version.articleId,
    createdAt: version.updatedAt,
    updatedAt: version.updatedAt,
    updatedBy: {
      id: version.updatedBy.id,
      name: version.updatedBy.name,
      role: version.updatedBy.role,
    },
    contentSnapshot: version.contentSnapshot,
  };
}

export async function getArticleVersions(
  articleId: string,
  user: AuthenticatedUser | undefined
): Promise<ArticleVersionListResponseDto> {
  const normalizedArticleId = readArticleId(articleId);
  await getManageableArticleAccess(normalizedArticleId, user);
  const versions = await findArticleVersionsByArticleId(normalizedArticleId);
  return { items: versions.map(mapArticleVersionItem) };
}