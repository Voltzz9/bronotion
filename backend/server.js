import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from "socket.io";
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import { createClient } from '@usewaypoint/client';
import crypto from 'node:crypto';
import PushNotifications from "node-pushnotifications";

dotenv.config();

const prisma = new PrismaClient();
const client = createClient(process.env.WAYPOINT_API_USERNAME, process.env.WAYPOINT_API_PASSWORD);
const app = express();
const PORT = process.env.PORT || 8080;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const options = {
  key: fs.readFileSync('server.key'), // Path to your key file
  cert: fs.readFileSync('server.cert'), // Path to your certificate file
};

app.use(cors({
  origin: 'https://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// ********************************* Push Notifications **************************


const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || "BG-iCoGsGvQ4B6R5GL--aerOPJHKj-EyFkEZjgP2w-HIvhjqMEVo4W-oGTt7_Ok1YuH_tegUtiahMkUzuVMT6xk",
  privateKey: process.env.VAPID_PRIVATE_KEY || "0O45q8aWmc-iZ4v6W8H98kRavhzdWacFq1rdLiNfNEk",
};

app.post("/subscribe", async (req, res) => {
  try {
    const { subscription, id } = req.body;

    if (!subscription || !id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { endpoint, keys } = subscription;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: "Invalid subscription object" });
    }

    const newUserPushNoti = await prisma.userPushNoti.create({
      data: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user: {
          connect: { id }
        }
      }
    });

    res.status(201).json({ message: "Subscription created successfully", data: newUserPushNoti });
  } catch (error) {
    console.error("Error in /subscribe endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const sendPushNotif = async (userId, title) => {
  try {
    const settings = {
      web: {
        vapidDetails: {
          subject: "mailto:jonty09090@gmail.com",
          publicKey: vapidKeys.publicKey,
          privateKey: vapidKeys.privateKey,
        },
        gcmAPIKey: "gcmkey",
        TTL: 2419200,
        contentEncoding: "aes128gcm",
        headers: {},
      },
      isAlwaysUseFCM: false,
    };

    const push = new PushNotifications(settings);

    const dbresults = await prisma.userPushNoti.findFirst({
      where: { user_id: userId },
      select: { endpoint: true, p256dh: true, auth: true }
    });

    if (!dbresults) {
      throw new Error(`No push notification subscription found for user ${userId}`);
    }

    const subscription = {
      endpoint: dbresults.endpoint,
      keys: {
        p256dh: dbresults.p256dh,
        auth: dbresults.auth
      }
    };

    const payload = JSON.stringify({ title, body: "A note has been shared with you" });

    const result = await push.sendNotification(subscription, payload);
    console.log("Push notification sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
};

// ********************************* Emails **************************************


async function sendEmail(to, subject, bodyHtml) {
  try {
    await client.emailMessages.createTemplated({
      to: to,
      subject: subject,
      bodyHtml: bodyHtml
    });
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Error sending email' };
  }
}


// Send email for share notification

async function sendEmailShareNote(to, noteId) {
  try {
    const res = await client.emailMessages.createTemplated({
      to: to,
      subject: "NOTE HAS BEEN SHARED WITH YOU",
      bodyHtml: `
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f3e8ff; padding: 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f3e8ff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #3c005a;">A Note Has Been Shared With You!</h2>
          <p style="color: #312359;">Hello,</p>
          <p style="color: #312359;">A note has been shared with you through <strong style="color: #3c005a;">Bronotion</strong>.</p>
          <p style="color: #312359;">Click the button below to view the note:</p>
          <a href="https://bronotion.co.za/notes/${noteId}" style="display: inline-block; background-color: #3c005a; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Note</a>
          <p style="color: #312359;">Thank you for using Bronotion!</p>
          <p style="color: #ceb2ff; font-size: 12px;">If you did not expect this email, please ignore it.</p>
        </div>
      </body>
    </html> 
    `
    });
    return { success: true, message: 'Email sent succesfully' };
  } catch (error) {
    console.log('Error sending email:', error);
    return { success: false, error: 'Error sending email' }
  }
}

async function sendPasswordReset(to, token) {
  try {
    await client.emailMessages.createTemplated({
      to: to,
      subject: "Password Reset Request",
      bodyHtml: `
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f3e8ff; padding: 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f3e8ff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #3c005a;">Password Reset Request</h2>
          <p style="color: #312359;">Hello,</p>
          <p style="color: #312359;">You have requested to reset your password for <strong style="color: #3c005a;">Bronotion</strong>.</p>
          <p style="color: #312359;">Click the button below to reset your password:</p>
          <a href="https://localhost:8080/password-reset?token=${token}" style="display: inline-block; background-color: #3c005a; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
          <p style="color: #312359;">If you did not request this, please ignore this email.</p>
          <p style="color: #ceb2ff; font-size: 12px;">Thank you for using Bronotion!</p>
        </div>
      </body>
    </html> 
    `
    });
    console.log('Email sent successfully');
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.log('Error sending email:', error);
    return { success: false, error: 'Error sending email' }
  }
}

app.post('/password-reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log(token)

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token: token,
      },
      include: {
        user: true,
      },
    });

    if (!resetToken || resetToken.token_expiry < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: resetToken.user_id },
      data: {
        password_hash: hashedPassword,
      },
    });

    // Delete used token
    await prisma.passwordResetToken.delete({
      where: {
        token: token,
      },
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while resetting password' });
  }
});

