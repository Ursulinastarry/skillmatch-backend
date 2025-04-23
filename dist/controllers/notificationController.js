"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.createNotification = exports.getUnreadNotifications = exports.getNotifications = void 0;
const server_1 = __importDefault(require("../server"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
// Helper to check authorization
function isAuthorized(req, userId) {
    return req.user && (req.user.user_id === userId || req.user.role_id === 1);
}
exports.getNotifications = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    if (!isAuthorized(req, userId)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const result = await server_1.default.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.status(200).json(result.rows);
});
exports.getUnreadNotifications = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    if (!isAuthorized(req, userId)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const result = await server_1.default.query('SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC', [userId]);
    res.status(200).json(result.rows);
});
exports.createNotification = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const { message, type } = req.body;
    if (!isAuthorized(req, userId)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    if (!message || !type) {
        return res.status(400).json({ message: 'Message and type are required' });
    }
    const result = await server_1.default.query('INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3) RETURNING *', [userId, message, type]);
    res.status(201).json(result.rows[0]);
});
exports.markNotificationAsRead = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const id = parseInt(req.params.id, 10);
    if (!isAuthorized(req, userId)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    // Ensure the notification belongs to the user
    const notif = await server_1.default.query('SELECT * FROM notifications WHERE id = $1 AND user_id = $2', [id, userId]);
    if (notif.rows.length === 0) {
        return res.status(404).json({ message: 'Notification not found' });
    }
    const result = await server_1.default.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *', [id]);
    res.status(200).json(result.rows[0]);
});
exports.markAllNotificationsAsRead = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    if (!isAuthorized(req, userId)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    await server_1.default.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);
    res.status(200).json({ message: 'All notifications marked as read' });
});
exports.deleteNotification = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const id = parseInt(req.params.id, 10);
    if (!isAuthorized(req, userId)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    // Ensure the notification belongs to the user
    const notif = await server_1.default.query('SELECT * FROM notifications WHERE id = $1 AND user_id = $2', [id, userId]);
    if (notif.rows.length === 0) {
        return res.status(404).json({ message: 'Notification not found' });
    }
    await server_1.default.query('DELETE FROM notifications WHERE id = $1', [id]);
    res.status(200).json({ message: 'Notification deleted successfully' });
});
