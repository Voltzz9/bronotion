const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const cors = require('cors');
const https = require('https'); // Import HTTPS
const fs = require('fs'); // Import File System
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8080;

// Load SSL certificate and key
const options = {
  key: fs.readFileSync('server.key'), // Path to your key file
  cert: fs.readFileSync('server.cert'), // Path to your certificate file
};

app.use(cors());
app.use(express.json());

// ********************************* User Routes *********************************

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,       // Change made here
        username: true,
        email: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a manual user
app.post('/create_user', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash: hashedPassword,
        auth_methods: {
          create: {
            isManual: true,
          },
        },
      },
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// View user info
app.get('/users/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        auth_methods: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login user
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email,
        auth_methods: {
          isManual: true,
        },
      },
      include: {
        auth_methods: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (passwordMatch) {
      res.status(200).json({ message: 'Login successful', userId: user.id });
      res.status(200).json({ message: 'Login successful', userId: user.id });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete user
app.delete('/users/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ********************************* Note Routes *********************************

// Create a new note
app.post('/notes', async (req, res) => {
  try {
    const { title, content, userId } = req.body;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        user_id,
        tags: {
          connect: { tag_id: tag_id },
        },
        is_deleted: false,
      },
    });

    res.status(201).json({ message: 'Note created successfully', noteId: note.note_id });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch all notes for a user
app.get('/users/:userId/notes', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const notes = await prisma.note.findMany({
      where: {
        user_id: userId,
        is_deleted: false,
      },
    });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a note
app.put('/notes/:noteId', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const { title, content } = req.body;

    const note = await prisma.note.update({
      where: { note_id: noteId },
      data: {
        title,
        content,
        tags: {
          connect: { tag_id: tag_id },
        },
        updated_at: new Date(),
      },
    });

    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete (soft delete) a note
app.delete('/notes/:noteId', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);

    await prisma.note.update({
      where: { note_id: noteId },
      data: {
        is_deleted: true,
      },
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch a single note
app.get('/notes/:noteId', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const note = await prisma.note.findUnique({
      where: { note_id: noteId },
      select: {
        note_id: true,
        title: true,
        content: true,
        tags: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ********************************* Shared Note Routes *********************************

// Share a note with another user
app.post('/notes/:noteId/share', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const { sharedWithUserId, canEdit } = req.body;

    const existingShare = await prisma.sharedNote.findUnique({
      where: {
        note_id_shared_with_user_id: {
          note_id: noteId,
          shared_with_user_id: sharedWithUserId,
        },
      },
    });

    if (existingShare) {
      return res.status(200).json({
        message: 'Note has already been shared with this user.',
        sharedNoteId: existingShare.shared_note_id,
      });
    }

    const result = await prisma.sharedNote.create({
      data: {
        note_id: noteId,
        shared_with_user_id: sharedWithUserId,
        can_edit: canEdit,
      },
      select: {
        shared_note_id: true,
      },
    });

    res.status(201).json({
      message: 'Note shared successfully',
      sharedNoteId: result.shared_note_id,
    });
  } catch (error) {
    console.error('Error sharing note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all notes shared with a user
app.get('/users/:userId/shared-notes', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const sharedNotes = await prisma.sharedNote.findMany({
      where: { shared_with_user_id: userId },
      include: {
        note: {
          where: { is_deleted: false },
          select: {
            note_id: true,
            title: true,
            content: true,
            user_id: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    res.json(sharedNotes);
  } catch (error) {
    console.error('Error fetching shared notes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all users from a shared note
app.get('/notes/:noteId/shared-users', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const sharedUsers = await prisma.sharedNote.findMany({
      where: { note_id: noteId },
      include: {
        shared_with_users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.json(sharedUsers);
  } catch (error) {
    console.error('Error fetching shared users:', error);
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

    const result = await prisma.sharedNote.updateMany({
      where: {
        note_id: noteId,
        shared_with_user_id: sharedWithUserId,
      },
      data: { can_edit: canEdit },
    });

    if (result.count === 0) {
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

    await prisma.sharedNote.delete({
      where: { shared_note_id: sharedNoteId },
    });

    res.json({ message: 'Shared access removed successfully' });
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

    const result = await prisma.activeEditor.upsert({
      where: {
        note_id_user_id: {
          note_id: noteId,
          user_id: userId,
        },
      },
      update: { last_active: new Date() },
      create: {
        note_id: noteId,
        user_id: userId,
        last_active: new Date(),
      },
      select: {
        active_editor_id: true,
      },
    });

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
    const activeEditors = await prisma.activeEditor.findMany({
      where: { note_id: noteId },
      include: {
        users: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

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

    const result = await prisma.activeEditor.deleteMany({
      where: {
        note_id: noteId,
        user_id: userId,
      },
    });

    if (result.count === 0) {
      res.status(404).json({ error: 'Active editor not found' });
    } else {
      res.json({ message: 'Active editor removed successfully' });
    }
  } catch (error) {
    console.error('Error removing active editor:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ********************************* Tag Routes *********************************

// Create a new tag
app.post('/tags', async (req, res) => {
  try {
    const { name } = req.body;

    const result = await prisma.tag.create({
      data: { name },
      select: {
        tag_id: true,
        name: true,
      },
    });

    res.status(201).json({ message: 'Tag created successfully', tag: result });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all tags
app.get('/tags', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a tag
app.put('/tags/:tagId', async (req, res) => {
  try {
    const tagId = parseInt(req.params.tagId);
    const { name } = req.body;

    const result = await prisma.tag.update({
      where: { tag_id: tagId },
      data: { name },
    });

    res.json({ message: 'Tag updated successfully' });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a tag
app.delete('/tags/:tagId', async (req, res) => {
  try {
    const tagId = parseInt(req.params.tagId);

    const result = await prisma.tag.delete({
      where: { tag_id: tagId },
    });

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ********************************* Note-Tag Operations *********************************

// Add a tag to a note
app.post('/notes/:noteId/tags', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const { tagId } = req.body;

    await prisma.noteTag.create({
      data: {
        note_id: noteId,
        tag_id: tagId,
      },
    });

    res.json({ message: 'Tag added to note successfully' });
  } catch (error) {
    console.error('Error adding tag to note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove a tag from a note
app.delete('/notes/:noteId/tags/:tagId', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const tagId = parseInt(req.params.tagId);

    await prisma.noteTag.delete({
      where: {
        note_id_tag_id: {
          note_id: noteId,
          tag_id: tagId,
        },
      },
    });

    res.json({ message: 'Tag removed from note successfully' });
  } catch (error) {
    console.error('Error removing tag from note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all notes with a specific tag
app.get('/tags/:tagId/notes', async (req, res) => {
  try {
    const tagId = parseInt(req.params.tagId);

    const notes = await prisma.note.findMany({
      where: {
        tags: {
          some: {
            tag_id: tagId,
          },
        },
        is_deleted: false,
      },
      select: {
        note_id: true,
        title: true,
        content: true,
        user_id: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes by tag:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});