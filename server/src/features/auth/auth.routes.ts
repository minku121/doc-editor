import { Router } from "express";
import { register, login, logout, getMe } from "./auth.controller";
import { authMiddleware } from "../../core/middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;
