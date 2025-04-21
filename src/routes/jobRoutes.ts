import {  getAllJobs,getJobsById,getJobsByEmployer,postJob,updateJob,deleteJob ,applyJob} from "../controllers/jobController"; 
import express from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();

router.post("/post",protect,postJob);
router.post("/apply",protect,applyJob);
router.get("/:employer_id",protect,getJobsByEmployer)
router.get("/",  protect,getAllJobs);
router.put("/:id", protect,updateJob);
router.delete("/:id", protect,deleteJob);
router.get("/:id", protect,getJobsById);


export default router;
