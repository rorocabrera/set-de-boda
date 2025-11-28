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

    // Migration: Add position column to existing sets table if it doesn't exist
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM sets LIKE 'position'
    `);

    if (columns.length === 0) {
      console.log('🔄 Running migration: Adding position field to sets table...');

      await connection.query(`
        ALTER TABLE sets
        ADD COLUMN position INT DEFAULT 0 AFTER title,
        ADD INDEX idx_position (position)
      `);

      // Initialize positions based on created_at (newest first gets position 0, 1, 2...)
      const [sets] = await connection.query(`
        SELECT id FROM sets ORDER BY created_at DESC
      `);

      for (let i = 0; i < sets.length; i++) {
        await connection.query(
          'UPDATE sets SET position = ? WHERE id = ?',
          [i, sets[i].id]
        );
      }

      console.log(`✅ Migration completed: Initialized positions for ${sets.length} sets`);
    }

    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;
