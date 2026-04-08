// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import { getArticleReactionsController, reactToArticleController } from "../controllers/reaction.controller";
import { authenticateUser } from "../middlewares/authenticate-user";
import { optionalAuthenticateUser } from "../middlewares/optional-authenticate-user";
import type { ArticleRouteParamsDto } from "../types/article.types";

const router = Router();

router.get<ArticleRouteParamsDto>("/articles/:articleId/reactions", optionalAuthenticateUser, getArticleReactionsController);
router.post("/reactions", authenticateUser, reactToArticleController);

export default router;