import dotenv from "dotenv";

// Load environment variables BEFORE reading them
dotenv.config();

// Single agent ID for the remaining video:
// "Managing Items - Initiator" (videoId: "4")
const AGENT_ID_4 = process.env.ELEVENLABS_AGENT_ID_4 || "";

// Map video IDs to their respective agent IDs
export const videoAgentIds: Record<string, string> = {
  "4": AGENT_ID_4
};

// Helper function to get agent ID for a video
export const getAgentIdForVideo = (videoId: string): string | null => {
  return videoAgentIds[videoId] || null;
};

// Get all agent IDs (for validation)
export const getAllAgentIds = (): string[] => {
  return Object.values(videoAgentIds).filter(id => id && id.trim() !== "");
};

