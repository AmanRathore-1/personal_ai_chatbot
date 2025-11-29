import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import personalInfoRoutes from "./routes/personalInfo.js";

dotenv.config();
const app = express();

// Better CORS for production + local
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// DB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Routes
app.use("/api/personal-info", personalInfoRoutes);
app.use("/api/chat", chatRoutes);

// IMPORTANT: Render uses dynamic port
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log("Server running on port", PORT));
