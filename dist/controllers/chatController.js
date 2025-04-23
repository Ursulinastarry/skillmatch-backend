"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithGemini = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const chatWithGemini = async (req, res) => {
    var _a, _b, _c, _d, _e;
    const { message } = req.body;
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: message }],
                    },
                ],
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("Gemini API error:", data);
            return res.status(500).json({ error: "Gemini failed to generate content." });
        }
        const reply = ((_e = (_d = (_c = (_b = (_a = data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || "No response from Gemini";
        res.json({ reply });
    }
    catch (error) {
        console.error("Gemini fetch error:", error.message);
        res.status(500).json({ error: "Server error talking to Gemini." });
    }
};
exports.chatWithGemini = chatWithGemini;
