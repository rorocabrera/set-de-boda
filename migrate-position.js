import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

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

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log('🔄 Starting migration: Adding position field to sets table...');

    // Check if position column already exists
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM sets LIKE 'position'
    `);

    if (columns.length > 0) {
      console.log('✅ Position column already exists. Skipping migration.');
      return;
    }

    // Add position column
    await connection.query(`
      ALTER TABLE sets
      ADD COLUMN position INT DEFAULT 0 AFTER title,
      ADD INDEX idx_position (position)
    `);

    console.log('✅ Added position column to sets table');

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

    console.log(`✅ Initialized positions for ${sets.length} sets`);
    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

migrate().catch(console.error);
