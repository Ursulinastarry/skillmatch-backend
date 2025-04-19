"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
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
    origin: "http://localhost:4200",
    methods: "GET, POST,PUT,PATCH,DELETE",
    credentials: true //allows cookies and auth headers
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/users", userRoutes_1.default);
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port: ${port}`);
});
exports.default = pool;
