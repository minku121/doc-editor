import { Router } from "express";
import { searchUsers } from "./users.controller";
import { authMiddleware } from "../../core/middleware";

const router = Router();

router.get("/", authMiddleware, searchUsers);

export default router;
