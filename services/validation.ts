import { getQuestionsForVideo } from "../config/questions.js";
import { Question, ValidationResult, AllAnswersValidation } from "../types/index.js";

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

