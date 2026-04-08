// Luvina
// Vu Huy Hoang - Dev2
import { Prisma, ReactionType } from "@prisma/client";
import prisma from "../config/prisma";

const reactionSelect = Prisma.validator<Prisma.ReactionSelect>()({
  articleId: true,
  type: true,
});

export type ReactionRecord = Prisma.ReactionGetPayload<{ select: typeof reactionSelect }>;

export async function findArticleReactions(articleId: string): Promise<ReactionRecord[]> {
  return prisma.reaction.findMany({
    where: { articleId },
    select: reactionSelect,
  });
}

export async function findUserReaction(articleId: string, userId: string): Promise<ReactionRecord | null> {
  return prisma.reaction.findFirst({
    where: {
      articleId,
      userId,
    },
    select: reactionSelect,
  });
}

export async function upsertReaction(articleId: string, userId: string, type: ReactionType): Promise<void> {
  await prisma.reaction.upsert({
    where: {
      articleId_userId: {
        articleId,
        userId,
      },
    },
    update: {
      type,
    },
    create: {
      articleId,
      userId,
      type,
    },
  });
}

export async function deleteReaction(articleId: string, userId: string): Promise<void> {
  await prisma.reaction.deleteMany({
    where: {
      articleId,
      userId,
    },
  });
}