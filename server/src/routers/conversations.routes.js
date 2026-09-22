import { Router } from "express";
import { getConversationsList } from "../controllers/conversationList.controller.js";

const router = Router();

router.get("/conversation-list", getConversationsList);

export default router;
