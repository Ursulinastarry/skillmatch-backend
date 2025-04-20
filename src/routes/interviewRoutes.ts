import { createInterview, deleteInterview, getInterviewById, getInterviews, getInterviewsByApplicant, getInterviewsByJob, updateInterview } from "../controllers/interviewController"; 
import express from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();

router.post("/",protect,createInterview);
router.get("/:applicant_id",protect,getInterviewsByApplicant);
router.get("/",protect,getInterviewsByJob)
router.get("/",  protect,getInterviews);
router.put("/:id", protect,updateInterview);
router.delete("/:id", protect,deleteInterview);
router.get("/:id", protect,getInterviewById);


export default router;
