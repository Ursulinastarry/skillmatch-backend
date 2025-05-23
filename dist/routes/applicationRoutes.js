"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const applicationController_1 = require("../controllers/applicationController");
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const router = express_1.default.Router();
router.get("/user/:userId", protect_1.protect, applicationController_1.getUserApplications);
router.get("/:jobId", protect_1.protect, applicationController_1.getJobApplications);
router.put("/:id", protect_1.protect, applicationController_1.updateApplicationStatus);
exports.default = router;
