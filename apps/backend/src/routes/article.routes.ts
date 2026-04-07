// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import {
  createArticle,
  deleteArticle,
  getArticleDetailController,
  getArticleListController,
  publishArticleController,
  unpublishArticleController,
  updateArticle,
} from "../controllers/article.controller";
import { authenticateUser } from "../middlewares/authenticate-user";
import { optionalAuthenticateUser } from "../middlewares/optional-authenticate-user";
import type { ArticleRouteParamsDto } from "../types/article.types";

const router = Router();

router.get("/articles", optionalAuthenticateUser, getArticleListController);
router.get<ArticleRouteParamsDto>("/articles/:articleId", optionalAuthenticateUser, getArticleDetailController);
router.post("/articles", authenticateUser, createArticle);
router.patch<ArticleRouteParamsDto>("/articles/:articleId/publish", authenticateUser, publishArticleController);
router.patch<ArticleRouteParamsDto>("/articles/:articleId/unpublish", authenticateUser, unpublishArticleController);
router.patch<ArticleRouteParamsDto>("/articles/:articleId", authenticateUser, updateArticle);
router.delete<ArticleRouteParamsDto>("/articles/:articleId", authenticateUser, deleteArticle);

export default router; 