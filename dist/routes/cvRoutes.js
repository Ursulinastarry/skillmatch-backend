"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cvController_1 = require("../controllers/cvController");
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const router = express_1.default.Router();
router.post("/", protect_1.protect, cvController_1.createCv);
router.get("/user/:userId", protect_1.protect, cvController_1.getUserCvs); // Changed path to avoid conflict
router.get("/", protect_1.protect, cvController_1.getCvs);
router.get("/:id", protect_1.protect, cvController_1.getCvById);
router.put("/:id", protect_1.protect, cvController_1.updateCv);
router.delete("/:id", protect_1.protect, cvController_1.deleteCv);
exports.default = router;
