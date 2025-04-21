// routes/chat.route.ts
import express from "express";
import { chatWithGPT } from "../controllers/chatController";

const router = express.Router();

router.post("/", chatWithGPT);

export default router;
