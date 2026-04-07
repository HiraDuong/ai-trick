// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import { getCategoryTreeController } from "../controllers/category.controller";

const router = Router();

router.get("/categories/tree", getCategoryTreeController);

export default router;