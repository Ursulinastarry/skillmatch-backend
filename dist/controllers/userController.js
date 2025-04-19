"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.logoutUser = exports.loginUser = exports.createUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = __importDefault(require("../server"));
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
//Debugging  - check if env var are loaded correctly  
const jwtSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
const generateToken = (res, userId, roleId) => {
    if (!jwtSecret || !refreshSecret) {
        throw new Error("ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is not defined in environment variables");
    }
    try {
        const accessToken = jsonwebtoken_1.default.sign({ userId, roleId }, jwtSecret, { expiresIn: "15m" });
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, refreshSecret, { expiresIn: "30d" });
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        return { accessToken, refreshToken, expiresIn: 900 }; // 900s = 15min
    }
    catch (error) {
        console.error("Error generating JWT:", error);
        throw new Error("Error generating authentication tokens");
    }
};
/** Create a new user */
exports.createUser = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { name, email, password, role_id } = req.body;
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt); // Hash password before saving
        const query = `INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [name, email, hashedPassword, role_id];
        const { rows } = await server_1.default.query(query, values);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
/** Login user and return JWT */
exports.loginUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    // Query user from database
    const { rows } = await server_1.default.query(`SELECT * FROM users WHERE email = $1`, [email]);
    // Check if user exists
    if (!rows.length)
        return res.status(401).json({ message: "Invalid email or password" });
    const user = rows[0];
    // Compare hashed password
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        return res.status(401).json({ message: "Invalid email or password" });
    // Generate JWT token
    const tokens = await generateToken(res, user.user_id, user.role_id);
    // ✅ Send a response after successful login
    return res.status(200).json({
        message: "Login successful",
        accessToken: tokens.accessToken, // Optional, in case the frontend needs it
        user: { id: user.user_id, email: user.email, role_id: user.role_id }
    });
});
exports.logoutUser = (0, asyncHandler_1.default)(async (req, res, next) => {
    //We need to immedietly invalidate the access token and the refreh token 
    res.cookie("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0) // Expire immediately
    });
    res.cookie("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0) // Expire immediately
    });
    res.status(200).json({ message: "User logged out successfully" });
});
exports.getAllUsers = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { rows } = await server_1.default.query(`SELECT * FROM users`);
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
/** Get user by ID */
exports.getUserById = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { rows } = await server_1.default.query(`SELECT * FROM users WHERE user_id = $1`, [req.params.user_id]);
        if (!rows.length)
            return res.status(404).json({ message: "User not found" });
        res.json(rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
/** Update user */
exports.updateUser = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { name, email, role_id } = req.body;
        const query = `UPDATE users SET name = $1, email = $2, role_id = $3 WHERE user_id = $4 RETURNING *`;
        const values = [name, email, role_id, req.params.user_id];
        const { rows } = await server_1.default.query(query, values);
        if (!rows.length)
            return res.status(404).json({ message: "User not found" });
        res.json(rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
/** Delete user */
exports.deleteUser = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { rowCount } = await server_1.default.query(`DELETE FROM users WHERE user_id = $1`, [req.params.user_id]);
        if (!rowCount)
            return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
