// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import { getNotificationsController, markNotificationAsReadController } from "../controllers/notification.controller";
import { authenticateUser } from "../middlewares/authenticate-user";
import type { NotificationRouteParamsDto } from "../types/notification.types";

const router = Router();

router.get("/notifications", authenticateUser, getNotificationsController);
router.patch<NotificationRouteParamsDto>("/notifications/:notificationId/read", authenticateUser, markNotificationAsReadController);

export default router;