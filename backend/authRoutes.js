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

// In authRoutes.js

// User registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    // Determine role - default to 'default' if not specified or invalid
    let userRole = 'default';
    if (role && ['default', 'agent', 'manager'].includes(role)) {
      userRole = role;
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
      
      // Insert new user with role
      const sql = 'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)';
      db.run(sql, [email, hashedPassword, firstName, lastName, userRole], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Generate JWT token with role
        const token = jwt.sign(
          { id: this.lastID, email, role: userRole },
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
            lastName,
            role: userRole
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint - update to include role in token and response
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token including role
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '24h' }
      );
      
      // Return user info and token
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
