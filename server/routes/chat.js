import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import dotenv from "dotenv";
import express from "express";
import PersonalInfo from "../models/PersonalInfo.js";
import { getUserMemories, saveMemory, shouldSaveMemory } from "../utils/memory.js";

dotenv.config();
const router = express.Router();

// Gemini Flash 2.0 (same model you wanted)
const model = google("gemini-2.0-flash");

// 🔥 Block ALL non-English scripts (Bangla, Hindi, Tamil etc.)
function forceRoman(text) {
  return text.replace(/[^A-Za-z0-9 .,!?'"-]/g, "");
}

// Detect if message is full English
function isEnglish(text) {
  return /^[A-Za-z0-9 .,!?'"-]+$/.test(text);
}

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
      short: "Reply in 1–3 friendly lines.",
      medium: "Reply in 3–6 natural lines with little humor.",
      detailed: "Reply detailed but stay human-like.",
    }[replyStyle];

    // Detect user language
    const englishMode = isEnglish(message);

    // 🔥 ENGLISH ONLY PROMPT
    const englishPrompt = `
You are Aman's personal AI assistant.

LANGUAGE RULES:
- User message is in ENGLISH → reply ONLY in English.
- NO Hinglish.
- NO Hindi words.
- NO scripts like: Hindi, Bangla, Tamil.
- ONLY English alphabet allowed (A–Z).

Tone:
- friendly, natural, short
- emoji max 1

Memory:
${memoryText}

User: "${message}"

Reply in clean English only.
`;

    // 🔥 HINGLISH ONLY PROMPT (Roman letters only)
    const hinglishPrompt = `
You are Aman's personal AI assistant and his close friend.

LANGUAGE RULES:
- User message is Hinglish → reply in Hinglish.
- Hinglish MUST be written ONLY in English letters.
- NEVER use scripts: Devanagari, Bangla, Tamil, Telugu, Marathi.
- ALWAYS reply in ROMAN English only.
- If any Hindi word comes → write it in English letters (kya, kaise, chal raha).

Tone:
- friendly, casual, natural
- emoji max 1

Memory:
${memoryText}

User: "${message}"

Reply in Hinglish using English letters only.
`;

    const prompt = englishMode ? englishPrompt : hinglishPrompt;

    // AI CALL
    const result = await generateText({ model, prompt });

    // 🔥 CLEAN OUTPUT (remove any non-English script Gemini tries to add)
    const cleanReply = forceRoman(result.text);

    // Save Memory
    if (shouldSaveMemory(message)) {
      await saveMemory("default-user", message);
    }

    res.json({ reply: cleanReply });

  } catch (err) {
    console.error("CHAT ROUTE ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
