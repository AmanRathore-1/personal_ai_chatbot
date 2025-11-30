import Memory from "../models/memory.js";

// Simple condition-based memory detection
export function shouldSaveMemory(message) {
  const keywords = ["mera", "meri", "mujhe", "my", "I am", "I live", "birthday"];
  return keywords.some((key) => message.toLowerCase().includes(key));
}

export async function saveMemory(userId, message) {
  await Memory.create({
    userId,
    data: message,
    type: "personal"
  });
}

export async function getUserMemories(userId) {
  return await Memory.find({ userId }).sort({ createdAt: -1 }).limit(8);
}
