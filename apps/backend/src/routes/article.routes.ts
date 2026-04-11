// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import {
  createArticle,
  deleteArticle,
  getArticleDetailController,
  getArticleListController,
  getArticleVersionsController,
  publishArticleController,
  unpublishArticleController,
  updateArticle,
} from "../controllers/article.controller";
import { authenticateUser } from "../middlewares/authenticate-user";
import { authorizeRoles } from "../middlewares/authorize-roles";
import { optionalAuthenticateUser } from "../middlewares/optional-authenticate-user";
import type { ArticleRouteParamsDto } from "../types/article.types";

const router = Router();

router.get("/articles", optionalAuthenticateUser, getArticleListController);
router.get<ArticleRouteParamsDto>("/articles/:articleId", optionalAuthenticateUser, getArticleDetailController);
router.post("/articles", authenticateUser, authorizeRoles("AUTHOR", "EDITOR"), createArticle);
router.get<ArticleRouteParamsDto>(
  "/articles/:articleId/versions",
  authenticateUser,
  authorizeRoles("AUTHOR", "EDITOR"),
  getArticleVersionsController
);
router.patch<ArticleRouteParamsDto>("/articles/:articleId/publish", authenticateUser, authorizeRoles("AUTHOR", "EDITOR"), publishArticleController);
router.patch<ArticleRouteParamsDto>("/articles/:articleId/unpublish", authenticateUser, authorizeRoles("AUTHOR", "EDITOR"), unpublishArticleController);
router.patch<ArticleRouteParamsDto>("/articles/:articleId", authenticateUser, authorizeRoles("AUTHOR", "EDITOR"), updateArticle);
router.put<ArticleRouteParamsDto>("/articles/:articleId", authenticateUser, authorizeRoles("AUTHOR", "EDITOR"), updateArticle);
router.delete<ArticleRouteParamsDto>("/articles/:articleId", authenticateUser, authorizeRoles("AUTHOR", "EDITOR"), deleteArticle);

export default router; 