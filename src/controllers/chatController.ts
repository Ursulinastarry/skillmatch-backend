import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

export const chatWithGemini = async (req: Request, res: Response) => {
  const { message } = req.body;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
      {
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
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(500).json({ error: "Gemini failed to generate content." });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini fetch error:", error.message);
    res.status(500).json({ error: "Server error talking to Gemini." });
  }
};
