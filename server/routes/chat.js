import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import dotenv from "dotenv";
import express from "express";
import PersonalInfo from "../models/PersonalInfo.js";
import { getUserMemories, saveMemory, shouldSaveMemory } from "../utils/memory.js";

dotenv.config();
const router = express.Router();

// Gemini Flash 2.0
const model = google("gemini-2.0-flash");

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // (1) Load Admin Memory
    const docs = await PersonalInfo.find();
    const adminMemory = docs.map(d => `${d.key}: ${d.content}`).join("\n\n");

    // (2) Load Chat Memory
    const userMemories = await getUserMemories("default-user");
    const chatMemory = userMemories.map(m => `• ${m.data}`).join("\n");

    // (3) Merge memory
    const memoryText = `
=== Admin Memory ===
${adminMemory}

=== Chat Memory ===
${chatMemory}
`;

    // Reply Length Logic
    let replyStyle = "medium";
    if (message.length < 40) replyStyle = "short";
    else if (message.length > 150) replyStyle = "detailed";

    const styleGuide = {
      short: "Reply in 1–4 fun, human-like lines. Maintain a friendly tone.",
      medium: "Reply in 3–6 natural lines with humor and personality.",
      detailed: "Reply detailed but stay human-like and lightly funny.",
    }[replyStyle];

    // Random vibe phrases (very human touch)
    const randomExpressions = [
      "haha 😂",
      "arre yaar",
      "bhai sach bolu?",
      "mat puch yaar 😆",
      "badiya badiya",
      "lol",
      "scene kya hai bhai?"
    ];
    const vibe = randomExpressions[Math.floor(Math.random() * randomExpressions.length)];

    // Small filler (makes AI feel alive)
    const smallTalk = [
      "acha acha...",
      "hmm theek...",
      "samajh gaya bhai...",
      "ohho yeh baat hai...",
      "sahi pakde ho..."
    ];
    const filler = smallTalk[Math.floor(Math.random() * smallTalk.length)];

    // FINAL PROMPT — Human Mode Activated
    const prompt = `
You are Aman's personal AI assistant, but act like his real-life close friend.

Your tone must be:
- friendly
- casual
- natural
- slightly funny
- emotional when needed
- never robotic
- never overly formal
- never give long intros
- never repeat skills or future tasks
- never mention "future fields", "task management", "meeting scheduling", or "next steps"
- never repeat memory unless user asks for it

Use Hinglish (Hindi + English mix).
Use emojis sometimes (1–3 max).
Speak like a real Indian college friend.

${styleGuide}

Here is memory (use only when needed):
${memoryText}

Filler: ${filler}
Feeling: ${vibe}

User: "${message}"
Reply in a human, friendly way.
`;

    // AI CALL
    const result = await generateText({ model, prompt });

    // Save Memory
    if (shouldSaveMemory(message)) {
      await saveMemory("default-user", message);
    }

    res.json({ reply: result.text });

  } catch (err) {
    console.error("CHAT ROUTE ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
