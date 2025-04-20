import { Request, Response } from 'express';
import pool from '../server';
import dotenv from 'dotenv';
import asyncHandler from '../middlewares/asyncHandler';
import { UserRequest } from '../utils/types/userTypes';
dotenv.config();

export const getUserSkills = asyncHandler(async (req: UserRequest, res: Response)=> {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT s.* FROM skills s JOIN user_skills us ON s.id = us.skill_id WHERE us.user_id = $1',
      [userId]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({ message: 'Failed to fetch user skills' });
  }
});

export const addUserSkill = asyncHandler(async (req: UserRequest, res: Response)=> {
  const { userId } = req.params;
  const { skillId } = req.body;
  
  if (!skillId) {
    return res.status(400).json({ message: 'Skill ID is required' });
  }
  
  try {
   
    
    // Check if the user already has this skill
    const existingSkill = await pool.query(
      'SELECT * FROM user_skills WHERE user_id = $1 AND skill_id = $2',
      [userId, skillId]
    );
      // Check if user is the skills creator or admin
      if (!req.user || existingSkill.rows[0].user_id !== req.user.user_id && req.user.role_id !== 1) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
    if (existingSkill.rows.length > 0) {
      return res.status(400).json({ message: 'User already has this skill' });
    }
    
    const result = await pool.query(
        'INSERT INTO user_skills (user_id, skill_id) VALUES ($1, (SELECT id FROM skills WHERE id = $2)) RETURNING *',
        [userId, skillId]
      );
    res.status(201).json({ message: 'Skill added to user successfully' });
  } catch (error) {
    console.error('Error adding skill to user:', error);
    res.status(500).json({ message: 'Failed to add skill to user' });
  }
});

export const removeUserSkill =asyncHandler(async (req: UserRequest, res: Response)=> {
  const { userId, skillId } = req.params;
  
  try {
    const skillsResult = await pool.query(
        'SELECT user_id FROM user_skills WHERE skill_id = $1',
        [skillId]
      );
      
      
      // Check if user is the skills creator or admin
      if (!req.user || skillsResult.rows[0].user_id !== req.user.user_id && req.user.role_id !== 1) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    const result = await pool.query(
      'DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2 RETURNING *',
      [userId, skillId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User skill association not found' });
    }
    
    res.status(200).json({ message: 'Skill removed from user successfully' });
  } catch (error) {
    console.error('Error removing skill from user:', error);
    res.status(500).json({ message: 'Failed to remove skill from user' });
  }
});
