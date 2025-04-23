"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeJobSkill = exports.addJobSkill = exports.getJobSkills = void 0;
const server_1 = __importDefault(require("../server"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.getJobSkills = (0, asyncHandler_1.default)(async (req, res) => {
    const jobId = parseInt(req.params.jobId, 10);
    try {
        const result = await server_1.default.query('SELECT s.* FROM skills s JOIN job_skills js ON s.id = js.skill_id WHERE js.job_id = $1', [jobId]);
        console.log("hob id", jobId);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching job skills:', error);
        res.status(500).json({ message: 'Failed to fetch job skills' });
    }
});
exports.addJobSkill = (0, asyncHandler_1.default)(async (req, res) => {
    const jobId = parseInt(req.params.jobId, 10);
    const skillId = parseInt(req.body.skillId, 10);
    if (!skillId) {
        return res.status(400).json({ message: 'Skill ID is required' });
    }
    try {
        // Check if job exists and user is the employer
        const jobResult = await server_1.default.query('SELECT employer_id FROM jobs WHERE id = $1', [jobId]);
        if (jobResult.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        // Check if user is the job creator or admin
        if (!req.user || jobResult.rows[0].employer_id !== req.user.user_id && req.user.role_id !== 1) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        // Check if the job already has this skill
        const existingSkill = await server_1.default.query('SELECT * FROM job_skills WHERE job_id = $1 AND skill_id = $2', [jobId, skillId]);
        if (existingSkill.rows.length > 0) {
            return res.status(400).json({ message: 'Job already has this skill' });
        }
        const result = await server_1.default.query('INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2) RETURNING *', [jobId, skillId]);
        res.status(201).json({ message: 'Skill added to job successfully' });
    }
    catch (error) {
        console.error('Error adding skill to job:', error);
        res.status(500).json({ message: 'Failed to add skill to job' });
    }
});
exports.removeJobSkill = (0, asyncHandler_1.default)(async (req, res) => {
    const jobId = parseInt(req.params.jobId, 10);
    const skillId = parseInt(req.params.skillId, 10);
    try {
        // Check if job exists and user is the employer
        const jobResult = await server_1.default.query('SELECT employer_id FROM jobs WHERE id = $1', [jobId]);
        if (jobResult.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        // Check if user is the job creator or admin
        if (!req.user || jobResult.rows[0].employer_id !== req.user.user_id && req.user.role_id !== 1) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const result = await server_1.default.query('DELETE FROM job_skills WHERE job_id = $1 AND skill_id = $2 RETURNING *', [jobId, skillId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Job skill association not found' });
        }
        res.status(200).json({ message: 'Skill removed from job successfully' });
    }
    catch (error) {
        console.error('Error removing skill from job:', error);
        res.status(500).json({ message: 'Failed to remove skill from job' });
    }
});
