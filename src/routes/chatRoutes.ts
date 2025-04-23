// routes/chat.route.ts
import express from "express";
import { chatWithGemini } from "../controllers/chatController";
import { RequestHandler } from "express";

const router = express.Router();
router.post("/chat", chatWithGemini as RequestHandler);

export default router;
