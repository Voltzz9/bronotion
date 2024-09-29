const express = require('express');
const pgp = require('pg-promise')();
const bcrypt = require('bcrypt');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'bronotion',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin'
};

// Initialize database connection
const db = pgp(dbConfig);

// Test database connection
db.connect()
    .then(obj => {
        console.log('Database connection successful');
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.error('ERROR:', error.message || error);
    });

const app = express();
const PORT = process.env.PORT || 5433;

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

// ********************************* Shared Note Routes *********************************

// Share a note with another user
app.post('/notes/:noteId/share', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const { sharedWithUserId, canEdit } = req.body;

    // First, check if the note is already shared
    const existingShare = await db.oneOrNone(
      `SELECT shared_note_id FROM shared_notes 
       WHERE note_id = $1 AND shared_with_user_id = $2`,
      [noteId, sharedWithUserId]
    );

    if (existingShare) {
      // Note is already shared
      return res.status(200).json({ 
        message: 'Note has already been shared with this user.',
        sharedNoteId: existingShare.shared_note_id
      });
    }

    // If not already shared, create new share
    const result = await db.one(
      `INSERT INTO shared_notes (note_id, shared_with_user_id, can_edit)
       VALUES ($1, $2, $3)
       RETURNING shared_note_id`,
      [noteId, sharedWithUserId, canEdit]
    );

    res.status(201).json({ 
      message: 'Note shared successfully', 
      sharedNoteId: result.shared_note_id 
    });

  } catch (error) {
    console.error('Error sharing note:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Invalid note ID or user ID' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Get all notes shared with a user
app.get('/users/:userId/shared-notes', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const sharedNotes = await db.any(
      `SELECT n.note_id, n.title, n.content, n.user_id as owner_id, sn.shared_note_id, sn.can_edit, sn.shared_at
       FROM notes n
       JOIN shared_notes sn ON n.note_id = sn.note_id
       WHERE sn.shared_with_user_id = $1 AND n.is_deleted = false`,
      [userId]
    );
    res.json(sharedNotes);
  } catch (error) {
    console.error('Error fetching shared notes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update shared note permissions
app.put('/shared-notes/:noteId/permissions', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const { sharedWithUserId, canEdit } = req.body;

    if (!sharedWithUserId || typeof canEdit !== 'boolean') {
      return res.status(400).json({ error: 'Invalid input. Both shared_with_user_id and canEdit are required.' });
    }

    const result = await db.result(
      `UPDATE shared_notes
       SET can_edit = $1
       WHERE note_id = $2 AND shared_with_user_id = $3`,
      [canEdit, noteId, sharedWithUserId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Shared note not found or user does not have access' });
    } else {
      res.json({ message: 'Shared note permissions updated successfully' });
    }
  } catch (error) {
    console.error('Error updating shared note permissions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove shared access to a note
app.delete('/shared-notes/:sharedNoteId', async (req, res) => {
  try {
    const sharedNoteId = parseInt(req.params.sharedNoteId);

    const result = await db.result(
      `DELETE FROM shared_notes
       WHERE shared_note_id = $1`,
      [sharedNoteId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Shared note not found' });
    } else {
      res.json({ message: 'Shared access removed successfully' });
    }
  } catch (error) {
    console.error('Error removing shared access:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ********************************* Collaboration Routes *********************************

// Add active editor to a note
app.post('/notes/:noteId/active-editors', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const { userId } = req.body;

    const result = await db.one(
      `INSERT INTO active_editors (note_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (note_id, user_id) DO UPDATE
       SET last_active = CURRENT_TIMESTAMP
       RETURNING active_editor_id`,
      [noteId, userId]
    );

    res.status(201).json({ message: 'Active editor added successfully', activeEditorId: result.active_editor_id });
  } catch (error) {
    console.error('Error adding active editor:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get active editors for a note
app.get('/notes/:noteId/active-editors', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const activeEditors = await db.any(
      `SELECT ae.user_id, u.username, ae.last_active
       FROM active_editors ae
       JOIN users u ON ae.user_id = u.user_id
       WHERE ae.note_id = $1`,
      [noteId]
    );
    res.json(activeEditors);
  } catch (error) {
    console.error('Error fetching active editors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove active editor from a note
app.delete('/notes/:noteId/active-editors/:userId', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const userId = parseInt(req.params.userId);

    const result = await db.result(
      `DELETE FROM active_editors
       WHERE note_id = $1 AND user_id = $2`,
      [noteId, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Active editor not found' });
    } else {
      res.json({ message: 'Active editor removed successfully' });
    }
  } catch (error) {
    console.error('Error removing active editor:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


