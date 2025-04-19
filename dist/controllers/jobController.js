"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
exports.JobController = {
    // Get all jobs
    getAllJobs: async (req, res) => {
        const { limit = 20, offset = 0, skill_id, location } = req.query;
        try {
            let query = `
        SELECT j.id, j.title, j.description, j.location, j.salary_range, 
               j.created_at, j.updated_at, u.user_id as employer_id, 
               up.full_name as employer_name, up.company_name
        FROM jobs j
        JOIN users u ON j.employer_id = u.user_id
        LEFT JOIN user_profiles up ON u.user_id = up.user_id
        WHERE 1=1
      `;
            const queryParams = [];
            let paramCounter = 1;
            // Add filter for location if provided
            if (location) {
                query += ` AND j.location ILIKE $${paramCounter}`;
                queryParams.push(`%${location}%`);
                paramCounter++;
            }
            // Base query without skill filtering
            if (!skill_id) {
                query += ` ORDER BY j.created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
                queryParams.push(limit, offset);
                const result = await pool.query(query, queryParams);
                // Get skills for each job
                const jobs = await Promise.all(result.rows.map(async (job) => {
                    const skillsResult = await pool.query(`SELECT s.id, s.name
             FROM skills s
             JOIN job_skills js ON s.id = js.skill_id
             WHERE js.job_id = $1`, [job.id]);
                    return {
                        ...job,
                        skills: skillsResult.rows
                    };
                }));
                return res.status(200).json(jobs);
            }
            else {
                // With skill filtering
                query = `
          SELECT j.id, j.title, j.description, j.location, j.salary_range, 
                 j.created_at, j.updated_at, u.user_id as employer_id, 
                 up.full_name as employer_name, up.company_name
          FROM jobs j
          JOIN users u ON j.employer_id = u.user_id
          LEFT JOIN user_profiles up ON u.user_id = up.user_id
          JOIN job_skills js ON j.id = js.job_id
          WHERE js.skill_id = $${paramCounter}
        `;
                queryParams.push(skill_id);
                paramCounter++;
                // Add filter for location if provided
                if (location) {
                    query += ` AND j.location ILIKE $${paramCounter}`;
                    queryParams.push(`%${location}%`);
                    paramCounter++;
                }
                query += ` ORDER BY j.created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
                queryParams.push(limit, offset);
                const result = await pool.query(query, queryParams);
                // Get skills for each job
                const jobs = await Promise.all(result.rows.map(async (job) => {
                    const skillsResult = await pool.query(`SELECT s.id, s.name
             FROM skills s
             JOIN job_skills js ON s.id = js.skill_id
             WHERE js.job_id = $1`, [job.id]);
                    return {
                        ...job,
                        skills: skillsResult.rows
                    };
                }));
                return res.status(200).json(jobs);
            }
        }
        catch (error) {
            console.error('Error getting jobs:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    },
    // Get job by ID
    getJobById: async (req, res) => {
        const { id } = req.params;
        try {
            const jobResult = await pool.query(`SELECT j.id, j.title, j.description, j.location, j.salary_range, 
                j.created_at, j.updated_at, u.user_id as employer_id, 
                up.full_name as employer_name, up.company_name
         FROM jobs j
         JOIN users u ON j.employer_id = u.user_id
         LEFT JOIN user_profiles up ON u.user_id = up.user_id
         WHERE j.id = $1`, [id]);
            if (jobResult.rows.length === 0) {
                return res.status(404).json({ error: 'Job not found' });
            }
            // Get job skills
            const skillsResult = await pool.query(`SELECT s.id, s.name
         FROM skills s
         JOIN job_skills js ON s.id = js.skill_id
         WHERE js.job_id = $1`, [id]);
            const job = {
                ...jobResult.rows[0],
                skills: skillsResult.rows
            };
            return res.status(200).json(job);
        }
        catch (error) {
            console.error('Error getting job:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    },
    // Create job
    createJob: async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const employer_id = req.user.user_id;
        // Check if user is employer
        if (req.user.role_id !== 2 && req.user.role_id !== 1) {
            return res.status(403).json({ error: 'Only employers can create jobs' });
        }
        const { title, description, location, salary_range, skills } = req.body;
        try {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                // Insert job
                const jobResult = await client.query(`INSERT INTO jobs (employer_id, title, description, location, salary_range, updated_at) 
           VALUES ($1, $2, $3, $4, $5, NOW()) 
           RETURNING id`, [employer_id, title, description, location, salary_range]);
                const job_id = jobResult.rows[0].id;
                // Insert job skills
                if (skills && skills.length > 0) {
                    for (const skill_id of skills) {
                        await client.query('INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2)', [job_id, skill_id]);
                    }
                }
                await client.query('COMMIT');
                return res.status(201).json({
                    message: 'Job created successfully',
                    job_id
                });
            }
            catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        }
        catch (error) {
            console.error('Error creating job:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    },
    // Update job
    updateJob: async (req, res) => {
        const { id } = req.params;
        const { title, description, location, salary_range, skills } = req.body;
        try {
            // Check if job exists and user is the employer
            const jobResult = await pool.query('SELECT employer_id FROM jobs WHERE id = $1', [id]);
            if (jobResult.rows.length === 0) {
                return res.status(404).json({ error: 'Job not found' });
            }
            // Check if user is the job creator or admin
            if (!req.user || jobResult.rows[0].employer_id !== req.user.user_id && req.user.role_id !== 1) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                // Update job
                await client.query(`UPDATE jobs 
           SET title = COALESCE($1, title), 
               description = COALESCE($2, description), 
               location = COALESCE($3, location), 
               salary_range = COALESCE($4, salary_range),
               updated_at = NOW()
           WHERE id = $5`, [title, description, location, salary_range, id]);
                // Update skills if provided
                if (skills && skills.length > 0) {
                    // Remove existing skills
                    await client.query('DELETE FROM job_skills WHERE job_id = $1', [id]);
                    // Add new skills
                    for (const skill_id of skills) {
                        await client.query('INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2)', [id, skill_id]);
                    }
                }
                await client.query('COMMIT');
                return res.status(200).json({ message: 'Job updated successfully' });
            }
            catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        }
        catch (error) {
            console.error('Error updating job:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    },
    // Delete job
    deleteJob: async (req, res) => {
        const { id } = req.params;
        try {
            // Check if job exists and user is the employer
            const jobResult = await pool.query('SELECT employer_id FROM jobs WHERE id = $1', [id]);
            if (jobResult.rows.length === 0) {
                return res.status(404).json({ error: 'Job not found' });
            }
            // Check if user is the job creator or admin
            if (!req.user || jobResult.rows[0].employer_id !== req.user.user_id && req.user.role_id !== 1) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            // Delete job (cascades to job_skills and applications)
            await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
            return res.status(200).json({ message: 'Job deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting job:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    },
    // Get jobs by employer
    getJobsByEmployer: async (req, res) => {
        const { employer_id } = req.params;
        try {
            const result = await pool.query(`SELECT j.id, j.title, j.description, j.location, j.salary_range, 
                j.created_at, j.updated_at, u.user_id as employer_id, 
                up.full_name as employer_name, up.company_name
         FROM jobs j
         JOIN users u ON j.employer_id = u.user_id
         LEFT JOIN user_profiles up ON u.user_id = up.user_id
         WHERE j.employer_id = $1
         ORDER BY j.created_at DESC`, [employer_id]);
            // Get skills and application count for each job
            const jobs = await Promise.all(result.rows.map(async (job) => {
                const skillsResult = await pool.query(`SELECT s.id, s.name
           FROM skills s
           JOIN job_skills js ON s.id = js.skill_id
           WHERE js.job_id = $1`, [job.id]);
                const applicationsResult = await pool.query('SELECT COUNT(*) FROM applications WHERE job_id = $1', [job.id]);
                return {
                    ...job,
                    skills: skillsResult.rows,
                    application_count: parseInt(applicationsResult.rows[0].count)
                };
            }));
            return res.status(200).json(jobs);
        }
        catch (error) {
            console.error('Error getting employer jobs:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
};
