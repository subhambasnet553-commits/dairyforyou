require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const pairRoutes = require("./routes/pairRoutes");
const diaryRoutes = require("./routes/diaryRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const profileRoutes = require("./routes/profileRoutes");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "6mb" })); // raised from the 100kb default so profile picture uploads (sent as base64) don't get rejected

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/pair", pairRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/quiz", quizRoutes);

// Serve the frontend (register.html, structure.html, style.css, script.js, etc.)
app.use(express.static(path.join(__dirname, "../frontend")));

// Basic health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
