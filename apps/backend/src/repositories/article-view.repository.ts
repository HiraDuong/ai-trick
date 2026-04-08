import { createHash, randomUUID } from "node:crypto";
import prisma from "../config/prisma";

function hashViewerSessionKey(viewerSessionKey: string): string {
  return createHash("sha256").update(viewerSessionKey).digest("hex");
}

export async function touchArticleViewSession(
  articleId: string,
  viewerSessionKey: string,
  dedupWindowMs: number
): Promise<boolean> {
  const now = new Date();
  const dedupBoundary = new Date(now.getTime() - dedupWindowMs);
  const viewerKeyHash = hashViewerSessionKey(viewerSessionKey);

  const affectedRows = await prisma.$executeRaw`
    INSERT INTO "ArticleViewSession" ("id", "articleId", "viewerKeyHash", "lastViewedAt")
    VALUES (${randomUUID()}, ${articleId}, ${viewerKeyHash}, ${now})
    ON CONFLICT ("articleId", "viewerKeyHash")
    DO UPDATE SET "lastViewedAt" = EXCLUDED."lastViewedAt"
    WHERE "ArticleViewSession"."lastViewedAt" <= ${dedupBoundary}
  `;

  return affectedRows > 0;
}