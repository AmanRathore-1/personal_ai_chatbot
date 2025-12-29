// controllers/chatController.js

import PersonalInfo from "../models/PersonalInfo.js";
import { getUserMemories, saveMemory, shouldSaveMemory } from "../utils/memory.js";

// Clean Roman English
const forceRoman = (txt) =>
  txt.replace(/[^A-Za-z0-9 .,!?'"-]/g, "");

// Detect English
const isEnglish = (txt) =>
  /^[A-Za-z0-9 .,!?'"-]+$/.test(txt);

// Extract URLs
const extractRealUrl = (txt) =>
  txt.match(/https?:\/\/[^\s]+/g);

export const handleChat = async (req, res) => {
  try {
    console.log("🔥 /api/chat hit");

    const { message } = req.body;
    if (!message)
      return res.status(400).json({ error: "Message required" });

    // -------- LOAD MEMORY --------
    const docs = await PersonalInfo.find();
    const adminMemory = docs.map((d) => `${d.key}: ${d.content}`).join("\n\n");

    const userMemories = await getUserMemories("default-user");
    const chatMemory = userMemories.map((m) => `• ${m.data}`).join("\n");

    const memoryText = `
=== ADMIN MEMORY ===
${adminMemory}

=== USER MEMORY ===
${chatMemory}
`;

    // PROMPTS
    const englishPrompt = `
Reply ONLY in English.
Memory:
${memoryText}

User: "${message}"
`;

    const hinglishPrompt = `
Reply in Hinglish (Roman English only).
Memory:
${memoryText}

User: "${message}"
`;

    const finalPrompt = isEnglish(message)
      ? englishPrompt
      : hinglishPrompt;

    // -------- GROQ OFFICIAL API CALL --------
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",  // 🔥 NEW OFFICIAL MODEL
          messages: [
            { role: "user", content: finalPrompt }
          ],
          temperature: 0.6,
        }),
      }
    );

    const data = await response.json();

    if (!data?.choices) {
      console.log("❌ GROQ RAW ERROR:", data);
      return res
        .status(500)
        .json({ error: "Groq API Error", details: data });
    }

    let reply = data.choices[0].message.content;

    // Clean reply
    reply = forceRoman(reply);

    // Fix broken URLs
    const realUrl = extractRealUrl(adminMemory);
    if (realUrl?.[0])
      reply = reply.replace(/https[^ ]+/g, realUrl[0]);

    // Save memory
    if (shouldSaveMemory(message))
      await saveMemory("default-user", message);

    console.log("🔥 FINAL REPLY:", reply);
    return res.json({ reply });

  } catch (err) {
    console.error("❌ ERROR in Controller:", err);
    return res
      .status(500)
      .json({ error: err.message, stack: err.stack });
  }
};
