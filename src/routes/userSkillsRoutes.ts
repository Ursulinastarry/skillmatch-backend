import express from "express";
import { protect } from "../middlewares/protect";
import { addUserSkill, getUserSkills, removeUserSkill } from "../controllers/userSkillsControllers";
const router = express.Router();

router.get("/:userId", protect, getUserSkills);
router.post("/:userId", protect, addUserSkill);
router.delete("/userId/:id", protect, removeUserSkill);


export default router;
