import { getQuestionsForVideo } from "../config/questions.js";
import { Question, ValidationResult, AllAnswersValidation, HybridValidationResult } from "../types/index.js";

/**
 * Check if an answer is correct
 */
export const checkAnswer = (answer: string, question: Question): boolean => {
  if (!answer || !question) return false;
  
  const lowerAnswer = answer.toLowerCase().trim();
  const lowerCorrect = question.correctAnswer.toLowerCase();
  
  // Check if correct answer phrase is in the user's answer
  if (lowerAnswer.includes(lowerCorrect)) {
    return true;
  }
  
  // Check keywords
  if (question.keywords && question.keywords.length > 0) {
    const hasKeyword = question.keywords.some(keyword => 
      lowerAnswer.includes(keyword.toLowerCase())
    );
    if (hasKeyword) {
      return true;
    }
  }
  
  return false;
};

/**
 * Validate answer for a specific question
 */
export const validateAnswer = (
  videoId: string,
  questionId: string,
  answer: string
): ValidationResult => {
  const questions = getQuestionsForVideo(videoId);
  const question = questions.find(q => q.id === questionId);
  
  if (!question) {
    return { isCorrect: false, question: null, error: "Question not found" };
  }
  
  const isCorrect = checkAnswer(answer, question);
  
  return { isCorrect, question };
};

/**
 * Check if all questions for a video are answered correctly
 */
export const validateAllAnswers = (
  videoId: string,
  answers: Record<string, string>
): AllAnswersValidation => {
  const questions = getQuestionsForVideo(videoId);
  const results = questions.map(question => {
    const answer = answers[question.id];
    const isCorrect = answer ? checkAnswer(answer, question) : false;
    return {
      questionId: question.id,
      isCorrect,
      answered: !!answer
    };
  });
  
  const allCorrect = results.every(r => r.isCorrect);
  const allAnswered = results.every(r => r.answered);
  
  return {
    allCorrect: allCorrect && allAnswered,
    allAnswered,
    results
  };
};

/**
 * Hybrid validation: Validate answers using agent metadata and thresholds
 * This approach doesn't require hardcoded questions - relies on agent's validation
 */
export const validateAnswersHybrid = (
  answers: Record<string, string>,
  metadata?: Record<string, any>
): HybridValidationResult => {
  const answerCount = Object.keys(answers).length;
  const minQuestions = metadata?.min_questions || 2;
  const questionsAsked = metadata?.questions_asked || answerCount;
  const agentValidationPassed = metadata?.validation_passed;

  const details: HybridValidationResult['details'] = {};

  // Check 1: Minimum questions threshold
  if (answerCount < minQuestions) {
    return {
      passed: false,
      reason: `Need at least ${minQuestions} answers, got ${answerCount}`,
      questionsAnswered: answerCount,
      minQuestionsRequired: minQuestions,
      agentValidationPassed,
      details: { insufficientQuestions: true }
    };
  }

  // Check 2: Agent validation (if provided)
  if (agentValidationPassed === false) {
    return {
      passed: false,
      reason: "Agent validation failed - answers are incorrect",
      questionsAnswered: answerCount,
      minQuestionsRequired: minQuestions,
      agentValidationPassed: false,
      details: { validationFailed: true }
    };
  }

  // Check 3: Answer quality - ensure answers are not empty or too short
  const MIN_ANSWER_LENGTH = 5;
  const qualityAnswers = Object.values(answers).filter(
    a => a && typeof a === 'string' && a.trim().length >= MIN_ANSWER_LENGTH
  );

  if (qualityAnswers.length < minQuestions) {
    return {
      passed: false,
      reason: `Need at least ${minQuestions} quality answers (min ${MIN_ANSWER_LENGTH} characters), got ${qualityAnswers.length}`,
      questionsAnswered: answerCount,
      minQuestionsRequired: minQuestions,
      agentValidationPassed,
      details: { lowQualityAnswers: true }
    };
  }

  // All checks passed
  return {
    passed: true,
    questionsAnswered: answerCount,
    minQuestionsRequired: minQuestions,
    agentValidationPassed: agentValidationPassed !== false,
    details: {}
  };
};

