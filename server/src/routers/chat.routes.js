import { Router } from "express";
import { chat, testGemini } from "../controllers/chat.controller.js";

const router = Router();
router.post("/chat", chat);
router.get("/test-gemini", testGemini);

export default router;
