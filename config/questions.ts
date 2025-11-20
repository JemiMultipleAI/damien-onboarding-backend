import { VideoQuestions } from "../types/index.js";

// Questions and answers for each video module
export const videoQuestions: VideoQuestions = {
  "1": [
    {
      id: "q1-1",
      question: "What is the main purpose of KissFlow?",
      correctAnswer: "workflow automation",
      keywords: ["automate", "workflow", "process", "automation", "business process"]
    },
    {
      id: "q1-2",
      question: "Can you name one key feature of KissFlow?",
      correctAnswer: "process management",
      keywords: ["process", "management", "workflow", "automation", "forms", "approval"]
    }
  ],
  "2": [
    {
      id: "q2-1",
      question: "What is conditional visibility used for?",
      correctAnswer: "show fields conditionally",
      keywords: ["conditional", "visibility", "show", "hide", "based on", "condition"]
    },
    {
      id: "q2-2",
      question: "When would you use conditional visibility in a form?",
      correctAnswer: "dynamic forms",
      keywords: ["dynamic", "conditional", "depending", "based on", "user input", "form fields"]
    }
  ],
  "3": [
    {
      id: "q3-1",
      question: "How do you access a process in KissFlow?",
      correctAnswer: "dashboard",
      keywords: ["dashboard", "menu", "navigate", "access", "open", "process list"]
    },
    {
      id: "q3-2",
      question: "What information can you see when accessing a process?",
      correctAnswer: "process details",
      keywords: ["details", "information", "status", "items", "tasks", "workflow"]
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
      keywords: ["assignee", "complete", "tasks", "assigned", "work", "action items"]
    },
    {
      id: "q5-2",
      question: "How does an assignee know they have tasks?",
      correctAnswer: "notifications",
      keywords: ["notification", "alert", "assigned", "task list", "inbox", "reminder"]
    }
  ]
};

// Get questions for a specific video
export const getQuestionsForVideo = (videoId: string) => {
  return videoQuestions[videoId] || [];
};

