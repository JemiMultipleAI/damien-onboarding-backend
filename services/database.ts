import pool from "../db/connection.js";
import { UserProgress, ActiveConversation, ProgressData } from "../types/index.js";

/**
 * Get user progress for a specific video
 */
export const getUserProgress = async (userId: string, videoId: string): Promise<UserProgress | null> => {
  const result = await pool.query<UserProgress>(
    `SELECT * FROM user_progress 
     WHERE user_id = $1 AND video_id = $2`,
    [userId, videoId]
  );
  return result.rows[0] || null;
};

/**
 * Get all progress for a user
 */
export const getAllUserProgress = async (userId: string): Promise<Array<{
  video_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}>> => {
  const result = await pool.query<{
    video_id: string;
    completed: boolean;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT video_id, completed, completed_at, created_at, updated_at
     FROM user_progress 
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId]
  );
  return result.rows;
};

/**
 * Save or update user progress
 */
export const saveUserProgress = async (
  userId: string,
  videoId: string,
  data: ProgressData
): Promise<UserProgress> => {
  const { completed, completedAt, conversationId, answers, metadata } = data;

  const result = await pool.query<UserProgress>(
    `INSERT INTO user_progress 
     (user_id, video_id, completed, completed_at, conversation_id, answers, metadata, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id, video_id)
     DO UPDATE SET
       completed = EXCLUDED.completed,
       completed_at = EXCLUDED.completed_at,
       conversation_id = EXCLUDED.conversation_id,
       answers = EXCLUDED.answers,
       metadata = EXCLUDED.metadata,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      userId,
      videoId,
      completed,
      completedAt || null,
      conversationId || null,
      JSON.stringify(answers || {}),
      JSON.stringify(metadata || {})
    ]
  );

  return result.rows[0];
};

/**
 * Get active conversation
 */
export const getActiveConversation = async (conversationId: string): Promise<ActiveConversation | null> => {
  const result = await pool.query<ActiveConversation>(
    `SELECT * FROM active_conversations 
     WHERE conversation_id = $1`,
    [conversationId]
  );
  return result.rows[0] || null;
};

/**
 * Save active conversation
 */
export const saveActiveConversation = async (
  conversationId: string,
  videoId: string,
  userId: string
): Promise<ActiveConversation> => {
  const result = await pool.query<ActiveConversation>(
    `INSERT INTO active_conversations (conversation_id, video_id, user_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (conversation_id)
     DO UPDATE SET
       video_id = EXCLUDED.video_id,
       user_id = EXCLUDED.user_id,
       started_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [conversationId, videoId, userId]
  );
  return result.rows[0];
};

/**
 * Delete active conversation
 */
export const deleteActiveConversation = async (conversationId: string): Promise<void> => {
  await pool.query(
    `DELETE FROM active_conversations WHERE conversation_id = $1`,
    [conversationId]
  );
};

