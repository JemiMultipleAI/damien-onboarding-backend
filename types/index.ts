// Type definitions for the backend

export interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  keywords?: string[];
}

export interface VideoQuestions {
  [videoId: string]: Question[];
}

export interface UserProgress {
  id?: number;
  user_id: string;
  video_id: string;
  completed: boolean;
  completed_at?: string | null;
  conversation_id?: string | null;
  answers?: Record<string, string> | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

export interface ActiveConversation {
  id?: number;
  conversation_id: string;
  video_id: string;
  user_id: string;
  started_at?: string;
}

export interface ProgressData {
  completed: boolean;
  completedAt?: string;
  conversationId?: string;
  answers?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  isCorrect: boolean;
  question: Question | null;
  error?: string;
}

export interface AllAnswersValidation {
  allCorrect: boolean;
  allAnswered: boolean;
  results: Array<{
    questionId: string;
    isCorrect: boolean;
    answered: boolean;
  }>;
}

export interface HybridValidationResult {
  passed: boolean;
  reason?: string;
  questionsAnswered: number;
  minQuestionsRequired: number;
  agentValidationPassed?: boolean;
  details?: {
    insufficientQuestions?: boolean;
    validationFailed?: boolean;
    lowQualityAnswers?: boolean;
  };
}

export interface WebhookPayload {
  event: string;
  conversation_id?: string;
  video_id?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  answers?: Record<string, string>;
}

