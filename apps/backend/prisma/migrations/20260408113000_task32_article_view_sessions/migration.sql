-- CreateTable
CREATE TABLE "ArticleViewSession" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "viewerKeyHash" TEXT NOT NULL,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleViewSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleViewSession_articleId_viewerKeyHash_key" ON "ArticleViewSession"("articleId", "viewerKeyHash");

-- CreateIndex
CREATE INDEX "ArticleViewSession_lastViewedAt_idx" ON "ArticleViewSession"("lastViewedAt");

-- AddForeignKey
ALTER TABLE "ArticleViewSession" ADD CONSTRAINT "ArticleViewSession_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;