import {  getAllJobs,getJobsById,getJobsByEmployer,postJob,updateJob,deleteJob ,applyJob,getJobApplications,getUserApplications} from "../controllers/jobController"; 
import express from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();

router.post("/post",protect,postJob);
router.post("/apply",protect,applyJob);
router.get("/:employer_id",protect,getJobsByEmployer)
router.get("/",  protect,getAllJobs);
router.get("/:id", protect,getJobsById);
router.get("/:id",protect,getJobApplications)
router.get("/:user_id", protect, getUserApplications);
router.put("/:id", protect,updateJob);
router.delete("/:id", protect,deleteJob);


export default router;
