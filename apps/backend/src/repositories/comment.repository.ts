// Luvina
// Vu Huy Hoang - Dev2
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";

const commentSelect = Prisma.validator<Prisma.CommentSelect>()({
  id: true,
  content: true,
  articleId: true,
  userId: true,
  parentId: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
});

const articleCommentAccessSelect = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  authorId: true,
  status: true,
});

const commentParentAccessSelect = Prisma.validator<Prisma.CommentSelect>()({
  id: true,
  articleId: true,
  userId: true,
  parentId: true,
  deletedAt: true,
});

export type CommentRecord = Prisma.CommentGetPayload<{ select: typeof commentSelect }>;
export type ArticleCommentAccessRecord = Prisma.ArticleGetPayload<{ select: typeof articleCommentAccessSelect }>;
export type CommentParentAccessRecord = Prisma.CommentGetPayload<{ select: typeof commentParentAccessSelect }>;

export interface CreateCommentData {
  content: string;
  articleId: string;
  userId: string;
  parentId?: string;
}

export interface CommentListParams {
  articleId: string;
  skip: number;
  take: number;
}

export async function findArticleAccessById(articleId: string): Promise<ArticleCommentAccessRecord | null> {
  return prisma.article.findUnique({
    where: { id: articleId },
    select: articleCommentAccessSelect,
  });
}

export async function findParentCommentById(commentId: string): Promise<CommentParentAccessRecord | null> {
  return prisma.comment.findUnique({
    where: { id: commentId },
    select: commentParentAccessSelect,
  });
}

export async function findCommentById(commentId: string): Promise<CommentParentAccessRecord | null> {
  return prisma.comment.findUnique({
    where: { id: commentId },
    select: commentParentAccessSelect,
  });
}

export async function createComment(data: CreateCommentData): Promise<CommentRecord> {
  return prisma.comment.create({
    data: {
      content: data.content,
      articleId: data.articleId,
      userId: data.userId,
      ...(data.parentId ? { parentId: data.parentId } : {}),
    },
    select: commentSelect,
  });
}

export async function findTopLevelComments({ articleId, skip, take }: CommentListParams): Promise<CommentRecord[]> {
  return prisma.comment.findMany({
    where: {
      articleId,
      parentId: null,
    },
    select: commentSelect,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    skip,
    take,
  });
}

export async function findRepliesByParentIds(articleId: string, parentIds: string[]): Promise<CommentRecord[]> {
  if (parentIds.length === 0) {
    return [];
  }

  return prisma.comment.findMany({
    where: {
      articleId,
      parentId: {
        in: parentIds,
      },
    },
    select: commentSelect,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
}

export async function softDeleteComment(commentId: string): Promise<{ id: string; deletedAt: Date | null }> {
  return prisma.comment.update({
    where: { id: commentId },
    data: {
      deletedAt: new Date(),
    },
    select: {
      id: true,
      deletedAt: true,
    },
  });
}