import { Request, Response } from 'express';
import pool from '../server';
import { UserRequest } from '../utils/types/userTypes';
import asyncHandler from '../middlewares/asyncHandler';
import dotenv from 'dotenv';
dotenv.config();
export const getCvs = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM cvs');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({ message: 'Failed to fetch CVs' });
  }
});

export const getCvById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM cvs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching CV:', error);
    res.status(500).json({ message: 'Failed to fetch CV' });
  }
});

export const getUserCvs = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM cvs WHERE user_id = $1', [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user CVs:', error);
    res.status(500).json({ message: 'Failed to fetch user CVs' });
  }
});

export const createCv = asyncHandler(async (req: Request, res: Response) => {
  const { user_id, file_url } = req.body;
  
  if (!user_id || !file_url) {
    return res.status(400).json({ message: 'User ID and file URL are required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO cvs (user_id, file_url) VALUES ($1, $2) RETURNING *',
      [user_id, file_url]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating CV:', error);
    res.status(500).json({ message: 'Failed to create CV' });
  }
});

export const updateCv = asyncHandler(async (req: UserRequest, res: Response) => {
  const { id } = req.params;
  const { file_url } = req.body;
  
  if (!file_url) {
    return res.status(400).json({ message: 'File URL is required' });
  }
  
  try {
    // Verify the user is the owner of the CV
    if (!req.user || !req.user.user_id) {
      return res.status(403).json({ message: 'User information is missing or unauthorized' });
    }
    const ownershipCheck = await pool.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [id, req.user.user_id]);
    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You are not authorized to update this CV' });
    }
    const result = await pool.query(
      'UPDATE cvs SET file_url = $1, uploaded_at = NOW() WHERE id = $2 RETURNING *',
      [file_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating CV:', error);
    res.status(500).json({ message: 'Failed to update CV' });
  }
});

export const deleteCv = asyncHandler(async (req: UserRequest, res: Response) => {
  const { id } = req.params;
  
  try {
    // Verify the user is the owner of the CV
    if (!req.user || !req.user.user_id) {
        return res.status(403).json({ message: 'User information is missing or unauthorized' });
      }
      const ownershipCheck = await pool.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [id, req.user.user_id]);
      if (ownershipCheck.rows.length === 0) {
        return res.status(403).json({ message: 'You are not authorized to update this CV' });
      }
    const result = await pool.query('DELETE FROM cvs WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }
    
    res.status(200).json({ message: 'CV deleted successfully' });
  } catch (error) {
    console.error('Error deleting CV:', error);
    res.status(500).json({ message: 'Failed to delete CV' });
  }
});
