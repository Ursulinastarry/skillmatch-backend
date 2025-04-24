import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";
import { UserRequest } from "../utils/types/userTypes"; // Assuming you have an auth middleware for user requests
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Interface definitions for type safety
interface Skill {
  id: number;
  name: string;
  description?: string;
  proficiency?: number; // Optional proficiency rating (1-5)
}

interface User {
  id: number;
  roleId: number;
  name: string;
  skills?: Skill[];
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
  user?: User;
  matchPercentage?: number;
}

// Main chat function for general AI interactions
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

// Career recommendations for job seekers based on their skills
export const getCareerRecommendations = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  
  try {
    // Fetch user skills from API
    const userSkillsResponse = await axios.get(`/api/user-skills/${userId}`);
    const userSkills: Skill[] = userSkillsResponse.data;
    
    // Fetch user information to verify roleId
    const userResponse = await axios.get(`/api/users/${userId}`);
    const user: User = userResponse.data;
    
    // Only provide recommendations for job seekers (roleId 3)
    if (user.roleId !== 3) {
      return res.status(403).json({ error: "Career recommendations are only available for job seekers" });
    }
    
    // Create prompt for AI with user skills
    const skillsList = userSkills.map(skill => `${skill.name}${skill.proficiency ? ` (Proficiency: ${skill.proficiency}/5)` : ''}`).join(', ');
    
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

// Calculate match percentages between job applicants and job requirements
export const getJobApplicantMatches = async (req: UserRequest, res: Response) => {
  const jobId = req.params.jobId;
  
  try {
    // Verify the requester is an employer (roleId 2)
    const requesterId = req.user?.user_id; // Assuming you have authentication middleware
    const requesterResponse = await axios.get(`/api/users/${requesterId}`);
    const requester: User = requesterResponse.data;
    
    if (requester.roleId !== 2) {
      return res.status(403).json({ error: "Only employers can view applicant match percentages" });
    }
    
    // Fetch job details including required skills
    const jobSkillsResponse = await axios.get(`/api/job-skills/${jobId}`);
    const jobSkills: Skill[] = jobSkillsResponse.data;
    
    // Fetch applicants for this job
    const applicationsResponse = await axios.get(`/api/applications/${jobId}`);
    const applications: Application[] = applicationsResponse.data;
    
    // For each applicant, calculate match percentage
    const applicantsWithMatches = await Promise.all(applications.map(async (application) => {
      // Fetch applicant skills
      const userSkillsResponse = await axios.get(`/api/user-skills/${application.userId}`);
      const userSkills: Skill[] = userSkillsResponse.data;
      
      // Calculate match percentage
      const matchScore = calculateSkillMatch(jobSkills, userSkills);
      
      return {
        ...application,
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
    userSkillMap.set(skill.name.toLowerCase(), skill.proficiency || 1);
  });
  
  // For each job skill, check if user has it
  jobSkills.forEach(jobSkill => {
    const jobSkillName = jobSkill.name.toLowerCase();
    const jobSkillImportance = jobSkill.proficiency || 1; // Default to 1 if not specified
    
    if (userSkillMap.has(jobSkillName)) {
      const userProficiency = userSkillMap.get(jobSkillName);
      
      // Calculate match points based on proficiency
      // If user meets or exceeds job requirement, full points
      // Otherwise, partial points based on how close they are
      if (userProficiency >= jobSkillImportance) {
        matchPoints += 1;
      } else {
        matchPoints += userProficiency / jobSkillImportance;
      }
    }
  });
  
  // Calculate final percentage
  return Math.round((matchPoints / totalPossiblePoints) * 100);
}

// AI-enhanced skill suggestion for job seekers
export const getSuggestedSkills = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  
  try {
    // Fetch user skills
    const userSkillsResponse = await axios.get(`/api/user-skills/${userId}`);
    const userSkills: Skill[] = userSkillsResponse.data;
    
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