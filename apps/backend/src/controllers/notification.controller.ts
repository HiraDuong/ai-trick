// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { getNotifications, markAsRead } from "../services/notification.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type { AuthenticatedUser } from "../types/auth.types";
import type { NotificationDto, NotificationRouteParamsDto } from "../types/notification.types";

function readRequestUser(request: unknown): AuthenticatedUser | undefined {
  return (request as Request & { user?: AuthenticatedUser }).user;
}

export async function getNotificationsController(
  request: Request,
  response: Response<ApiSuccessResponse<NotificationDto[]>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getNotifications(readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsReadController(
  request: Request<NotificationRouteParamsDto, ApiSuccessResponse<NotificationDto>>,
  response: Response<ApiSuccessResponse<NotificationDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await markAsRead(request.params.notificationId, readRequestUser(request));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}