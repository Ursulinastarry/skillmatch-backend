import { createNotification, deleteNotification, getNotifications, getUnreadNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../controllers/notificationController"; 
import express from "express";
import { protect } from "../middlewares/protect";
const router = express.Router();

router.post("/",protect,createNotification);
router.get("/unread",protect,getUnreadNotifications)
router.get("/",  protect,getNotifications);
router.put("/user_id", protect,markAllNotificationsAsRead);
router.put("/:id", protect,markNotificationAsRead);
router.delete("/:id", protect,deleteNotification);


export default router;
