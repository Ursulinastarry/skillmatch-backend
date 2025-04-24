import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";
import { UserRequest } from "../utils/types/userTypes";
import pool from "../server";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Interface definitions for type safety
interface Skill {
  id: number;
  name: string;

}


interface Job {
  id: number;
  title: string;
  description: string;
  employerId: number;
  skills?: Skill[];
}

interface Application {
  id: number;
  userId: number;
  jobId: number;
  status: string;
  matchPercentage?: number;
}

// Main chat function for general AI interactions - no authentication required
export const chatWithGemini = async (req: Request, res: Response) => {
  const { message } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error: any) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ error: "Gemini failed to generate content." });
  }
};

// Career recommendations for job seekers based on their skills - protected route
export const getCareerRecommendations = async (req: UserRequest, res: Response) => {
  const userId = req.params.userId;
  
  try {
    // Verify the user is authorized to access this data
    if (!req.user || (req.user.user_id !== parseInt(userId) && req.user.role_id !== 1)) { // Assuming role_id 1 is admin
      return res.status(403).json({ error: "Not authorized to access this resource" });
    }
    
    // Fetch user skills directly from database
    const userSkillsQuery = await pool.query(
      "SELECT skill_id as id, name FROM user_skills JOIN skills ON user_skills.skill_id = skills.id WHERE user_id = $1",
      [userId]
    );
    const userSkills: Skill[] = userSkillsQuery.rows;
    
    // Fetch user information to verify roleId
    const userQuery = await pool.query(
      "SELECT user_id , role_id as roleId, name FROM users WHERE user_id = $1",
      [userId]
    );
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const user: UserRequest = userQuery.rows[0];
    
    // Only provide recommendations for job seekers (roleId 3)
    if (req.user.role_id !== 3) {
      return res.status(403).json({ error: "Career recommendations are only available for job seekers" });
    }
    
    // Create prompt for AI with user skills
    const skillsList = userSkills.map(skill => `${skill.name}`).join(', ');
    
    const prompt = `Based on the following skills: ${skillsList}, provide career recommendations including:
    1. The top 5 job roles that match these skills
    2. For each role, explain why it's a good match
    3. Suggest 2-3 additional skills the person could develop to become more competitive
    4. Recommend industries where these skills are in high demand
    Please format the response in clear sections with headings.`;
    
    // Generate AI recommendations
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const recommendations = response.text();
    
    res.json({ 
      userId,
      skills: userSkills,
      recommendations
    });
    
  } catch (error: any) {
    console.error("Error generating career recommendations:", error.message);
    res.status(500).json({ error: "Failed to generate career recommendations" });
  }
};

// Calculate match percentages between job applicants and job requirements - protected route
export const getJobApplicantMatches = async (req: UserRequest, res: Response) => {
  const jobId = req.params.jobId;
  
  try {
    // Verify the requester is an employer (roleId 2) by checking the user attached from protect middleware
    if (!req.user || req.user.role_id !== 2) {
      return res.status(403).json({ error: "Only employers can view applicant match percentages" });
    }
    
    // Fetch job details including required skills
    const jobSkillsQuery = await pool.query(
      "SELECT skill_id as id, name FROM job_skills JOIN skills ON job_skills.skill_id = skills.id WHERE job_id = $1",
      [jobId]
    );
    const jobSkills: Skill[] = jobSkillsQuery.rows;
    
    // Fetch applicants for this job
    const applicationsQuery = await pool.query(
      "SELECT  id, user_id as userId, job_id as jobId, status FROM applications WHERE job_id = $1",
      [jobId]
    );
    const applications: Application[] = applicationsQuery.rows;
    
    // For each applicant, calculate match percentage
    const applicantsWithMatches = await Promise.all(applications.map(async (application) => {
      // Fetch applicant skills
      const userSkillsQuery = await pool.query(
        "SELECT skill_id as id, name FROM user_skills JOIN skills ON user_skills.skill_id = skills.id WHERE user_id = $1",
        [application.userId]
      );
      const userSkills: Skill[] = userSkillsQuery.rows;
      
      // Get user details
      const userQuery = await pool.query(
        "SELECT user_id , name, email FROM users WHERE user_id = $1",
        [application.userId]
      );
      
      // Calculate match percentage
      const matchScore = calculateSkillMatch(jobSkills, userSkills);
      
      return {
        ...application,
        user: userQuery.rows[0],
        matchPercentage: matchScore
      };
    }));
    
    // Sort by match percentage (highest first)
    applicantsWithMatches.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    
    res.json({
      jobId,
      totalApplicants: applicantsWithMatches.length,
      applicants: applicantsWithMatches
    });
    
  } catch (error: any) {
    console.error("Error calculating job match percentages:", error.message);
    res.status(500).json({ error: "Failed to calculate job match percentages" });
  }
};

// Helper function to calculate skill match percentage
function calculateSkillMatch(jobSkills: Skill[], userSkills: Skill[]): number {
  if (!jobSkills.length) return 0;
  
  let matchPoints = 0;
  const totalPossiblePoints = jobSkills.length;
  
  // Create a map of user skills for easy lookup
  const userSkillMap = new Map();
  userSkills.forEach(skill => {
    userSkillMap.set(skill.name.toLowerCase(), 1);
  });
  
  // For each job skill, check if user has it
  jobSkills.forEach(jobSkill => {
    const jobSkillName = jobSkill.name.toLowerCase();
    if (userSkillMap.has(jobSkillName)) {
      matchPoints += 1;
    }
  });
  
  // Calculate final percentage
  return Math.round((matchPoints / totalPossiblePoints) * 100);
}

// AI-enhanced skill suggestion for job seekers - protected route
export const getSuggestedSkills = async (req: UserRequest, res: Response) => {
  const userId = req.params.userId;
  
  try {
    // Verify the user is authorized to access this data
    if (!req.user || (req.user.user_id !== parseInt(userId) && req.user.role_id !== 1)) { // Assuming role_id 1 is admin
      return res.status(403).json({ error: "Not authorized to access this resource" });
    }
    
    // Fetch user skills directly from database
    const userSkillsQuery = await pool.query(
      "SELECT skill_id as id, name FROM user_skills JOIN skills ON user_skills.skill_id = skills.id WHERE user_id = $1",
      [userId]
    );
    const userSkills: Skill[] = userSkillsQuery.rows;
    
    // Create prompt for AI with user skills
    const skillsList = userSkills.map(skill => skill.name).join(', ');
    
    const prompt = `Based on this skill set: ${skillsList}, suggest 5 complementary skills that would make this person more employable. For each skill, explain why it's valuable and how it complements their existing skills.`;
    
    // Generate AI recommendations
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestions = response.text();
    
    res.json({ 
      userId,
      currentSkills: userSkills.map(s => s.name),
      suggestedSkills: suggestions
    });
    
  } catch (error: any) {
    console.error("Error generating skill suggestions:", error.message);
    res.status(500).json({ error: "Failed to generate skill suggestions" });
  }
};