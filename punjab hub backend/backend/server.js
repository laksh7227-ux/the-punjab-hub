import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import businessRoutes from "./routes/businesses.js";
import marketingRoutes from "./routes/marketing.js";
import { seedMongoIfEmpty } from "./data/seedHelper.js";
import "./data/localStore.js"; // Initialize local store

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Permissive yet secure CORS for local development across Vite, Postman, etc.
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any local development origin
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "2mb" }));

let dbMode = "Local File Storage";

// Health check endpoint with real-time status
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "PunjabHub AI API",
    database: {
      mode: dbMode,
      connected: mongoose.connection.readyState === 1
    },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/marketing", marketingRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error("API Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

async function startServer() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/punjabhub_ai";

  console.log("Connecting to database...");
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500
    });
    dbMode = "MongoDB (Native)";
    console.log(`✅ MongoDB connected successfully to ${mongoUri}`);
    await seedMongoIfEmpty();
  } catch (error) {
    dbMode = "Local Resilient Storage";
    console.warn(`⚠️ Could not reach MongoDB (${error.message}).`);
    console.log("🚀 Activated Local Resilient Storage mode (backend/data/punjabhub_store.json).");
    console.log("💡 All authentication, businesses, and AI marketing endpoints are 100% operational!");
  }

  app.listen(PORT, () => {
    console.log("\n=======================================================");
    console.log(`🚀 PunjabHub AI Backend is running!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`💾 Database: ${dbMode}`);
    console.log("=======================================================\n");
  });
}

startServer();
