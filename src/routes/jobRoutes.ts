import {  getAllJobs,getJobsById,getJobsByEmployer,postJob,updateJob,deleteJob } from "../controllers/jobController"; 
import express from "express";
const router = express.Router();

router.post("/post",postJob);
router.get("/:employer_id",getJobsByEmployer)
router.get("/",  getAllJobs);
router.get("/:id", getJobsById);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;
