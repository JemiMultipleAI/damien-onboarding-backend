import express, { Request, Response } from "express";
import { validateAllAnswers } from "../services/validation.js";
import { 
  saveUserProgress, 
  getActiveConversation, 
  saveActiveConversation, 
  deleteActiveConversation 
} from "../services/database.js";
import { WebhookPayload } from "../types/index.js";

const router = express.Router();

/**
 * POST /api/elevenlabs/webhook
 * Receives webhook callbacks from ElevenLabs when conversation events occur
 */
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const { event, conversation_id, video_id, user_id, metadata, answers } = req.body as WebhookPayload;
    
    // Enhanced logging for debugging
    console.log("=".repeat(50));
    console.log("📥 ElevenLabs Webhook Received");
    console.log("Event:", event);
    console.log("Conversation ID:", conversation_id);
    console.log("Video ID:", video_id);
    console.log("User ID:", user_id);
    console.log("Timestamp:", new Date().toISOString());
    if (answers) {
      console.log("Answers:", JSON.stringify(answers, null, 2));
    }
    if (metadata) {
      console.log("Metadata:", JSON.stringify(metadata, null, 2));
    }
    console.log("=".repeat(50));

    // Handle different event types
    switch (event) {
      case "conversation.started":
        // Track that a conversation has started
        if (conversation_id && video_id) {
          try {
            await saveActiveConversation(
              conversation_id,
              video_id,
              user_id || "default"
            );
            console.log("✅ Conversation tracked in database");
          } catch (error) {
            console.error("❌ Error saving conversation:", error);
            // Continue anyway - don't fail the webhook
          }
        } else {
          console.warn("⚠️ Missing conversation_id or video_id");
        }
        return res.json({ 
          success: true, 
          message: "Conversation started",
          conversation_id 
        });

      case "conversation.completed":
        // Handle completion - validate and mark video as complete
        return handleConversationCompleted(
          conversation_id,
          video_id,
          user_id,
          answers,
          metadata,
          res
        );

      case "subagent.completed":
        // Handle sub-agent completion (if ElevenLabs sends this)
        console.log("Sub-agent completed:", { conversation_id, video_id, metadata });
        return res.json({ 
          success: true, 
          message: "Sub-agent completed",
          conversation_id 
        });

      default:
        // Unknown event type - log but don't error
        console.log("Unknown webhook event:", event);
        return res.json({ 
          success: true, 
          message: "Event received" 
        });
    }
  } catch (error) {
    console.error("Error processing ElevenLabs webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      error: "Internal server error",
      message: errorMessage 
    });
  }
});

/**
 * Handle conversation completion
 */
async function handleConversationCompleted(
  conversation_id: string | undefined,
  video_id: string | undefined,
  user_id: string | undefined,
  answers: Record<string, string> | undefined,
  metadata: Record<string, any> | undefined,
  res: Response
): Promise<Response> {
  try {
    // Get video ID from active conversation if not provided
    const conversation = conversation_id ? await getActiveConversation(conversation_id) : null;
    const finalVideoId = video_id || conversation?.video_id;
    const finalUserId = user_id || conversation?.user_id || "default";

    if (!finalVideoId) {
      return res.status(400).json({
        error: "Video ID not found",
        conversation_id
      });
    }

    // If answers are provided in webhook, validate them
    if (answers && typeof answers === "object") {
      const validation = validateAllAnswers(finalVideoId, answers);
      
      if (!validation.allAnswered) {
        return res.status(400).json({
          error: "Not all questions have been answered",
          conversation_id,
          ...validation
        });
      }

      if (!validation.allCorrect) {
        return res.status(400).json({
          error: "Not all answers are correct. 100% correctness required.",
          conversation_id,
          ...validation
        });
      }
    }

    // Mark video as complete in database
    const progress = await saveUserProgress(finalUserId, finalVideoId, {
      completed: true,
      completedAt: new Date().toISOString(),
      conversationId: conversation_id,
      answers: answers || {},
      metadata: metadata || {}
    });

    // Clean up active conversation
    if (conversation_id) {
      await deleteActiveConversation(conversation_id);
    }

    console.log("✅ Video marked as complete:", { 
      videoId: finalVideoId, 
      userId: finalUserId,
      completedAt: progress.completed_at 
    });

    return res.json({
      success: true,
      message: "Video module completed successfully",
      videoId: finalVideoId,
      userId: finalUserId,
      completedAt: progress.completed_at,
      conversation_id
    });
  } catch (error) {
    console.error("Error handling conversation completion:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Internal server error",
      message: errorMessage
    });
  }
}

/**
 * GET /api/elevenlabs/conversation/:conversationId/status
 * Check status of an active conversation
 */
router.get("/conversation/:conversationId/status", async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const conversation = await getActiveConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        error: "Conversation not found",
        conversationId
      });
    }

    res.json({
      conversationId: conversation.conversation_id,
      videoId: conversation.video_id,
      userId: conversation.user_id,
      startedAt: conversation.started_at
    });
  } catch (error) {
    console.error("Error getting conversation status:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      error: "Internal server error",
      message: errorMessage 
    });
  }
});

/**
 * POST /api/elevenlabs/start-conversation
 * Initialize a conversation for a video
 * Body: { videoId, userId?, conversationId? }
 */
router.post("/start-conversation", async (req: Request, res: Response) => {
  try {
    const { videoId, userId = "default", conversationId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        error: "videoId is required"
      });
    }

    const finalConversationId = conversationId || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await saveActiveConversation(finalConversationId, videoId, userId);

    res.json({
      success: true,
      conversationId: finalConversationId,
      videoId,
      userId
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      error: "Internal server error",
      message: errorMessage 
    });
  }
});

export default router;

