"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCv = exports.updateCv = exports.createCv = exports.getUserCvs = exports.getCvById = exports.getCvs = void 0;
const server_1 = __importDefault(require("../server"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.getCvs = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const result = await server_1.default.query('SELECT * FROM cvs');
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching CVs:', error);
        res.status(500).json({ message: 'Failed to fetch CVs' });
    }
});
exports.getCvById = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const result = await server_1.default.query('SELECT * FROM cvs WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'CV not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching CV:', error);
        res.status(500).json({ message: 'Failed to fetch CV' });
    }
});
exports.getUserCvs = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    try {
        const result = await server_1.default.query('SELECT * FROM cvs WHERE user_id = $1', [userId]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching user CVs:', error);
        res.status(500).json({ message: 'Failed to fetch user CVs' });
    }
});
exports.createCv = (0, asyncHandler_1.default)(async (req, res) => {
    const { user_id, file_url } = req.body;
    if (!user_id || !file_url) {
        return res.status(400).json({ message: 'User ID and file URL are required' });
    }
    try {
        const result = await server_1.default.query('INSERT INTO cvs (user_id, file_url) VALUES ($1, $2) RETURNING *', [user_id, file_url]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating CV:', error);
        res.status(500).json({ message: 'Failed to create CV' });
    }
});
exports.updateCv = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { file_url } = req.body;
    if (!file_url) {
        return res.status(400).json({ message: 'File URL is required' });
    }
    try {
        // Verify the user is the owner of the CV
        if (!req.user || !req.user.user_id) {
            return res.status(403).json({ message: 'User information is missing or unauthorized' });
        }
        const ownershipCheck = await server_1.default.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [id, req.user.user_id]);
        if (ownershipCheck.rows.length === 0) {
            return res.status(403).json({ message: 'You are not authorized to update this CV' });
        }
        const result = await server_1.default.query('UPDATE cvs SET file_url = $1, uploaded_at = NOW() WHERE id = $2 RETURNING *', [file_url, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'CV not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating CV:', error);
        res.status(500).json({ message: 'Failed to update CV' });
    }
});
exports.deleteCv = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        // Verify the user is the owner of the CV
        if (!req.user || !req.user.user_id) {
            return res.status(403).json({ message: 'User information is missing or unauthorized' });
        }
        const ownershipCheck = await server_1.default.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [id, req.user.user_id]);
        if (ownershipCheck.rows.length === 0) {
            return res.status(403).json({ message: 'You are not authorized to delete this CV' });
        }
        const result = await server_1.default.query('DELETE FROM cvs WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'CV not found' });
        }
        res.status(200).json({ message: 'CV deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting CV:', error);
        res.status(500).json({ message: 'Failed to delete CV' });
    }
});
