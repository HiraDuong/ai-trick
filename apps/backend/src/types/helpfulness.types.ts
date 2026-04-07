// Luvina
// Vu Huy Hoang - Dev2
import type { HelpfulnessValue } from "@prisma/client";

export interface HelpfulnessSummaryDto {
  articleId: string;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote: HelpfulnessValue | null;
}

export interface RateArticleHelpfulnessRequestDto {
  value: string;
}

export interface HelpfulnessRouteParamsDto {
  [key: string]: string;
  articleId: string;
}