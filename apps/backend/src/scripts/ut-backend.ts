// Luvina
// Vu Huy Hoang - Dev2
import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcrypt";
import type { Server } from "node:http";
import { HelpfulnessValue, NotificationType, ReactionType, UserRole } from "@prisma/client";
import app from "../app";
import prisma from "../config/prisma";

interface SeedUsers {
  authorOwner: { id: string; email: string; password: string };
  authorPeer: { id: string; email: string; password: string };
  viewer: { id: string; email: string; password: string };
}

interface SeedCategories {
  rootId: string;
  childId: string;
}

interface SeedContext {
  users: SeedUsers;
  categories: SeedCategories;
}

interface ApiCallResult {
  status: number;
  rawBody: string;
  parsedBody: unknown;
}

interface CsvRow {
  case_id: string;
  description: string;
  preconditions: string;
  test_data: string;
  steps: string;
  api_response: string;
  expected_result: string;
  compare: string;
  db_verification: string;
  status: "PASS" | "FAIL";
  notes: string;
}

interface ModuleCoverageRow {
  moduleName: string;
  displayName: string;
  count: number;
  caseIds: string[];
}

interface TestcaseCatalogRow {
  caseId: string;
  moduleName: string;
  displayName: string;
  type: string;
  description: string;
}

const REPORT_PATH = path.resolve(__dirname, "../../reports/ut-backend-report.csv");
const SUMMARY_PATH = path.resolve(__dirname, "../../reports/ut-backend-regression-summary.md");
const TESTCASE_XML_PATH = path.resolve(__dirname, "../../../../prompt/TC/ikp-tc-ut.xml");

async function startServer(): Promise<{ server: Server; baseUrl: string }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to resolve test server address"));
        return;
      }

      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}/api` });
    });

    server.on("error", reject);
  });
}

async function stopServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "Notification",
      "Reaction",
      "Bookmark",
      "HelpfulnessRating",
      "Comment",
      "ArticleVersion",
      "ArticleTag",
      "Tag",
      "Article",
      "Category",
      "User"
    RESTART IDENTITY CASCADE
  `);
}

async function seedBaseData(): Promise<SeedContext> {
  const password = "Passw0rd!";
  const passwordHash = await bcrypt.hash(password, 10);

  const users: SeedUsers = {
    authorOwner: { id: "ut_author_owner", email: "author.owner@example.com", password },
    authorPeer: { id: "ut_author_peer", email: "author.peer@example.com", password },
    viewer: { id: "ut_viewer", email: "viewer@example.com", password },
  };

  await prisma.user.createMany({
    data: [
      {
        id: users.authorOwner.id,
        name: "Author Owner",
        email: users.authorOwner.email,
        passwordHash,
        role: UserRole.AUTHOR,
      },
      {
        id: users.authorPeer.id,
        name: "Author Peer",
        email: users.authorPeer.email,
        passwordHash,
        role: UserRole.AUTHOR,
      },
      {
        id: users.viewer.id,
        name: "Viewer User",
        email: users.viewer.email,
        passwordHash,
        role: UserRole.VIEWER,
      },
    ],
  });

  const categories: SeedCategories = {
    rootId: "ut_category_root",
    childId: "ut_category_child",
  };

  await prisma.category.create({
    data: {
      id: categories.rootId,
      name: "Engineering",
      description: "Root category for unit tests",
      children: {
        create: {
          id: categories.childId,
          name: "Knowledge Base",
          description: "Child category for unit tests",
        },
      },
    },
  });

  return { users, categories };
}

async function createArticleRecord(params: {
  id: string;
  title: string;
  content: unknown;
  status: "DRAFT" | "PUBLISHED";
  authorId: string;
  categoryId: string;
  views?: number;
  publishedAt?: Date | null;
}): Promise<void> {
  await prisma.article.create({
    data: {
      id: params.id,
      title: params.title,
      content: params.content as never,
      status: params.status,
      publishedAt: params.status === "PUBLISHED" ? (params.publishedAt ?? new Date("2026-04-08T10:00:00.000Z")) : null,
      authorId: params.authorId,
      categoryId: params.categoryId,
      views: params.views ?? 0,
    },
  });
}

async function createVersion(articleId: string, updatedById: string, snapshot: unknown, id: string): Promise<void> {
  await prisma.articleVersion.create({
    data: {
      id,
      articleId,
      updatedById,
      contentSnapshot: snapshot as never,
    },
  });
}

async function createCommentFixture(params: {
  id: string;
  content: string;
  articleId: string;
  userId: string;
  parentId?: string;
  deletedAt?: Date;
}): Promise<void> {
  await prisma.comment.create({
    data: {
      id: params.id,
      content: params.content,
      articleId: params.articleId,
      userId: params.userId,
      ...(params.parentId ? { parentId: params.parentId } : {}),
      ...(params.deletedAt ? { deletedAt: params.deletedAt } : {}),
    },
  });
}

async function createNotificationFixture(params: {
  id: string;
  userId: string;
  type: NotificationType;
  entityId: string;
  isRead?: boolean;
}): Promise<void> {
  await prisma.notification.create({
    data: {
      id: params.id,
      userId: params.userId,
      type: params.type,
      entityId: params.entityId,
      isRead: params.isRead ?? false,
    },
  });
}

async function createHelpfulnessFixture(params: {
  articleId: string;
  userId: string;
  value: HelpfulnessValue;
}): Promise<void> {
  await prisma.helpfulnessRating.create({
    data: {
      articleId: params.articleId,
      userId: params.userId,
      value: params.value,
    },
  });
}

async function createReactionFixture(params: {
  articleId: string;
  userId: string;
  type: ReactionType;
}): Promise<void> {
  await prisma.reaction.create({
    data: {
      articleId: params.articleId,
      userId: params.userId,
      type: params.type,
    },
  });
}

async function createBookmarkFixture(userId: string, articleId: string): Promise<void> {
  await prisma.bookmark.create({
    data: {
      userId,
      articleId,
    },
  });
}

async function createTagFixture(tagId: string, name: string): Promise<void> {
  await prisma.tag.create({
    data: {
      id: tagId,
      name,
    },
  });
}

async function attachTagToArticle(articleId: string, tagId: string): Promise<void> {
  await prisma.articleTag.create({
    data: {
      articleId,
      tagId,
    },
  });
}

async function login(baseUrl: string, email: string, password: string): Promise<string> {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json()) as { data?: { accessToken?: string } };
  const accessToken = payload.data?.accessToken;
  if (!response.ok || !accessToken) {
    throw new Error(`Login failed for ${email}`);
  }

  return accessToken;
}

async function apiCall(baseUrl: string, pathName: string, init?: RequestInit & { token?: string }): Promise<ApiCallResult> {
  const headers = new Headers(init?.headers);
  if (init?.token) {
    headers.set("Authorization", `Bearer ${init.token}`);
  }

  const response = await fetch(`${baseUrl}${pathName}`, {
    ...init,
    headers,
  });

  const rawBody = await response.text();
  let parsedBody: unknown = null;

  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    parsedBody = rawBody;
  }

  return {
    status: response.status,
    rawBody,
    parsedBody,
  };
}

