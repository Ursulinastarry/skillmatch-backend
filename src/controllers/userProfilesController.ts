import { Request, Response } from 'express';
import pool from '../server';
import { UserRequest } from '../utils/types/userTypes';
import dotenv from 'dotenv';
import asyncHandler from '../middlewares/asyncHandler';
dotenv.config();

export const getUserProfiles  = asyncHandler(async (req: UserRequest, res: Response)=> {
  try {
    const result = await pool.query('SELECT * FROM user_profiles');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    res.status(500).json({ message: 'Failed to fetch user profiles' });
  }
});

export const getUserProfileById  = asyncHandler(async (req: UserRequest, res: Response)=> {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM user_profiles WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

export const getUserProfileByUserId  = asyncHandler(async (req: UserRequest, res: Response)=> {
    console.log("🎯 Hitting unprotected profile route");
    
    console.log("👤 req.user:", req.user); // Should be undefined, and that's okay

  const { userId } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

export const createUserProfile  = asyncHandler(async (req: UserRequest, res: Response)=> {
  const { user_id, full_name, phone, bio, company_name, location, profile_picture } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO user_profiles (user_id, full_name, phone, bio, company_name, location, profile_picture) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, full_name, phone, bio, company_name, location, profile_picture]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).json({ message: 'Failed to create user profile' });
  }
});

export const updateUserProfile  = asyncHandler(async (req: UserRequest, res: Response)=> {
  const { id } = req.params;
  const { full_name, phone, bio, company_name, location, profile_picture } = req.body;
  
  try {
    // Check if profile exists 
    const profileResult = await pool.query(
        'SELECT user_id FROM user_profiles WHERE id = $1',
        [id]
      );
      
      if (profileResult.rows.length === 0) {
        return res.status(404).json({ error: 'profile not found' });
      }
      
      // Check if user is the profile creator or admin
      if (!req.user || profileResult.rows[0].user_id !== req.user.user_id && req.user.role_id !== 1) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    const result = await pool.query(
      'UPDATE user_profiles SET full_name = $1, phone = $2, bio = $3, company_name = $4, location = $5, profile_picture = $6 WHERE id = $7 RETURNING *',
      [full_name, phone, bio, company_name, location, profile_picture, id]
    );
    
    
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

export const deleteUserProfile  = asyncHandler(async (req: UserRequest, res: Response)=> {
  const { id } = req.params;
  
  try {
    // Check if profile exists 
    const profileResult = await pool.query(
        'SELECT user_id FROM user_profiles WHERE id = $1',
        [id]
      );
      
      if (profileResult.rows.length === 0) {
        return res.status(404).json({ error: 'profile not found' });
      }
      
      // Check if user is the profile creator or admin
      if (!req.user || profileResult.rows[0].user_id !== req.user.user_id && req.user.role_id !== 1) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    const result = await pool.query('DELETE FROM user_profiles WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({ message: 'Failed to delete user profile' });
  }
});