"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const applicationController_1 = require("../controllers/applicationController");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/:id", applicationController_1.getJobApplications);
router.get("/:user_id", applicationController_1.getUserApplications);
router.put("/:id", applicationController_1.updateApplicationStatus);
exports.default = router;
