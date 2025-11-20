import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import agentsRouter from "./routes/agents.js";
import quizRouter from "./routes/quiz.js";
import videosRouter from "./routes/videos.js";
import elevenlabsRouter from "./routes/elevenlabs.js";
import { initializeDatabase } from "./db/connection.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "KissFlow Onboarding Backend"
  });
});

// API Routes
app.use("/api/agents", agentsRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/videos", videosRouter);
app.use("/api/elevenlabs", elevenlabsRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path 
  });
});

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database schema
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`📡 Frontend URL: ${FRONTEND_URL}`);
      console.log(`🤖 ElevenLabs integration ready`);
      console.log(`🗄️  Database: PostgreSQL`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

