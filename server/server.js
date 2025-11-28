import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { initDB } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../dist')); // Serve Vite build

// Initialize database
await initDB();

// GET all sets
app.get('/api/sets', async (req, res) => {
  try {
    const [sets] = await pool.query('SELECT * FROM sets ORDER BY created_at DESC');

    // Get songs for each set
    for (const set of sets) {
      const [songs] = await pool.query(
        'SELECT id, title, lyrics, color FROM songs WHERE set_id = ? ORDER BY position',
        [set.id]
      );
      set.songs = songs;
    }

    res.json(sets);
  } catch (error) {
    console.error('Error fetching sets:', error);
    res.status(500).json({ error: 'Failed to fetch sets' });
  }
});

// GET single set
app.get('/api/sets/:id', async (req, res) => {
  try {
    const [sets] = await pool.query('SELECT * FROM sets WHERE id = ?', [req.params.id]);

    if (sets.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    const set = sets[0];
    const [songs] = await pool.query(
      'SELECT id, title, lyrics, color FROM songs WHERE set_id = ? ORDER BY position',
      [set.id]
    );
    set.songs = songs;

    res.json(set);
  } catch (error) {
    console.error('Error fetching set:', error);
    res.status(500).json({ error: 'Failed to fetch set' });
  }
});

// POST create set
app.post('/api/sets', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { title, songs } = req.body;
    const setId = Date.now().toString();

    // Insert set
    await connection.query(
      'INSERT INTO sets (id, title) VALUES (?, ?)',
      [setId, title]
    );

    // Insert songs
    if (songs && songs.length > 0) {
      for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        await connection.query(
          'INSERT INTO songs (id, set_id, title, lyrics, color, position) VALUES (?, ?, ?, ?, ?, ?)',
          [song.id || Date.now().toString() + i, setId, song.title, song.lyrics || '', song.color || '#ffffff', i]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ id: setId, title, songs });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating set:', error);
    res.status(500).json({ error: 'Failed to create set' });
  } finally {
    connection.release();
  }
});

// PUT update set
app.put('/api/sets/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { title, songs } = req.body;
    const setId = req.params.id;

    // Update set
    await connection.query(
      'UPDATE sets SET title = ? WHERE id = ?',
      [title, setId]
    );

    // Delete existing songs
    await connection.query('DELETE FROM songs WHERE set_id = ?', [setId]);

    // Insert new songs
    if (songs && songs.length > 0) {
      for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        await connection.query(
          'INSERT INTO songs (id, set_id, title, lyrics, color, position) VALUES (?, ?, ?, ?, ?, ?)',
          [song.id || Date.now().toString() + i, setId, song.title, song.lyrics || '', song.color || '#ffffff', i]
        );
      }
    }

    await connection.commit();
    res.json({ id: setId, title, songs });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating set:', error);
    res.status(500).json({ error: 'Failed to update set' });
  } finally {
    connection.release();
  }
});

// DELETE set
app.delete('/api/sets/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM sets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Set deleted' });
  } catch (error) {
    console.error('Error deleting set:', error);
    res.status(500).json({ error: 'Failed to delete set' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
