"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jobController_1 = require("../controllers/jobController");
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const router = express_1.default.Router();
router.post("/post", protect_1.protect, jobController_1.postJob);
router.post("/apply", protect_1.protect, jobController_1.applyJob);
router.get("/employer/:employer_id", protect_1.protect, jobController_1.getJobsByEmployer);
router.get("/", protect_1.protect, jobController_1.getAllJobs);
router.put("/:id", protect_1.protect, jobController_1.updateJob);
router.delete("/:id", protect_1.protect, jobController_1.deleteJob);
router.get("/:id", protect_1.protect, jobController_1.getJobsById);
exports.default = router;
