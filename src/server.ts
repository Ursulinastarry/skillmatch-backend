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
import chatRoutes from "./routes/chatRoutes";
import cookieParser from 'cookie-parser';
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
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log("🔥 HEADERS:", req.headers);
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use('/api/profiles',userProfileRoutes);
app.use('/api/user-skills', userSkillsRoutes);
app.use('/api/job-skills', jobSkillsRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/", chatRoutes);

app.listen(3000,'0.0.0.0', () => {
  console.log(`Server is running on port: ${port}`);
});

export default pool;
