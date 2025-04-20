import express from "express";
import { protect } from "../middlewares/protect";
import { addUserSkill, getUserSkills, removeUserSkill } from "../controllers/userSkillsControllers";
const router = express.Router();

router.get("/",protect,getUserSkills);
router.post("/",protect,addUserSkill)
router.delete("/:id", protect,removeUserSkill);


export default router;
