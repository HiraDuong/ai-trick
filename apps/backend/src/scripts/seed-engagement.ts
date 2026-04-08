// Luvina
// Vu Huy Hoang - Dev2
import bcrypt from "bcrypt";
import {
  ArticleStatus,
  HelpfulnessValue,
  Prisma,
  UserRole,
} from "@prisma/client";
import prisma from "../config/prisma";

const SEED_PASSWORD = "Hackathon123!";
const ROOT_CATEGORY_NAME = "Engineering Playbooks";
const ROOT_CATEGORY_DESCRIPTION = "Seeded category for article engagement verification flows.";

const SEEDED_USERS = [
  {
    email: "seed.author@ikp.local",
    name: "Seed Author",
    role: UserRole.AUTHOR,
  },
  {
    email: "seed.reviewer1@ikp.local",
    name: "Seed Reviewer One",
    role: UserRole.VIEWER,
  },
  {
    email: "seed.reviewer2@ikp.local",
    name: "Seed Reviewer Two",
    role: UserRole.VIEWER,
  },
  {
    email: "seed.reviewer3@ikp.local",
    name: "Seed Reviewer Three",
    role: UserRole.VIEWER,
  },
] as const;

const ENGAGEMENT_ARTICLE_TITLE = "Building a reliable knowledge-sharing workflow";
const ZERO_VOTE_ARTICLE_TITLE = "Launching article feedback from zero";

const ENGAGEMENT_ARTICLE_CONTENT: Prisma.InputJsonValue = [
  { type: "heading", text: "Why this article exists" },
  {
    type: "paragraph",
    text: "Teams need a repeatable path from project delivery to reusable internal knowledge. This seeded article is used to verify public article rendering, comments, and helpfulness voting end to end.",
  },
  { type: "heading", text: "Recommended workflow" },
  {
    type: "bulletList",
    content: [
      { text: "Capture the implementation decisions while context is still fresh." },
      { text: "Publish one concise article before expanding into long-form documentation." },
      { text: "Track reader feedback to learn whether the article is actually useful." },
    ],
  },
  {
    type: "quote",
    text: "Knowledge compounds only when the next team can find it, trust it, and improve it.",
  },
];

const ZERO_VOTE_ARTICLE_CONTENT: Prisma.InputJsonValue = [
  { type: "heading", text: "Testing the empty engagement state" },
  {
    type: "paragraph",
    text: "This published article intentionally starts with zero helpfulness votes so the UI can be reviewed in its empty state without changing code or database records manually.",
  },
];

async function upsertUser(user: (typeof SEEDED_USERS)[number], passwordHash: string) {
  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      role: user.role,
      passwordHash,
    },
    create: {
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash,
    },
  });
}

async function ensureCategory() {
  const existingCategory = await prisma.category.findFirst({
    where: {
      parentId: null,
      name: ROOT_CATEGORY_NAME,
    },
  });

  if (existingCategory) {
    return prisma.category.update({
      where: { id: existingCategory.id },
      data: { description: ROOT_CATEGORY_DESCRIPTION },
    });
  }

  return prisma.category.create({
    data: {
      name: ROOT_CATEGORY_NAME,
      description: ROOT_CATEGORY_DESCRIPTION,
    },
  });
}

async function ensureTags(tagNames: string[]) {
  return Promise.all(
    tagNames.map((tagName) =>
      prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      })
    )
  );
}

async function ensureArticle(input: {
  title: string;
  content: Prisma.InputJsonValue;
  authorId: string;
  categoryId: string;
  views: number;
  tagIds: string[];
}) {
  const existingArticle = await prisma.article.findFirst({
    where: {
      title: input.title,
      authorId: input.authorId,
    },
    select: { id: true },
  });

  const articleData = {
    title: input.title,
    content: input.content,
    status: ArticleStatus.PUBLISHED,
    publishedAt: new Date("2026-04-08T09:00:00.000Z"),
    views: input.views,
    authorId: input.authorId,
    categoryId: input.categoryId,
  };

  const article = existingArticle
    ? await prisma.article.update({
        where: { id: existingArticle.id },
        data: articleData,
      })
    : await prisma.article.create({
        data: articleData,
      });

  await prisma.articleTag.deleteMany({ where: { articleId: article.id } });

  if (input.tagIds.length > 0) {
    await prisma.articleTag.createMany({
      data: input.tagIds.map((tagId) => ({ articleId: article.id, tagId })),
      skipDuplicates: true,
    });
  }

  return article;
}

