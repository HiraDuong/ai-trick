// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import {
  getArticleHelpfulnessController,
  rateArticleHelpfulnessController,
} from "../controllers/helpfulness.controller";
import { authenticateUser } from "../middlewares/authenticate-user";
import { optionalAuthenticateUser } from "../middlewares/optional-authenticate-user";
import type { HelpfulnessRouteParamsDto } from "../types/helpfulness.types";

const router = Router();

router.get<HelpfulnessRouteParamsDto>("/articles/:articleId/helpfulness", optionalAuthenticateUser, getArticleHelpfulnessController);
router.post<HelpfulnessRouteParamsDto>("/articles/:articleId/helpfulness", authenticateUser, rateArticleHelpfulnessController);

export default router;