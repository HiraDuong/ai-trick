// Luvina
// Vu Huy Hoang - Dev2
import { Router } from "express";
import { getCurrentUser, getEditorAccess, login, register } from "../controllers/auth.controller";
import { authenticateUser } from "../middlewares/authenticate-user";
import { authorizeRoles } from "../middlewares/authorize-roles";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateUser, getCurrentUser);
router.get("/editor-access", authenticateUser, authorizeRoles("EDITOR"), getEditorAccess);

export default router;