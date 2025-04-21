import dotenv from 'dotenv';
import express from "express";
import cors from 'cors';
import userRoutes from "./routes/userRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import userProfileRoutes from "./routes/userProfilesRoutes";
import userSkillsRoutes from "./routes/userSkillsRoutes";
import jobSkillsRoutes from "./routes/jobSkillsRoutes";
import cvRoutes from "./routes/cvRoutes";
import interviewRoutes from "./routes/interviewRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import cookieParser from 'cookie-parser';
import asyncHandler from './middlewares/asyncHandler';
import { Request, Response } from "express";
import { Pool } from 'pg';
import fs from 'fs';
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
app.use(cookieParser());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: {
    ca: process.env.DB_SSL_CA ? fs.readFileSync(process.env.DB_SSL_CA).toString() : undefined,
    rejectUnauthorized: true, 
  },
});

app.use(cors({
  origin: "http://localhost:4200",
  methods: "GET, POST,PUT,PATCH,DELETE",
  credentials: true //allows cookies and auth headers
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/jobs/:id",asyncHandler(async (req: Request, res: Response)=> {
  try {
    console.log('ID from params:', req.params.id);
    console.log('ID type:', typeof req.params.id);
    
    // First try a count query to see if the job exists
    const checkQuery = await pool.query(
      `SELECT COUNT(*) FROM jobs WHERE id = $1`,
      [req.params.id]
    );
    console.log('Count result:', checkQuery.rows[0]);
    
    const jobResult = await pool.query(
      `SELECT * FROM jobs WHERE id = $1`,
      [req.params.id]
    );
    console.log('Job result length:', jobResult.rows.length);
    console.log('Job result data:', JSON.stringify(jobResult.rows));
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get job skills
    const skillsResult = await pool.query(
      `SELECT * FROM job_skills 
        WHERE job_id = $1`,
      [req.params.id]
    );

    const job = {
      ...jobResult.rows[0],
      skills: skillsResult.rows.length > 0 ? skillsResult.rows : []
    };

    console.log('Job result:', jobResult.rows);


    return res.status(200).json(job);
  } catch (error) {
    console.error('Error getting job:', error);
    return res.status(500).json({ error: 'Server error' });
  }
})

)
app.use("/users", userRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use('/jobs/:job_id/applications', applicationRoutes);
app.use('/profiles',userProfileRoutes);
app.use('/user-skills', userSkillsRoutes);
app.use('/jobs/:job_id/job-skills', jobSkillsRoutes);
app.use('/cvs', cvRoutes);
app.use('/interviews', interviewRoutes);
app.use('/jobs/:job_id/interviews', interviewRoutes);
app.use('/notifications', notificationRoutes);

app.listen(3000,'0.0.0.0', () => {
  console.log(`Server is running on port: ${port}`);
});

export default pool;
