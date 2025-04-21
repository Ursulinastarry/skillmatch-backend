import { createInterview, deleteInterview, getInterviewById, getInterviews, getInterviewsByApplicant, getInterviewsByJob, updateInterview } from "../controllers/interviewController"; 
import express from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();

// Create a new interview
router.post("/", protect, createInterview);

// Get interviews by applicant
router.get("/applicant/:applicantId", protect, getInterviewsByApplicant);

// Get interviews by job
router.get("/job/:jobId", protect, getInterviewsByJob);

// Get a single interview by ID
router.get("/:id", protect, getInterviewById);

// Update an interview
router.put("/:id", protect, updateInterview);

// Delete an interview
router.delete("/:id", protect, deleteInterview);


export default router;
