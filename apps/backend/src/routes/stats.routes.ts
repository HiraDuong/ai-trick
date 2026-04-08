// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import { getArticleStatsController } from "../controllers/stats.controller";
import { optionalAuthenticateUser } from "../middlewares/optional-authenticate-user";
import type { ArticleStatsRouteParamsDto } from "../types/article.types";

const router = Router();

router.get<ArticleStatsRouteParamsDto>("/articles/:articleId/stats", optionalAuthenticateUser, getArticleStatsController);

export default router;