import { createCv, deleteCv, getCvById, getCvs, getUserCvs, updateCv } from "../controllers/cvController"; 
import express from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();

router.post("/", protect, createCv);
router.get("/user/:userId", protect, getUserCvs); // Changed path to avoid conflict
router.get("/", protect, getCvs);
router.get("/:id", protect, getCvById);
router.put("/:id", protect, updateCv);
router.delete("/:id", protect, deleteCv);


export default router;
