import express from 'express';
import pgp from 'pg-promise';
import bcrypt from 'bcrypt'; // For password hashing

const db = pgp()('postgres://admin:admin@localhost:5432/bronotion');
const app = express();
const PORT = 5433;

// Middleware to parse JSON
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
