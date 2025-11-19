import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import dotenv from "dotenv";
import express from "express";
import PersonalInfo from "../models/PersonalInfo.js";

dotenv.config();
const router = express.Router();

// Gemini 2.0 Flash model
const model = google("gemini-2.0-flash");

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // Load personal memory from MongoDB
    const docs = await PersonalInfo.find();
    const memoryText = docs.map(d => `${d.key}: ${d.content}`).join("\n\n");

    const prompt = `
You are Aman's personal AI assistant.
Use his personal stored memory:

${memoryText}

User: ${message}
Respond naturally and helpfully.
`;

    // AI SDK text generation
    const result = await generateText({
      model,
      prompt
    });

    res.json({ reply: result.text });
  } catch (err) {
    console.error("CHAT ROUTE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
