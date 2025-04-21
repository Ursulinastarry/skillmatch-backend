import { createNotification, deleteNotification, getNotifications, getUnreadNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../controllers/notificationController"; 
import express from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();

// Create a notification for a user
router.post("/:userId", protect, createNotification);

// Get all notifications for a user
router.get("/:userId", protect, getNotifications);

// Get unread notifications for a user
router.get("/:userId/unread", protect, getUnreadNotifications);

// Mark all notifications as read for a user
router.put("/:userId/mark-all-read", protect, markAllNotificationsAsRead);

// Mark a specific notification as read for a user
router.put("/:userId/:id/read", protect, markNotificationAsRead);

// Delete a specific notification for a user
router.delete("/:userId/:id", protect, deleteNotification);


export default router;
