const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose(); // Add this import
const auth = require('./middleware/auth');
const roleAuth = require('./middleware/roleAuth');

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database for user management');
  }
});

// Get all users (managers only)
router.get('/', [auth, roleAuth('manager')], (req, res) => {
  db.all('SELECT id, email, firstName, lastName, role, createdAt FROM users', [], (err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(users);
  });
});

// Update user role (managers only)
router.put('/:id/role', [auth, roleAuth('manager')], (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;
  
  // Validate role
  if (!['default', 'agent', 'manager'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User role updated successfully' });
  });
});

module.exports = router;
