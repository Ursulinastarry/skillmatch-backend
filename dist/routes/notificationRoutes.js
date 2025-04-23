"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notificationController_1 = require("../controllers/notificationController");
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const router = express_1.default.Router();
// Create a notification for a user
router.post("/:userId", protect_1.protect, notificationController_1.createNotification);
// Get all notifications for a user
router.get("/:userId", protect_1.protect, notificationController_1.getNotifications);
// Get unread notifications for a user
router.get("/:userId/unread", protect_1.protect, notificationController_1.getUnreadNotifications);
// Mark all notifications as read for a user
router.put("/:userId/mark-all-read", protect_1.protect, notificationController_1.markAllNotificationsAsRead);
// Mark a specific notification as read for a user
router.put("/:userId/:id/read", protect_1.protect, notificationController_1.markNotificationAsRead);
// Delete a specific notification for a user
router.delete("/:userId/:id", protect_1.protect, notificationController_1.deleteNotification);
exports.default = router;
