// Luvina
// Vu Huy Hoang - Dev2
import type { NotificationType } from "@prisma/client";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  entityId: string;
  isRead: boolean;
  createdAt: Date;
  message: string;
}

export interface NotificationRouteParamsDto {
  [key: string]: string;
  notificationId: string;
}