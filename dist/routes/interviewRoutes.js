"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const interviewController_1 = require("../controllers/interviewController");
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const router = express_1.default.Router();
// Create a new interview
router.post("/", protect_1.protect, interviewController_1.createInterview);
// Get interviews by applicant
router.get("/applicant/:applicantId", protect_1.protect, interviewController_1.getInterviewsByApplicant);
// Get interviews by job
router.get("/job/:jobId", protect_1.protect, interviewController_1.getInterviewsByJob);
// Get a single interview by ID
router.get("/:id", protect_1.protect, interviewController_1.getInterviewById);
// Update an interview
router.put("/:id", protect_1.protect, interviewController_1.updateInterview);
// Delete an interview
router.delete("/:id", protect_1.protect, interviewController_1.deleteInterview);
exports.default = router;
