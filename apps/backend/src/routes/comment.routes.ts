// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import { createCommentController, deleteCommentController, getArticleCommentsController } from "../controllers/comment.controller";
import { authenticateUser } from "../middlewares/authenticate-user";
import { optionalAuthenticateUser } from "../middlewares/optional-authenticate-user";
import type { CommentRouteParamsDto, DeleteCommentRouteParamsDto } from "../types/comment.types";

const router = Router();

router.get<CommentRouteParamsDto>("/articles/:articleId/comments", optionalAuthenticateUser, getArticleCommentsController);
router.post<CommentRouteParamsDto>("/articles/:articleId/comments", authenticateUser, createCommentController);
router.delete<DeleteCommentRouteParamsDto>("/comments/:commentId", authenticateUser, deleteCommentController);

export default router;