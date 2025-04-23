"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const userSkillsControllers_1 = require("../controllers/userSkillsControllers");
const router = express_1.default.Router();
router.get("/:userId", protect_1.protect, userSkillsControllers_1.getUserSkills);
router.post("/:userId", protect_1.protect, userSkillsControllers_1.addUserSkill);
router.delete("/:userId/:skillId", protect_1.protect, userSkillsControllers_1.removeUserSkill);
exports.default = router;
