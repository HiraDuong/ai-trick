// Luvina
// Vu Huy Hoang - Dev2
import prisma from "../config/prisma";

export async function findArticleStatsById(articleId: string): Promise<{
  views: number;
  comments: number;
  helpful: number;
  notHelpful: number;
} | null> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      views: true,
      _count: {
        select: {
          comments: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  if (!article) {
    return null;
  }

  const [helpful, notHelpful] = await Promise.all([
    prisma.helpfulnessRating.count({
      where: {
        articleId,
        value: "HELPFUL",
      },
    }),
    prisma.helpfulnessRating.count({
      where: {
        articleId,
        value: "NOT_HELPFUL",
      },
    }),
  ]);

  return {
    views: article.views,
    comments: article._count.comments,
    helpful,
    notHelpful,
  };
}