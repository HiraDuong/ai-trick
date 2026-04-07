// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import { searchArticlesController } from "../controllers/search.controller";

const router = Router();

router.get("/search/articles", searchArticlesController);

export default router;