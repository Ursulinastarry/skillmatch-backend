import { Request, Response } from 'express';
import pool from '../server';
import asyncHandler from '../middlewares/asyncHandler';
import { UserRequest } from '../utils/types/userTypes';
export const getNotifications = asyncHandler(async (req: UserRequest, res: Response) => {
  const { userId } = req.params;
  
  try {
    // Check if profile exists 
    const profileResult = await pool.query(
        'SELECT user_id FROM users WHERE user_id = $1',
        [userId]
      );
      
      if (profileResult.rows.length === 0) {
        return res.status(404).json({ error: 'user not found' });
      }
      
      // Check if user is the profile creator or admin
      if (!req.user || profileResult.rows[0].user_id !== req.user.user_id && req.user.role_id !== 1) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

export const getUnreadNotifications = asyncHandler(async (req: UserRequest, res: Response) => {
  const { userId } = req.params;
  
  try {
    // Check if profile exists 
    const profileResult = await pool.query(
        'SELECT user_id FROM users WHERE user_id = $1',
        [userId]
      );
      
      if (profileResult.rows.length === 0) {
        return res.status(404).json({ error: 'user not found' });
      }
      
      // Check if user is the profile creator or admin
      if (!req.user || profileResult.rows[0].user_id !== req.user.user_id && req.user.role_id !== 1) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC',
      [userId]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({ message: 'Failed to fetch unread notifications' });
  }
});

export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const { user_id, message, type } = req.body;
  
  if (!user_id || !message || !type) {
    return res.status(400).json({ message: 'User ID, message, and type are required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3) RETURNING *',
      [user_id, message, type]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

export const markAllNotificationsAsRead = asyncHandler(async (req: UserRequest, res: Response) => {
  const { userId } = req.params;
  
  try {
    // Check if profile exists 
    const profileResult = await pool.query(
        'SELECT user_id FROM users WHERE user_id = $1',
        [userId]
      );
      
      if (profileResult.rows.length === 0) {
        return res.status(404).json({ error: 'user not found' });
      }
      
      // Check if user is the profile creator or admin
      if (!req.user || profileResult.rows[0].user_id !== req.user.user_id && req.user.role_id !== 1) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
      [userId]
    );
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

export const deleteNotification = asyncHandler(async (req: UserRequest, res: Response) => {
  const { id } = req.params;
  
  try {
    // Check if profile exists 
    const profileResult = await pool.query(
        'SELECT user_id FROM notifications WHERE id = $1',
        [req.params.user_id]
      );
      
    
      // Check if user is the profile creator or admin
      if (!req.user || profileResult.rows[0].user_id !== req.user.user_id && req.user.role_id !== 1) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});