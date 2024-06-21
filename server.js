require('dotenv').config(); // Corrected spelling of dotenv

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.message); // Changed to log only error message
        return;
    }
    console.log('Connected to database');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = { name, email, password: hashedPassword };

        const query = 'INSERT INTO users SET ?';
        db.query(query, user, (err, result) => {
            if (err) {
                console.error('Error inserting user into database:', err.message);
                return res.status(500).send('Server error');
            }
            res.status(201).send('User registered');
        });
    } catch (err) {
        console.error('Error hashing password:', err.message); // Log specific error
        res.status(500).send('Server error');
    }
});

app.get('/users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});

app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error fetching user:', err.message);
            return res.status(500).send('Server error');
        }
        res.json(result[0]);
    });
});

app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
    db.query(query, [name, email, hashedPassword, id], (err, result) => {
        if (err) {
            console.error('Error updating user:', err.message);
            return res.status(500).send('Server error');
        }
        res.send('User updated');
    });
});

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err.message);
            return res.status(500).send('Server error');
        }
        res.send('User deleted');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
