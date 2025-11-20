import { VideoQuestions } from "../types/index.js";

// Questions and answers for the single onboarding module:
// "Managing Items - Initiator"
export const videoQuestions: VideoQuestions = {
  "4": [
    {
      id: "q4-1",
      question: "What can an initiator do with items in KissFlow?",
      correctAnswer: "create and manage",
      keywords: ["create", "manage", "initiate", "start", "submit", "items"]
    },
    {
      id: "q4-2",
      question: "What actions are available to an initiator?",
      correctAnswer: "create submit track",
      keywords: ["create", "submit", "track", "view", "edit", "delete", "monitor"]
    }
  ]
};

// Get questions for a specific video
export const getQuestionsForVideo = (videoId: string) => {
  return videoQuestions[videoId] || [];
};

