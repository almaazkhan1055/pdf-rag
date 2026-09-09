import { Router } from "express";
import { chat } from "../controllers/chat.controller.js";

const router = Router();
router.post("/chat", chat);

export default router;
