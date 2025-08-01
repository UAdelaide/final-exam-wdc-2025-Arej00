const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login with session management:
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username,email, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user=rows[0];

    req.session.user={
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.json({
      message: 'Login Successful',
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

//Post logout
router.post('/logout',(req,res) => {
  req.session.destroy((err) => {
    if (err){
      return res.status(500).json({ error: 'Logout failed'});
    }
    res.json({ message: 'Logout successful'});
  });
});

//Route to get owner's dog:

router.get('/me/dogs', async (req, res) => {
  if(!req.session.user || req.session.user.role !=='owner'){
    return res.status(401).json({ error:'Not authorized' })
  }
  try {
    const [rows] = await db.query(`
      SELECT dog_id, name FROM Dogs WHERE owner_id=?`,
      [req.session.user.user_id]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching dogs:',error)
    res.status(500).json({ error: 'Failed to load dogs' });
  }
});

//Routes to get dogs:
router.get('/dogs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.dog_id,d.name AS dog_name,d.size,d.owner_id AS owner_id
      FROM Dogs d
      JOIN Users u ON d.owner_id=u.user_id`,
      );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching dogs:',error)
    res.status(500).json({ error: 'Failed to load dogs' });
  }
});

module.exports = router;