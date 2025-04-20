import {  getAllJobs,getJobsById,getJobsByEmployer,postJob,updateJob,deleteJob } from "../controllers/jobController"; 
import express from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();

router.post("/post",protect,postJob);
router.get("/:employer_id",getJobsByEmployer)
router.get("/",  getAllJobs);
router.get("/:id", getJobsById);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;
