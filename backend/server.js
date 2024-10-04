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

// Create a new user (for OAuth)
app.post('/create_user', async (req, res) => {
  try {
    const { id, name, password, email, image, auth_method, provider_account_id } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing required fields email' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Generate a username from email
    let username = '';
    if (name) {
      username = name;
    } else {
      username = email.split('@')[0];
    }

    // if auth_method not defined, it is manual
    const auth = auth_method || 'manual';

    // Create user with associated records
    // Hash the password before storing it in the database
    let hashedPassword = '';
    if (password !== undefined) {
    const hashedPassword = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.create({
      data: {
      id: id,
      username: username,
      password_hash: hashedPassword,
      email: email,
      emailVerified: new Date(),
      image: image,
      auth_methods: {
        create: {
        isManual: auth === 'manual',
        isOAuth: auth === 'google' || auth === 'github',
        },
      },
      accounts: auth === 'google' || auth === 'github' ? {
        create: {
        type: 'oauth',
        provider: auth,
        provider_account_id: provider_account_id,
        // TODO add access_token and refresh_token etc.
        },
      } : undefined,
      },
      include: {
      auth_methods: true,
      accounts: true,
      },
    });

    res.status(201).json({ 
      message: 'User created successfully', 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get User ID from email
app.get('/users/email/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Enable OAuth for a user
app.post('/users/:userId/oauth', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Await the result of findFirst to get the data
    const data = await prisma.userAuthMethod.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!data) {
      // If no data is found, return a 404 response
      return res.status(404).json({ error: 'UserAuthMethod not found for this user' });
    }

    const id = data.id;

    await prisma.userAuthMethod.update({
      where: {
        id: id,
      },
      data: {
        isOAuth: true,
      },
    });

    res.status(200).json({ message: 'OAuth enabled successfully' });

  } catch (error) {
    console.error('Error enabling OAuth:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// View user info
app.get('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
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

// Login user manually
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        email,
        auth_methods: {
          some: {
            isManual: true
          }
        }
      },
      include: {
        auth_methods: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    //TODO: Review and change
    // if (!user.auth_methods.isManual) {
    //   return res.status(400).json({ error: 'User has not created a password' });
    // }

    //TODO:
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (passwordMatch) {
      return res.status(200).json({ message: 'Login successful', userId: user.id, email: user.email, name: user.name });
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete user
app.delete('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

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
        userId,
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
    const userId = req.params.userId;
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
        is_deleted: true,
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
  //TODO: Currently users can share note with themselves.
  try {
    const noteId = parseInt(req.params.noteId); // Note IDs are integers
    const { sharedWithUserId, canEdit } = req.body; // User IDs are strings

    // Check if the note has already been shared with this user
    const existingShare = await prisma.sharedNote.findFirst({
      where: {
        note_id: noteId,
        shared_with_user_id: sharedWithUserId,
      },
    });

    if (existingShare) {
      return res.status(200).json({
        message: 'Note has already been shared with this user.',
        sharedNoteId: existingShare.shared_note_id,
      });
    }

    // Create a new shared note entry
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
    const userId = req.params.userId;
    const sharedNotes = await prisma.sharedNote.findMany({
      where: {
        shared_with_user_id: userId,
        note: {
          is_deleted: false,
        },
      },
      include: {
        note: {
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

// Get all users a note has been shared with
// Important: Must use the note id not the shared note id
app.get('/notes/:noteId/shared-users', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);

    // Fetch shared notes with user information
    const sharedNotes = await prisma.sharedNote.findMany({
      where: { note_id: noteId },
      include: {
        shared_with_user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Extract user information from shared notes
    const sharedUsers = sharedNotes.map(sharedNote => sharedNote.shared_with_user);

    res.json(sharedUsers);
  } catch (error) {
    console.error('Error fetching shared users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update shared note permissions
app.put('/notes/:noteId/permissions', async (req, res) => {
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
// Important: Must use the shared note id not the note id (Open to suggestions on better endpoint)
app.delete('/shared-notes/:sharedNoteId', async (req, res) => {
  try {
    const sharedNoteId = parseInt(req.params.sharedNoteId);
    const { sharedWithUserId } = req.body;

    // Check if the shared note exists
    const existingShare = await prisma.sharedNote.findFirst({
      where: {
        shared_note_id: sharedNoteId,
        shared_with_user_id: sharedWithUserId,
      },
    });

    if (!existingShare) {
      return res.status(404).json({
        message: 'Shared note not found or not shared with the specified user.',
      });
    }

    // Ensure both shared_note_id and shared_with_user_id are used in the deletion
    await prisma.sharedNote.deleteMany({
      where: {
        shared_note_id: sharedNoteId,
        shared_with_user_id: sharedWithUserId,
      },
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
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Extract user information from active editors
    const editors = activeEditors.map(editor => editor.user);

    res.json(editors);
  } catch (error) {
    console.error('Error fetching active editors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove active editor from a note
app.delete('/notes/:noteId/active-editors', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const { userId } = req.body;

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
    if (error.code === 'P2002' && error.meta.target.includes('name')) {
      console.error('Unique constraint failed on the fields:', error.meta.target);
      res.status(409).json({ error: 'Tag with this name already exists' });
    } else {
      console.error('Error creating tag:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
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
app.delete('/notes/:noteId/tags', async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const tagId = parseInt(req.body.tagId);

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
// Note sure if this endpoint is what we need
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