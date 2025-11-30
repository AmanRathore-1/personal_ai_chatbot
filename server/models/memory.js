import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  data: { type: String, required: true },
  type: { type: String, default: "personal" },
  createdAt: { type: Date, default: Date.now }
});

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;
