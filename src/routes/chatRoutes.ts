// routes/chat.route.ts
import express from "express";
import { chatWithGemini,getCareerRecommendations,getJobApplicantMatches,getSuggestedSkills } from "../controllers/chatController";
import { RequestHandler } from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();
router.post("/chat", chatWithGemini as RequestHandler);
router.get("/career/:userId", protect,getCareerRecommendations as RequestHandler);
router.get("/matches/:jobId", protect,getJobApplicantMatches as RequestHandler);
router.get("/suggested-skills/:jobId", protect,getSuggestedSkills as RequestHandler);
export default router;
