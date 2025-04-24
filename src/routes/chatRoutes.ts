// routes/chat.route.ts
import express from "express";
import { chatWithGemini,getCareerRecommendations,getJobApplicantMatches,getSuggestedSkills } from "../controllers/chatController";
import { RequestHandler } from "express";

const router = express.Router();
router.post("/chat", chatWithGemini as RequestHandler);
router.get("/career/:userId", getCareerRecommendations as RequestHandler);
router.get("/matches/:jobId", getJobApplicantMatches as RequestHandler);
router.get("/suggested-skills/:jobId", getSuggestedSkills as RequestHandler);
export default router;
