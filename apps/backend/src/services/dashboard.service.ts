// Luvina
// Vu Huy Hoang - Dev2
import {
  findLatestPublishedArticles,
  findMostActiveAuthorCounts,
  findMostViewedArticles,
  findPopularTagCounts,
  findTagsByIds,
  findUsersByIds,
  type ActiveAuthorCountRecord,
  type AuthorRecord,
  type DashboardArticleRecord,
  type PopularTagCountRecord,
  type TagRecord,
} from "../repositories/dashboard.repository";
import type {
  ActiveAuthorDto,
  DashboardArticleSummaryDto,
  DashboardFeedResponseDto,
  PopularTagDto,
} from "../types/dashboard.types";

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

function mapArticleSummary(article: DashboardArticleRecord): DashboardArticleSummaryDto {
  return {
    id: article.id,
    title: article.title,
    views: article.views,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
    author: article.author,
    category: article.category,
    tags: article.articleTags.map((articleTag) => articleTag.tag),
  };
}

function mergeAuthorStats(authorCounts: ActiveAuthorCountRecord[], users: AuthorRecord[]): ActiveAuthorDto[] {
  const usersById = new Map(users.map((user) => [user.id, user]));

  return authorCounts
    .map((authorCount) => {
      const user = usersById.get(authorCount.authorId);
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        articleCount: authorCount._count.authorId,
      };
    })
    .filter(isDefined);
}

function mergeTagStats(tagCounts: PopularTagCountRecord[], tags: TagRecord[]): PopularTagDto[] {
  const tagsById = new Map(tags.map((tag) => [tag.id, tag]));

  return tagCounts
    .map((tagCount) => {
      const tag = tagsById.get(tagCount.tagId);
      if (!tag) {
        return null;
      }

      return {
        id: tag.id,
        name: tag.name,
        articleCount: tagCount._count.tagId,
      };
    })
    .filter(isDefined);
}

export async function getDashboardFeed(): Promise<DashboardFeedResponseDto> {
  const [latestArticles, mostViewedArticles, authorCounts, tagCounts] = await Promise.all([
    findLatestPublishedArticles(),
    findMostViewedArticles(),
    findMostActiveAuthorCounts(),
    findPopularTagCounts(),
  ]);

  const [authors, tags] = await Promise.all([
    findUsersByIds(authorCounts.map((authorCount) => authorCount.authorId)),
    findTagsByIds(tagCounts.map((tagCount) => tagCount.tagId)),
  ]);

  return {
    latestArticles: latestArticles.map(mapArticleSummary),
    mostViewedArticles: mostViewedArticles.map(mapArticleSummary),
    activeAuthors: mergeAuthorStats(authorCounts, authors),
    popularTags: mergeTagStats(tagCounts, tags),
  };
}