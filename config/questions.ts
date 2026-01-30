import { VideoQuestions } from "../types/index.js";

// Questions and answers for all 5 onboarding modules
export const videoQuestions: VideoQuestions = {
  "1": [
    {
      id: "q1-1",
      question: "What is the main purpose of KissFlow?",
      correctAnswer: "automate processes workflows",
      keywords: ["automate", "process", "workflow", "business", "organization", "management"]
    },
    {
      id: "q1-2",
      question: "Can you name one key feature of KissFlow?",
      correctAnswer: "process management workflow automation form builder",
      keywords: ["process", "workflow", "automation", "form", "builder", "approval", "task", "management"]
    }
  ],
  "2": [
    {
      id: "q2-1",
      question: "What is conditional visibility used for?",
      correctAnswer: "show hide fields based on conditions",
      keywords: ["show", "hide", "field", "condition", "based", "dynamic", "form"]
    },
    {
      id: "q2-2",
      question: "When would you use conditional visibility in a form?",
      correctAnswer: "when fields depend on other inputs",
      keywords: ["depend", "input", "condition", "dynamic", "relevant", "context"]
    }
  ],
  "3": [
    {
      id: "q3-1",
      question: "How do you access a process in KissFlow?",
      correctAnswer: "navigate dashboard select process",
      keywords: ["navigate", "dashboard", "select", "process", "menu", "access", "open"]
    },
    {
      id: "q3-2",
      question: "What information can you see when accessing a process?",
      correctAnswer: "items tasks status details",
      keywords: ["items", "tasks", "status", "details", "information", "view", "see"]
    }
  ],
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
  ],
  "5": [
    {
      id: "q5-1",
      question: "What is the role of an assignee in KissFlow?",
      correctAnswer: "complete assigned tasks",
      keywords: ["complete", "assigned", "task", "work", "action", "responsibility"]
    },
    {
      id: "q5-2",
      question: "How does an assignee know they have tasks?",
      correctAnswer: "notifications dashboard",
      keywords: ["notification", "dashboard", "alert", "reminder", "indicator", "see"]
    }
  ]
};

// Get questions for a specific video
export const getQuestionsForVideo = (videoId: string) => {
  return videoQuestions[videoId] || [];
};

