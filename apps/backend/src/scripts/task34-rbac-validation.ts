import bcrypt from "bcrypt";
import type { Server } from "node:http";
import { UserRole } from "@prisma/client";
import app from "../app";
import prisma from "../config/prisma";

interface SeedUsers {
  authorOwner: { id: string; email: string; password: string };
  authorPeer: { id: string; email: string; password: string };
  editor: { id: string; email: string; password: string };
  viewer: { id: string; email: string; password: string };
}

interface CaseResult {
  caseId: string;
  description: string;
  passed: boolean;
  notes: string;
}

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

async function seedBaseData(): Promise<{ users: SeedUsers; categoryId: string }> {
  const password = "Passw0rd!";
  const passwordHash = await bcrypt.hash(password, 10);

  const users: SeedUsers = {
    authorOwner: { id: "task34_author_owner", email: "task34.author.owner@example.com", password },
    authorPeer: { id: "task34_author_peer", email: "task34.author.peer@example.com", password },
    editor: { id: "task34_editor", email: "task34.editor@example.com", password },
    viewer: { id: "task34_viewer", email: "task34.viewer@example.com", password },
  };

  await prisma.user.createMany({
    data: [
      {
        id: users.authorOwner.id,
        name: "Task 34 Author Owner",
        email: users.authorOwner.email,
        passwordHash,
        role: UserRole.AUTHOR,
      },
      {
        id: users.authorPeer.id,
        name: "Task 34 Author Peer",
        email: users.authorPeer.email,
        passwordHash,
        role: UserRole.AUTHOR,
      },
      {
        id: users.editor.id,
        name: "Task 34 Editor",
        email: users.editor.email,
        passwordHash,
        role: UserRole.EDITOR,
      },
      {
        id: users.viewer.id,
        name: "Task 34 Viewer",
        email: users.viewer.email,
        passwordHash,
        role: UserRole.VIEWER,
      },
    ],
  });

  await prisma.category.create({
    data: {
      id: "task34_category",
      name: "Task 34 Category",
      description: "Category for Task 34 RBAC validation",
    },
  });

  await prisma.article.createMany({
    data: [
      {
        id: "task34_owner_draft",
        title: "Owner Draft",
        content: ["Owner draft content"] as never,
        status: "DRAFT",
        authorId: users.authorOwner.id,
        categoryId: "task34_category",
      },
      {
        id: "task34_peer_update_draft",
        title: "Peer Update Draft",
        content: ["Peer update draft content"] as never,
        status: "DRAFT",
        authorId: users.authorPeer.id,
        categoryId: "task34_category",
      },
      {
        id: "task34_peer_publish_draft",
        title: "Peer Publish Draft",
        content: ["Peer publish draft content"] as never,
        status: "DRAFT",
        authorId: users.authorPeer.id,
        categoryId: "task34_category",
      },
      {
        id: "task34_peer_restore_draft",
        title: "Peer Restore Draft",
        content: ["Current restore draft content"] as never,
        status: "DRAFT",
        authorId: users.authorPeer.id,
        categoryId: "task34_category",
      },
      {
        id: "task34_published_article",
        title: "Published Article",
        content: ["Published content"] as never,
        status: "PUBLISHED",
        publishedAt: new Date("2026-04-08T12:00:00.000Z"),
        authorId: users.authorPeer.id,
        categoryId: "task34_category",
      },
    ],
  });

  await prisma.articleVersion.createMany({
    data: [
      {
        id: "task34_restore_v1",
        articleId: "task34_peer_restore_draft",
        updatedById: users.authorPeer.id,
        contentSnapshot: ["Restore target content"] as never,
      },
      {
        id: "task34_restore_v2",
        articleId: "task34_peer_restore_draft",
        updatedById: users.authorPeer.id,
        contentSnapshot: ["Current restore draft content"] as never,
      },
    ],
  });

  return { users, categoryId: "task34_category" };
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

function buildCaseResult(caseId: string, description: string, passed: boolean, notes: string): CaseResult {
  return { caseId, description, passed, notes };
}

async function main(): Promise<void> {
  await resetDatabase();
  const seed = await seedBaseData();
  const { server, baseUrl } = await startServer();

  try {
    const authorOwnerToken = await login(baseUrl, seed.users.authorOwner.email, seed.users.authorOwner.password);
    const authorPeerToken = await login(baseUrl, seed.users.authorPeer.email, seed.users.authorPeer.password);
    const editorToken = await login(baseUrl, seed.users.editor.email, seed.users.editor.password);
    const viewerToken = await login(baseUrl, seed.users.viewer.email, seed.users.viewer.password);

    const results: CaseResult[] = [];

    const be58Response = (await apiCall(baseUrl, "/articles?status=DRAFT&skip=0&limit=50", {
      method: "GET",
      token: authorOwnerToken,
    })) as { status: number; parsedBody: { data?: { items?: Array<{ id: string }> } } | null };
    const be58Ids = be58Response.parsedBody?.data?.items?.map((item) => item.id) ?? [];
    results.push(buildCaseResult("BE-58", "AUTHOR can only see own drafts", be58Response.status === 200 && be58Ids.length === 1 && be58Ids[0] === "task34_owner_draft", `status=${be58Response.status}; ids=${JSON.stringify(be58Ids)}`));

    const be59Response = (await apiCall(baseUrl, "/articles?status=DRAFT&skip=0&limit=50", {
      method: "GET",
      token: editorToken,
    })) as { status: number; parsedBody: { data?: { items?: Array<{ id: string }> } } | null };
    const be59Ids = be59Response.parsedBody?.data?.items?.map((item) => item.id).sort() ?? [];
    results.push(buildCaseResult("BE-59", "EDITOR can see all drafts", be59Response.status === 200 && be59Ids.length === 4, `status=${be59Response.status}; ids=${JSON.stringify(be59Ids)}`));

    const be60Response = await apiCall(baseUrl, "/articles/task34_peer_update_draft", {
      method: "PATCH",
      token: authorOwnerToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Illegal peer update" }),
    });
    results.push(buildCaseResult("BE-60", "AUTHOR cannot update others' articles", be60Response.status === 403, `status=${be60Response.status}`));

    const be61Response = await apiCall(baseUrl, "/articles/task34_peer_update_draft", {
      method: "PATCH",
      token: editorToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Editor updated draft" }),
    });
    const be61Article = await prisma.article.findUnique({ where: { id: "task34_peer_update_draft" }, select: { title: true } });
    results.push(buildCaseResult("BE-61", "EDITOR can update any article", be61Response.status === 200 && be61Article?.title === "Editor updated draft", `status=${be61Response.status}; title=${be61Article?.title ?? "null"}`));

    const be62Response = await apiCall(baseUrl, "/articles/task34_peer_publish_draft/publish", {
      method: "PATCH",
      token: authorOwnerToken,
    });
    results.push(buildCaseResult("BE-62", "AUTHOR cannot publish others' articles", be62Response.status === 403, `status=${be62Response.status}`));

    const be63Response = await apiCall(baseUrl, "/articles/task34_peer_publish_draft/publish", {
      method: "PATCH",
      token: editorToken,
    });
    const be63Article = await prisma.article.findUnique({ where: { id: "task34_peer_publish_draft" }, select: { status: true } });
    results.push(buildCaseResult("BE-63", "EDITOR can publish any article", be63Response.status === 200 && be63Article?.status === "PUBLISHED", `status=${be63Response.status}; articleStatus=${be63Article?.status ?? "null"}`));

    const be64Response = await apiCall(baseUrl, "/articles/task34_peer_restore_draft/restore", {
      method: "POST",
      token: editorToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId: "task34_restore_v1" }),
    });
    const be64Article = await prisma.article.findUnique({ where: { id: "task34_peer_restore_draft" }, select: { content: true } });
    results.push(buildCaseResult("BE-64", "EDITOR can restore any version", be64Response.status === 200 && JSON.stringify(be64Article?.content ?? null) === JSON.stringify(["Restore target content"]), `status=${be64Response.status}; content=${JSON.stringify(be64Article?.content ?? null)}`));

    const be65Response = await apiCall(baseUrl, "/articles", {
      method: "POST",
      token: viewerToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Viewer article", categoryId: seed.categoryId, content: ["Viewer content"], status: "DRAFT" }),
    });
    results.push(buildCaseResult("BE-65", "VIEWER cannot create article", be65Response.status === 403, `status=${be65Response.status}`));

    const be66Response = (await apiCall(baseUrl, "/articles?skip=0&limit=50", {
      method: "GET",
      token: viewerToken,
    })) as { status: number; parsedBody: { data?: { items?: Array<{ id: string; status: string }> } } | null };
    const be66Items = be66Response.parsedBody?.data?.items ?? [];
    results.push(
      buildCaseResult(
        "BE-66",
        "VIEWER can only access published articles",
        be66Response.status === 200 &&
          be66Items.length >= 1 &&
          be66Items.every((item) => item.status === "PUBLISHED") &&
          !be66Items.some((item) => item.id === "task34_owner_draft" || item.id === "task34_peer_update_draft" || item.id === "task34_peer_restore_draft"),
        `status=${be66Response.status}; items=${JSON.stringify(be66Items)}`
      )
    );

    const be67OwnerResponse = await apiCall(baseUrl, "/reactions", {
      method: "POST",
      token: authorOwnerToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: "task34_owner_draft", type: "LIKE" }),
    });
    const be67PeerResponse = await apiCall(baseUrl, "/reactions", {
      method: "POST",
      token: authorPeerToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: "task34_owner_draft", type: "LOVE" }),
    });
    results.push(buildCaseResult("BE-67", "Reaction on draft restricted by ownership", be67OwnerResponse.status === 200 && be67PeerResponse.status === 403, `ownerStatus=${be67OwnerResponse.status}; ownerBody=${JSON.stringify(be67OwnerResponse.parsedBody)}; peerStatus=${be67PeerResponse.status}; peerBody=${JSON.stringify(be67PeerResponse.parsedBody)}`));

    const be68Response = await apiCall(baseUrl, "/reactions", {
      method: "POST",
      token: editorToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: "task34_owner_draft", type: "LAUGH" }),
    });
    const be68Reaction = await prisma.reaction.findFirst({
      where: {
        articleId: "task34_owner_draft",
        userId: seed.users.editor.id,
      },
      select: { type: true },
    });
    results.push(buildCaseResult("BE-68", "EDITOR not restricted by ownership", be68Response.status === 200 && be68Reaction?.type === "LAUGH", `status=${be68Response.status}; body=${JSON.stringify(be68Response.parsedBody)}; reaction=${be68Reaction?.type ?? "null"}`));

    const be69Response = await apiCall(baseUrl, "/auth/me", {
      method: "PATCH",
      token: viewerToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "EDITOR" }),
    });
    results.push(buildCaseResult("BE-69", "User cannot escalate role via API", be69Response.status === 404, `status=${be69Response.status}`));

    const failedCases = results.filter((result) => !result.passed);
    for (const result of results) {
      console.log(`${result.caseId} ${result.passed ? "PASS" : "FAIL"} - ${result.description} (${result.notes})`);
    }

    if (failedCases.length > 0) {
      throw new Error(`Task 34 RBAC validation failed for: ${failedCases.map((result) => result.caseId).join(", ")}`);
    }

    console.log(`Task 34 RBAC validation passed (${results.length}/${results.length})`);
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