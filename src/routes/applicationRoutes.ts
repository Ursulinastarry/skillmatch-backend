import {  getJobApplications,getUserApplications,updateApplicationStatus } from "../controllers/applicationController"; 
import express from "express";
import { protect} from "../middlewares/protect";
const router = express.Router();

router.get("/jobs/:jobId", protect, getJobApplications);
router.get("/users/:userId", protect, getUserApplications);
router.put("/:id", protect, updateApplicationStatus);

export default router;
