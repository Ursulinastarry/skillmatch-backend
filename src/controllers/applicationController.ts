import { Request, Response } from 'express';
import  pool  from '../server';
import dotenv from 'dotenv';
dotenv.config();
import asyncHandler from '../middlewares/asyncHandler';
import { UserRequest } from '../utils/types/userTypes';



 


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

