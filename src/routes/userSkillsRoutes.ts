import express from "express";
import { protect } from "../middlewares/protect";
import { addUserSkill, getUserSkills, removeUserSkill } from "../controllers/userSkillsControllers";
const router = express.Router();

router.get("/users/:userId",protect,getUserSkills);
router.post("/users/:userId",protect,addUserSkill)
router.delete("/:id", protect,removeUserSkill);


export default router;
