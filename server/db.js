import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load .env file if it exists (for local development)
// In production (Coolify), environment variables are provided by the platform
dotenv.config({ path: '.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database schema
export async function initDB() {
  const connection = await pool.getConnection();
  try {
    // Create sets table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sets (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_position (position)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create songs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id VARCHAR(255) PRIMARY KEY,
        set_id VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        lyrics TEXT,
        color VARCHAR(20) DEFAULT '#ffffff',
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE,
        INDEX idx_set_id (set_id),
        INDEX idx_position (position)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;
