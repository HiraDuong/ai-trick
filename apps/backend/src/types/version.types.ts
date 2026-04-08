// Luvina
// Vu Huy Hoang - Dev2
import type { Prisma } from "@prisma/client";

export interface ArticleVersionDto {
  id: string;
  articleId: string;
  contentSnapshot: Prisma.JsonValue;
  updatedAt: Date;
  updatedBy: {
    id: string;
    name: string;
  };
}

export interface RestoreArticleVersionRequestDto {
  versionId: string;
}