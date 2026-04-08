import bcrypt from "bcrypt";
import type { Server } from "node:http";
import { UserRole } from "@prisma/client";
import app from "../app";
import prisma from "../config/prisma";

async function startServer(): Promise<{ server: Server; baseUrl: string }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to resolve validation server address"));
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
      "ArticleViewSession",
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

async function seedUsers(): Promise<{ authorId: string; viewerId: string; viewerEmail: string; password: string; categoryId: string }> {
  const password = "Passw0rd!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.createMany({
    data: [
      {
        id: "task32_author",
        name: "Task 32 Author",
        email: "task32.author@example.com",
        passwordHash,
        role: UserRole.AUTHOR,
      },
      {
        id: "task32_viewer",
        name: "Task 32 Viewer",
        email: "task32.viewer@example.com",
        passwordHash,
        role: UserRole.VIEWER,
      },
    ],
  });

  await prisma.category.create({
    data: {
      id: "task32_category",
      name: "Task 32 Category",
      description: "Category for Task 32 validation",
    },
  });

  return {
    authorId: "task32_author",
    viewerId: "task32_viewer",
    viewerEmail: "task32.viewer@example.com",
    password,
    categoryId: "task32_category",
  };
}

async function seedArticles(authorId: string, categoryId: string): Promise<void> {
  await prisma.article.createMany({
    data: [
      {
        id: "task32_published_article",
        title: "Task 32 Published Article",
        content: ["Published content for Task 32 validation"] as never,
        status: "PUBLISHED",
        publishedAt: new Date("2026-04-08T11:00:00.000Z"),
        authorId,
        categoryId,
      },
      {
        id: "task32_draft_article",
        title: "Task 32 Draft Article",
        content: ["Draft content for Task 32 validation"] as never,
        status: "DRAFT",
        authorId,
        categoryId,
      },
    ],
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

async function apiCall(baseUrl: string, pathName: string, init?: RequestInit & { token?: string }): Promise<{ status: number; parsedBody: unknown }> {
  const headers = new Headers(init?.headers);
  if (init?.token) {
    headers.set("Authorization", `Bearer ${init.token}`);
  }

  const response = await fetch(`${baseUrl}${pathName}`, {
    ...init,
    headers,
  });

  return {
    status: response.status,
    parsedBody: await response.json().catch(() => null),
  };
}

function assertValidation(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function validateBookmarkStatus(): Promise<void> {
  await resetDatabase();
  const seed = await seedUsers();
  await seedArticles(seed.authorId, seed.categoryId);

  const { server, baseUrl } = await startServer();

  try {
    const token = await login(baseUrl, seed.viewerEmail, seed.password);
    const beforeStatus = (await apiCall(baseUrl, "/articles/task32_published_article/bookmark-status", {
      method: "GET",
      token,
    })) as { status: number; parsedBody: { data?: { bookmarked?: boolean } } | null };

    const createBookmarkResponse = await apiCall(baseUrl, "/bookmarks", {
      method: "POST",
      token,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ articleId: "task32_published_article" }),
    });

    const afterStatus = (await apiCall(baseUrl, "/articles/task32_published_article/bookmark-status", {
      method: "GET",
      token,
    })) as { status: number; parsedBody: { data?: { bookmarked?: boolean } } | null };

    const draftStatus = await apiCall(baseUrl, "/articles/task32_draft_article/bookmark-status", {
      method: "GET",
      token,
    });

    assertValidation(beforeStatus.status === 200, "Bookmark status before create should return 200");
    assertValidation(beforeStatus.parsedBody?.data?.bookmarked === false, "Bookmark status before create should be false");
    assertValidation(createBookmarkResponse.status === 201, "Bookmark creation should return 201");
    assertValidation(afterStatus.status === 200, "Bookmark status after create should return 200");
    assertValidation(afterStatus.parsedBody?.data?.bookmarked === true, "Bookmark status after create should be true");
    assertValidation(draftStatus.status === 404, "Draft bookmark status should return 404");
  } finally {
    await stopServer(server);
  }
}

async function validatePersistentViewDedup(): Promise<void> {
  await resetDatabase();
  const seed = await seedUsers();
  await seedArticles(seed.authorId, seed.categoryId);

  const cookieHeader = "ut_view_session=task32-cookie";

  const firstServer = await startServer();
  try {
    const firstResponse = await apiCall(firstServer.baseUrl, "/articles/task32_published_article", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    assertValidation(firstResponse.status === 200, "First article read should return 200");
  } finally {
    await stopServer(firstServer.server);
  }

  const secondServer = await startServer();
  try {
    const secondResponse = await apiCall(secondServer.baseUrl, "/articles/task32_published_article", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    assertValidation(secondResponse.status === 200, "Second article read after restart should return 200");
  } finally {
    await stopServer(secondServer.server);
  }

  const storedArticle = await prisma.article.findUnique({
    where: { id: "task32_published_article" },
    select: { views: true },
  });
  const storedSessions = await prisma.articleViewSession.count({
    where: { articleId: "task32_published_article" },
  });

  assertValidation(storedArticle?.views === 1, `Expected persisted view count 1, received ${storedArticle?.views ?? "null"}`);
  assertValidation(storedSessions === 1, `Expected one persisted view session row, received ${storedSessions}`);
}

async function main(): Promise<void> {
  try {
    await validateBookmarkStatus();
    await validatePersistentViewDedup();
    console.log("Task 32 backend validation passed");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(async (error: unknown) => {
  console.error(error);
  await prisma.$disconnect();
  process.exitCode = 1;
});