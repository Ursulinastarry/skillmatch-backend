import express from "express";
import { protect } from "../middlewares/protect";
import { createUserProfile, getUserProfileById, updateUserProfile, deleteUserProfile, getUserProfiles,getUserProfileByUserId } from "../controllers/userProfilesController";
const router = express.Router();

router.get("/",protect,getUserProfiles);
router.post("/",protect,createUserProfile)
router.get("/users/:userId",  protect,getUserProfileByUserId);
router.put("/:id", protect,updateUserProfile);
router.delete("/:id", protect,deleteUserProfile);


export default router;
