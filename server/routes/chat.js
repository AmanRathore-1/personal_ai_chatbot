import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import dotenv from "dotenv";
import express from "express";
import PersonalInfo from "../models/PersonalInfo.js";

dotenv.config();
const router = express.Router();

// Gemini Flash 2.0
const model = google("gemini-2.0-flash");

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // Load stored memory (YOUR ORIGINAL)
    const docs = await PersonalInfo.find();
    const memoryText = docs.map(d => `${d.key}: ${d.content}`).join("\n\n");

    // Adaptive Reply Length Logic (YOUR ORIGINAL)
    let replyStyle = "medium";
    if (message.length < 40) replyStyle = "short";
    else if (message.length > 150) replyStyle = "detailed";

    // Extra improvement: keep your styleGuide connected
    const styleGuide = {
      short: "Reply in 1–6 crisp lines.",
      medium: "Reply in 3–7 helpful lines.",
      detailed: "Reply in a detailed format with clear structure, examples, points, and guidance.",
    }[replyStyle];

    // Final Prompt (YOUR ORIGINAL — untouched)
    const prompt = `
You are Aman's personal AI assistant. Keep your responses SHORT, CRISP and to the point and add future fields. 
Never write more than 4–5 compact lines unless the user asks for details.

Here is Aman's stored memory:
${memoryText}

When the user asks about academic performance or CGPA:
- Mention all CGPA values briefly (9.4, 9.6, 9.1, 9.0)
- Give a quick overall evaluation in one line
- Give a small improvement tip in two line
- NO long paragraphs
- NO deep explanations
- NO over-friendly tone
- Keep it simple, short and helpful

${styleGuide}

Now answer:
"${message}"
`;

    // AI SDK call (YOUR ORIGINAL)
    const result = await generateText({
      model,
      prompt,
    });

    res.json({ reply: result.text });
  } catch (err) {
    // Extra improvement: cleaner error logging
    console.error("CHAT ROUTE ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
