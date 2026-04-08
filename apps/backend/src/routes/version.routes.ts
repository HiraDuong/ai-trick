// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import { getArticleVersionsController, restoreArticleVersionController } from "../controllers/version.controller";
import { authenticateUser } from "../middlewares/authenticate-user";
import type { ArticleRouteParamsDto } from "../types/article.types";

const router = Router();

router.get<ArticleRouteParamsDto>("/articles/:articleId/versions", authenticateUser, getArticleVersionsController);
router.post<ArticleRouteParamsDto>("/articles/:articleId/restore", authenticateUser, restoreArticleVersionController);

export default router;