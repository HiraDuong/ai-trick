// Luvina
// Vu Huy Hoang - Dev2
import { Prisma, NotificationType } from "@prisma/client";
import prisma from "../config/prisma";

const notificationSelect = Prisma.validator<Prisma.NotificationSelect>()({
  id: true,
  type: true,
  entityId: true,
  isRead: true,
  createdAt: true,
});

export type NotificationRecord = Prisma.NotificationGetPayload<{ select: typeof notificationSelect }>;

export async function createNotification(userId: string, type: NotificationType, entityId: string): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type,
      entityId,
    },
  });
}

export async function findNotificationsByUserId(userId: string): Promise<NotificationRecord[]> {
  return prisma.notification.findMany({
    where: { userId },
    select: notificationSelect,
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }, { id: "desc" }],
    take: 20,
  });
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<NotificationRecord | null> {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
    select: notificationSelect,
  });

  if (!notification) {
    return null;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
    select: notificationSelect,
  });
}