"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jobSkillsController_1 = require("../controllers/jobSkillsController");
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const router = express_1.default.Router();
router.post("/:jobId", protect_1.protect, jobSkillsController_1.addJobSkill);
router.get("/:jobId", jobSkillsController_1.getJobSkills);
router.delete("/:jobId/:skillId", protect_1.protect, jobSkillsController_1.removeJobSkill);
exports.default = router;
