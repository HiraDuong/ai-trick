-- Luvina
-- Vu Huy Hoang - Dev2
-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "publishedAt" TIMESTAMP(3);

UPDATE "Article"
SET "publishedAt" = "createdAt"
WHERE "status" = 'PUBLISHED' AND "publishedAt" IS NULL;

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");