async function ensureComment(articleId: string, userId: string, content: string, parentId?: string) {
  const existingComment = await prisma.comment.findFirst({
    where: {
      articleId,
      userId,
      content,
      ...(parentId ? { parentId } : { parentId: null }),
    },
  });

  if (existingComment) {
    return existingComment;
  }

  return prisma.comment.create({
    data: {
      articleId,
      userId,
      content,
      ...(parentId ? { parentId } : {}),
    },
  });
}

async function ensureHelpfulnessRating(articleId: string, userId: string, value: HelpfulnessValue) {
  return prisma.helpfulnessRating.upsert({
    where: {
      articleId_userId: {
        articleId,
        userId,
      },
    },
    update: { value },
    create: { articleId, userId, value },
  });
}

async function clearHelpfulnessRatings(articleId: string, keepUserIds: string[]) {
  await prisma.helpfulnessRating.deleteMany({
    where: {
      articleId,
      userId: {
        notIn: keepUserIds,
      },
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const seededUsers = await Promise.all(
    SEEDED_USERS.map((user) => upsertUser(user, passwordHash))
  );
  const author = seededUsers[0]!;
  const reviewerOne = seededUsers[1]!;
  const reviewerTwo = seededUsers[2]!;
  const reviewerThree = seededUsers[3]!;

  const category = await ensureCategory();
  const engagementTags = await ensureTags(["knowledge-base", "engagement", "workflow"]);
  const zeroVoteTags = await ensureTags(["testing", "empty-state"]);

  const seededArticle = await ensureArticle({
    title: ENGAGEMENT_ARTICLE_TITLE,
    content: ENGAGEMENT_ARTICLE_CONTENT,
    authorId: author.id,
    categoryId: category.id,
    views: 184,
    tagIds: engagementTags.map((tag) => tag.id),
  });

  const zeroVoteArticle = await ensureArticle({
    title: ZERO_VOTE_ARTICLE_TITLE,
    content: ZERO_VOTE_ARTICLE_CONTENT,
    authorId: author.id,
    categoryId: category.id,
    views: 12,
    tagIds: zeroVoteTags.map((tag) => tag.id),
  });

  const topLevelComment = await ensureComment(
    seededArticle.id,
    reviewerOne.id,
    "The workflow section is clear and immediately reusable for a real handoff."
  );
  await ensureComment(
    seededArticle.id,
    author.id,
    "Good catch. I will add a checklist for release retrospectives next.",
    topLevelComment.id
  );

  await Promise.all([
    ensureHelpfulnessRating(seededArticle.id, reviewerOne.id, HelpfulnessValue.HELPFUL),
    ensureHelpfulnessRating(seededArticle.id, reviewerTwo.id, HelpfulnessValue.HELPFUL),
    ensureHelpfulnessRating(seededArticle.id, reviewerThree.id, HelpfulnessValue.NOT_HELPFUL),
  ]);

  await clearHelpfulnessRatings(seededArticle.id, [reviewerOne.id, reviewerTwo.id, reviewerThree.id]);
  await prisma.helpfulnessRating.deleteMany({ where: { articleId: zeroVoteArticle.id } });

  console.log(
    JSON.stringify(
      {
        credentials: {
          password: SEED_PASSWORD,
          author: author.email,
          helpfulVoter: reviewerOne.email,
          secondHelpfulVoter: reviewerTwo.email,
          notHelpfulVoter: reviewerThree.email,
        },
        articles: {
          engagement: seededArticle.id,
          zeroVotes: zeroVoteArticle.id,
        },
        helpfulness: {
          engagementArticle: {
            helpful: 2,
            notHelpful: 1,
          },
          zeroVoteArticle: {
            helpful: 0,
            notHelpful: 0,
          },
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });