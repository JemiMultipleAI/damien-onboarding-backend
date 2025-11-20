import express, { Request, Response } from "express";
import { getQuestionsForVideo } from "../config/questions.js";
import { validateAnswer, validateAllAnswers } from "../services/validation.js";

const router = express.Router();

/**
 * GET /api/quiz/:videoId/questions
 * Get all questions for a video
 */
router.get("/:videoId/questions", (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const questions = getQuestionsForVideo(videoId);
    
    if (questions.length === 0) {
      return res.status(404).json({ 
        error: "No questions found for this video",
        videoId 
      });
    }
    
    // Return questions without correct answers (security)
    const safeQuestions = questions.map(q => ({
      id: q.id,
      question: q.question
    }));
    
    res.json({ 
      videoId,
      questions: safeQuestions,
      totalQuestions: questions.length
    });
  } catch (error) {
    console.error("Error getting questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/quiz/validate
 * Validate a single answer
 * Body: { videoId, questionId, answer }
 */
router.post("/validate", (req: Request, res: Response) => {
  try {
    const { videoId, questionId, answer } = req.body;
    
    if (!videoId || !questionId || !answer) {
      return res.status(400).json({ 
        error: "Missing required fields: videoId, questionId, answer" 
      });
    }
    
    const result = validateAnswer(videoId, questionId, answer);
    
    if (result.error) {
      return res.status(404).json(result);
    }
    
    res.json({
      isCorrect: result.isCorrect,
      questionId: result.question?.id
    });
  } catch (error) {
    console.error("Error validating answer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/quiz/:videoId/validate-all
 * Validate all answers for a video
 * Body: { answers: { questionId: answer } }
 */
router.post("/:videoId/validate-all", (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { answers } = req.body;
    
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ 
        error: "Missing or invalid answers object" 
      });
    }
    
    const result = validateAllAnswers(videoId, answers);
    
    res.json({
      videoId,
      ...result
    });
  } catch (error) {
    console.error("Error validating all answers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

