import dotenv from "dotenv";

// Load environment variables BEFORE reading them
dotenv.config();

// Single agent ID for the remaining video:
// "Managing Items - Initiator" (videoId: "4")
const AGENT_ID_4 = process.env.ELEVENLABS_AGENT_ID_4 || "";

// Michael - AI Assistant for landing page product demo
// Default to the provided agent ID if env var is not set
const AGENT_ID_MICHAEL = process.env.ELEVENLABS_AGENT_ID_MICHAEL || "agent_6701kajbn5a1e23tq757q7vh4ang";

// Map video IDs to their respective agent IDs
export const videoAgentIds: Record<string, string> = {
  "4": AGENT_ID_4
};

// Helper function to get agent ID for a video
export const getAgentIdForVideo = (videoId: string): string | null => {
  return videoAgentIds[videoId] || null;
};

// Get Michael's agent ID (for landing page chat)
export const getMichaelAgentId = (): string | null => {
  return AGENT_ID_MICHAEL && AGENT_ID_MICHAEL.trim() !== "" ? AGENT_ID_MICHAEL : null;
};

// Get all agent IDs (for validation)
export const getAllAgentIds = (): string[] => {
  return Object.values(videoAgentIds).filter(id => id && id.trim() !== "");
};

