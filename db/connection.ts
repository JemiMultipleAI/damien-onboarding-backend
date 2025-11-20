import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Or use individual connection parameters if DATABASE_URL is not set
  ...(process.env.DATABASE_URL
    ? {}
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        database: process.env.DB_NAME || "kissflow_onboarding",
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }),
  // Enable SSL for production or if DATABASE_URL is provided (e.g., Neon, Railway, etc.)
  // Neon requires SSL connections
  ssl: process.env.DATABASE_URL || process.env.NODE_ENV === "production" 
    ? { rejectUnauthorized: false } 
    : false,
});

// Test connection
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err: Error) => {
  console.error("❌ Unexpected error on idle client", err);
  process.exit(-1);
});

// Initialize database schema
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Create user_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        video_id VARCHAR(50) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        conversation_id VARCHAR(255),
        answers JSONB,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, video_id)
      )
    `);

    // Create active_conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS active_conversations (
        id SERIAL PRIMARY KEY,
        conversation_id VARCHAR(255) UNIQUE NOT NULL,
        video_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_video_id ON user_progress(video_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_active_conversations_conversation_id ON active_conversations(conversation_id)
    `);

    console.log("✅ Database schema initialized");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
};

export default pool;

