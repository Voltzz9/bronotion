import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import cors from 'cors';
import https from 'https'; // Import HTTPS
import fs from 'fs'; // Import File System
import dotenv from 'dotenv';
import { Server as SocketIOServer } from "socket.io";
dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8080;

// Load SSL certificate and key
const options = {
  key: fs.readFileSync('server.key'), // Path to your key file
  cert: fs.readFileSync('server.cert'), // Path to your certificate file
};

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.use(express.json());


// ********************************* Socket.io *********************************

// Create HTTPS server
const server = https.createServer(options, app);

// Initialize Socket.IO with the server instance
const io = new SocketIOServer(server, {
  cors: {
    origin: "https://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-note', (noteId) => {
    socket.join(noteId);
  });

  socket.on('update-note', (data) => {
    socket.to(data.noteId).emit('note-updated', data.content);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

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
    const { id, username, password, email, image, auth_method, provider_account_id } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing required fields email' });
    }

    // Check if user already exists
    const existingEmail = await prisma.user.findFirst({
      where: { email: email },
    });

    const existingUsername = await prisma.user.findFirst({
      where: { username: username },
    });

    if (existingEmail) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    if (existingUsername) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Generate a username from email
    if (!username) {
      username = email.split('@')[0];
    }

    // if auth_method not defined, it is manual
    const auth = auth_method || 'credentials';

    // Create user with associated records
    // Hash the password before storing it in the database
    let hashedPassword = '';
    if (password !== undefined) {
    hashedPassword = await bcrypt.hash(password, 10);
    }

    let user = await prisma.user.create({
      data: {
      id: id,
      username: username,
      password_hash: hashedPassword,
      email: email,
      emailVerified: new Date(),
      image: image,
      auth_methods: {
        create: {
        isManual: auth === 'credentials',
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

    user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    res.status(201).json({ 
      message: 'User created successfully', 
      user: {
        id: user.id,
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

// Search users with prefix support
app.get('/users/search', async (req, res) => {
  try {
    const { query, prefix } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let whereClause;

    if (prefix === 'true') {
      whereClause = {
        OR: [
          { username: { startsWith: query, mode: 'insensitive' } },
          { email: { startsWith: query, mode: 'insensitive' } },
        ],
      };
    } else {
      whereClause = {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        image: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
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

    res.json({ id: user.id, username: user.username, email: user.email, image: user.image });
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
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.json({ message: 'Login successful', id: user.id, username: user.username, email: user.email, image: user.image });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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

    // if content not specified, set it to an empty string
    const noteContent = content || '';

    const note = await prisma.note.create({
      data: {
        title,
        content: noteContent,
        user: {
          connect: { id: userId }, // Connect the note to an existing user
        },
      },
    });

    res.status(201).json({ message: 'Note created successfully', noteId: note.note_id });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/users/:userId/notes', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { includeShared } = req.body; // Default to false if not provided

    // Fetch the user's own notes
    const userNotes = await prisma.note.findMany({
      where: {
        user_id: userId,
        is_deleted: false,
      },
      include: {
        user: true, // Include user data
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    let sharedNotes = [];
    if (includeShared) {
      // Fetch the shared notes
      sharedNotes = await prisma.sharedNote.findMany({
        where: {
          shared_with_user_id: userId,
          note: {
            is_deleted: false,
          },
        },
        include: {
          note: {
            include: {
              user: true, // Include user data
              tags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      });

      // Format the shared notes to include only the tag names
      sharedNotes = sharedNotes.map(sharedNote => ({
        ...sharedNote.note,
        tags: sharedNote.note.tags.map(noteTag => noteTag.tag.name),
      }));
    }

    // Format the user's own notes to include only the tag names
    const formattedUserNotes = userNotes.map(note => ({
      ...note,
      tags: note.tags.map(noteTag => noteTag.tag.name),
    }));

    // Combine the user's own notes and the shared notes
    const allNotes = [...formattedUserNotes, ...sharedNotes];

    res.json(allNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get notes associated with tags for a specific user
app.put('/users/:userId/tags/notes', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { tagId } = req.body;

    // Fetch the tag IDs for the user
    const tagIdResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tag-ids/${userId}`);
    if (!tagIdResponse.ok) {
      throw new Error(`Failed to fetch tag IDs for user: ${tagIdResponse.status}`);
    }
    const userTagIds = await tagIdResponse.json();

    // Fetch the user's own notes with the specified tag
    const userNotes = await prisma.note.findMany({
      where: {
        user_id: userId,
        tags: {
          some: {
            tag_id: {
              in: userTagIds, // Use the tag IDs fetched earlier
            },
          },
        },
        is_deleted: false,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Organize notes by tag
    const tagNotesMap = {};

    userNotes.forEach(note => {
      note.tags.forEach(noteTag => {
        const tagId = noteTag.tag.tag_id;
        const tagName = noteTag.tag.name;

        if (!tagNotesMap[tagId]) {
          tagNotesMap[tagId] = {
            tagId,
            tagName,
            noteIds: [],
            noteTitles: [],
          };
        }

        tagNotesMap[tagId].noteIds.push(note.id);
        tagNotesMap[tagId].noteTitles.push(note.title);
      });
    });

    // Convert the map to an array
    const formattedResponse = Object.values(tagNotesMap);

    res.json(formattedResponse);
  } catch (error) {
    console.error('Error fetching notes by tag:', error);
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

app.get('/notes/:noteId/check', async (req, res) => {

  try {
    const authHeader = req.headers['authorization']; // Lowercase 'authorization' for case sensitivity issues.
    const userId = authHeader && authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    const noteId = parseInt(req.params.noteId, 10);
    const note = await prisma.note.findUnique({
      where: { note_id: noteId},
      select: { user_id: true },
    });
    if (userId !== note.user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json({ message: 'Authorized' });
  } catch (error) {
    console.error('Error checking note:', error);
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

    // Check if userId exists
    const user = await prisma.user.findFirst({
      where: { id: sharedWithUserId },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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
          include: {
            user: true, // Include user data
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    // Format the shared notes to include only the tag names
    const formattedSharedNotes = sharedNotes.map(sharedNote => ({
      note_id: sharedNote.note.note_id,
      title: sharedNote.note.title,
      content: sharedNote.note.content,
      user_id: sharedNote.note.user_id,
      created_at: sharedNote.note.created_at,
      updated_at: sharedNote.note.updated_at,
      is_deleted: sharedNote.note.is_deleted,
      user: sharedNote.note.user ? { id: sharedNote.note.user.id, username: sharedNote.note.user.username, image: sharedNote.note.user.image } : { id: '', username: '', image: '' },
      tags: sharedNote.note.tags.map(noteTag => noteTag.tag.name),
      shared_notes: [], // Add empty array for shared_notes
      active_editors: [], // Add empty array for active_editors
    }));

    res.json(formattedSharedNotes);
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
            username: true,
            email: true,
            image: true
          }
        }
      }
    });

    // Fetch owner of the note
    const note = await prisma.note.findUnique({
      where: { note_id: noteId },
      select: {
        user_id: true
      }
    });
    // Fetch owner information
    const owner = await prisma.user.findUnique({
      where: { id: note.user_id },
      select: {
        id: true,
        username: true,
        email: true,
        image: true
      }
    });
    // Add owner to the shared users list
    sharedNotes.push({ shared_with_user: owner, can_edit: true, shared_at: null });

    // Extract user information from shared notes
    const sharedUsers = sharedNotes.map(sharedNote => ({
      ...sharedNote.shared_with_user,
      canEdit: sharedNote.can_edit,
      sharedAt: sharedNote.shared_at
    }));

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

// Get TagID from tag name
app.get('/tagnames/:tagName', async (req, res) => {
  try {
    const tagName = req.params.tagName;

    const tag = await prisma.tag.findFirst({
      where: {
        name: tagName,
      },
      select: {
        tag_id: true,
      },
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
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

    // Check if the tag exists
    const tag = await prisma.tag.findUnique({
      where: { tag_id: tagId },
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

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

// Get all tags for a specific user
app.get('/tags/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Query to get all tags associated with the user's notes
    const tags = await prisma.tag.findMany({
      where: {
        notes: {
          some: {
            note: {
              user_id: userId,
              is_deleted: false,
            },
          },
        },
      },
      select: {
        tag_id: true,
        name: true,
      },
    });

    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags for user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all tag IDs for a specific user
app.get('/tag-ids/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Query to get all tags associated with the user's notes
    const tags = await prisma.tag.findMany({
      where: {
        notes: {
          some: {
            note: {
              user_id: userId,
              is_deleted: false,
            },
          },
        },
      },
      select: {
        tag_id: true,
      },
    });

    // Extract the tag IDs
    const tagIds = tags.map(tag => tag.tag_id);
    
    // Return the tag IDs
    res.json(tagIds);
  } catch (error) {
    console.error('Error fetching tag IDs for user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});