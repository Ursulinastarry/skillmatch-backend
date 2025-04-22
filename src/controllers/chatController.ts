// controllers/chat.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler";
dotenv.config();
// Native fetch is available from Node 18+, else install node-fetch:
const fetch = global.fetch || require("node-fetch");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Replace with process.env.API_KEY in prod

export const chatWithGPT = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (err: any) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Something went wrong with the AI" });
  }
});
