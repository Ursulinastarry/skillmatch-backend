import { addJobSkill, getJobSkills, removeJobSkill } from "../controllers/jobSkillsController"; 
import express from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();

router.post("/:jobId", protect, addJobSkill);
router.get("/:jobId", getJobSkills);
router.delete("/:jobId/:skillId", protect, removeJobSkill);


export default router;
