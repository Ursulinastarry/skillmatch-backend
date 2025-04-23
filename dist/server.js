"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const jobRoutes_1 = __importDefault(require("./routes/jobRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
const userProfilesRoutes_1 = __importDefault(require("./routes/userProfilesRoutes"));
const userSkillsRoutes_1 = __importDefault(require("./routes/userSkillsRoutes"));
const jobSkillsRoutes_1 = __importDefault(require("./routes/jobSkillsRoutes"));
const cvRoutes_1 = __importDefault(require("./routes/cvRoutes"));
const interviewRoutes_1 = __importDefault(require("./routes/interviewRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3000;
app.use((0, cookie_parser_1.default)());
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    ssl: {
        ca: process.env.DB_SSL_CA ? fs_1.default.readFileSync(process.env.DB_SSL_CA).toString() : undefined,
        rejectUnauthorized: true,
    },
});
app.use((0, cors_1.default)({
    origin: "*",
    methods: "GET, POST,PUT,PATCH,DELETE",
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log("🔥 HEADERS:", req.headers);
    next();
});
app.use("/users", userRoutes_1.default);
app.use("/jobs", jobRoutes_1.default);
app.use("/applications", applicationRoutes_1.default);
app.use('/profiles', userProfilesRoutes_1.default);
app.use('/user-skills', userSkillsRoutes_1.default);
app.use('/job-skills', jobSkillsRoutes_1.default);
app.use('/cvs', cvRoutes_1.default);
app.use('/interviews', interviewRoutes_1.default);
app.use('/notifications', notificationRoutes_1.default);
app.use("/", chatRoutes_1.default);
app.listen(3000, '0.0.0.0', () => {
    console.log(`Server is running on port: ${port}`);
});
exports.default = pool;
