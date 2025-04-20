import {  getJobApplications,getUserApplications,updateApplicationStatus } from "../controllers/applicationController"; 
import express from "express";
const router = express.Router();

router.get("/",getJobApplications)
router.get("/:user_id",  getUserApplications);
router.put("/:id", updateApplicationStatus);

export default router;
