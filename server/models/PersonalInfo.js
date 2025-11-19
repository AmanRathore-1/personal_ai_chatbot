import mongoose from "mongoose";

const personalInfoSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String },
  content: { type: String, required: true },
  tags: { type: [String], default: [] }
});

export default mongoose.model("PersonalInfo", personalInfoSchema);
