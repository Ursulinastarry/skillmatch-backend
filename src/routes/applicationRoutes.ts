import {  getJobApplications,getUserApplications,updateApplicationStatus } from "../controllers/applicationController"; 
import express from "express";
import { protect} from "../middlewares/protect";
const router = express.Router();

router.get("/jobs/:id",protect,getJobApplications)
router.get("/users/:user_id",protect,  getUserApplications);
router.put("/:id", protect,updateApplicationStatus);

export default router;
