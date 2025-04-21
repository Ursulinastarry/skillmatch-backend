import {  getJobApplications,getUserApplications,updateApplicationStatus } from "../controllers/applicationController"; 
import express from "express";
import { protect} from "../middlewares/protect";
const router = express.Router();

router.get("/user/:user_id", protect, getUserApplications);
router.get("/:jobId", protect, getJobApplications);
router.put("/:id", protect, updateApplicationStatus);

export default router;
