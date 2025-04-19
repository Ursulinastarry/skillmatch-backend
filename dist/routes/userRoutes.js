"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const protect_1 = require("../middlewares/protect");
const router = express_1.default.Router();
router.post("/register", userController_1.createUser);
router.post("/login", userController_1.loginUser);
router.post("/logout", userController_1.logoutUser);
router.get("/", userController_1.getAllUsers);
router.get("/:user_id", userController_1.getUserById);
router.put("/:user_id", userController_1.updateUser);
router.delete("/:user_id", userController_1.deleteUser);
router.get("/auth/me", protect_1.protect);
exports.default = router;
