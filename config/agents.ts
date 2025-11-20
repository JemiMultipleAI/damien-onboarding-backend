import dotenv from "dotenv";

// Load environment variables BEFORE reading them
dotenv.config();

// Separate agent IDs for each video (5 main agents, one per video)
const AGENT_ID_1 = process.env.ELEVENLABS_AGENT_ID_1 || "";
const AGENT_ID_2 = process.env.ELEVENLABS_AGENT_ID_2 || "";
const AGENT_ID_3 = process.env.ELEVENLABS_AGENT_ID_3 || "";
const AGENT_ID_4 = process.env.ELEVENLABS_AGENT_ID_4 || "";
const AGENT_ID_5 = process.env.ELEVENLABS_AGENT_ID_5 || "";

// Map video IDs to their respective agent IDs
export const videoAgentIds: Record<string, string> = {
  "1": AGENT_ID_1,
  "2": AGENT_ID_2,
  "3": AGENT_ID_3,
  "4": AGENT_ID_4,
  "5": AGENT_ID_5,
};

// Helper function to get agent ID for a video
export const getAgentIdForVideo = (videoId: string): string | null => {
  return videoAgentIds[videoId] || null;
};

// Get all agent IDs (for validation)
export const getAllAgentIds = (): string[] => {
  return Object.values(videoAgentIds).filter(id => id && id.trim() !== "");
};

