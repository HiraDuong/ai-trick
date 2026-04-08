// Luvina
// Vu Huy Hoang - Dev2
import type { NextFunction, Request, Response } from "express";
import { createBookmark, getBookmarkStatus, getBookmarks, removeBookmark } from "../services/bookmark.service";
import type { ApiSuccessResponse } from "../types/api.types";
import type { BookmarkDto, BookmarkListItemDto, BookmarkRouteParamsDto, CreateBookmarkRequestDto } from "../types/bookmark.types";

export async function createBookmarkController(
  request: Request<Record<string, never>, ApiSuccessResponse<BookmarkDto>, CreateBookmarkRequestDto>,
  response: Response<ApiSuccessResponse<BookmarkDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await createBookmark(request.body.articleId, request.user);
    response.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteBookmarkController(
  request: Request<BookmarkRouteParamsDto, ApiSuccessResponse<BookmarkDto>>,
  response: Response<ApiSuccessResponse<BookmarkDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await removeBookmark(request.params.articleId, request.user);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getBookmarksController(
  request: Request,
  response: Response<ApiSuccessResponse<BookmarkListItemDto[]>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getBookmarks(request.user);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getBookmarkStatusController(
  request: Request<BookmarkRouteParamsDto, ApiSuccessResponse<BookmarkDto>>,
  response: Response<ApiSuccessResponse<BookmarkDto>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getBookmarkStatus(request.params.articleId, request.user);
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}