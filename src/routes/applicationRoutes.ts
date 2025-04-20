import {  getJobApplications,getUserApplications,updateApplicationStatus } from "../controllers/applicationController"; 
import express from "express";
const router = express.Router();


router.put("/:id", updateApplicationStatus);

export default router;
