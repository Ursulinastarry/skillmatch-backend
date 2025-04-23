"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInterview = exports.updateInterview = exports.createInterview = exports.getInterviewsByApplicant = exports.getInterviewsByJob = exports.getInterviewById = exports.getInterviews = void 0;
const server_1 = __importDefault(require("../server"));
const dotenv_1 = __importDefault(require("dotenv"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
dotenv_1.default.config();
exports.getInterviews = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        if (!req.user || req.user.role_id !== 1) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const result = await server_1.default.query('SELECT * FROM interviews ORDER BY scheduled_time');
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ message: 'Failed to fetch interviews' });
    }
});
exports.getInterviewById = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        // Fetch the interview to get applicant_id and job_id
        const interviewResult = await server_1.default.query('SELECT * FROM interviews WHERE id = $1', [id]);
        if (interviewResult.rows.length === 0) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        const interview = interviewResult.rows[0];
        // Fetch the employer_id for the job
        const jobResult = await server_1.default.query('SELECT employer_id FROM jobs WHERE id = $1', [interview.job_id]);
        const employerId = jobResult.rows.length > 0 ? jobResult.rows[0].employer_id : null;
        // Only allow admin, the applicant, or the employer who created the interview
        if (!req.user ||
            (req.user.role_id !== 1 && // not admin
                req.user.user_id !== interview.applicant_id && // not applicant
                req.user.user_id !== employerId // not employer
            )) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const result = await server_1.default.query('SELECT * FROM interviews WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching interview:', error);
        res.status(500).json({ message: 'Failed to fetch interview' });
    }
});
exports.getInterviewsByJob = (0, asyncHandler_1.default)(async (req, res) => {
    const jobId = parseInt(req.params.jobId, 10);
    try {
        // Fetch the interview to get applicant_id and job_id
        const interviewResult = await server_1.default.query('SELECT * FROM interviews WHERE job_id = $1', [jobId]);
        if (interviewResult.rows.length === 0) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        const interview = interviewResult.rows[0];
        // Fetch the employer_id for the job
        const jobResult = await server_1.default.query('SELECT employer_id FROM jobs WHERE id = $1', [interview.job_id]);
        const employerId = jobResult.rows.length > 0 ? jobResult.rows[0].employer_id : null;
        // Only allow admin, the applicant, or the employer who created the interview
        if (!req.user ||
            (req.user.role_id !== 1 && // not admin
                req.user.user_id !== interview.applicant_id && // not applicant
                req.user.user_id !== employerId // not employer
            )) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const result = await server_1.default.query('SELECT * FROM interviews WHERE job_id = $1 ORDER BY scheduled_time', [jobId]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching job interviews:', error);
        res.status(500).json({ message: 'Failed to fetch job interviews' });
    }
});
exports.getInterviewsByApplicant = (0, asyncHandler_1.default)(async (req, res) => {
    const applicantId = parseInt(req.params.applicantId, 10);
    try {
        // Fetch the interview to get applicant_id and job_id
        const interviewResult = await server_1.default.query('SELECT * FROM interviews WHERE applicant_id = $1', [applicantId]);
        if (interviewResult.rows.length === 0) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        const interview = interviewResult.rows[0];
        // Fetch the employer_id for the job
        const jobResult = await server_1.default.query('SELECT employer_id FROM jobs WHERE id = $1', [interview.job_id]);
        const employerId = jobResult.rows.length > 0 ? jobResult.rows[0].employer_id : null;
        // Only allow admin, the applicant, or the employer who created the interview
        if (!req.user ||
            (req.user.role_id !== 1 && // not admin
                req.user.user_id !== interview.applicant_id && // not applicant
                req.user.user_id !== employerId // not employer
            )) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const result = await server_1.default.query('SELECT * FROM interviews WHERE applicant_id = $1 ORDER BY scheduled_time', [applicantId]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching applicant interviews:', error);
        res.status(500).json({ message: 'Failed to fetch applicant interviews' });
    }
});
exports.createInterview = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // Check if user is employer
    if (req.user.role_id !== 2 && req.user.role_id !== 1) {
        return res.status(403).json({ error: 'Only employers can create interviews' });
    }
    const { job_id, applicant_id, scheduled_time, meeting_link, notes } = req.body;
    if (!job_id || !applicant_id || !scheduled_time) {
        return res.status(400).json({ message: 'Job ID, applicant ID, and scheduled time are required' });
    }
    try {
        const result = await server_1.default.query('INSERT INTO interviews (job_id, applicant_id, scheduled_time, meeting_link, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *', [job_id, applicant_id, scheduled_time, meeting_link, notes]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating interview:', error);
        res.status(500).json({ message: 'Failed to create interview' });
    }
});
exports.updateInterview = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { scheduled_time, meeting_link, notes } = req.body;
    try {
        // Fetch the interview to get applicant_id and job_id
        const interviewResult = await server_1.default.query('SELECT * FROM interviews WHERE id = $1', [id]);
        if (interviewResult.rows.length === 0) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        const interview = interviewResult.rows[0];
        // Fetch the employer_id for the job
        const jobResult = await server_1.default.query('SELECT employer_id FROM jobs WHERE id = $1', [interview.job_id]);
        const employerId = jobResult.rows.length > 0 ? jobResult.rows[0].employer_id : null;
        // Only allow admin, the applicant, or the employer who created the interview
        if (!req.user ||
            (req.user.role_id !== 1 && // not admin
                req.user.user_id !== interview.applicant_id && // not applicant
                req.user.user_id !== employerId // not employer
            )) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const result = await server_1.default.query('UPDATE interviews SET scheduled_time = $1, meeting_link = $2, notes = $3 WHERE id = $4 RETURNING *', [scheduled_time, meeting_link, notes, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating interview:', error);
        res.status(500).json({ message: 'Failed to update interview' });
    }
});
exports.deleteInterview = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        // Fetch the interview to get applicant_id and job_id
        const interviewResult = await server_1.default.query('SELECT * FROM interviews WHERE id = $1', [id]);
        if (interviewResult.rows.length === 0) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        const interview = interviewResult.rows[0];
        // Fetch the employer_id for the job
        const jobResult = await server_1.default.query('SELECT employer_id FROM jobs WHERE id = $1', [interview.job_id]);
        const employerId = jobResult.rows.length > 0 ? jobResult.rows[0].employer_id : null;
        // Only allow admin, the applicant, or the employer who created the interview
        if (!req.user ||
            (req.user.role_id !== 1 && // not admin
                req.user.user_id !== interview.applicant_id && // not applicant
                req.user.user_id !== employerId // not employer
            )) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const result = await server_1.default.query('DELETE FROM interviews WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        res.status(200).json({ message: 'Interview deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting interview:', error);
        res.status(500).json({ message: 'Failed to delete interview' });
    }
});
