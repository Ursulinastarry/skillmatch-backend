import express from "express";
import { protect } from "../middlewares/protect";
import { createUserProfile, getUserProfileById, updateUserProfile, deleteUserProfile, getUserProfiles,getUserProfileByUserId } from "../controllers/userProfilesController";
const router = express.Router();

router.get("/",protect,getUserProfiles);
router.post("/:user_id",protect,createUserProfile)
router.get("/:id",  protect,getUserProfileById);
router.put("/:id", protect,updateUserProfile);
router.delete("/:id", protect,deleteUserProfile);
router.get("/:user_id", protect,deleteUserProfile);


export default router;
