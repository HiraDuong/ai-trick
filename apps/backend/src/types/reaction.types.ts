// Luvina
// Vu Huy Hoang - Dev2
import type { ReactionType } from "@prisma/client";

export interface ReactionSummaryDto {
  articleId: string;
  likeCount: number;
  loveCount: number;
  laughCount: number;
  userReaction: ReactionType | null;
}

export interface CreateReactionRequestDto {
  articleId: string;
  type: string;
}