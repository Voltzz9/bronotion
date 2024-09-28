import express from 'express';
const pgp = require('pg-promise')(/* options */);
const db = pgp('postgres://admin:admin@localhost:5432/bronotion');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Test Hello World
app.get('/', async (req, res) => {
    try {
        const user = await db.one('SELECT * FROM USERS');
        console.log(user);
        res.send('Hello, World!');
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