function stringify(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function escapeCsv(value: string): string {
  const normalized = value.replace(/\r?\n/g, " ");
  if (/[",]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

function buildCompare(pass: boolean, detail: string): string {
  return `${pass ? "MATCH" : "MISMATCH"}: ${detail}`;
}

async function runCaseBe01(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const payload = {
    title: "Task 25 draft article",
    categoryId: seed.categories.childId,
    content: ["Paragraph one", "Paragraph two"],
    status: "DRAFT",
  };

  const beforeArticleCount = await prisma.article.count();
  const beforeVersionCount = await prisma.articleVersion.count();

  const response = await apiCall(baseUrl, "/articles", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const createdArticle = await prisma.article.findFirst({ where: { title: payload.title } });
  const versionCount = createdArticle
    ? await prisma.articleVersion.count({ where: { articleId: createdArticle.id } })
    : 0;
  const afterArticleCount = await prisma.article.count();
  const afterVersionCount = await prisma.articleVersion.count();
  const pass =
    response.status === 201 &&
    Boolean(createdArticle) &&
    versionCount === 1 &&
    beforeArticleCount === 0 &&
    afterArticleCount === 1 &&
    beforeVersionCount === 0 &&
    afterVersionCount === 1;

  return {
    case_id: "BE-01",
    description: "Create a new draft article",
    preconditions: "Authenticated author exists; category ut_category_child exists.",
    test_data: stringify(payload),
    steps: "POST /api/articles with author.owner@example.com bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "201 Created and one draft article persisted with one initial version snapshot.",
    compare: buildCompare(pass, `status=${response.status}, beforeArticleCount=${beforeArticleCount}, afterArticleCount=${afterArticleCount}, beforeVersionCount=${beforeVersionCount}, afterVersionCount=${afterVersionCount}, articlePersisted=${Boolean(createdArticle)}, versionCount=${versionCount}`),
    db_verification: `beforeArticleCount=${beforeArticleCount}; afterArticleCount=${afterArticleCount}; beforeVersionCount=${beforeVersionCount}; afterVersionCount=${afterVersionCount}; articleId=${createdArticle?.id ?? "null"}; status=${createdArticle?.status ?? "null"}; versionCount=${versionCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Creation flow matches the requirement with before/after article and version persistence verified." : "Unexpected create behavior or persistence delta.",
  };
}

async function runCaseBe02(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const payload = {
    categoryId: seed.categories.childId,
    status: "DRAFT",
  };

  const response = await apiCall(baseUrl, "/articles", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const articleCount = await prisma.article.count();
  const pass = response.status === 400 && articleCount === 0;

  return {
    case_id: "BE-02",
    description: "Create article with missing required fields",
    preconditions: "Authenticated author exists.",
    test_data: stringify(payload),
    steps: "POST /api/articles without title and content.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "400 Bad Request and no article created.",
    compare: buildCompare(pass, `status=${response.status}, articleCount=${articleCount}`),
    db_verification: `articleCount=${articleCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Required field validation fired." : "Validation did not match expectation.",
  };
}

async function runCaseBe03(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);
  const maxTitle = "T".repeat(200);

  const payload = {
    title: maxTitle,
    categoryId: seed.categories.childId,
    content: ["Boundary title article body"],
    status: "DRAFT",
  };

  const response = await apiCall(baseUrl, "/articles", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const createdArticle = await prisma.article.findFirst({ where: { title: maxTitle } });
  const pass = response.status === 201 && Boolean(createdArticle);

  return {
    case_id: "BE-03",
    description: "Create article with maximum allowed title length",
    preconditions: "Authenticated author exists.",
    test_data: stringify({ ...payload, titleLength: maxTitle.length }),
    steps: "POST /api/articles with a 200-character title.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "Success when title length is within the 200-character limit.",
    compare: buildCompare(pass, `status=${response.status}, created=${Boolean(createdArticle)}`),
    db_verification: `articleId=${createdArticle?.id ?? "null"}; titleLength=${createdArticle?.title.length ?? 0}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Boundary title length is accepted." : "Boundary title handling failed.",
  };
}

async function runCaseBe04(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const payload = {
    title: 12345,
    categoryId: seed.categories.childId,
    content: 42,
    status: "DRAFT",
  };

  const response = await apiCall(baseUrl, "/articles", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const articleCount = await prisma.article.count();
  const pass = response.status === 400 && articleCount === 0;

  return {
    case_id: "BE-04",
    description: "Create article with invalid data types",
    preconditions: "Authenticated author exists.",
    test_data: stringify(payload),
    steps: "POST /api/articles with title as number and content as number.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "400 validation error and no article created.",
    compare: buildCompare(pass, `status=${response.status}, articleCount=${articleCount}`),
    db_verification: `articleCount=${articleCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Type validation blocks invalid payloads." : "Invalid payload unexpectedly persisted.",
  };
}

async function runCaseBe05(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_draft_autosave",
    title: "Autosave draft",
    content: ["Original body"],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createVersion("ut_draft_autosave", seed.users.authorOwner.id, ["Original body"], "ut_version_initial");
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const payload = {
    title: "Autosave draft updated",
    content: ["Updated body paragraph"],
  };

  const beforeArticle = await prisma.article.findUnique({ where: { id: "ut_draft_autosave" } });
  const beforeVersionCount = await prisma.articleVersion.count({ where: { articleId: "ut_draft_autosave" } });

  const response = await apiCall(baseUrl, "/articles/ut_draft_autosave", {
    method: "PATCH",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const article = await prisma.article.findUnique({ where: { id: "ut_draft_autosave" } });
  const versionCount = await prisma.articleVersion.count({ where: { articleId: "ut_draft_autosave" } });
  const pass =
    response.status === 200 &&
    beforeArticle?.title === "Autosave draft" &&
    article?.title === payload.title &&
    beforeVersionCount === 1 &&
    versionCount === 2;

  return {
    case_id: "BE-05",
    description: "Update draft article with autosave",
    preconditions: "Draft article ut_draft_autosave exists with one saved version.",
    test_data: stringify(payload),
    steps: "PATCH /api/articles/ut_draft_autosave with changed title and content.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "Draft content updated and one additional version snapshot created.",
    compare: buildCompare(pass, `status=${response.status}, beforeTitle=${beforeArticle?.title ?? "null"}, afterTitle=${article?.title ?? "null"}, beforeVersionCount=${beforeVersionCount}, afterVersionCount=${versionCount}`),
    db_verification: `beforeTitle=${beforeArticle?.title ?? "null"}; afterTitle=${article?.title ?? "null"}; beforeContent=${JSON.stringify(beforeArticle?.content ?? null)}; afterContent=${JSON.stringify(article?.content ?? null)}; beforeVersionCount=${beforeVersionCount}; afterVersionCount=${versionCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Changed autosave input produced the expected before/after article delta and a new version snapshot." : "Update or version persistence diverged.",
  };
}

async function runCaseBe06(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  const initialContent = ["Same content body"];
  await createArticleRecord({
    id: "ut_draft_same_content",
    title: "Same content draft",
    content: initialContent,
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createVersion("ut_draft_same_content", seed.users.authorOwner.id, initialContent, "ut_version_same_1");
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const payload = {
    title: "Same content draft",
    categoryId: seed.categories.childId,
    content: initialContent,
  };

  const response = await apiCall(baseUrl, "/articles/ut_draft_same_content", {
    method: "PATCH",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const versionCount = await prisma.articleVersion.count({ where: { articleId: "ut_draft_same_content" } });
  const pass = response.status === 200 && versionCount === 1;

  return {
    case_id: "BE-06",
    description: "Update article with identical content",
    preconditions: "Draft article ut_draft_same_content exists with one version snapshot.",
    test_data: stringify(payload),
    steps: "PATCH /api/articles/ut_draft_same_content with unchanged title, category, and content.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "No new version should be created when content is identical.",
    compare: buildCompare(pass, `status=${response.status}, actualVersionCount=${versionCount}, expectedVersionCount=1`),
    db_verification: `versionCount=${versionCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Identical update avoided duplicate versioning." : "Implementation still records an extra snapshot for identical content.",
  };
}

async function runCaseBe07(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_draft_empty_content",
    title: "Empty content draft",
    content: ["Original draft body"],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createVersion("ut_draft_empty_content", seed.users.authorOwner.id, ["Original draft body"], "ut_version_empty_1");
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const payload = {
    content: [],
  };

  const response = await apiCall(baseUrl, "/articles/ut_draft_empty_content", {
    method: "PATCH",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const article = await prisma.article.findUnique({ where: { id: "ut_draft_empty_content" } });
  const versionCount = await prisma.articleVersion.count({ where: { articleId: "ut_draft_empty_content" } });
  const pass = response.status === 400;

  return {
    case_id: "BE-07",
    description: "Update article with empty content",
    preconditions: "Draft article ut_draft_empty_content exists.",
    test_data: stringify(payload),
    steps: "PATCH /api/articles/ut_draft_empty_content with empty content array.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "Validation error for empty content.",
    compare: buildCompare(pass, `status=${response.status}, storedContent=${JSON.stringify(article?.content ?? null)}, versionCount=${versionCount}`),
    db_verification: `storedContent=${JSON.stringify(article?.content ?? null)}; versionCount=${versionCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Empty content was rejected." : "Current implementation accepts an empty JSON payload for content.",
  };
}

async function runCaseBe08(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await prisma.notification.createMany({
    data: Array.from({ length: 25 }, (_, index) => ({
      id: `ut_notification_${index + 1}`,
      userId: seed.users.authorOwner.id,
      type: index % 2 === 0 ? NotificationType.ARTICLE_COMMENT : NotificationType.COMMENT_REPLY,
      entityId: `ut_article_${index + 1}`,
      isRead: false,
      createdAt: new Date(Date.UTC(2026, 3, 8, 12, 0, index)),
    })),
  });
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const response = await apiCall(baseUrl, "/notifications", {
    method: "GET",
    token,
  });

  const parsed = response.parsedBody as { data?: Array<unknown> } | null;
  const returnedCount = parsed?.data?.length ?? 0;
  const dbCount = await prisma.notification.count({ where: { userId: seed.users.authorOwner.id } });
  const pass = response.status === 200 && returnedCount === 20;

  return {
    case_id: "BE-08",
    description: "Retrieve notifications with limit",
    preconditions: "User author.owner@example.com has 25 unread notifications.",
    test_data: stringify({ userId: seed.users.authorOwner.id, notificationCount: 25 }),
    steps: "GET /api/notifications with author.owner@example.com bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "Only the latest 20 notifications should be returned.",
    compare: buildCompare(pass, `status=${response.status}, returnedCount=${returnedCount}, expectedCount=20`),
    db_verification: `dbNotificationCount=${dbCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Notification list is capped." : "Current implementation returns all notifications without a latest-20 limit.",
  };
}

async function runCaseBe09(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);
  const response = await apiCall(baseUrl, "/notifications", {
    method: "GET",
    token,
  });

  const parsed = response.parsedBody as { data?: Array<unknown> } | null;
  const returnedCount = parsed?.data?.length ?? 0;
  const pass = response.status === 200 && returnedCount === 0;

  return {
    case_id: "BE-09",
    description: "Retrieve notifications when none exist",
    preconditions: "Authenticated author exists with zero notifications.",
    test_data: stringify({ userId: seed.users.authorOwner.id, notificationCount: 0 }),
    steps: "GET /api/notifications with author.owner@example.com bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "Empty array returned.",
    compare: buildCompare(pass, `status=${response.status}, returnedCount=${returnedCount}`),
    db_verification: `dbNotificationCount=0` ,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Empty-state notification response is correct." : "Unexpected notification payload for empty state.",
  };
}

async function runCaseBe10(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_published_view_article",
    title: "Published view article",
    content: ["Public body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
    views: 0,
  });

  const firstResponse = await apiCall(baseUrl, "/articles/ut_published_view_article", {
    method: "GET",
    headers: { Cookie: "ut_session=session-1" },
  });
  const secondResponse = await apiCall(baseUrl, "/articles/ut_published_view_article", {
    method: "GET",
    headers: { Cookie: "ut_session=session-1" },
  });

  const article = await prisma.article.findUnique({ where: { id: "ut_published_view_article" } });
  const pass = firstResponse.status === 200 && secondResponse.status === 200 && article?.views === 1;

  return {
    case_id: "BE-10",
    description: "Increment view count with session deduplication",
    preconditions: "Published article ut_published_view_article exists.",
    test_data: stringify({ articleId: "ut_published_view_article", cookie: "ut_session=session-1", requestCount: 2 }),
    steps: "GET /api/articles/ut_published_view_article twice with the same cookie header.",
    api_response: `first=HTTP ${firstResponse.status} ${firstResponse.rawBody}; second=HTTP ${secondResponse.status} ${secondResponse.rawBody}`,
    expected_result: "View count increments only once for repeated reads in the same session.",
    compare: buildCompare(pass, `firstStatus=${firstResponse.status}, secondStatus=${secondResponse.status}, storedViews=${article?.views ?? "null"}, expectedViews=1`),
    db_verification: `views=${article?.views ?? "null"}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "View counting is deduplicated per session." : "Current implementation increments views on every published detail fetch.",
  };
}

async function runCaseBe11(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  await seedBaseData();
  const response = await apiCall(baseUrl, "/notifications", {
    method: "GET",
  });
  const pass = response.status === 401;

  return {
    case_id: "BE-11",
    description: "Access auth-required endpoint without authentication",
    preconditions: "Notifications endpoint requires bearer authentication.",
    test_data: stringify({ token: null, endpoint: "/api/notifications" }),
    steps: "GET /api/notifications without Authorization header.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "401 Unauthorized.",
    compare: buildCompare(pass, `status=${response.status}`),
    db_verification: "No database mutation expected.",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Auth middleware rejects anonymous access." : "Endpoint allowed unauthenticated access.",
  };
}

async function runCaseBe12(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_comment_article",
    title: "Comment article",
    content: ["Comment target"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await prisma.comment.create({
    data: {
      id: "ut_comment_owned",
      content: "Owner comment",
      articleId: "ut_comment_article",
      userId: seed.users.authorOwner.id,
    },
  });
  const token = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);
  const response = await apiCall(baseUrl, "/comments/ut_comment_owned", {
    method: "DELETE",
    token,
  });

  const comment = await prisma.comment.findUnique({ where: { id: "ut_comment_owned" } });
  const pass = response.status === 403 && comment?.deletedAt === null;

  return {
    case_id: "BE-12",
    description: "Delete comment by non-owner",
    preconditions: "Published article and owner comment exist; acting user is not the owner.",
    test_data: stringify({ commentId: "ut_comment_owned", actingUser: seed.users.authorPeer.email }),
    steps: "DELETE /api/comments/ut_comment_owned with author.peer@example.com bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "403 Forbidden and comment remains undeleted.",
    compare: buildCompare(pass, `status=${response.status}, deletedAt=${comment?.deletedAt ?? "null"}`),
    db_verification: `deletedAt=${comment?.deletedAt ?? "null"}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Ownership protection is enforced." : "Non-owner delete unexpectedly changed the record.",
  };
}

async function runCaseBe13(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_comment_empty_article",
    title: "Empty comment article",
    content: ["Comment target"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);
  const payload = { content: "   " };
  const response = await apiCall(baseUrl, "/articles/ut_comment_empty_article/comments", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const commentCount = await prisma.comment.count({ where: { articleId: "ut_comment_empty_article" } });
  const pass = response.status === 400 && commentCount === 0;

  return {
    case_id: "BE-13",
    description: "Create comment with empty content",
    preconditions: "Published article exists and acting user is authenticated.",
    test_data: stringify(payload),
    steps: "POST /api/articles/ut_comment_empty_article/comments with whitespace-only content.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "400 validation error and no comment created.",
    compare: buildCompare(pass, `status=${response.status}, commentCount=${commentCount}`),
    db_verification: `commentCount=${commentCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Whitespace-only comments are rejected." : "Empty comment validation failed.",
  };
}

async function runCaseBe14(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_reaction_article",
    title: "Reaction article",
    content: ["Reaction target"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);
  const payload = {
    articleId: "ut_reaction_article",
    type: "LIKE",
  };

  const beforeReactionCount = await prisma.reaction.count({
    where: {
      articleId: payload.articleId,
      userId: seed.users.authorPeer.id,
    },
  });

  const response = await apiCall(baseUrl, "/reactions", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const reaction = await prisma.reaction.findUnique({
    where: {
      articleId_userId: {
        articleId: "ut_reaction_article",
        userId: seed.users.authorPeer.id,
      },
    },
  });
  const afterReactionCount = await prisma.reaction.count({
    where: {
      articleId: payload.articleId,
      userId: seed.users.authorPeer.id,
    },
  });
  const parsed = response.parsedBody as { data?: { likeCount?: number; userReaction?: ReactionType | null } } | null;
  const pass = response.status === 200 && beforeReactionCount === 0 && afterReactionCount === 1 && reaction?.type === ReactionType.LIKE && parsed?.data?.likeCount === 1 && parsed?.data?.userReaction === ReactionType.LIKE;

  return {
    case_id: "BE-14",
    description: "Toggle reaction on article",
    preconditions: "Published article exists and acting user is authenticated.",
    test_data: stringify(payload),
    steps: "POST /api/reactions with articleId ut_reaction_article and type LIKE.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "Reaction stored and response summary reflects the new LIKE count.",
    compare: buildCompare(pass, `status=${response.status}, beforeReactionCount=${beforeReactionCount}, afterReactionCount=${afterReactionCount}, storedReaction=${reaction?.type ?? "null"}, likeCount=${parsed?.data?.likeCount ?? "null"}, userReaction=${parsed?.data?.userReaction ?? "null"}`),
    db_verification: `beforeReactionCount=${beforeReactionCount}; afterReactionCount=${afterReactionCount}; reactionType=${reaction?.type ?? "null"}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Reaction create/toggle flow works for initial LIKE with before/after DB persistence verified." : "Reaction summary or persistence diverged.",
  };
}

async function runCaseBe15(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_non_owner_update_article",
    title: "Owner-only draft",
    content: ["Private content"],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);
  const payload = { title: "Illegal peer update" };

  const response = await apiCall(baseUrl, "/articles/ut_non_owner_update_article", {
    method: "PATCH",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const article = await prisma.article.findUnique({ where: { id: "ut_non_owner_update_article" } });
  const pass = response.status === 403 && article?.title === "Owner-only draft";

  return {
    case_id: "BE-15",
    description: "Update draft article by non-owner author",
    preconditions: "Draft article belongs to author owner and acting author is not the owner.",
    test_data: stringify(payload),
    steps: "PATCH /api/articles/ut_non_owner_update_article with another author's bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "403 Forbidden and article remains unchanged.",
    compare: buildCompare(pass, `status=${response.status}, storedTitle=${article?.title ?? "null"}`),
    db_verification: `title=${article?.title ?? "null"}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Ownership check blocks draft updates by other authors." : "Non-owner update changed article state unexpectedly.",
  };
}

async function runCaseBe16(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_delete_draft_article",
    title: "Delete me",
    content: ["Disposable content"],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createVersion("ut_delete_draft_article", seed.users.authorOwner.id, ["Disposable content"], "ut_delete_v1");
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const beforeArticle = await prisma.article.findUnique({ where: { id: "ut_delete_draft_article" } });
  const beforeVersionCount = await prisma.articleVersion.count({ where: { articleId: "ut_delete_draft_article" } });

  const response = await apiCall(baseUrl, "/articles/ut_delete_draft_article", {
    method: "DELETE",
    token,
  });

  const article = await prisma.article.findUnique({ where: { id: "ut_delete_draft_article" } });
  const versionCount = await prisma.articleVersion.count({ where: { articleId: "ut_delete_draft_article" } });
  const pass = response.status === 200 && Boolean(beforeArticle) && beforeVersionCount === 1 && !article && versionCount === 0;

  return {
    case_id: "BE-16",
    description: "Delete own draft article",
    preconditions: "Owned draft article exists with saved versions.",
    test_data: stringify({ articleId: "ut_delete_draft_article" }),
    steps: "DELETE /api/articles/ut_delete_draft_article with owner bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK, article deleted, and dependent versions removed.",
    compare: buildCompare(pass, `status=${response.status}, beforeArticleExists=${Boolean(beforeArticle)}, afterArticleExists=${Boolean(article)}, beforeVersionCount=${beforeVersionCount}, afterVersionCount=${versionCount}`),
    db_verification: `beforeArticleExists=${Boolean(beforeArticle)}; afterArticleExists=${Boolean(article)}; beforeVersionCount=${beforeVersionCount}; afterVersionCount=${versionCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Delete removes article and cascades version records with the expected before/after DB delta." : "Delete did not remove the expected data.",
  };
}

async function runCaseBe17(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_owner_draft_only",
    title: "Owner draft only",
    content: ["Owner draft content"],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createArticleRecord({
    id: "ut_peer_draft_only",
    title: "Peer draft only",
    content: ["Peer draft content"],
    status: "DRAFT",
    authorId: seed.users.authorPeer.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const response = await apiCall(baseUrl, "/articles?status=DRAFT&skip=0&limit=50", {
    method: "GET",
    token,
  });

  const parsed = response.parsedBody as { data?: { items?: Array<{ id: string }> } } | null;
  const itemIds = parsed?.data?.items?.map((item) => item.id) ?? [];
  const pass = response.status === 200 && itemIds.length === 1 && itemIds[0] === "ut_owner_draft_only";

  return {
    case_id: "BE-17",
    description: "List draft articles returns only current author's drafts",
    preconditions: "Two authors each have at least one draft article.",
    test_data: stringify({ status: "DRAFT", skip: 0, limit: 50 }),
    steps: "GET /api/articles?status=DRAFT&skip=0&limit=50 with owner bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK and response contains only drafts authored by the requester.",
    compare: buildCompare(pass, `status=${response.status}, itemIds=${JSON.stringify(itemIds)}`),
    db_verification: `ownerDraftId=ut_owner_draft_only; peerDraftId=ut_peer_draft_only` ,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Draft list is correctly filtered by requesting author." : "Draft list exposed another author's content.",
  };
}

async function runCaseBe18(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_hidden_draft",
    title: "Hidden owner draft",
    content: ["Hidden draft body"],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);
  const response = await apiCall(baseUrl, "/articles/ut_hidden_draft", {
    method: "GET",
    token,
  });
  const pass = response.status === 403;

  return {
    case_id: "BE-18",
    description: "Read another author's draft article detail",
    preconditions: "Draft article exists and acting author does not own it.",
    test_data: stringify({ articleId: "ut_hidden_draft" }),
    steps: "GET /api/articles/ut_hidden_draft with non-owner author token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "403 Forbidden.",
    compare: buildCompare(pass, `status=${response.status}`),
    db_verification: "No database mutation expected.",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Draft detail is protected from other authors." : "Non-owner could access draft detail.",
  };
}

async function runCaseBe19(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_versions_article",
    title: "Versioned draft",
    content: ["Current draft"],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createVersion("ut_versions_article", seed.users.authorOwner.id, ["Old draft"], "ut_versions_v1");
  await createVersion("ut_versions_article", seed.users.authorOwner.id, ["Current draft"], "ut_versions_v2");
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const response = await apiCall(baseUrl, "/articles/ut_versions_article/versions", {
    method: "GET",
    token,
  });

  const parsed = response.parsedBody as { data?: Array<{ id: string }> } | null;
  const versionIds = parsed?.data?.map((item) => item.id) ?? [];
  const pass = response.status === 200 && versionIds.length === 2 && versionIds.includes("ut_versions_v1") && versionIds.includes("ut_versions_v2");

  return {
    case_id: "BE-19",
    description: "Get owned article versions",
    preconditions: "Owned draft article exists with multiple saved versions.",
    test_data: stringify({ articleId: "ut_versions_article" }),
    steps: "GET /api/articles/ut_versions_article/versions with owner bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK and response contains all saved versions for the article.",
    compare: buildCompare(pass, `status=${response.status}, versionIds=${JSON.stringify(versionIds)}`),
    db_verification: `versionCount=${await prisma.articleVersion.count({ where: { articleId: "ut_versions_article" } })}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Version history endpoint returns the owner's saved snapshots." : "Version history response was incomplete.",
  };
}

async function runCaseBe20(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_restore_article",
    title: "Restore target draft",
    content: ["Current content"],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createVersion("ut_restore_article", seed.users.authorOwner.id, ["Original content"], "ut_restore_v1");
  await createVersion("ut_restore_article", seed.users.authorOwner.id, ["Current content"], "ut_restore_v2");
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const beforeArticle = await prisma.article.findUnique({ where: { id: "ut_restore_article" } });
  const beforeVersionCount = await prisma.articleVersion.count({ where: { articleId: "ut_restore_article" } });

  const response = await apiCall(baseUrl, "/articles/ut_restore_article/restore", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ versionId: "ut_restore_v1" }),
  });

  const article = await prisma.article.findUnique({ where: { id: "ut_restore_article" } });
  const versionCount = await prisma.articleVersion.count({ where: { articleId: "ut_restore_article" } });
  const pass = response.status === 200 && JSON.stringify(beforeArticle?.content ?? null) === JSON.stringify(["Current content"]) && JSON.stringify(article?.content ?? null) === JSON.stringify(["Original content"]) && beforeVersionCount === 2 && versionCount === 2;

  return {
    case_id: "BE-20",
    description: "Restore previous article version",
    preconditions: "Owned draft article exists, target version exists, and target content differs from current content.",
    test_data: stringify({ articleId: "ut_restore_article", versionId: "ut_restore_v1" }),
    steps: "POST /api/articles/ut_restore_article/restore with valid versionId.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK and article content restored to the selected version without duplicate snapshot creation.",
    compare: buildCompare(pass, `status=${response.status}, beforeContent=${JSON.stringify(beforeArticle?.content ?? null)}, afterContent=${JSON.stringify(article?.content ?? null)}, beforeVersionCount=${beforeVersionCount}, afterVersionCount=${versionCount}`),
    db_verification: `beforeContent=${JSON.stringify(beforeArticle?.content ?? null)}; afterContent=${JSON.stringify(article?.content ?? null)}; beforeVersionCount=${beforeVersionCount}; afterVersionCount=${versionCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Restore applies the selected snapshot with the expected before/after content delta and no extra version row." : "Restore flow did not preserve the expected version state.",
  };
}

async function runCaseBe21(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_restore_article_missing",
    title: "Restore missing version draft",
    content: ["Unchanged current content"],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createVersion("ut_restore_article_missing", seed.users.authorOwner.id, ["Unchanged current content"], "ut_restore_existing_v1");
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const response = await apiCall(baseUrl, "/articles/ut_restore_article_missing/restore", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ versionId: "ut_missing_version" }),
  });

  const article = await prisma.article.findUnique({ where: { id: "ut_restore_article_missing" } });
  const pass = response.status === 404 && JSON.stringify(article?.content ?? null) === JSON.stringify(["Unchanged current content"]);

  return {
    case_id: "BE-21",
    description: "Restore article with missing version id",
    preconditions: "Owned draft article exists but the provided versionId does not belong to the article.",
    test_data: stringify({ articleId: "ut_restore_article_missing", versionId: "ut_missing_version" }),
    steps: "POST /api/articles/ut_restore_article_missing/restore with invalid versionId.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "404 Not Found and article content remains unchanged.",
    compare: buildCompare(pass, `status=${response.status}, content=${JSON.stringify(article?.content ?? null)}`),
    db_verification: `content=${JSON.stringify(article?.content ?? null)}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Invalid version restore does not modify the article." : "Invalid restore changed article state unexpectedly.",
  };
}

async function runCaseBe22(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createNotificationFixture({
    id: "ut_notification_read_owner",
    userId: seed.users.authorOwner.id,
    type: NotificationType.ARTICLE_COMMENT,
    entityId: "ut_notification_entity_owner",
  });
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const beforeNotification = await prisma.notification.findUnique({ where: { id: "ut_notification_read_owner" } });

  const response = await apiCall(baseUrl, "/notifications/ut_notification_read_owner/read", {
    method: "PATCH",
    token,
  });

  const notification = await prisma.notification.findUnique({ where: { id: "ut_notification_read_owner" } });
  const pass = response.status === 200 && beforeNotification?.isRead === false && notification?.isRead === true;

  return {
    case_id: "BE-22",
    description: "Mark own notification as read",
    preconditions: "Authenticated user has an unread notification.",
    test_data: stringify({ notificationId: "ut_notification_read_owner" }),
    steps: "PATCH /api/notifications/ut_notification_read_owner/read with owner bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK and notification isRead becomes true in database.",
    compare: buildCompare(pass, `status=${response.status}, beforeIsRead=${beforeNotification?.isRead ?? "null"}, afterIsRead=${notification?.isRead ?? "null"}`),
    db_verification: `beforeIsRead=${beforeNotification?.isRead ?? "null"}; afterIsRead=${notification?.isRead ?? "null"}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Owner can mark notification as read, and the before/after DB state changed exactly once." : "Notification read state was not updated as expected.",
  };
}

async function runCaseBe23(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createNotificationFixture({
    id: "ut_notification_read_other",
    userId: seed.users.authorPeer.id,
    type: NotificationType.COMMENT_REPLY,
    entityId: "ut_notification_entity_other",
  });
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const response = await apiCall(baseUrl, "/notifications/ut_notification_read_other/read", {
    method: "PATCH",
    token,
  });

  const notification = await prisma.notification.findUnique({ where: { id: "ut_notification_read_other" } });
  const pass = response.status === 404 && notification?.isRead === false;

  return {
    case_id: "BE-23",
    description: "Mark another user's notification as read",
    preconditions: "Unread notification exists for a different user.",
    test_data: stringify({ notificationId: "ut_notification_read_other" }),
    steps: "PATCH /api/notifications/ut_notification_read_other/read with unauthorized bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "404 Not Found and target notification remains unread.",
    compare: buildCompare(pass, `status=${response.status}, isRead=${notification?.isRead ?? "null"}`),
    db_verification: `isRead=${notification?.isRead ?? "null"}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Notification ownership is enforced on mark-as-read." : "Another user's notification was modified unexpectedly.",
  };
}

async function runCaseBe24(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_stats_article",
    title: "Stats article",
    content: ["Stats body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
    views: 4,
  });
  await createCommentFixture({
    id: "ut_stats_comment_top",
    content: "Top comment",
    articleId: "ut_stats_article",
    userId: seed.users.authorOwner.id,
  });
  await createCommentFixture({
    id: "ut_stats_comment_reply",
    content: "Reply comment",
    articleId: "ut_stats_article",
    userId: seed.users.authorPeer.id,
    parentId: "ut_stats_comment_top",
  });
  await createCommentFixture({
    id: "ut_stats_comment_deleted",
    content: "Deleted comment",
    articleId: "ut_stats_article",
    userId: seed.users.viewer.id,
    deletedAt: new Date("2026-04-08T07:00:00.000Z"),
  });
  await createHelpfulnessFixture({ articleId: "ut_stats_article", userId: seed.users.authorPeer.id, value: HelpfulnessValue.HELPFUL });
  await createHelpfulnessFixture({ articleId: "ut_stats_article", userId: seed.users.viewer.id, value: HelpfulnessValue.NOT_HELPFUL });

  const response = await apiCall(baseUrl, "/articles/ut_stats_article/stats", {
    method: "GET",
  });

  const parsed = response.parsedBody as { data?: { views?: number; comments?: number; helpful?: number; notHelpful?: number } } | null;
  const pass = response.status === 200 && parsed?.data?.views === 4 && parsed?.data?.comments === 2 && parsed?.data?.helpful === 1 && parsed?.data?.notHelpful === 1;

  return {
    case_id: "BE-24",
    description: "Read article stats summary",
    preconditions: "Published article exists with seeded views, comments, and helpfulness ratings.",
    test_data: stringify({ articleId: "ut_stats_article" }),
    steps: "GET /api/articles/ut_stats_article/stats.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK and response counts match database aggregates, excluding deleted comments.",
    compare: buildCompare(pass, `status=${response.status}, stats=${JSON.stringify(parsed?.data ?? null)}`),
    db_verification: "views=4; comments=2; helpful=1; notHelpful=1",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Stats endpoint reflects the expected aggregates." : "Stats summary diverged from database state.",
  };
}

async function runCaseBe25(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_comment_create_article",
    title: "Commentable published article",
    content: ["Published comment body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);
  const payload = { content: "Great write-up on the release checklist." };

  const beforeCommentCount = await prisma.comment.count({ where: { articleId: "ut_comment_create_article" } });
  const beforeNotificationCount = await prisma.notification.count({ where: { userId: seed.users.authorOwner.id, entityId: "ut_comment_create_article" } });

  const response = await apiCall(baseUrl, "/articles/ut_comment_create_article/comments", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const comment = await prisma.comment.findFirst({ where: { articleId: "ut_comment_create_article", content: payload.content } });
  const notificationCount = await prisma.notification.count({ where: { userId: seed.users.authorOwner.id, entityId: "ut_comment_create_article" } });
  const afterCommentCount = await prisma.comment.count({ where: { articleId: "ut_comment_create_article" } });
  const pass = response.status === 201 && beforeCommentCount === 0 && afterCommentCount === 1 && Boolean(comment) && beforeNotificationCount === 0 && notificationCount === 1;

  return {
    case_id: "BE-25",
    description: "Create top-level comment and notify article author",
    preconditions: "Published article exists and acting user is not the article author.",
    test_data: stringify(payload),
    steps: "POST /api/articles/ut_comment_create_article/comments with valid content.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "201 Created, comment persisted, and article author receives one notification.",
    compare: buildCompare(pass, `status=${response.status}, beforeCommentCount=${beforeCommentCount}, afterCommentCount=${afterCommentCount}, commentCreated=${Boolean(comment)}, beforeNotificationCount=${beforeNotificationCount}, afterNotificationCount=${notificationCount}`),
    db_verification: `beforeCommentCount=${beforeCommentCount}; afterCommentCount=${afterCommentCount}; commentId=${comment?.id ?? "null"}; beforeNotificationCount=${beforeNotificationCount}; afterNotificationCount=${notificationCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Comment creation also triggered the article-author notification side effect with the expected before/after DB delta." : "Comment create side effects were incomplete.",
  };
}

async function runCaseBe26(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_comment_thread_article",
    title: "Threaded comments article",
    content: ["Thread body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createCommentFixture({
    id: "ut_comment_thread_top",
    content: "Parent comment",
    articleId: "ut_comment_thread_article",
    userId: seed.users.authorOwner.id,
  });
  await createCommentFixture({
    id: "ut_comment_thread_reply",
    content: "Child reply",
    articleId: "ut_comment_thread_article",
    userId: seed.users.authorPeer.id,
    parentId: "ut_comment_thread_top",
  });

  const response = await apiCall(baseUrl, "/articles/ut_comment_thread_article/comments?skip=0&limit=20", {
    method: "GET",
  });

  const parsed = response.parsedBody as { data?: { items?: Array<{ id: string; replies: Array<{ id: string }> }> } } | null;
  const firstComment = parsed?.data?.items?.[0];
  const pass = response.status === 200 && parsed?.data?.items?.length === 1 && firstComment?.id === "ut_comment_thread_top" && firstComment.replies.length === 1 && firstComment.replies[0]?.id === "ut_comment_thread_reply";

  return {
    case_id: "BE-26",
    description: "Read article comments with one-level replies",
    preconditions: "Published article exists with one top-level comment and one reply.",
    test_data: stringify({ articleId: "ut_comment_thread_article", skip: 0, limit: 20 }),
    steps: "GET /api/articles/ut_comment_thread_article/comments?skip=0&limit=20.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK and response nests the reply under its parent top-level comment.",
    compare: buildCompare(pass, `status=${response.status}, items=${JSON.stringify(parsed?.data?.items ?? null)}`),
    db_verification: "topLevelCount=1; replyCount=1",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Comment list returns the expected one-level thread structure." : "Comment thread structure did not match the expected nesting.",
  };
}

async function runCaseBe27(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_deleted_parent_article",
    title: "Deleted parent article",
    content: ["Deleted parent body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createCommentFixture({
    id: "ut_deleted_parent_comment",
    content: "Deleted parent",
    articleId: "ut_deleted_parent_article",
    userId: seed.users.authorOwner.id,
    deletedAt: new Date("2026-04-08T07:00:00.000Z"),
  });
  const token = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);
  const payload = { content: "Trying to reply", parentId: "ut_deleted_parent_comment" };

  const response = await apiCall(baseUrl, "/articles/ut_deleted_parent_article/comments", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const commentCount = await prisma.comment.count({ where: { articleId: "ut_deleted_parent_article" } });
  const pass = response.status === 400 && commentCount === 1;

  return {
    case_id: "BE-27",
    description: "Reply to deleted parent comment",
    preconditions: "Published article exists and parent comment is soft-deleted.",
    test_data: stringify(payload),
    steps: "POST /api/articles/ut_deleted_parent_article/comments with deleted parentId.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "400 Bad Request and no reply comment persisted.",
    compare: buildCompare(pass, `status=${response.status}, commentCount=${commentCount}`),
    db_verification: `commentCount=${commentCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Deleted parent comments correctly block new replies." : "Reply was allowed against a deleted parent comment.",
  };
}

async function runCaseBe28(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_toggle_reaction_article",
    title: "Toggle reaction article",
    content: ["Reaction toggle body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);
  const payload = { articleId: "ut_toggle_reaction_article", type: "LIKE" };

  const beforeReactionCount = await prisma.reaction.count({
    where: {
      articleId: payload.articleId,
      userId: seed.users.authorPeer.id,
    },
  });

  const firstResponse = await apiCall(baseUrl, "/reactions", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const afterFirstReactionCount = await prisma.reaction.count({
    where: {
      articleId: payload.articleId,
      userId: seed.users.authorPeer.id,
    },
  });
  const secondResponse = await apiCall(baseUrl, "/reactions", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const reaction = await prisma.reaction.findUnique({
    where: {
      articleId_userId: {
        articleId: "ut_toggle_reaction_article",
        userId: seed.users.authorPeer.id,
      },
    },
  });
  const afterSecondReactionCount = await prisma.reaction.count({
    where: {
      articleId: payload.articleId,
      userId: seed.users.authorPeer.id,
    },
  });
  const parsed = secondResponse.parsedBody as { data?: { likeCount?: number; userReaction?: ReactionType | null } } | null;
  const pass = firstResponse.status === 200 && secondResponse.status === 200 && beforeReactionCount === 0 && afterFirstReactionCount === 1 && afterSecondReactionCount === 0 && !reaction && parsed?.data?.likeCount === 0 && parsed?.data?.userReaction === null;

  return {
    case_id: "BE-28",
    description: "Toggle same reaction twice removes it",
    preconditions: "Published article exists and acting user is authenticated.",
    test_data: stringify({ ...payload, requestCount: 2 }),
    steps: "POST /api/reactions twice with articleId ut_toggle_reaction_article and type LIKE.",
    api_response: `first=HTTP ${firstResponse.status} ${firstResponse.rawBody}; second=HTTP ${secondResponse.status} ${secondResponse.rawBody}`,
    expected_result: "Second request removes the user's reaction and counts return to zero.",
    compare: buildCompare(pass, `firstStatus=${firstResponse.status}, secondStatus=${secondResponse.status}, beforeReactionCount=${beforeReactionCount}, afterFirstReactionCount=${afterFirstReactionCount}, afterSecondReactionCount=${afterSecondReactionCount}, storedReaction=${reaction?.type ?? "null"}, likeCount=${parsed?.data?.likeCount ?? "null"}, userReaction=${parsed?.data?.userReaction ?? "null"}`),
    db_verification: `beforeReactionCount=${beforeReactionCount}; afterFirstReactionCount=${afterFirstReactionCount}; afterSecondReactionCount=${afterSecondReactionCount}; reactionExists=${Boolean(reaction)}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Same reaction is correctly toggled off on the second request with the expected intermediate and final DB states." : "Reaction toggle-off rule failed.",
  };
}

async function runCaseBe29(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_helpfulness_article",
    title: "Helpfulness target article",
    content: ["Helpfulness body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);

  const beforeRatingCount = await prisma.helpfulnessRating.count({ where: { articleId: "ut_helpfulness_article" } });

  const firstResponse = await apiCall(baseUrl, "/articles/ut_helpfulness_article/helpfulness", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "HELPFUL" }),
  });
  const afterFirstRatingCount = await prisma.helpfulnessRating.count({ where: { articleId: "ut_helpfulness_article" } });
  const secondResponse = await apiCall(baseUrl, "/articles/ut_helpfulness_article/helpfulness", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "NOT_HELPFUL" }),
  });

  const rating = await prisma.helpfulnessRating.findUnique({
    where: {
      articleId_userId: {
        articleId: "ut_helpfulness_article",
        userId: seed.users.authorPeer.id,
      },
    },
  });
  const ratingCount = await prisma.helpfulnessRating.count({ where: { articleId: "ut_helpfulness_article" } });
  const parsed = secondResponse.parsedBody as { data?: { helpfulCount?: number; notHelpfulCount?: number; userVote?: HelpfulnessValue | null } } | null;
  const pass = firstResponse.status === 200 && secondResponse.status === 200 && beforeRatingCount === 0 && afterFirstRatingCount === 1 && rating?.value === HelpfulnessValue.NOT_HELPFUL && ratingCount === 1 && parsed?.data?.helpfulCount === 0 && parsed?.data?.notHelpfulCount === 1 && parsed?.data?.userVote === HelpfulnessValue.NOT_HELPFUL;

  return {
    case_id: "BE-29",
    description: "Upsert helpfulness vote",
    preconditions: "Published article exists and acting user is authenticated.",
    test_data: stringify({ articleId: "ut_helpfulness_article", firstValue: "HELPFUL", secondValue: "NOT_HELPFUL" }),
    steps: "POST /api/articles/ut_helpfulness_article/helpfulness twice, first HELPFUL then NOT_HELPFUL.",
    api_response: `first=HTTP ${firstResponse.status} ${firstResponse.rawBody}; second=HTTP ${secondResponse.status} ${secondResponse.rawBody}`,
    expected_result: "Only one rating row remains and final summary reflects NOT_HELPFUL for the acting user.",
    compare: buildCompare(pass, `firstStatus=${firstResponse.status}, secondStatus=${secondResponse.status}, beforeRatingCount=${beforeRatingCount}, afterFirstRatingCount=${afterFirstRatingCount}, finalRatingValue=${rating?.value ?? "null"}, finalRatingCount=${ratingCount}, summary=${JSON.stringify(parsed?.data ?? null)}`),
    db_verification: `beforeRatingCount=${beforeRatingCount}; afterFirstRatingCount=${afterFirstRatingCount}; finalRatingValue=${rating?.value ?? "null"}; finalRatingCount=${ratingCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Helpfulness votes are correctly upserted instead of duplicated, with stable row cardinality across both mutations." : "Helpfulness upsert behavior did not match the business rule.",
  };
}

async function runCaseBe30(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_invalid_helpfulness_article",
    title: "Invalid helpfulness article",
    content: ["Invalid helpfulness body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);

  const response = await apiCall(baseUrl, "/articles/ut_invalid_helpfulness_article/helpfulness", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "MAYBE" }),
  });

  const ratingCount = await prisma.helpfulnessRating.count({ where: { articleId: "ut_invalid_helpfulness_article" } });
  const pass = response.status === 400 && ratingCount === 0;

  return {
    case_id: "BE-30",
    description: "Reject invalid helpfulness value",
    preconditions: "Published article exists and acting user is authenticated.",
    test_data: stringify({ articleId: "ut_invalid_helpfulness_article", value: "MAYBE" }),
    steps: "POST /api/articles/ut_invalid_helpfulness_article/helpfulness with invalid value.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "400 Bad Request and no helpfulness rating row persisted.",
    compare: buildCompare(pass, `status=${response.status}, ratingCount=${ratingCount}`),
    db_verification: `ratingCount=${ratingCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Invalid helpfulness values are rejected before persistence." : "Invalid helpfulness value unexpectedly modified database state.",
  };
}

async function runCaseBe31(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  await seedBaseData();
  const payload = {
    name: "New Author",
    email: "new.author@example.com",
    password: "Passw0rd!",
  };

  const response = await apiCall(baseUrl, "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  const parsed = response.parsedBody as { data?: { user?: { role?: string } } } | null;
  const pass = response.status === 201 && Boolean(user) && user?.role === UserRole.AUTHOR && parsed?.data?.user?.role === UserRole.AUTHOR;

  return {
    case_id: "BE-31",
    description: "Register a new author account",
    preconditions: "Email is not already registered.",
    test_data: stringify(payload),
    steps: "POST /api/auth/register with valid payload.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "201 Created, user returned with AUTHOR role, and user record persisted.",
    compare: buildCompare(pass, `status=${response.status}, userExists=${Boolean(user)}, role=${user?.role ?? "null"}`),
    db_verification: `userExists=${Boolean(user)}; role=${user?.role ?? "null"}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Registration creates an AUTHOR account and returns auth data." : "Registration behavior diverged from the expected auth flow.",
  };
}

async function runCaseBe32(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  const payload = {
    email: seed.users.authorOwner.email,
    password: "WrongPass123",
  };

  const response = await apiCall(baseUrl, "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const pass = response.status === 401;

  return {
    case_id: "BE-32",
    description: "Login with invalid password",
    preconditions: "User account exists.",
    test_data: stringify(payload),
    steps: "POST /api/auth/login with incorrect password.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "401 Unauthorized and no new data persisted.",
    compare: buildCompare(pass, `status=${response.status}`),
    db_verification: "No database mutation expected.",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Invalid credentials are rejected cleanly." : "Unexpected login result for invalid credentials.",
  };
}

async function runCaseBe33(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);
  const response = await apiCall(baseUrl, "/auth/me", {
    method: "GET",
    token,
  });

  const parsed = response.parsedBody as { data?: { user?: { email?: string; id?: string } } } | null;
  const pass = response.status === 200 && parsed?.data?.user?.email === seed.users.authorOwner.email && parsed?.data?.user?.id === seed.users.authorOwner.id;

  return {
    case_id: "BE-33",
    description: "Get current authenticated user profile",
    preconditions: "Valid bearer token exists for an authenticated user.",
    test_data: stringify({ tokenOwner: seed.users.authorOwner.email }),
    steps: "GET /api/auth/me with valid bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK and response contains the authenticated user's profile.",
    compare: buildCompare(pass, `status=${response.status}, email=${parsed?.data?.user?.email ?? "null"}, id=${parsed?.data?.user?.id ?? "null"}`),
    db_verification: `expectedUserId=${seed.users.authorOwner.id}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Current-user endpoint returns the bearer token owner." : "Current-user endpoint returned unexpected user data.",
  };
}

async function runCaseBe34(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  for (let index = 0; index < 12; index += 1) {
    await createArticleRecord({
      id: `ut_published_list_${index + 1}`,
      title: `Published list article ${index + 1}`,
      content: [`Published list content ${index + 1}`],
      status: "PUBLISHED",
      authorId: seed.users.authorOwner.id,
      categoryId: seed.categories.childId,
      publishedAt: new Date(Date.UTC(2026, 3, 8, 12, index, 0)),
    });
  }

  const response = await apiCall(baseUrl, "/articles?status=PUBLISHED&skip=0&limit=10", {
    method: "GET",
  });

  const parsed = response.parsedBody as {
    data?: {
      items?: Array<{ id: string }>;
      pagination?: { hasMore?: boolean; nextSkip?: number | null; limit?: number; skip?: number };
    };
  } | null;
  const itemIds = parsed?.data?.items?.map((item) => item.id) ?? [];
  const pagination = parsed?.data?.pagination;
  const pass = response.status === 200 && itemIds.length === 10 && itemIds[0] === "ut_published_list_12" && itemIds[9] === "ut_published_list_3" && pagination?.hasMore === true && pagination?.nextSkip === 10;

  return {
    case_id: "BE-34",
    description: "List published articles with pagination metadata",
    preconditions: "At least 12 published articles exist.",
    test_data: stringify({ status: "PUBLISHED", skip: 0, limit: 10 }),
    steps: "GET /api/articles?status=PUBLISHED&skip=0&limit=10.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK, 10 items returned, hasMore=true, nextSkip=10, and items ordered by published date descending.",
    compare: buildCompare(pass, `status=${response.status}, itemCount=${itemIds.length}, firstId=${itemIds[0] ?? "null"}, lastId=${itemIds[9] ?? "null"}, hasMore=${pagination?.hasMore ?? "null"}, nextSkip=${pagination?.nextSkip ?? "null"}`),
    db_verification: "publishedArticleCount=12",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Published article list pagination and ordering are correct." : "Published article listing did not match expected pagination or ordering.",
  };
}

async function runCaseBe35(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  await seedBaseData();
  const response = await apiCall(baseUrl, "/articles?status=PUBLISHED&skip=0&limit=0", {
    method: "GET",
  });
  const pass = response.status === 400;

  return {
    case_id: "BE-35",
    description: "Reject invalid article list pagination limit",
    preconditions: "No special setup beyond reachable API.",
    test_data: stringify({ status: "PUBLISHED", skip: 0, limit: 0 }),
    steps: "GET /api/articles?status=PUBLISHED&skip=0&limit=0.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "400 Bad Request because limit must be between 1 and 50.",
    compare: buildCompare(pass, `status=${response.status}`),
    db_verification: "No database mutation expected.",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Article list validation rejects zero limit." : "Article list accepted an invalid limit unexpectedly.",
  };
}

async function runCaseBe36(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_comment_page_article",
    title: "Comment page article",
    content: ["Comment page body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  for (let index = 0; index < 25; index += 1) {
    await createCommentFixture({
      id: `ut_comment_page_${index + 1}`,
      content: `Comment page item ${index + 1}`,
      articleId: "ut_comment_page_article",
      userId: seed.users.authorOwner.id,
    });
  }

  const response = await apiCall(baseUrl, "/articles/ut_comment_page_article/comments?skip=10&limit=10", {
    method: "GET",
  });

  const parsed = response.parsedBody as {
    data?: {
      items?: Array<{ id: string }>;
      pagination?: { hasMore?: boolean; nextSkip?: number | null };
    };
  } | null;
  const itemIds = parsed?.data?.items?.map((item) => item.id) ?? [];
  const pagination = parsed?.data?.pagination;
  const pass = response.status === 200 && itemIds.length === 10 && pagination?.hasMore === true && pagination?.nextSkip === 20;

  return {
    case_id: "BE-36",
    description: "Read article comments on the second page",
    preconditions: "Published article exists with at least 25 top-level comments.",
    test_data: stringify({ articleId: "ut_comment_page_article", skip: 10, limit: 10 }),
    steps: "GET /api/articles/ut_comment_page_article/comments?skip=10&limit=10.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK, 10 comments returned, hasMore=true, and nextSkip=20.",
    compare: buildCompare(pass, `status=${response.status}, itemCount=${itemIds.length}, hasMore=${pagination?.hasMore ?? "null"}, nextSkip=${pagination?.nextSkip ?? "null"}`),
    db_verification: "topLevelCommentCount=25",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Comment pagination returns the expected second page." : "Comment pagination metadata or slice was incorrect.",
  };
}

async function runCaseBe37(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_comment_invalid_page_article",
    title: "Comment invalid page article",
    content: ["Comment invalid page body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const response = await apiCall(baseUrl, "/articles/ut_comment_invalid_page_article/comments?skip=0&limit=51", {
    method: "GET",
  });
  const pass = response.status === 400;

  return {
    case_id: "BE-37",
    description: "Reject invalid comment list pagination limit",
    preconditions: "Published article exists.",
    test_data: stringify({ articleId: "ut_comment_invalid_page_article", skip: 0, limit: 51 }),
    steps: "GET /api/articles/ut_comment_invalid_page_article/comments?skip=0&limit=51.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "400 Bad Request because limit must be between 1 and 50.",
    compare: buildCompare(pass, `status=${response.status}`),
    db_verification: "No database mutation expected.",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Comment list validation rejects an out-of-range limit." : "Comment list accepted an invalid limit unexpectedly.",
  };
}

async function runCaseBe38(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_bookmark_article",
    title: "Bookmarkable article",
    content: ["Bookmark body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.viewer.email, seed.users.viewer.password);

  const beforeBookmarkCount = await prisma.bookmark.count({
    where: {
      userId: seed.users.viewer.id,
      articleId: "ut_bookmark_article",
    },
  });

  const createResponse = await apiCall(baseUrl, "/bookmarks", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId: "ut_bookmark_article" }),
  });
  const listResponse = await apiCall(baseUrl, "/bookmarks", {
    method: "GET",
    token,
  });

  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_articleId: {
        userId: seed.users.viewer.id,
        articleId: "ut_bookmark_article",
      },
    },
  });
  const afterBookmarkCount = await prisma.bookmark.count({
    where: {
      userId: seed.users.viewer.id,
      articleId: "ut_bookmark_article",
    },
  });
  const parsed = listResponse.parsedBody as { data?: Array<{ articleId: string }> } | null;
  const listedIds = parsed?.data?.map((item) => item.articleId) ?? [];
  const pass = createResponse.status === 201 && listResponse.status === 200 && beforeBookmarkCount === 0 && afterBookmarkCount === 1 && Boolean(bookmark) && listedIds.includes("ut_bookmark_article");

  return {
    case_id: "BE-38",
    description: "Create bookmark and list it for the current user",
    preconditions: "Published article exists and user is authenticated.",
    test_data: stringify({ articleId: "ut_bookmark_article" }),
    steps: "POST /api/bookmarks then GET /api/bookmarks with the same bearer token.",
    api_response: `create=HTTP ${createResponse.status} ${createResponse.rawBody}; list=HTTP ${listResponse.status} ${listResponse.rawBody}`,
    expected_result: "Bookmark is created and appears in the authenticated user's bookmark list.",
    compare: buildCompare(pass, `createStatus=${createResponse.status}, listStatus=${listResponse.status}, beforeBookmarkCount=${beforeBookmarkCount}, afterBookmarkCount=${afterBookmarkCount}, bookmarkExists=${Boolean(bookmark)}, listedIds=${JSON.stringify(listedIds)}`),
    db_verification: `beforeBookmarkCount=${beforeBookmarkCount}; afterBookmarkCount=${afterBookmarkCount}; bookmarkExists=${Boolean(bookmark)}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Bookmark create and list flows are consistent with the expected before/after DB persistence delta." : "Bookmark create/list behavior did not match expectations.",
  };
}

async function runCaseBe39(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_bookmark_delete_article",
    title: "Bookmark delete article",
    content: ["Bookmark delete body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createBookmarkFixture(seed.users.viewer.id, "ut_bookmark_delete_article");
  const token = await login(baseUrl, seed.users.viewer.email, seed.users.viewer.password);

  const beforeBookmarkCount = await prisma.bookmark.count({
    where: {
      userId: seed.users.viewer.id,
      articleId: "ut_bookmark_delete_article",
    },
  });

  const response = await apiCall(baseUrl, "/bookmarks/ut_bookmark_delete_article", {
    method: "DELETE",
    token,
  });

  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_articleId: {
        userId: seed.users.viewer.id,
        articleId: "ut_bookmark_delete_article",
      },
    },
  });
  const afterBookmarkCount = await prisma.bookmark.count({
    where: {
      userId: seed.users.viewer.id,
      articleId: "ut_bookmark_delete_article",
    },
  });
  const pass = response.status === 200 && beforeBookmarkCount === 1 && afterBookmarkCount === 0 && !bookmark;

  return {
    case_id: "BE-39",
    description: "Delete existing bookmark",
    preconditions: "User already has a bookmark for the target published article.",
    test_data: stringify({ articleId: "ut_bookmark_delete_article" }),
    steps: "DELETE /api/bookmarks/ut_bookmark_delete_article with authenticated user's bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK, bookmarked=false returned, and bookmark row removed from database.",
    compare: buildCompare(pass, `status=${response.status}, beforeBookmarkCount=${beforeBookmarkCount}, afterBookmarkCount=${afterBookmarkCount}, bookmarkExists=${Boolean(bookmark)}`),
    db_verification: `beforeBookmarkCount=${beforeBookmarkCount}; afterBookmarkCount=${afterBookmarkCount}; bookmarkExists=${Boolean(bookmark)}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Bookmark delete removes the persisted row with the expected before/after DB delta." : "Bookmark delete did not clear the stored bookmark.",
  };
}

async function runCaseBe40(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_bookmark_draft_article",
    title: "Draft bookmark article",
    content: ["Draft bookmark body"],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.viewer.email, seed.users.viewer.password);

  const response = await apiCall(baseUrl, "/bookmarks", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId: "ut_bookmark_draft_article" }),
  });

  const bookmarkCount = await prisma.bookmark.count({ where: { articleId: "ut_bookmark_draft_article" } });
  const pass = response.status === 404 && bookmarkCount === 0;

  return {
    case_id: "BE-40",
    description: "Reject bookmark creation for inaccessible draft article",
    preconditions: "Draft article exists but is not published.",
    test_data: stringify({ articleId: "ut_bookmark_draft_article" }),
    steps: "POST /api/bookmarks with draft articleId.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "404 Not Found and no bookmark row persisted.",
    compare: buildCompare(pass, `status=${response.status}, bookmarkCount=${bookmarkCount}`),
    db_verification: `bookmarkCount=${bookmarkCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Bookmarks are restricted to published articles." : "Draft article bookmark was allowed unexpectedly.",
  };
}

async function runCaseBe41(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  await seedBaseData();
  await prisma.category.createMany({
    data: [
      {
        id: "ut_category_root_2",
        name: "Operations",
        description: "Second root category",
      },
      {
        id: "ut_category_child_2",
        name: "Release",
        description: "Child under operations",
        parentId: "ut_category_root_2",
      },
    ],
  });

  const response = await apiCall(baseUrl, "/categories/tree", {
    method: "GET",
  });

  const parsed = response.parsedBody as { data?: { total?: number; categories?: Array<{ id: string; children: Array<{ id: string }> }> } } | null;
  const total = parsed?.data?.total ?? 0;
  const rootCategories = parsed?.data?.categories ?? [];
  const operationsNode = rootCategories.find((category) => category.id === "ut_category_root_2");
  const pass = response.status === 200 && total === 4 && rootCategories.length === 2 && operationsNode?.children.some((child) => child.id === "ut_category_child_2") === true;

  return {
    case_id: "BE-41",
    description: "Retrieve hierarchical category tree",
    preconditions: "Categories exist with parent-child relationships.",
    test_data: stringify({}),
    steps: "GET /api/categories/tree.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK, nested category structure returned, and total matches database category count.",
    compare: buildCompare(pass, `status=${response.status}, total=${total}, rootCount=${rootCategories.length}, operationsChildCount=${operationsNode?.children.length ?? 0}`),
    db_verification: "categoryCount=4; rootCount=2",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Category tree returns the expected nested structure and total." : "Category tree output did not match the seeded hierarchy.",
  };
}

async function runCaseBe42(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createTagFixture("ut_search_tag", "tag-filter");
  await createTagFixture("ut_search_tag_other", "other-tag");
  await createArticleRecord({
    id: "ut_tagged_article_1",
    title: "Tagged article one",
    content: ["Search tag content one"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
    publishedAt: new Date("2026-04-08T12:02:00.000Z"),
  });
  await createArticleRecord({
    id: "ut_tagged_article_2",
    title: "Tagged article two",
    content: ["Search tag content two"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
    publishedAt: new Date("2026-04-08T12:01:00.000Z"),
  });
  await createArticleRecord({
    id: "ut_untagged_article",
    title: "Other article",
    content: ["Other content"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
    publishedAt: new Date("2026-04-08T12:00:00.000Z"),
  });
  await attachTagToArticle("ut_tagged_article_1", "ut_search_tag");
  await attachTagToArticle("ut_tagged_article_2", "ut_search_tag");
  await attachTagToArticle("ut_untagged_article", "ut_search_tag_other");

  const response = await apiCall(baseUrl, "/search/articles?tagId=ut_search_tag&skip=0&limit=1", {
    method: "GET",
  });

  const parsed = response.parsedBody as {
    data?: {
      tag?: { id?: string; name?: string } | null;
      items?: Array<{ id: string }>;
      pagination?: { total?: number; hasMore?: boolean; nextSkip?: number | null };
    };
  } | null;
  const itemIds = parsed?.data?.items?.map((item) => item.id) ?? [];
  const pagination = parsed?.data?.pagination;
  const tag = parsed?.data?.tag;
  const pass = response.status === 200 && itemIds.length === 1 && itemIds[0] === "ut_tagged_article_1" && tag?.id === "ut_search_tag" && pagination?.total === 2 && pagination?.hasMore === true && pagination?.nextSkip === 1;

  return {
    case_id: "BE-42",
    description: "Filter published articles by tag with pagination",
    preconditions: "At least two published articles are associated with the same tag.",
    test_data: stringify({ tagId: "ut_search_tag", skip: 0, limit: 1 }),
    steps: "GET /api/search/articles?tagId=ut_search_tag&skip=0&limit=1.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK, one tagged article returned, total reflects all matches, and tag metadata is included.",
    compare: buildCompare(pass, `status=${response.status}, itemIds=${JSON.stringify(itemIds)}, tagId=${tag?.id ?? "null"}, total=${pagination?.total ?? "null"}, hasMore=${pagination?.hasMore ?? "null"}, nextSkip=${pagination?.nextSkip ?? "null"}`),
    db_verification: "taggedArticleCount=2",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Tag-filtered search returns matching published articles with correct pagination metadata." : "Tag-filtered search results did not match the seeded dataset.",
  };
}

async function runCaseBe43(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  await seedBaseData();
  const response = await apiCall(baseUrl, "/search/articles?q=knowledge&skip=-1&limit=10", {
    method: "GET",
  });
  const pass = response.status === 400;

  return {
    case_id: "BE-43",
    description: "Reject invalid search pagination input",
    preconditions: "Search endpoint is reachable.",
    test_data: stringify({ q: "knowledge", skip: -1, limit: 10 }),
    steps: "GET /api/search/articles?q=knowledge&skip=-1&limit=10.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "400 Bad Request because skip must be a non-negative integer.",
    compare: buildCompare(pass, `status=${response.status}`),
    db_verification: "No database mutation expected.",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Search validation rejects negative skip values." : "Search endpoint accepted invalid pagination unexpectedly.",
  };
}

async function runCaseBe44(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_search_keyword_title",
    title: "Playbook for Incident Reviews",
    content: ["Operational checklist"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
    publishedAt: new Date("2026-04-08T12:03:00.000Z"),
  });
  await createArticleRecord({
    id: "ut_search_keyword_content",
    title: "Runbook reference",
    content: ["This guide includes a playbook section for outages."],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
    publishedAt: new Date("2026-04-08T12:02:00.000Z"),
  });
  await createArticleRecord({
    id: "ut_search_keyword_unrelated",
    title: "Office schedule",
    content: ["Nothing about operations here."],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
    publishedAt: new Date("2026-04-08T12:01:00.000Z"),
  });
  await createArticleRecord({
    id: "ut_search_keyword_draft",
    title: "Playbook draft",
    content: ["Draft content should stay hidden from search."],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });

  const response = await apiCall(baseUrl, "/search/articles?q=playbook&skip=0&limit=1", {
    method: "GET",
  });

  const parsed = response.parsedBody as {
    data?: {
      query?: string;
      items?: Array<{ id: string; highlightTerms?: string[] }>;
      pagination?: { total?: number; hasMore?: boolean; nextSkip?: number | null; limit?: number; skip?: number };
    };
  } | null;
  const itemIds = parsed?.data?.items?.map((item) => item.id) ?? [];
  const pagination = parsed?.data?.pagination;
  const highlightTerms = parsed?.data?.items?.[0]?.highlightTerms ?? [];
  const pass = response.status === 200 && parsed?.data?.query === "playbook" && itemIds.length === 1 && itemIds[0] === "ut_search_keyword_title" && pagination?.total === 2 && pagination?.hasMore === true && pagination?.nextSkip === 1 && highlightTerms.includes("playbook");

  return {
    case_id: "BE-44",
    description: "Search published articles by keyword with pagination",
    preconditions: "Published and draft articles exist with overlapping searchable content.",
    test_data: stringify({ q: "playbook", skip: 0, limit: 1 }),
    steps: "GET /api/search/articles?q=playbook&skip=0&limit=1.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK, only published keyword matches are returned, and pagination reflects the full match count.",
    compare: buildCompare(pass, `status=${response.status}, query=${parsed?.data?.query ?? "null"}, itemIds=${JSON.stringify(itemIds)}, total=${pagination?.total ?? "null"}, hasMore=${pagination?.hasMore ?? "null"}, nextSkip=${pagination?.nextSkip ?? "null"}, highlightTerms=${JSON.stringify(highlightTerms)}`),
    db_verification: "publishedKeywordMatches=2; draftKeywordMatchesExcluded=true",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Keyword search returns only published matches with correct pagination metadata." : "Keyword search behavior did not match the seeded dataset.",
  };
}

async function runCaseBe45(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_version_history_article",
    title: "Version history article",
    content: ["Current version content"],
    status: "DRAFT",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await prisma.articleVersion.create({
    data: {
      id: "ut_version_history_v1",
      articleId: "ut_version_history_article",
      updatedById: seed.users.authorOwner.id,
      contentSnapshot: ["Version one"] as never,
      updatedAt: new Date("2026-04-08T09:00:00.000Z"),
    },
  });
  await prisma.articleVersion.create({
    data: {
      id: "ut_version_history_v2",
      articleId: "ut_version_history_article",
      updatedById: seed.users.authorOwner.id,
      contentSnapshot: ["Version two"] as never,
      updatedAt: new Date("2026-04-08T10:00:00.000Z"),
    },
  });
  await prisma.articleVersion.create({
    data: {
      id: "ut_version_history_v3",
      articleId: "ut_version_history_article",
      updatedById: seed.users.authorOwner.id,
      contentSnapshot: ["Version three"] as never,
      updatedAt: new Date("2026-04-08T11:00:00.000Z"),
    },
  });
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);

  const response = await apiCall(baseUrl, "/articles/ut_version_history_article/versions", {
    method: "GET",
    token,
  });

  const parsed = response.parsedBody as { data?: Array<{ id: string; contentSnapshot?: unknown; updatedBy?: { id?: string } }> } | null;
  const versionIds = parsed?.data?.map((version) => version.id) ?? [];
  const firstSnapshot = JSON.stringify(parsed?.data?.[0]?.contentSnapshot ?? null);
  const pass = response.status === 200 && versionIds.length === 3 && versionIds[0] === "ut_version_history_v3" && versionIds[1] === "ut_version_history_v2" && versionIds[2] === "ut_version_history_v1" && firstSnapshot === JSON.stringify(["Version three"]);

  return {
    case_id: "BE-45",
    description: "Retrieve version history of an owned article",
    preconditions: "Authenticated author owns an article with multiple persisted versions.",
    test_data: stringify({ articleId: "ut_version_history_article" }),
    steps: "GET /api/articles/ut_version_history_article/versions with the owning author's bearer token.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK and versions are returned in descending updatedAt order.",
    compare: buildCompare(pass, `status=${response.status}, versionIds=${JSON.stringify(versionIds)}, firstSnapshot=${firstSnapshot}`),
    db_verification: "versionCount=3; newestVersionId=ut_version_history_v3",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Version history is returned for the owner in descending updatedAt order." : "Version history response order or payload was incorrect.",
  };
}

async function runCaseBe46(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_helpfulness_vote_article",
    title: "Helpfulness vote article",
    content: ["Helpfulness body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.viewer.email, seed.users.viewer.password);

  const beforeRatingCount = await prisma.helpfulnessRating.count({ where: { articleId: "ut_helpfulness_vote_article" } });

  const response = await apiCall(baseUrl, "/articles/ut_helpfulness_vote_article/helpfulness", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "HELPFUL" }),
  });

  const rating = await prisma.helpfulnessRating.findUnique({
    where: {
      articleId_userId: {
        articleId: "ut_helpfulness_vote_article",
        userId: seed.users.viewer.id,
      },
    },
  });
  const ratingCount = await prisma.helpfulnessRating.count({ where: { articleId: "ut_helpfulness_vote_article" } });
  const parsed = response.parsedBody as { data?: { helpfulCount?: number; notHelpfulCount?: number; userVote?: HelpfulnessValue | null } } | null;
  const pass = response.status === 200 && beforeRatingCount === 0 && rating?.value === HelpfulnessValue.HELPFUL && ratingCount === 1 && parsed?.data?.helpfulCount === 1 && parsed?.data?.notHelpfulCount === 0 && parsed?.data?.userVote === HelpfulnessValue.HELPFUL;

  return {
    case_id: "BE-46",
    description: "Create an initial helpfulness vote",
    preconditions: "Published article exists and authenticated user has not voted yet.",
    test_data: stringify({ articleId: "ut_helpfulness_vote_article", value: "HELPFUL" }),
    steps: "POST /api/articles/ut_helpfulness_vote_article/helpfulness with value HELPFUL.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK, one helpfulness row is saved, and the returned summary reflects HELPFUL for the acting user.",
    compare: buildCompare(pass, `status=${response.status}, beforeRatingCount=${beforeRatingCount}, ratingValue=${rating?.value ?? "null"}, ratingCount=${ratingCount}, summary=${JSON.stringify(parsed?.data ?? null)}`),
    db_verification: `beforeRatingCount=${beforeRatingCount}; ratingValue=${rating?.value ?? "null"}; ratingCount=${ratingCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Initial helpfulness vote is stored and summarized correctly with before/after persistence verified." : "Initial helpfulness vote flow did not match expectations.",
  };
}

