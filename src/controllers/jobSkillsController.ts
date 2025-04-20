import { Request, Response } from 'express';
import pool from '../server';
import asyncHandler from '../middlewares/asyncHandler';
import { UserRequest } from '../utils/types/userTypes';
import dotenv from 'dotenv';
dotenv.config();

export const getJobSkills = asyncHandler(async (req: UserRequest, res: Response)=> {
  const { jobId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT s.* FROM skills s JOIN job_skills js ON s.id = js.skill_id WHERE js.job_id = $1',
      [jobId]
    );
    console.log("hob id", jobId);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching job skills:', error);
    res.status(500).json({ message: 'Failed to fetch job skills' });
  }
});

export const addJobSkill = asyncHandler(async (req: UserRequest, res: Response)=> {
  const { jobId } = req.params;
  const { skillId } = req.body;
  
  if (!skillId) {
    return res.status(400).json({ message: 'Skill ID is required' });
  }
  
  try {
    // Check if job exists and user is the employer
    const jobResult = await pool.query(
      'SELECT employer_id FROM jobs WHERE id = $1',
      [jobId]
    );
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if user is the job creator or admin
    if (!req.user || jobResult.rows[0].employer_id !== req.user.user_id && req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Check if the job already has this skill
    const existingSkill = await pool.query(
      'SELECT * FROM job_skills WHERE job_id = $1 AND skill_id = $2',
      [jobId, skillId]
    );
    
    if (existingSkill.rows.length > 0) {
      return res.status(400).json({ message: 'Job already has this skill' });
    }
    
    const result = await pool.query(
      'INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2) RETURNING *',
      [jobId, skillId]
    );
    
    res.status(201).json({ message: 'Skill added to job successfully' });
  } catch (error) {
    console.error('Error adding skill to job:', error);
    res.status(500).json({ message: 'Failed to add skill to job' });
  }
});

export const removeJobSkill = asyncHandler(async (req: UserRequest, res: Response)=> {
  const { jobId, skillId } = req.params;
  
  try {
    // Check if job exists and user is the employer
    const jobResult = await pool.query(
      'SELECT employer_id FROM jobs WHERE id = $1',
      [jobId]
    );
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if user is the job creator or admin
    if (!req.user || jobResult.rows[0].employer_id !== req.user.user_id && req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const result = await pool.query(
      'DELETE FROM job_skills WHERE job_id = $1 AND skill_id = $2 RETURNING *',
      [jobId, skillId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job skill association not found' });
    }
    
    res.status(200).json({ message: 'Skill removed from job successfully' });
  } catch (error) {
    console.error('Error removing skill from job:', error);
    res.status(500).json({ message: 'Failed to remove skill from job' });
  }
});
