import dotenv from 'dotenv';
import express from "express";
import cors from 'cors';
import userRoutes from "./routes/userRoutes"
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
  credentials: true //allows cookies and auth headers
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes)
app.listen(port,'0.0.0.0', () => {
  console.log(`Server is running on port: ${port}`);
});

export default pool;
