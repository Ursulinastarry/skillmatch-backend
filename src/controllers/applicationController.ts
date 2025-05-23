import { Request, Response } from 'express';
import  pool  from '../server';
import dotenv from 'dotenv';
dotenv.config();
import asyncHandler from '../middlewares/asyncHandler';
import { UserRequest } from '../utils/types/userTypes';


  // Get applications for a job
  export const getJobApplications = asyncHandler(async (req: UserRequest, res: Response)=> {
    const jobId = parseInt(req.params.jobId, 10);
    
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
        `SELECT a.id, a.status, a.applied_at, 
                u.user_id, up.full_name, up.profile_picture,
                c.id as cv_id, c.file_url as cv_url
         FROM applications a
         JOIN users u ON a.user_id = u.user_id
         LEFT JOIN user_profiles up ON u.user_id = up.user_id
         LEFT JOIN cvs c ON a.cv_id = c.id
         WHERE a.job_id = $1
         ORDER BY a.applied_at DESC`,
        [jobId]
      );
      
      // Get applicant skills
      const applications = await Promise.all(result.rows.map(async (application) => {
        const skillsResult = await pool.query(
          `SELECT s.id, s.name
           FROM skills s
           JOIN user_skills us ON s.id = us.skill_id
           WHERE us.user_id = $1`,
          [application.userId]
        );
        
        return {
          ...application,
          skills: skillsResult.rows
        };
      }));
      
      return res.status(200).json(applications);
    } catch (error) {
      console.error('Error getting job applications:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  })

  // Get applications for a user
  export const getUserApplications= asyncHandler(async (req: UserRequest, res: Response)=> {
   
    const userId = parseInt(req.params.userId,10);
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }
    try {
      const result = await pool.query(
        `SELECT a.id, a.status, a.applied_at, 
                j.id as job_id, j.title, j.location, j.salary_range,
                u.user_id as employer_id, up.full_name as employer_name, up.company_name
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         JOIN users u ON j.employer_id = u.user_id
         LEFT JOIN user_profiles up ON u.user_id = up.user_id
         WHERE a.user_id = $1
         ORDER BY a.applied_at DESC`,
        [userId]
      );
      
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error getting user applications:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  })
  // Update application status
  export const updateApplicationStatus = asyncHandler(async (req: UserRequest, res: Response)=> {

 if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    try {
      // Check if application exists
      const applicationResult = await pool.query(
        `SELECT a.id, a.job_id, a.user_id, j.employer_id, j.title
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE a.id = $1`,
        [id]
      );
      
      if (applicationResult.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      const application = applicationResult.rows[0];
      
      // Check if user is the employer or admin
      if (application.employer_id !== req.user.user_id && req.user.role_id !== 1) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Update status
      await pool.query(
        'UPDATE applications SET status = $1 WHERE id = $2',
        [status, id]
      );
      
      // Create notification for applicant
      let message;
      if (status === 'shortlisted') {
        message = `You've been shortlisted for the job: ${application.title}`;
      } else if (status === 'rejected') {
        message = `Your application for the job: ${application.title} has been rejected`;
      } else if (status === 'accepted') {
        message = `Congratulations! You've been accepted for the job: ${application.title}`;
      } else {
        message = `Your application status for the job: ${application.title} has been updated to ${status}`;
      }
      
      await pool.query(
        'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
        [application.user_id, message, 'application']
      );
      
      return res.status(200).json({ message: 'Application status updated successfully' });
    } catch (error) {
      console.error('Error updating application status:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  })

