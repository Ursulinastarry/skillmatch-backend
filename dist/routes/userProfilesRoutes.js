"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const userProfilesController_1 = require("../controllers/userProfilesController");
const router = express_1.default.Router();
router.get("/", userProfilesController_1.getUserProfiles);
router.post("/", protect_1.protect, userProfilesController_1.createUserProfile);
router.get("/users/:userId", userProfilesController_1.getUserProfileByUserId);
router.put("/:id", protect_1.protect, userProfilesController_1.updateUserProfile);
router.delete("/:id", protect_1.protect, userProfilesController_1.deleteUserProfile);
exports.default = router;