app.post('/password-reset-request', async (req, res) => {
  try {
    const email = req.body.email;
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = generateToken();
    console.log(token)
    const tokenExpiry = new Date(Date.now() + 3600000); // Token expiry set to 1 hour from now

    // Save token in the database
    await prisma.passwordResetToken.create({
      data: {
        token: token,
        token_expiry: tokenExpiry,
        user_id: user.id,
      },
    });

    // Send reset email
    const emailResponse = await sendPasswordReset(user.email, token);

    if (emailResponse.success) {
      res.json({ message: 'Password reset email sent' });
    } else {
      res.status(500).json({ error: 'Error sending password reset email' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

//********************************************************************** */
// Serve static files from the UPLOAD_DIR
app.use('/uploads', express.static(UPLOAD_DIR));

// Ensure the upload directory exists
async function ensureUploadDir() {
  try {
    await fsPromises.mkdir(UPLOAD_DIR, { recursive: true });
    console.log(`Upload directory created: ${UPLOAD_DIR}`);
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

// ********************************* Socket.io *********************************

// Create HTTPS server
const server = https.createServer(options, app);

// Store connected users
const connectedUsers = new Map();

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

  let currentNoteId = null;
  let currentUserId = null;

  socket.on('join-note', ({ noteId, userId }) => {
    currentNoteId = noteId;
    currentUserId = userId;
    socket.join(noteId);
  
    if (!connectedUsers.has(noteId)) {
      connectedUsers.set(noteId, new Set());
    }
  
    connectedUsers.get(noteId).add(userId);
    console.log(`User ${userId} joined note ${noteId}`);
    console.log('User IDs connected to note', noteId, ':', Array.from(connectedUsers.get(noteId)));
    io.to(noteId).emit('user-connected', Array.from(connectedUsers.get(noteId)));
  });

  socket.on('update-collaborators-send', (noteId) => {
    console.log("recieved collab update socket")
    console.log(noteId)
    io.in(noteId).emit('update-collaborators-rec');
  })

  socket.on('update-note', (data) => {
    console.log(data.noteId)
    socket.to(data.noteId).emit('note-updated', data.content);
  });

  socket.on('leave-note', ({ noteId, userId }) => {
    handleUserLeave(noteId, userId);
  });

  socket.on('disconnect', () => {
    if (currentNoteId && currentUserId) {
      handleUserLeave(currentNoteId, currentUserId);
    }
  });

  function handleUserLeave(noteId, userId) {
    if (connectedUsers.has(noteId)) {
      connectedUsers.get(noteId).delete(userId);
      console.log(`User ${userId} left note ${noteId}`);
      if (connectedUsers.get(noteId).size === 0) {
        connectedUsers.delete(noteId);
      } else {
        io.to(noteId).emit('user-disconnected', Array.from(connectedUsers.get(noteId)));
      }
      console.log('User IDs still connected to note', noteId, ':', 
        connectedUsers.has(noteId) ? Array.from(connectedUsers.get(noteId)) : 'None');
    }
    if (noteId === currentNoteId) {
      currentNoteId = null;
      currentUserId = null;
    }
  }
});


// Start the server
async function startServer() {
  await ensureUploadDir();
  server.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
  });
}

startServer();

// ********************************* User Routes *********************************

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,       // Change made here
        username: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new user
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
    const auth = auth_method;

    console.log(auth);
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
        username: true,
        image: true,
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

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      image: user.image,
      auth_methods: user.auth_methods,
    });
  } catch (error) {
    console.error('Error retrieving user:', error);
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

// Update user details
app.post('/users/:userId', async (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const { name, email } = fields;
    const file = files.image?.[0];

    let imageUrl = null;

    if (file && file.size > 0) {
      try {
        const fileExtension = path.extname(file.originalFilename);
        const fileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        await fsPromises.copyFile(file.filepath, filePath);
        imageUrl = `/uploads/${fileName}`;
      } catch (error) {
        console.error('Error saving image:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }

    const userId = req.params.userId;

    try {
      // Get the server URL from the request object
      const serverUrl = `${req.protocol}://${req.get('host')}`;

      // Construct the full image URL if an image was uploaded
      const fullImageUrl = imageUrl ? `${serverUrl}${imageUrl}` : undefined;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          username: name ? name[0].toString() : undefined,
          email: email ? email[0].toString() : undefined,
          image: fullImageUrl || undefined,
        },
      });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        image: user.image,
      });
    } catch (error) {
      console.error('Error updating user details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

// Change user password
app.post('/users/:userId/change_password', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        auth_methods: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the password exists
    if (user.password_hash) {
      // Verify the current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Password is incorrect' });
      }
    } else {
      // Update the UserAuthMethod record to set isManual to true
      await prisma.userAuthMethod.updateMany({
        where: { user_id: userId },
        data: { isManual: true },
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedNewPassword },
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        image: true,
      },
    });


    res.status(201).json({ message: 'Note created successfully', noteId: note.note_id, user: user });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/users/:userId/notes', async (req, res) => {
  try {
    const userId2 = req.params.userId;
    const { includeShared, sortLastedited, tags } = req.body;// Default to false if not provided

    // Auth check
    const authHeader = req.headers['authorization']; // Lowercase 'authorization' for case sensitivity issues.
    const userId = authHeader && authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (userId !== userId2) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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

    let allNotes = [...formattedUserNotes, ...sharedNotes];

    // Sort the notes if sortLastedited is provided
    if (sortLastedited && ['asc', 'desc'].includes(sortLastedited.toLowerCase())) {
      allNotes.sort((a, b) => {
        const dateA = new Date(a.updated_at);
        const dateB = new Date(b.updated_at);
        return sortLastedited.toLowerCase() === 'asc'
          ? dateA - dateB
          : dateB - dateA;
      });
    }

    res.json(allNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search for notes associated with a specific user id
app.get('/users/:userId/notes/search', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { query } = req.query;

    const authHeader = req.headers['authorization']; // Lowercase 'authorization' for case sensitivity issues.
    const userIdCheck = authHeader && authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    if (!userIdCheck) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (userId !== userIdCheck) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the query is provided and not empty.
    if (query !== undefined && query.trim() !== '') {
      let whereClause = {
        user_id: userId,
        title: { contains: query, mode: 'insensitive' },
        is_deleted: false,
      };

      const notes = await prisma.note.findMany({
        where: whereClause,
        select: {
          note_id: true,
          title: true,
        },
      });

      res.json(notes);
    }
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get notes associated with tags for a specific user
app.get('/users/:userId/tags/notes', async (req, res) => {
  try {
    const userId = req.params.userId;
    const authHeader = req.headers['authorization']; // Lowercase 'authorization' for case sensitivity issues.
    const userIdCheck = authHeader && authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    if (!userIdCheck) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (userId !== userIdCheck) {
      return res.status(401).json({ error: 'Unauthorized' });
    }


    // Fetch the tag IDs for the user
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

    // Fetch the user's own notes with the specified tags
    const userNotes = await prisma.note.findMany({
      where: {
        user_id: userId,
        tags: {
          some: {
            tag_id: {
              in: tagIds, // Use the tag IDs fetched earlier
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

        tagNotesMap[tagId].noteIds.push(note.note_id);
        tagNotesMap[tagId].noteTitles.push(note.title);
      });
    });

    // Convert the map to an array
    const formattedResponse = Object.values(tagNotesMap);

    // Return the formatted response
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

    const authHeader = req.headers['authorization']; // Lowercase 'authorization' for case sensitivity issues.
    const userId = authHeader && authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has access to the note
    const note2 = await prisma.note.findUnique({
      where: { note_id: noteId },
      select: {
        user_id: true,
      },
    });
    const sharedNote = await prisma.sharedNote.findFirst({
      where: {
        note_id: noteId,
        shared_with_user_id: userId,
      },
    });

    if (userId !== note2.user_id && !sharedNote) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!note2 && !sharedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

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
    // Auth Check
    const authHeader = req.headers['authorization']; // Lowercase 'authorization' for case sensitivity issues.
    const userId = authHeader && authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    const noteId = parseInt(req.params.noteId);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has access to the note
    const note2 = await prisma.note.findUnique({
      where: { note_id: noteId },
      select: {
        user_id: true,
      },
    });
    const sharedNote = await prisma.sharedNote.findFirst({
      where: {
        note_id: noteId,
        shared_with_user_id: userId,
      },
    });

    if (userId !== note2.user_id && !sharedNote) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!note2 && !sharedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

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
    
    const authHeader = req.headers['authorization']; // Lowercase 'authorization' for case sensitivity issues.
    const userId = authHeader && authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    const noteId = parseInt(req.params.noteId);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has access to the note
    const note2 = await prisma.note.findUnique({
      where: { note_id: noteId },
      select: {
        user_id: true,
      },
    });
    const sharedNote = await prisma.sharedNote.findFirst({
      where: {
        note_id: noteId,
        shared_with_user_id: userId,
      },
    });

    if (userId !== note2.user_id && !sharedNote) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!note2 && !sharedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Finally, fetch the note and all its data
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
    const ret = false;
    const note = await prisma.note.findUnique({
      where: { note_id: noteId },
      select: { user_id: true },
    });
    const sharedNote = await prisma.sharedNote.findFirst({
      where: {
        note_id: noteId,
        shared_with_user_id: userId,
      },
    });

    if (userId !== note.user_id && !sharedNote) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!note && !sharedNote) {
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

    try {
      sendEmailToSharie(sharedWithUserId)
    } catch (error) {
      console.log("Error sending email notification")
    }

    try {
      sendPushNotif(userId, "Title of note")
    } catch (error) {
      console.log("Error sending web push notification")
    }

    res.status(201).json({
      message: 'Note shared successfully',
      sharedNoteId: result.shared_note_id,
    });
  } catch (error) {
    console.error('Error sharing note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function sendEmailToSharie(id) {
  const sharieEmail = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      email: true,
    },
  });
  sendEmailShareNote(sharieEmail.email)
}

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
    }));

    res.json(formattedSharedNotes);
  } catch (error) {
    console.error('Error fetching shared notes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all users a note has been shared with
// Important: Must use the note id not the shared note id
// User needs to have access to the note
app.get('/notes/:noteId/shared-users', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']; // Lowercase 'authorization' for case sensitivity issues.
    const userId = authHeader && authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    const noteId = parseInt(req.params.noteId);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has access to the note
    const note2 = await prisma.note.findUnique({
      where: { note_id: noteId },
      select: {
        user_id: true,
      },
    });
    const sharedNote = await prisma.sharedNote.findFirst({
      where: {
        note_id: noteId,
        shared_with_user_id: userId,
      },
    });

    if (userId !== note2.user_id && !sharedNote) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!note2 && !sharedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

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

    const authHeader = req.headers['authorization']; // Lowercase 'authorization' for case sensitivity issues.
    const userId = authHeader && authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Check if user has access to the note
    const note2 = await prisma.note.findUnique({
      where: { note_id: noteId },
      select: {
        user_id: true,
      },
    });
    const sharedNote = await prisma.sharedNote.findFirst({
      where: {
        note_id: noteId,
        shared_with_user_id: userId,
      },
    });

    if (userId !== note2.user_id && !sharedNote) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!note2 && !sharedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

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
// Important: Must use the shared note id not the note id
app.delete('/shared-notes/:sharedNoteId', async (req, res) => {
  try {
    const sharedNoteId = parseInt(req.params.sharedNoteId);
    const { sharedWithUserId } = req.body;

    const authHeader = req.headers['authorization']; // Lowercase 'authorization' for case sensitivity issues.
    const userId = authHeader && authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sharedNote = await prisma.sharedNote.findFirst({
      where: {
        shared_note_id: sharedNoteId,
      },
      select: {
        note_id: true,
      },
    });
    if (!sharedNote) {
      return res.status(404).json({ error: 'Shared note not found or not shared with the specified user.' });
    }
    // Get the owner of the note
    const noteOriginal = await prisma.note.findUnique({
      where: { note_id: sharedNote.note_id },
      select: {
        user_id: true,
      },
    });

    if (userId !== noteOriginal.user_id && !sharedNote) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
//https.createServer(options, app).listen(PORT, () => {
//  console.log(`Server is running on https://localhost:${PORT}`);
//});