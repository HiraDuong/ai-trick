// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import articleRouter from "./article.routes";
import authRouter from "./auth.routes";
import categoryRouter from "./category.routes";
import commentRouter from "./comment.routes";
import dashboardRouter from "./dashboard.routes";
import helpfulnessRouter from "./helpfulness.routes";
import healthRouter from "./health.routes";
import searchRouter from "./search.routes";

const router = Router();

router.use("/auth", authRouter);
router.use(articleRouter);
router.use(categoryRouter);
router.use(commentRouter);
router.use(dashboardRouter);
router.use(helpfulnessRouter);
router.use(healthRouter);
router.use(searchRouter);

export default router;