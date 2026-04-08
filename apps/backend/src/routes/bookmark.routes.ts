// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import { createBookmarkController, deleteBookmarkController, getBookmarkStatusController, getBookmarksController } from "../controllers/bookmark.controller";
import { authenticateUser } from "../middlewares/authenticate-user";
import type { BookmarkRouteParamsDto } from "../types/bookmark.types";

const router = Router();

router.get<BookmarkRouteParamsDto>("/articles/:articleId/bookmark-status", authenticateUser, getBookmarkStatusController);
router.get("/bookmarks", authenticateUser, getBookmarksController);
router.post("/bookmarks", authenticateUser, createBookmarkController);
router.delete<BookmarkRouteParamsDto>("/bookmarks/:articleId", authenticateUser, deleteBookmarkController);

export default router;