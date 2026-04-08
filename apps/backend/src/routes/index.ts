// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import articleRouter from "./article.routes";
import authRouter from "./auth.routes";
import bookmarkRouter from "./bookmark.routes";
import categoryRouter from "./category.routes";
import commentRouter from "./comment.routes";
import dashboardRouter from "./dashboard.routes";
import helpfulnessRouter from "./helpfulness.routes";
import healthRouter from "./health.routes";
import notificationRouter from "./notification.routes";
import reactionRouter from "./reaction.routes";
import searchRouter from "./search.routes";
import statsRouter from "./stats.routes";
import versionRouter from "./version.routes";

const router = Router();

router.use("/auth", authRouter);
router.use(articleRouter);
router.use(bookmarkRouter);
router.use(categoryRouter);
router.use(commentRouter);
router.use(dashboardRouter);
router.use(helpfulnessRouter);
router.use(healthRouter);
router.use(notificationRouter);
router.use(reactionRouter);
router.use(searchRouter);
router.use(statsRouter);
router.use(versionRouter);

export default router;