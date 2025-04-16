const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// User registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert new user
      const sql = 'INSERT INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)';
      db.run(sql, [email, hashedPassword, firstName, lastName], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { id: this.lastID, email },
          process.env.JWT_SECRET || 'your_jwt_secret_key',
          { expiresIn: '24h' }
        );
        
        // Return user info and token
        res.status(201).json({
          token,
          user: {
            id: this.lastID,
            email,
            firstName,
            lastName
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
