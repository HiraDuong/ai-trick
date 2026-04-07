// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import { getDashboardFeedController } from "../controllers/dashboard.controller";

const router = Router();

router.get("/dashboard/feed", getDashboardFeedController);

export default router;