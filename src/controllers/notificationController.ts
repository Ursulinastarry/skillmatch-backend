import { Request, Response } from 'express';
import pool from '../server';
import asyncHandler from '../middlewares/asyncHandler';
import { UserRequest } from '../utils/types/userTypes';

// Helper to check authorization
function isAuthorized(req: UserRequest, userId: number) {
  return req.user && (req.user.user_id === userId || req.user.role_id === 1);
}

export const getNotifications = asyncHandler(async (req: UserRequest, res: Response) => {
  const userId = parseInt(req.params.userId, 10);

  if (!isAuthorized(req, userId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const result = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  res.status(200).json(result.rows);
});

export const getUnreadNotifications = asyncHandler(async (req: UserRequest, res: Response) => {
  const userId = parseInt(req.params.userId, 10);

  if (!isAuthorized(req, userId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const result = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC',
    [userId]
  );

  res.status(200).json(result.rows);
});

export const createNotification = asyncHandler(async (req: UserRequest, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  const { message, type } = req.body;

  if (!isAuthorized(req, userId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (!message || !type) {
    return res.status(400).json({ message: 'Message and type are required' });
  }

  const result = await pool.query(
    'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3) RETURNING *',
    [userId, message, type]
  );

  res.status(201).json(result.rows[0]);
});

export const markNotificationAsRead = asyncHandler(async (req: UserRequest, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  const id = parseInt(req.params.id, 10);

  if (!isAuthorized(req, userId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Ensure the notification belongs to the user
  const notif = await pool.query(
    'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (notif.rows.length === 0) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  const result = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
    [id]
  );

  res.status(200).json(result.rows[0]);
});

export const markAllNotificationsAsRead = asyncHandler(async (req: UserRequest, res: Response) => {
  const userId = parseInt(req.params.userId, 10);

  if (!isAuthorized(req, userId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
    [userId]
  );

  res.status(200).json({ message: 'All notifications marked as read' });
});

export const deleteNotification = asyncHandler(async (req: UserRequest, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  const id = parseInt(req.params.id, 10);

  if (!isAuthorized(req, userId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Ensure the notification belongs to the user
  const notif = await pool.query(
    'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (notif.rows.length === 0) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  await pool.query('DELETE FROM notifications WHERE id = $1', [id]);

  res.status(200).json({ message: 'Notification deleted successfully' });
});
