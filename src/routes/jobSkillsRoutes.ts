import { addJobSkill, getJobSkills, removeJobSkill } from "../controllers/jobSkillsController"; 
import express from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();

router.post("/",protect,addJobSkill);
router.get("/",  protect,getJobSkills);
router.delete("/:id", protect,removeJobSkill);


export default router;
