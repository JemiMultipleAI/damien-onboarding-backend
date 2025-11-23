import dotenv from "dotenv";

// Load environment variables BEFORE reading them
dotenv.config();

// Agent IDs for all 5 video modules
const AGENT_ID_1 = process.env.ELEVENLABS_AGENT_ID_1 || "";
const AGENT_ID_2 = process.env.ELEVENLABS_AGENT_ID_2 || "";
const AGENT_ID_3 = process.env.ELEVENLABS_AGENT_ID_3 || "";
const AGENT_ID_4 = process.env.ELEVENLABS_AGENT_ID_4 || "";
const AGENT_ID_5 = process.env.ELEVENLABS_AGENT_ID_5 || "";

// Michael - AI Assistant for landing page product demo
// Default to the provided agent ID if env var is not set
const AGENT_ID_MICHAEL = process.env.ELEVENLABS_AGENT_ID_MICHAEL || "agent_6701kajbn5a1e23tq757q7vh4ang";

// Map video IDs to their respective agent IDs
export const videoAgentIds: Record<string, string> = {
  "1": AGENT_ID_1, // Introduction to KissFlow
  "2": AGENT_ID_2, // Conditional Visibility
  "3": AGENT_ID_3, // Accessing Process
  "4": AGENT_ID_4, // Managing Items - Initiator
  "5": AGENT_ID_5  // Managing Items - Assignee
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