async function runCaseBe47(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_helpfulness_update_article",
    title: "Helpfulness update article",
    content: ["Helpfulness update body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createHelpfulnessFixture({
    articleId: "ut_helpfulness_update_article",
    userId: seed.users.viewer.id,
    value: HelpfulnessValue.HELPFUL,
  });
  const token = await login(baseUrl, seed.users.viewer.email, seed.users.viewer.password);

  const beforeRating = await prisma.helpfulnessRating.findUnique({
    where: {
      articleId_userId: {
        articleId: "ut_helpfulness_update_article",
        userId: seed.users.viewer.id,
      },
    },
  });

  const response = await apiCall(baseUrl, "/articles/ut_helpfulness_update_article/helpfulness", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "NOT_HELPFUL" }),
  });

  const rating = await prisma.helpfulnessRating.findUnique({
    where: {
      articleId_userId: {
        articleId: "ut_helpfulness_update_article",
        userId: seed.users.viewer.id,
      },
    },
  });
  const ratingCount = await prisma.helpfulnessRating.count({ where: { articleId: "ut_helpfulness_update_article" } });
  const parsed = response.parsedBody as { data?: { helpfulCount?: number; notHelpfulCount?: number; userVote?: HelpfulnessValue | null } } | null;
  const pass = response.status === 200 && beforeRating?.value === HelpfulnessValue.HELPFUL && rating?.value === HelpfulnessValue.NOT_HELPFUL && ratingCount === 1 && parsed?.data?.helpfulCount === 0 && parsed?.data?.notHelpfulCount === 1 && parsed?.data?.userVote === HelpfulnessValue.NOT_HELPFUL;

  return {
    case_id: "BE-47",
    description: "Change an existing helpfulness vote",
    preconditions: "Published article exists and the authenticated user already has one helpfulness vote.",
    test_data: stringify({ articleId: "ut_helpfulness_update_article", value: "NOT_HELPFUL" }),
    steps: "POST /api/articles/ut_helpfulness_update_article/helpfulness after an existing HELPFUL vote for the same user.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK, the existing row is updated in place, and the returned summary reflects NOT_HELPFUL.",
    compare: buildCompare(pass, `status=${response.status}, beforeRatingValue=${beforeRating?.value ?? "null"}, afterRatingValue=${rating?.value ?? "null"}, ratingCount=${ratingCount}, summary=${JSON.stringify(parsed?.data ?? null)}`),
    db_verification: `beforeRatingValue=${beforeRating?.value ?? "null"}; afterRatingValue=${rating?.value ?? "null"}; ratingCount=${ratingCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Existing helpfulness vote is updated in place as expected with the correct before/after value transition." : "Helpfulness vote update behavior did not match the business rule.",
  };
}

async function runCaseBe48(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_reaction_switch_article",
    title: "Reaction switch article",
    content: ["Reaction switch body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createReactionFixture({
    articleId: "ut_reaction_switch_article",
    userId: seed.users.viewer.id,
    type: ReactionType.LIKE,
  });
  const token = await login(baseUrl, seed.users.viewer.email, seed.users.viewer.password);

  const beforeReaction = await prisma.reaction.findUnique({
    where: {
      articleId_userId: {
        articleId: "ut_reaction_switch_article",
        userId: seed.users.viewer.id,
      },
    },
  });

  const response = await apiCall(baseUrl, "/reactions", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId: "ut_reaction_switch_article", type: "LOVE" }),
  });

  const reaction = await prisma.reaction.findUnique({
    where: {
      articleId_userId: {
        articleId: "ut_reaction_switch_article",
        userId: seed.users.viewer.id,
      },
    },
  });
  const parsed = response.parsedBody as { data?: { likeCount?: number; loveCount?: number; userReaction?: ReactionType | null } } | null;
  const pass = response.status === 200 && beforeReaction?.type === ReactionType.LIKE && reaction?.type === ReactionType.LOVE && parsed?.data?.likeCount === 0 && parsed?.data?.loveCount === 1 && parsed?.data?.userReaction === ReactionType.LOVE;

  return {
    case_id: "BE-48",
    description: "Switch reaction type for the same article",
    preconditions: "Published article exists and the authenticated user already reacted with LIKE.",
    test_data: stringify({ articleId: "ut_reaction_switch_article", type: "LOVE" }),
    steps: "POST /api/reactions with the same articleId and a new type LOVE.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK, the existing reaction is updated from LIKE to LOVE and the summary counts change accordingly.",
    compare: buildCompare(pass, `status=${response.status}, beforeReaction=${beforeReaction?.type ?? "null"}, afterReaction=${reaction?.type ?? "null"}, likeCount=${parsed?.data?.likeCount ?? "null"}, loveCount=${parsed?.data?.loveCount ?? "null"}, userReaction=${parsed?.data?.userReaction ?? "null"}`),
    db_verification: `beforeReaction=${beforeReaction?.type ?? "null"}; afterReaction=${reaction?.type ?? "null"}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Reaction POST updates the existing row to the new type with the expected before/after transition." : "Reaction type switch did not produce the expected stored summary.",
  };
}

