// Luvina
// Vu Huy Hoang - Dev2
import { Prisma, type HelpfulnessValue } from "@prisma/client";
import prisma from "../config/prisma";

const articleHelpfulnessAccessSelect = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  authorId: true,
  status: true,
});

const helpfulnessRatingSelect = Prisma.validator<Prisma.HelpfulnessRatingSelect>()({
  articleId: true,
  userId: true,
  value: true,
});

export type ArticleHelpfulnessAccessRecord = Prisma.ArticleGetPayload<{ select: typeof articleHelpfulnessAccessSelect }>;
export type HelpfulnessRatingRecord = Prisma.HelpfulnessRatingGetPayload<{ select: typeof helpfulnessRatingSelect }>;

export interface UpsertHelpfulnessRatingData {
  articleId: string;
  userId: string;
  value: HelpfulnessValue;
}

export async function findArticleAccessById(articleId: string): Promise<ArticleHelpfulnessAccessRecord | null> {
  return prisma.article.findUnique({
    where: { id: articleId },
    select: articleHelpfulnessAccessSelect,
  });
}

export async function upsertHelpfulnessRating(data: UpsertHelpfulnessRatingData): Promise<HelpfulnessRatingRecord> {
  return prisma.helpfulnessRating.upsert({
    where: {
      articleId_userId: {
        articleId: data.articleId,
        userId: data.userId,
      },
    },
    update: {
      value: data.value,
    },
    create: {
      articleId: data.articleId,
      userId: data.userId,
      value: data.value,
    },
    select: helpfulnessRatingSelect,
  });
}

export async function findUserHelpfulnessRating(
  articleId: string,
  userId: string
): Promise<HelpfulnessRatingRecord | null> {
  return prisma.helpfulnessRating.findUnique({
    where: {
      articleId_userId: {
        articleId,
        userId,
      },
    },
    select: helpfulnessRatingSelect,
  });
}

export async function countHelpfulnessRatings(articleId: string): Promise<Array<{ value: HelpfulnessValue; count: number }>> {
  const groupedRatings = await prisma.helpfulnessRating.groupBy({
    by: ["value"],
    where: { articleId },
    _count: {
      _all: true,
    },
  });

  return groupedRatings.map((ratingGroup) => ({
    value: ratingGroup.value,
    count: ratingGroup._count._all,
  }));
}