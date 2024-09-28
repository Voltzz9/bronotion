import express from 'express';
import pgp from 'pg-promise';
import bcrypt from 'bcrypt'; // For password hashing
const cors = require('cors');

const db = pgp()('postgres://admin:admin@localhost:5432/bronotion');
const app = express();
const PORT = 5433;

app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// ********************************* User Routes *********************************

// Add a manual user
app.post('/create_user', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Start a transaction
    const result = await db.tx(async t => {
      // Insert into users table
      const user = await t.one(
        'INSERT INTO users (username, email, is_Manual) VALUES ($1, $2, $3) RETURNING user_id',
        [username, email, true]
      );

      // Insert into manual_users table with hashed password
      await t.none(
        'INSERT INTO manual_users (user_id, password_hash) VALUES ($1, $2)',
        [user.user_id, hashedPassword]
      );

      return user;
    });

    res.status(201).json({ message: 'User created successfully', userId: result.user_id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// View user info
app.get('/users/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await db.one(
      `SELECT u.user_id, u.username, u.email, u.avatar_url, u.is_Manual, 
              m.registration_date
       FROM users u
       LEFT JOIN manual_users m ON u.user_id = m.user_id
       WHERE u.user_id = $1`,
      userId
    );
    res.json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    if (error.name === 'QueryResultError') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Login user
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch the user by email
    const user = await db.one(
      `SELECT u.user_id, u.username, u.email, u.is_Manual, m.password_hash
       FROM users u
       JOIN manual_users m ON u.user_id = m.user_id
       WHERE u.email = $1 AND u.is_Manual = true`,
      [email]
    );

    // Compare the password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (passwordMatch) {
      res.status(200).json({ message: 'Login successful', userId: user.user_id });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    if (error.name === 'QueryResultError') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Delete user
app.delete('/users/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await db.result('DELETE FROM users WHERE user_id = $1', userId);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ message: 'User deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ********************************* Note Routes *********************************

// Create a new note
app.post('/notes', async (req, res) => {
  try {
    const { title, content, user_id, tag_id } = req.body;

    const result = await db.one(
      `INSERT INTO notes (title, content, user_id, tag_id, is_deleted)
       VALUES ($1, $2, $3, $4, $5) RETURNING note_id`,
      [title, content, user_id, tag_id, false]
    );

    res.status(201).json({ message: 'Note created successfully', noteId: result.note_id });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch all notes for a user
app.get('/users/:userId/notes', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const notes = await db.any(
      `SELECT note_id, title, content, tag_id, created_at, updated_at
       FROM notes
       WHERE user_id = $1 AND is_deleted = false`,
      [userId]
    );
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update an existing note
app.put('/notes/:noteId', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const { title, content, tag_id } = req.body;

    const result = await db.result(
      `UPDATE notes
       SET title = $1, content = $2, tag_id = $3, updated_at = CURRENT_TIMESTAMP
       WHERE note_id = $4 AND is_deleted = false`,
      [title, content, tag_id, noteId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Note not found or already deleted' });
    } else {
      res.json({ message: 'Note updated successfully' });
    }
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete (soft delete) a note
app.delete('/notes/:noteId', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);

    const result = await db.result(
      `UPDATE notes
       SET is_deleted = true
       WHERE note_id = $1`,
      [noteId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.json({ message: 'Note deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch a single note
app.get('/notes/:noteId', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const note = await db.one(
      `SELECT note_id, title, content, tag_id, created_at, updated_at
       FROM notes
       WHERE note_id = $1 AND is_deleted = false`,
      noteId
    );
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    if (error.name === 'QueryResultError') {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
