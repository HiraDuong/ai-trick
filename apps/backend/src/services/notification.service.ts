// Luvina
// Vu Huy Hoang - Dev2
import { NotificationType } from "@prisma/client";
import { createNotification, findNotificationsByUserId, markNotificationAsRead } from "../repositories/notification.repository";
import type { AuthenticatedUser } from "../types/auth.types";
import type { NotificationDto } from "../types/notification.types";
import { createHttpError } from "../utils/error.utils";

function ensureAuthenticatedUser(user: AuthenticatedUser | undefined): asserts user is AuthenticatedUser {
  if (!user) {
    throw createHttpError(401, "Authentication is required");
  }
}

function buildNotificationMessage(type: NotificationType): string {
  return type === "COMMENT_REPLY" ? "Someone replied to your comment." : "Someone commented on your article.";
}

export async function notifyUsersForComment(params: {
  articleAuthorId: string;
  actorUserId: string;
  articleId: string;
  parentCommentAuthorId?: string;
}): Promise<void> {
  const recipients = new Map<string, NotificationType>();

  if (params.articleAuthorId !== params.actorUserId) {
    recipients.set(params.articleAuthorId, "ARTICLE_COMMENT");
  }

  if (params.parentCommentAuthorId && params.parentCommentAuthorId !== params.actorUserId) {
    recipients.set(params.parentCommentAuthorId, "COMMENT_REPLY");
  }

  await Promise.all(
    Array.from(recipients.entries()).map(([userId, type]) => createNotification(userId, type, params.articleId))
  );
}

export async function getNotifications(user: AuthenticatedUser | undefined): Promise<NotificationDto[]> {
  ensureAuthenticatedUser(user);
  const notifications = await findNotificationsByUserId(user.id);

  return notifications.map((notification) => ({
    ...notification,
    message: buildNotificationMessage(notification.type),
  }));
}

export async function markAsRead(notificationId: string, user: AuthenticatedUser | undefined): Promise<NotificationDto> {
  ensureAuthenticatedUser(user);

  const normalizedNotificationId = notificationId.trim();
  if (!normalizedNotificationId) {
    throw createHttpError(400, "Notification id is required");
  }

  const notification = await markNotificationAsRead(user.id, normalizedNotificationId);
  if (!notification) {
    throw createHttpError(404, "Notification not found");
  }

  return {
    ...notification,
    message: buildNotificationMessage(notification.type),
  };
}