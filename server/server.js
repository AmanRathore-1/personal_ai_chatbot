import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import personalInfoRoutes from "./routes/personalInfo.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

app.use("/api/personal-info", personalInfoRoutes);
app.use("/api/chat", chatRoutes);

const PORT = 4000;
app.listen(PORT, () => console.log("Server running on port", PORT));
