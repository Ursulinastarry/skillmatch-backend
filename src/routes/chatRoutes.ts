// routes/chat.route.ts
import express from "express";
import { chatWithGemini } from "../controllers/chatController";

const router = express.Router();

router.post("/chat", chatWithGemini);

export default router;
