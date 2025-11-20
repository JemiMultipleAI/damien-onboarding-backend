import express, { Request, Response } from "express";
import { getAgentIdForVideo, getAllAgentIds, videoAgentIds } from "../config/agents.js";

const router = express.Router();

/**
 * GET /api/agents/:videoId
 * Get agent ID for a specific video
 */
router.get("/:videoId", (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
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
    // Return the full mapping of video IDs to agent IDs
    res.json({ 
      mappings: videoAgentIds,
      totalVideos: Object.keys(videoAgentIds).length
    });
  } catch (error) {
    console.error("Error getting agents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

