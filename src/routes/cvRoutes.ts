import { createCv, deleteCv, getCvById, getCvs, getUserCvs, updateCv } from "../controllers/cvController"; 
import express from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();

router.post("/",protect,createCv);
router.get("/:userId",protect,getUserCvs)
router.get("/",  protect,getCvs);
router.put("/:id", protect,updateCv);
router.delete("/:id", protect,deleteCv);
router.get("/:id", protect,getCvById);


export default router;
