import express, { Request, Response } from "express";
import { validateAllAnswers } from "../services/validation.js";
import { getUserProgress, getAllUserProgress, saveUserProgress } from "../services/database.js";

const router = express.Router();

/**
 * POST /api/videos/:videoId/complete
 * Mark video as complete (only if all questions answered correctly)
 * Body: { userId?, answers: { questionId: answer } }
 */
router.post("/:videoId/complete", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { userId = "default", answers } = req.body;
    
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ 
        error: "Missing or invalid answers object" 
      });
    }
    
    // Validate all answers
    const validation = validateAllAnswers(videoId, answers);
    
    if (!validation.allAnswered) {
      return res.status(400).json({
        error: "Not all questions have been answered",
        ...validation
      });
    }
    
    if (!validation.allCorrect) {
      return res.status(400).json({
        error: "Not all answers are correct. 100% correctness required.",
        ...validation
      });
    }
    
    // Save to database
    const progress = await saveUserProgress(userId, videoId, {
      completed: true,
      completedAt: new Date().toISOString(),
      answers,
      metadata: {}
    });
    
    res.json({
      success: true,
      message: "Video module completed successfully",
      videoId,
      completedAt: progress.completed_at
    });
  } catch (error) {
    console.error("Error completing video:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      error: "Internal server error",
      message: errorMessage 
    });
  }
});

/**
 * GET /api/videos/:videoId/progress
 * Get progress for a specific video
 * Query: ?userId=default
 */
router.get("/:videoId/progress", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { userId = "default" } = req.query;
    
    const progress = await getUserProgress(userId as string, videoId);
    
    if (!progress) {
      return res.json({
        videoId,
        userId,
        completed: false,
        progress: null
      });
    }
    
    res.json({
      videoId,
      userId,
      completed: progress.completed,
      completedAt: progress.completed_at,
      progress: {
        ...progress,
        answers: progress.answers || {},
        metadata: progress.metadata || {}
      }
    });
  } catch (error) {
    console.error("Error getting progress:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      error: "Internal server error",
      message: errorMessage 
    });
  }
});

/**
 * GET /api/videos/progress
 * Get all progress for a user
 * Query: ?userId=default
 */
router.get("/progress", async (req: Request, res: Response) => {
  try {
    const { userId = "default" } = req.query;
    
    const allProgress = await getAllUserProgress(userId as string);
    
    const formattedProgress = allProgress.map(p => ({
      videoId: p.video_id,
      completed: p.completed,
      completedAt: p.completed_at
    }));
    
    res.json({
      userId,
      progress: formattedProgress,
      totalCompleted: formattedProgress.filter(p => p.completed).length
    });
  } catch (error) {
    console.error("Error getting all progress:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      error: "Internal server error",
      message: errorMessage 
    });
  }
});

export default router;

