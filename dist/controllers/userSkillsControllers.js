"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserSkill = exports.addUserSkill = exports.getUserSkills = void 0;
const server_1 = __importDefault(require("../server"));
const dotenv_1 = __importDefault(require("dotenv"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
dotenv_1.default.config();
exports.getUserSkills = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    try {
        const result = await server_1.default.query('SELECT s.* FROM skills s JOIN user_skills us ON s.id = us.skill_id WHERE us.user_id = $1', [userId]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching user skills:', error);
        res.status(500).json({ message: 'Failed to fetch user skills' });
    }
});
exports.addUserSkill = (0, asyncHandler_1.default)(async (req, res) => {
    var _a;
    const userId = parseInt(req.params.userId, 10);
    const skillId = parseInt(req.body.skillId, 10);
    if (!skillId) {
        return res.status(400).json({ message: 'Skill ID is required' });
    }
    try {
        // Check if the user already has this skill
        const existingSkill = await server_1.default.query('SELECT * FROM user_skills WHERE user_id = $1 AND skill_id = $2', [userId, skillId]);
        // Check if user is the skills creator or admin
        const user_id = (_a = existingSkill.rows[0]) === null || _a === void 0 ? void 0 : _a.user_id;
        if (!req.user) {
            return res.status(403).json({ error: 'unauthorized' });
        }
        if (user_id !== req.user.user_id && req.user.role_id !== 1) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (existingSkill.rows.length > 0) {
            return res.status(400).json({ message: 'User already has this skill' });
        }
        const result = await server_1.default.query('INSERT INTO user_skills (user_id, skill_id) VALUES ($1, (SELECT id FROM skills WHERE id = $2)) RETURNING *', [userId, skillId]);
        res.status(201).json({ message: 'Skill added to user successfully' });
    }
    catch (error) {
        console.error('Error adding skill to user:', error);
        res.status(500).json({ message: 'Failed to add skill to user' });
    }
});
exports.removeUserSkill = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const skillId = parseInt(req.params.skillId, 10);
    try {
        if (!req.user || req.user.user_id !== req.user.user_id && req.user.role_id !== 1) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const result = await server_1.default.query('DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2 RETURNING *', [userId, skillId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User skill association not found' });
        }
        res.status(200).json({ message: 'Skill removed from user successfully' });
    }
    catch (error) {
        console.error('Error removing skill from user:', error);
        res.status(500).json({ message: 'Failed to remove skill from user' });
    }
});
