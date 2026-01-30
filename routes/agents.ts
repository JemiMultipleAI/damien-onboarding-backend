import express, { Request, Response } from "express";
import { getAgentIdForVideo, getAllAgentIds, videoAgentIds, getMichaelAgentId } from "../config/agents.js";

const router = express.Router();

/**
 * GET /api/agents/michael
 * Get Michael's agent ID for landing page chat
 * Must be before /:videoId to avoid route conflict
 */
router.get("/michael", (req: Request, res: Response) => {
  try {
    const agentId = getMichaelAgentId();
    
    if (!agentId) {
      return res.status(404).json({ 
        error: "Michael agent not configured"
      });
    }
    
    res.json({ 
      agentId,
      name: "Michael",
      purpose: "Product demo and onboarding information"
    });
  } catch (error) {
    console.error("Error getting Michael agent ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/agents/:videoId
 * Get agent ID for a specific video
 */
router.get("/:videoId", (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    
    // Handle special case for "michael" (though /michael route should catch this first)
    if (videoId === "michael") {
      const agentId = getMichaelAgentId();
      if (!agentId) {
        return res.status(404).json({ 
          error: "Michael agent not configured"
        });
      }
      return res.json({ 
        agentId,
        name: "Michael",
        purpose: "Product demo and onboarding information"
      });
    }
    
    const agentId = getAgentIdForVideo(videoId);
    
    if (!agentId) {
      return res.status(404).json({ 
        error: "Agent not found for this video",
        videoId 
      });
    }
    
    res.json({ 
      videoId,
      agentId 
    });
  } catch (error) {
    console.error("Error getting agent ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/agents
 * Get all agent mappings (returns video ID to agent ID mapping)
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const michaelAgentId = getMichaelAgentId();
    // Return the full mapping of video IDs to agent IDs
    res.json({ 
      mappings: videoAgentIds,
      totalVideos: Object.keys(videoAgentIds).length,
      michael: michaelAgentId || null
    });
  } catch (error) {
    console.error("Error getting agents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