async function runCaseBe49(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  const token = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);
  const largeParagraph = "Large article content block ".repeat(200);
  const payload = {
    title: "Large Article",
    categoryId: seed.categories.childId,
    status: "DRAFT",
    content: Array.from({ length: 12 }, (_, index) => `${index + 1}: ${largeParagraph}`),
  };

  const beforeArticleCount = await prisma.article.count();
  const beforeVersionCount = await prisma.articleVersion.count();

  const response = await apiCall(baseUrl, "/articles", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const createdArticle = await prisma.article.findFirst({ where: { title: payload.title } });
  const versionCount = createdArticle ? await prisma.articleVersion.count({ where: { articleId: createdArticle.id } }) : 0;
  const afterArticleCount = await prisma.article.count();
  const afterVersionCount = await prisma.articleVersion.count();
  const responseContent = (response.parsedBody as { data?: { content?: unknown } } | null)?.data?.content;
  const storedContentMatches = JSON.stringify(createdArticle?.content ?? null) === JSON.stringify(payload.content);
  const responseContentMatches = JSON.stringify(responseContent ?? null) === JSON.stringify(payload.content);
  const pass = response.status === 201 && Boolean(createdArticle) && beforeArticleCount === 0 && afterArticleCount === 1 && beforeVersionCount === 0 && afterVersionCount === 1 && versionCount === 1 && storedContentMatches && responseContentMatches;

  return {
    case_id: "BE-49",
    description: "Create article with large JSON content payload",
    preconditions: "Authenticated author exists and the category is valid.",
    test_data: stringify({ title: payload.title, categoryId: payload.categoryId, status: payload.status, contentLength: payload.content.length, paragraphLength: largeParagraph.length }),
    steps: "POST /api/articles with a large content array payload.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "201 Created, article content is persisted without truncation, and one initial version snapshot is created.",
    compare: buildCompare(pass, `status=${response.status}, beforeArticleCount=${beforeArticleCount}, afterArticleCount=${afterArticleCount}, beforeVersionCount=${beforeVersionCount}, afterVersionCount=${afterVersionCount}, articlePersisted=${Boolean(createdArticle)}, versionCount=${versionCount}, storedContentMatches=${storedContentMatches}, responseContentMatches=${responseContentMatches}`),
    db_verification: `beforeArticleCount=${beforeArticleCount}; afterArticleCount=${afterArticleCount}; beforeVersionCount=${beforeVersionCount}; afterVersionCount=${afterVersionCount}; articleId=${createdArticle?.id ?? "null"}; versionCount=${versionCount}; storedContentMatches=${storedContentMatches}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Large JSON article content is preserved in both API response and database state, with the expected before/after persistence delta." : "Large article payload was not preserved as expected.",
  };
}

async function runCaseBe50(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  const token = await login(baseUrl, seed.users.viewer.email, seed.users.viewer.password);
  const payload = { content: "Test" };

  const beforeCommentCount = await prisma.comment.count();

  const response = await apiCall(baseUrl, "/articles/invalid_id/comments", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const commentCount = await prisma.comment.count();
  const pass = response.status === 404 && beforeCommentCount === 0 && commentCount === 0;

  return {
    case_id: "BE-50",
    description: "Create comment with invalid articleId",
    preconditions: "Authenticated user exists but target article does not exist.",
    test_data: stringify({ articleId: "invalid_id", ...payload }),
    steps: "POST /api/articles/invalid_id/comments with a non-existent articleId.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "404 Not Found and no comment row is persisted.",
    compare: buildCompare(pass, `status=${response.status}, beforeCommentCount=${beforeCommentCount}, afterCommentCount=${commentCount}`),
    db_verification: `beforeCommentCount=${beforeCommentCount}; afterCommentCount=${commentCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Comment creation against a missing article is rejected before persistence, with no DB delta before or after the request." : "Comment creation against a missing article produced an unexpected result.",
  };
}

async function runCaseBe58(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_article_invalid_pagination",
    title: "Invalid pagination article",
    content: ["Invalid pagination body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });

  const response = await apiCall(baseUrl, "/articles?status=PUBLISHED&skip=abc&limit=ten", {
    method: "GET",
  });
  const articleCount = await prisma.article.count({ where: { status: "PUBLISHED" } });
  const pass = response.status === 400 && articleCount === 1;

  return {
    case_id: "BE-58",
    description: "Reject article list with non-numeric pagination params",
    preconditions: "Published articles exist and the endpoint is reachable.",
    test_data: stringify({ status: "PUBLISHED", skip: "abc", limit: "ten" }),
    steps: "GET /api/articles?status=PUBLISHED&skip=abc&limit=ten.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "400 Bad Request because skip and limit must be valid integers.",
    compare: buildCompare(pass, `status=${response.status}, publishedArticleCount=${articleCount}`),
    db_verification: `publishedArticleCount=${articleCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Article pagination rejects non-numeric skip/limit values." : "Article pagination unexpectedly accepted non-numeric values.",
  };
}

async function runCaseBe59(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_comment_empty_pagination_article",
    title: "Comment empty pagination article",
    content: ["Comment empty pagination body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });

  const response = await apiCall(baseUrl, "/articles/ut_comment_empty_pagination_article/comments?skip=&limit=", {
    method: "GET",
  });
  const commentCount = await prisma.comment.count({ where: { articleId: "ut_comment_empty_pagination_article" } });
  const pass = response.status === 400 && commentCount === 0;

  return {
    case_id: "BE-59",
    description: "Reject comment list with empty pagination params",
    preconditions: "Published article exists and the comments endpoint is reachable.",
    test_data: stringify({ articleId: "ut_comment_empty_pagination_article", skip: "", limit: "" }),
    steps: "GET /api/articles/ut_comment_empty_pagination_article/comments?skip=&limit=.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "400 Bad Request because empty skip and limit query parameters are invalid.",
    compare: buildCompare(pass, `status=${response.status}, commentCount=${commentCount}`),
    db_verification: `commentCount=${commentCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Comment pagination rejects empty skip/limit values." : "Comment pagination unexpectedly accepted empty values.",
  };
}

async function runCaseBe60(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_search_default_one",
    title: "Playbook default search alpha",
    content: ["Playbook default body alpha"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  await createArticleRecord({
    id: "ut_search_default_two",
    title: "Playbook default search beta",
    content: ["Playbook default body beta"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });

  const response = await apiCall(baseUrl, "/search/articles?q=playbook", {
    method: "GET",
  });
  const parsed = response.parsedBody as {
    data?: {
      items?: Array<{ id: string }>;
      pagination?: { skip?: number; limit?: number; total?: number; hasMore?: boolean; nextSkip?: number | null };
    };
  } | null;
  const itemIds = parsed?.data?.items?.map((item) => item.id) ?? [];
  const pagination = parsed?.data?.pagination;
  const pass = response.status === 200 && itemIds.length === 2 && pagination?.skip === 0 && pagination?.limit === 10 && pagination?.total === 2 && pagination?.hasMore === false && pagination?.nextSkip === null;

  return {
    case_id: "BE-60",
    description: "Search uses default pagination when params are omitted",
    preconditions: "Published search matches exist and the search endpoint is reachable.",
    test_data: stringify({ q: "playbook", skip: undefined, limit: undefined }),
    steps: "GET /api/search/articles?q=playbook without skip and limit query params.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK and default pagination values skip=0 and limit=10 are applied.",
    compare: buildCompare(pass, `status=${response.status}, itemIds=${JSON.stringify(itemIds)}, pagination=${JSON.stringify(pagination ?? null)}`),
    db_verification: "No database mutation expected.",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Search pagination correctly falls back to default skip/limit when params are omitted." : "Search default pagination behavior did not match the expected contract.",
  };
}

async function runCaseBe61(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  for (let index = 0; index < 3; index += 1) {
    await createArticleRecord({
      id: `ut_skip_beyond_article_${index + 1}`,
      title: `Skip beyond article ${index + 1}`,
      content: [`Skip beyond body ${index + 1}`],
      status: "PUBLISHED",
      authorId: seed.users.authorOwner.id,
      categoryId: seed.categories.childId,
      publishedAt: new Date(`2026-04-08T1${index}:00:00.000Z`),
    });
  }

  const response = await apiCall(baseUrl, "/articles?status=PUBLISHED&skip=50&limit=10", {
    method: "GET",
  });
  const parsed = response.parsedBody as {
    data?: {
      items?: Array<{ id: string }>;
      pagination?: { hasMore?: boolean; nextSkip?: number | null; total?: number; skip?: number; limit?: number };
    };
  } | null;
  const itemIds = parsed?.data?.items?.map((item) => item.id) ?? [];
  const pagination = parsed?.data?.pagination;
  const pass = response.status === 200 && itemIds.length === 0 && pagination?.hasMore === false && pagination?.nextSkip === null;

  return {
    case_id: "BE-61",
    description: "Article list returns empty page when skip exceeds total records",
    preconditions: "Published articles exist but requested skip is larger than the result set.",
    test_data: stringify({ status: "PUBLISHED", skip: 50, limit: 10, seededTotal: 3 }),
    steps: "GET /api/articles?status=PUBLISHED&skip=50&limit=10.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "200 OK with an empty items array and no next page metadata when skip exceeds the total record count.",
    compare: buildCompare(pass, `status=${response.status}, itemIds=${JSON.stringify(itemIds)}, pagination=${JSON.stringify(pagination ?? null)}`),
    db_verification: "publishedArticleCount=3",
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Article pagination returns a stable empty page when skip exceeds the total record count." : "Article pagination did not handle a skip-beyond-total request as expected.",
  };
}

async function runCaseBe55(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_reaction_db_article",
    title: "Reaction DB assertion article",
    content: ["Reaction DB assertion body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.viewer.email, seed.users.viewer.password);
  const payload = { articleId: "ut_reaction_db_article", type: "LIKE" };

  const beforeReactionCount = await prisma.reaction.count({
    where: {
      articleId: payload.articleId,
      userId: seed.users.viewer.id,
    },
  });

  const response = await apiCall(baseUrl, "/reactions", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const afterReactionCount = await prisma.reaction.count({
    where: {
      articleId: payload.articleId,
      userId: seed.users.viewer.id,
    },
  });
  const storedReaction = await prisma.reaction.findUnique({
    where: {
      articleId_userId: {
        articleId: payload.articleId,
        userId: seed.users.viewer.id,
      },
    },
  });
  const parsed = response.parsedBody as { data?: { likeCount?: number; userReaction?: ReactionType | null } } | null;
  const pass = response.status === 200 && beforeReactionCount === 0 && afterReactionCount === 1 && storedReaction?.type === ReactionType.LIKE && parsed?.data?.likeCount === 1 && parsed?.data?.userReaction === ReactionType.LIKE;

  return {
    case_id: "BE-55",
    description: "Create reaction and verify DB state",
    preconditions: "User and article exist, and there is no prior reaction for the articleId + userId pair.",
    test_data: stringify(payload),
    steps: "POST /api/reactions and verify before/after database state for the same articleId + userId pair.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "1 record is inserted in the Reaction table, the articleId + userId combination exists exactly once, and the API summary reflects LIKE count 1.",
    compare: buildCompare(pass, `status=${response.status}, beforeReactionCount=${beforeReactionCount}, afterReactionCount=${afterReactionCount}, storedReaction=${storedReaction?.type ?? "null"}, likeCount=${parsed?.data?.likeCount ?? "null"}, userReaction=${parsed?.data?.userReaction ?? "null"}`),
    db_verification: `beforeReactionCount=${beforeReactionCount}; afterReactionCount=${afterReactionCount}; storedReaction=${storedReaction?.type ?? "null"}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Reaction mutation passed all three layers: API response, DB persistence, and aggregate summary side effect." : "Reaction mutation did not satisfy the expected before/after DB state or summary side effect.",
  };
}

async function runCaseBe56(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_bookmark_db_article",
    title: "Bookmark DB assertion article",
    content: ["Bookmark DB assertion body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.viewer.email, seed.users.viewer.password);
  const payload = { articleId: "ut_bookmark_db_article" };

  const beforeBookmarkCount = await prisma.bookmark.count({
    where: {
      articleId: payload.articleId,
      userId: seed.users.viewer.id,
    },
  });

  const createResponse = await apiCall(baseUrl, "/bookmarks", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const listResponse = await apiCall(baseUrl, "/bookmarks", {
    method: "GET",
    token,
  });

  const afterBookmarkCount = await prisma.bookmark.count({
    where: {
      articleId: payload.articleId,
      userId: seed.users.viewer.id,
    },
  });
  const storedBookmark = await prisma.bookmark.findUnique({
    where: {
      userId_articleId: {
        userId: seed.users.viewer.id,
        articleId: payload.articleId,
      },
    },
  });
  const listedIds = ((listResponse.parsedBody as { data?: Array<{ articleId: string }> } | null)?.data ?? []).map((bookmark) => bookmark.articleId);
  const pass = createResponse.status === 201 && listResponse.status === 200 && beforeBookmarkCount === 0 && afterBookmarkCount === 1 && Boolean(storedBookmark) && listedIds.includes(payload.articleId);

  return {
    case_id: "BE-56",
    description: "Bookmark creation persists in DB",
    preconditions: "User and published article exist, and the user has not bookmarked the article yet.",
    test_data: stringify(payload),
    steps: "POST /api/bookmarks, then GET /api/bookmarks, and verify before/after database state.",
    api_response: `create=HTTP ${createResponse.status} ${createResponse.rawBody}; list=HTTP ${listResponse.status} ${listResponse.rawBody}`,
    expected_result: "Bookmark record exists in DB with the correct userId and articleId, and the bookmark appears in the authenticated user's bookmark list.",
    compare: buildCompare(pass, `createStatus=${createResponse.status}, listStatus=${listResponse.status}, beforeBookmarkCount=${beforeBookmarkCount}, afterBookmarkCount=${afterBookmarkCount}, bookmarkExists=${Boolean(storedBookmark)}, listedIds=${JSON.stringify(listedIds)}`),
    db_verification: `beforeBookmarkCount=${beforeBookmarkCount}; afterBookmarkCount=${afterBookmarkCount}; bookmarkExists=${Boolean(storedBookmark)}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Bookmark mutation passed API response, DB persistence, and list side effect verification." : "Bookmark mutation did not satisfy the expected before/after DB state or list side effect.",
  };
}

async function runCaseBe57(baseUrl: string): Promise<CsvRow> {
  await resetDatabase();
  const seed = await seedBaseData();
  await createArticleRecord({
    id: "ut_comment_db_article",
    title: "Comment DB assertion article",
    content: ["Comment DB assertion body"],
    status: "PUBLISHED",
    authorId: seed.users.authorOwner.id,
    categoryId: seed.categories.childId,
  });
  const token = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);
  const payload = { content: "Test comment persistence" };

  const beforeCommentCount = await prisma.comment.count({ where: { articleId: "ut_comment_db_article" } });
  const beforeNotificationCount = await prisma.notification.count({
    where: {
      userId: seed.users.authorOwner.id,
      entityId: "ut_comment_db_article",
    },
  });

  const response = await apiCall(baseUrl, "/articles/ut_comment_db_article/comments", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const afterCommentCount = await prisma.comment.count({ where: { articleId: "ut_comment_db_article" } });
  const storedComment = await prisma.comment.findFirst({
    where: {
      articleId: "ut_comment_db_article",
      userId: seed.users.authorPeer.id,
      content: payload.content,
    },
  });
  const afterNotificationCount = await prisma.notification.count({
    where: {
      userId: seed.users.authorOwner.id,
      entityId: "ut_comment_db_article",
    },
  });
  const pass = response.status === 201 && beforeCommentCount === 0 && afterCommentCount === 1 && Boolean(storedComment) && beforeNotificationCount === 0 && afterNotificationCount === 1;

  return {
    case_id: "BE-57",
    description: "Create comment and verify persistence",
    preconditions: "Published article exists and the acting user is authenticated.",
    test_data: stringify({ articleId: "ut_comment_db_article", content: payload.content }),
    steps: "POST /api/articles/:articleId/comments and verify before/after comment persistence plus notification side effect.",
    api_response: `HTTP ${response.status} ${response.rawBody}`,
    expected_result: "Comment is stored with the correct articleId and userId, and the article author receives one notification as a side effect.",
    compare: buildCompare(pass, `status=${response.status}, beforeCommentCount=${beforeCommentCount}, afterCommentCount=${afterCommentCount}, commentExists=${Boolean(storedComment)}, beforeNotificationCount=${beforeNotificationCount}, afterNotificationCount=${afterNotificationCount}`),
    db_verification: `beforeCommentCount=${beforeCommentCount}; afterCommentCount=${afterCommentCount}; commentExists=${Boolean(storedComment)}; beforeNotificationCount=${beforeNotificationCount}; afterNotificationCount=${afterNotificationCount}`,
    status: pass ? "PASS" : "FAIL",
    notes: pass ? "Comment mutation passed API response, DB persistence, and notification side effect verification." : "Comment mutation did not satisfy the expected persistence or side effect checks.",
  };
}

function toCsv(rows: CsvRow[]): string {
  const header = [
    "case_id",
    "description",
    "preconditions",
    "test_data",
    "steps",
    "api_response",
    "expected_result",
    "compare",
    "db_verification",
    "status",
    "notes",
  ];

  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.case_id,
        row.description,
        row.preconditions,
        row.test_data,
        row.steps,
        row.api_response,
        row.expected_result,
        row.compare,
        row.db_verification,
        row.status,
        row.notes,
      ]
        .map(escapeCsv)
        .join(",")
    );
  }

  return `${lines.join("\n")}\n`;
}

function normalizeModuleDisplayName(moduleName: string): string {
  switch (moduleName) {
    case "User":
      return "Users/Auth";
    case "Bookmark":
      return "Bookmarks";
    case "Category":
      return "Categories";
    case "Tag":
      return "Tags";
    default:
      return moduleName;
  }
}

async function readTestcaseCatalog(): Promise<TestcaseCatalogRow[]> {
  const xml = await fs.readFile(TESTCASE_XML_PATH, "utf8");
  const casePattern = /<case>\s*<case_id>([^<]+)<\/case_id>[\s\S]*?<module>([^<]+)<\/module>[\s\S]*?<type>([^<]+)<\/type>[\s\S]*?<description>([^<]+)<\/description>/g;
  const rows: TestcaseCatalogRow[] = [];

  for (const match of xml.matchAll(casePattern)) {
    const caseId = match[1]?.trim();
    const moduleName = match[2]?.trim();
    const type = match[3]?.trim();
    const description = match[4]?.trim();
    if (!caseId || !moduleName || !type || !description) {
      continue;
    }

    rows.push({
      caseId,
      moduleName,
      displayName: normalizeModuleDisplayName(moduleName),
      type,
      description,
    });
  }

  return rows;
}

function buildModuleCoverage(testcaseCatalog: TestcaseCatalogRow[]): ModuleCoverageRow[] {
  const modules = new Map<string, string[]>();

  for (const testcase of testcaseCatalog) {
    const { caseId, moduleName } = testcase;
    const caseIds = modules.get(moduleName) ?? [];
    caseIds.push(caseId);
    modules.set(moduleName, caseIds);
  }

  return Array.from(modules.entries())
    .map(([moduleName, caseIds]) => ({
      moduleName,
      displayName: normalizeModuleDisplayName(moduleName),
      count: caseIds.length,
      caseIds,
    }))
    .sort((left, right) => right.count - left.count || left.displayName.localeCompare(right.displayName));
}

function buildRegressionSummary(rows: CsvRow[], moduleCoverage: ModuleCoverageRow[], testcaseCatalog: TestcaseCatalogRow[]): string {
  const total = rows.length;
  const passCount = rows.filter((row) => row.status === "PASS").length;
  const failCount = total - passCount;
  const generatedAt = new Date().toISOString();
  const failedCaseIds = rows.filter((row) => row.status === "FAIL").map((row) => row.case_id);
  const mutationCaseIds = rows
    .filter((row) => row.db_verification.includes("before") || row.db_verification.includes("after"))
    .map((row) => row.case_id);
  const sideEffectCaseIds = rows
    .filter((row) => /side effect|notification|summary|list/i.test(row.notes))
    .map((row) => row.case_id);
  const paginationNegativeCaseIds = testcaseCatalog
    .filter((row) => /pagination/i.test(row.description) && ["Negative", "Boundary", "Edge", "Empty"].includes(row.type))
    .map((row) => row.caseId);
  const paginationRobustnessCaseIds = testcaseCatalog
    .filter((row) => /pagination|page/i.test(row.description) && /default|empty|omit|omitted|exceeds|reject/i.test(row.description.toLowerCase()))
    .map((row) => row.caseId);
  const authorizationCaseIds = testcaseCatalog
    .filter((row) => ["Security"].includes(row.type))
    .map((row) => row.caseId);
  const inputValidationCaseIds = testcaseCatalog
    .filter((row) => ["Negative", "Boundary", "Empty", "Edge"].includes(row.type) && !/pagination/i.test(row.description))
    .map((row) => row.caseId);

  return [
    "# BACKEND TEST REPORT - TASK 26",
    "",
    "## 1. Execution Info",
    `- Generated at: ${generatedAt}`,
    "- Command: npm run test:task26:be",
    "- Harness: apps/backend/src/scripts/ut-backend.ts",
    `- Total cases: ${total}`,
    `- Passed: ${passCount}`,
    `- Failed: ${failCount}`,
    `- Failed case IDs: ${failedCaseIds.length > 0 ? failedCaseIds.join(", ") : "none"}`,
    "",
    "## 2. Coverage Overview",
    ...moduleCoverage.map((moduleRow) => `- ${moduleRow.displayName}: ${moduleRow.count} cases (${moduleRow.caseIds.join(", ")})`),
    "",
    "## 3. Mutation Testing Strategy",
    "- Mutation verification pattern: BEFORE snapshot -> API call -> AFTER snapshot -> persistence delta assertion -> side-effect validation when applicable.",
    `- Deep mutation cases: ${mutationCaseIds.join(", ")}`,
    `- Side-effect and aggregate verification cases: ${sideEffectCaseIds.join(", ")}`,
    "",
    "## 4. Negative Cases Coverage",
    `- Pagination validation cases: ${paginationNegativeCaseIds.join(", ")}`,
    `- Pagination robustness cases: ${paginationRobustnessCaseIds.join(", ")}`,
    `- Authorization and ownership cases: ${authorizationCaseIds.join(", ")}`,
    `- Input validation and boundary cases: ${inputValidationCaseIds.join(", ")}`,
    "",
    "## 5. Notes",
    "- Seed strategy: each case resets the database and seeds only the minimum dataset needed to keep cases isolated and reproducible.",
    "- Summary module counts and negative-case classifications are derived from prompt/TC/ikp-tc-ut.xml, so XML and harness must stay in sync.",
    "- Current pagination contract on core list endpoints uses skip, limit, hasMore, and nextSkip; no totalPages or hasPrev metadata is asserted unless the endpoint returns it.",
    "",
    "## 6. Conclusion",
    failCount === 0
      ? `- Backend regression suite passed cleanly with ${passCount}/${total} cases green, including expanded pagination negatives and deeper mutation persistence assertions.`
      : `- Backend regression suite completed with ${failCount} failing cases that need follow-up: ${failedCaseIds.join(", ")}`,
  ].join("\n");
}

async function main(): Promise<void> {
  const { server, baseUrl } = await startServer();

  try {
    const rows = [
      await runCaseBe01(baseUrl),
      await runCaseBe02(baseUrl),
      await runCaseBe03(baseUrl),
      await runCaseBe04(baseUrl),
      await runCaseBe05(baseUrl),
      await runCaseBe06(baseUrl),
      await runCaseBe07(baseUrl),
      await runCaseBe08(baseUrl),
      await runCaseBe09(baseUrl),
      await runCaseBe10(baseUrl),
      await runCaseBe11(baseUrl),
      await runCaseBe12(baseUrl),
      await runCaseBe13(baseUrl),
      await runCaseBe14(baseUrl),
      await runCaseBe15(baseUrl),
      await runCaseBe16(baseUrl),
      await runCaseBe17(baseUrl),
      await runCaseBe18(baseUrl),
      await runCaseBe19(baseUrl),
      await runCaseBe20(baseUrl),
      await runCaseBe21(baseUrl),
      await runCaseBe22(baseUrl),
      await runCaseBe23(baseUrl),
      await runCaseBe24(baseUrl),
      await runCaseBe25(baseUrl),
      await runCaseBe26(baseUrl),
      await runCaseBe27(baseUrl),
      await runCaseBe28(baseUrl),
      await runCaseBe29(baseUrl),
      await runCaseBe30(baseUrl),
      await runCaseBe31(baseUrl),
      await runCaseBe32(baseUrl),
      await runCaseBe33(baseUrl),
      await runCaseBe34(baseUrl),
      await runCaseBe35(baseUrl),
      await runCaseBe36(baseUrl),
      await runCaseBe37(baseUrl),
      await runCaseBe38(baseUrl),
      await runCaseBe39(baseUrl),
      await runCaseBe40(baseUrl),
      await runCaseBe41(baseUrl),
      await runCaseBe42(baseUrl),
      await runCaseBe43(baseUrl),
      await runCaseBe44(baseUrl),
      await runCaseBe45(baseUrl),
      await runCaseBe46(baseUrl),
      await runCaseBe47(baseUrl),
      await runCaseBe48(baseUrl),
      await runCaseBe49(baseUrl),
      await runCaseBe50(baseUrl),
      await runCaseBe55(baseUrl),
      await runCaseBe56(baseUrl),
      await runCaseBe57(baseUrl),
      await runCaseBe58(baseUrl),
      await runCaseBe59(baseUrl),
      await runCaseBe60(baseUrl),
      await runCaseBe61(baseUrl),
    ];
    const testcaseCatalog = await readTestcaseCatalog();
    const moduleCoverage = buildModuleCoverage(testcaseCatalog);

    await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
    await fs.writeFile(REPORT_PATH, toCsv(rows), "utf8");
    await fs.writeFile(SUMMARY_PATH, buildRegressionSummary(rows, moduleCoverage, testcaseCatalog), "utf8");

    const passCount = rows.filter((row) => row.status === "PASS").length;
    const failCount = rows.length - passCount;

    console.log(`Backend unit test report written to ${REPORT_PATH}`);
    console.log(`Backend regression summary written to ${SUMMARY_PATH}`);
    console.log(`Executed ${rows.length} backend cases: ${passCount} PASS, ${failCount} FAIL`);
  } finally {
    await stopServer(server);
    await prisma.$disconnect();
  }
}

main().catch(async (error: unknown) => {
  console.error(error);
  await prisma.$disconnect();
  process.exitCode = 1;
});